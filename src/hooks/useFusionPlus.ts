import { useState, useCallback, useRef } from 'react';
import { useTradingStore } from '../store/tradingStore';
import { XRPLClient } from '../services/api/xrp/xrplClient';
import { AtomicSwapManager } from '../services/api/xrp/atomicSwap';
import { FusionPlusXRPIntegration } from '../services/api/xrp/fusionPlusXRP';
import type { ActiveTrade } from '../types/api';

export interface SwapParams {
  fromAmount: string;
  toAmount: string;
  fromToken: string;
  toToken: string;
  destinationAddress: string;
  options?: {
    slippageTolerance?: number;
    customTimelock?: number;
    priorityFee?: string;
  };
}

interface SwapResult {
  success: boolean;
  swapId?: string;
  error?: string;
}

interface OrderCallback {
  (stage: string, progress: number, details?: unknown): void;
}

interface ExecutionDetails {
  currentStage: string;
  progress: number;
  lastUpdate: number;
}

interface CrossChainDetails {
  sourceChain: string;
  destinationChain: string;
  atomicSwapId?: string;
  executionDetails?: ExecutionDetails;
}

interface CrossChainSwap {
  swapId: string;
  status: 'pending' | 'locked' | 'completed' | 'cancelled' | 'expired';
  timestamp: number;
  details: Record<string, unknown>;
}

export interface FusionPlusSwapHook {
  isInitializing: boolean;
  swapProgress: string;
  crossChainSwaps: CrossChainSwap[];
  activeTrades: ActiveTrade[];
  swapStats: {
    totalSwaps: number;
    completedSwaps: number;
    activeSwaps: number;
    failedSwaps: number;
  };
  swapETHtoXRP: (params: SwapParams) => Promise<SwapResult>;
  swapXRPtoETH: (params: SwapParams) => Promise<SwapResult>;
  initializeSwapClients: () => Promise<boolean>;
  getSwapStatus: (swapId: string) => CrossChainSwap | undefined;
}

export const useFusionPlusSwap = (): FusionPlusSwapHook => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [swapProgress, setSwapProgress] = useState<string>('');
  
  const xrplClientRef = useRef<XRPLClient | null>(null);
  const atomicSwapManagerRef = useRef<AtomicSwapManager | null>(null);
  const fusionPlusIntegrationRef = useRef<FusionPlusXRPIntegration | null>(null);

  const {
    crossChainSwaps,
    activeTrades,
    initiateCrossChainSwap,
    addActiveTrade,
    updateTrade
  } = useTradingStore();

  const { startOrderPolling } = useFusionPlusOrder();

  // Initialiser les clients pour les swaps cross-chain
  const initializeSwapClients = useCallback(async () => {
    if (xrplClientRef.current) return true;

    setIsInitializing(true);
    setSwapProgress('Connecting to XRPL...');

    try {
      xrplClientRef.current = new XRPLClient();
      const connected = await xrplClientRef.current.connect();
      
      if (!connected) {
        throw new Error('Failed to connect to XRPL');
      }

      setSwapProgress('Initializing atomic swap manager...');
      
      const ethereumRpcUrl = process.env.REACT_APP_ETHEREUM_RPC_URL || '';
      if (!ethereumRpcUrl) {
        throw new Error('Ethereum RPC URL not configured');
      }

      // Initialize both clients and managers
      const xrplClient = xrplClientRef.current;
      if (!xrplClient) {
        throw new Error('XRP client not initialized');
      }
        
      atomicSwapManagerRef.current = new AtomicSwapManager(
        xrplClient,
        ethereumRpcUrl
      );
        
      setSwapProgress('Configuring Fusion+ XRP...');
        
      fusionPlusIntegrationRef.current = new FusionPlusXRPIntegration(
        xrplClient,
        atomicSwapManagerRef.current!
      );

      setSwapProgress('Ready for cross-chain swaps!');
      return true;

    } catch (error) {
      console.error('Error initializing swap clients:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSwapProgress(`Error: ${errorMessage}`);
      return false;
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Initier un swap ETH → XRP
  const swapETHtoXRP = useCallback(async (params: SwapParams): Promise<SwapResult> => {
    try {
      const initialized = await initializeSwapClients();
      if (!initialized) {
        return { success: false, error: 'Failed to initialize services' };
      }

      if (!fusionPlusIntegrationRef.current) {
        return { success: false, error: 'Services not initialized' };
      }

      // Clear any previous state
      setSwapProgress('');

      setSwapProgress('Creating Fusion+ XRP order...');

      const result = await fusionPlusIntegrationRef.current.createFusionPlusXRPOrder(
        'ETH_to_XRP',
        params.fromAmount,
        params.toAmount,
        params.destinationAddress,
        {
          slippageTolerance: params.options?.slippageTolerance,
          customTimelock: params.options?.customTimelock,
          priorityFee: params.options?.priorityFee
        }
      );

      if (!result.success || !result.atomicSwap || !result.order) {
        throw new Error(result.error || 'Failed to create swap order');
      }

      const atomicSwap = result.atomicSwap;
      await initiateCrossChainSwap(atomicSwap);
      
      // Submit the order to Fusion+
      const orderRequest: FusionPlusSubmitOrderRequest = {
        order: {
          salt: atomicSwap.secretHash,
          makerAsset: params.fromToken,
          takerAsset: params.toToken,
          maker: atomicSwap.makerAddress,
          receiver: atomicSwap.takerAddress,
          makingAmount: params.fromAmount,
          takingAmount: params.toAmount,
          makerTraits: "0"
        },
        srcChainId: getChainId(atomicSwap.sourceChain),
        signature: atomicSwap.secret || "",
        extension: "0x",
        quoteId: atomicSwap.swapId,
        secretHashes: [atomicSwap.secretHash]
      };

      const { orderHash } = await fusionPlusApi.submitOrder(orderRequest);
      
      const trade: ActiveTrade = {
        id: atomicSwap.swapId,
        type: 'fusion_plus',
        fromToken: params.fromToken,
        toToken: params.toToken,
        fromAmount: params.fromAmount,
        expectedAmount: params.toAmount,
        status: 'processing',
        createdAt: Date.now(),
        crossChainDetails: {
          sourceChain: 'ethereum',
          destinationChain: 'xrp',
          atomicSwapId: atomicSwap.swapId,
          orderHash,
          stage: 'initiated',
          progress: 0,
          lastUpdate: Date.now()
        },
        estimatedGas: '50000',
        gasPrice: '20000000000',
        networkFee: '0.001'
      };
      
      // Add the initial trade to the store
      addActiveTrade(trade);

      // Start polling for order status
      useFusionPlusOrder().startOrderPolling(trade.id, orderHash);

      const order = result.order;
      
      // Monitor the order execution
      fusionPlusIntegrationRef.current.monitorAndExecuteOrder(
        order,
        (stage, progress) => {
          setSwapProgress(`${stage}: ${progress}%`);

          // Update trade status
          updateTrade(trade.id, {
            status: stage === 'completed' ? 'completed' : 'processing',
            updatedAt: Date.now(),
            executionDetails: {
              currentStage: stage,
              progress: Math.floor(progress),
              lastUpdate: Date.now()
            }
          });
        }
      );

      setSwapProgress('Swap initiated successfully!');
      
      return {
        success: true,
        swapId: atomicSwap.swapId
      };

    } catch (error) {
      console.error('Error in ETH→XRP swap:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }, [initializeSwapClients, initiateCrossChainSwap, addActiveTrade, activeTrades]);

  // Initier un swap XRP → ETH
  const swapXRPtoETH = useCallback(async (params: SwapParams): Promise<SwapResult> => {
    try {
      const initialized = await initializeSwapClients();
      if (!initialized) {
        return { success: false, error: 'Failed to initialize services' };
      }

      if (!fusionPlusIntegrationRef.current) {
        return { success: false, error: 'Services not initialized' };
      }

      setSwapProgress('Creating Fusion+ XRP→ETH order...');

      const result = await fusionPlusIntegrationRef.current.createFusionPlusXRPOrder(
        'XRP_to_ETH',
        params.fromAmount,
        params.toAmount,
        params.destinationAddress,
        {
          slippageTolerance: params.options?.slippageTolerance,
          customTimelock: params.options?.customTimelock,
          priorityFee: params.options?.priorityFee
        }
      );

      if (!result.success || !result.atomicSwap || !result.order) {
        throw new Error(result.error || 'Failed to create swap order');
      }

      const atomicSwap = result.atomicSwap;
      await initiateCrossChainSwap(atomicSwap);
      
      const trade: ActiveTrade = {
        id: atomicSwap.swapId,
        type: 'fusion_plus',
        fromToken: params.fromToken,
        toToken: params.toToken,
        fromAmount: params.fromAmount,
        expectedAmount: params.toAmount,
        status: 'processing',
        createdAt: Date.now(),
        crossChainDetails: {
          sourceChain: 'xrp',
          destinationChain: 'ethereum',
          atomicSwapId: atomicSwap.swapId
        },
        estimatedGas: '50000',
        gasPrice: '20000000000',
        networkFee: '0.001'
      };
      
      addActiveTrade(trade);

      const order = result.order;
      
      // Monitor the order execution
      fusionPlusIntegrationRef.current.monitorAndExecuteOrder(
        order,
        (stage, progress) => {
          setSwapProgress(`${stage}: ${progress}%`);
          
          // Update trade status and crossChainDetails
          updateTrade(trade.id, {
            crossChainDetails: {
              ...trade.crossChainDetails,
              stage,
              progress,
              lastUpdate: Date.now()
            }
          });
          updateTrade(trade.id, {
            status: stage === 'completed' ? 'completed' : 'processing',
            updatedAt: Date.now(),
            executionDetails: {
              currentStage: stage,
              progress: Math.floor(progress),
              lastUpdate: Date.now()
            }
          });
        }
      );

      setSwapProgress('XRP→ETH swap initiated successfully!');
      
      return {
        success: true,
        swapId: atomicSwap.swapId
      };

    } catch (error) {
      console.error('Error in XRP→ETH swap:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }, [initializeSwapClients, initiateCrossChainSwap, addActiveTrade, activeTrades]);

  // Récupérer le statut d'un swap
  const getSwapStatus = useCallback((swapId: string): CrossChainSwap | undefined => {
    const swap = crossChainSwaps.find(swap => swap.swapId === swapId);
    if (!swap) return undefined;

    return {
      swapId: swap.swapId,
      status: swap.status as 'pending' | 'locked' | 'completed' | 'cancelled' | 'expired',
      timestamp: Date.now(),
      details: { ...swap }
    };
  }, [crossChainSwaps]);

  // Statistiques des swaps
  const mappedCrossChainSwaps: CrossChainSwap[] = crossChainSwaps.map(swap => ({
    swapId: swap.swapId,
    status: swap.status as 'pending' | 'locked' | 'completed' | 'cancelled' | 'expired',
    timestamp: Date.now(),
    details: { ...swap }
  }));

  const swapStats = {
    totalSwaps: mappedCrossChainSwaps.length,
    completedSwaps: mappedCrossChainSwaps.filter(s => s.status === 'completed').length,
    activeSwaps: mappedCrossChainSwaps.filter(s => s.status === 'locked' || s.status === 'pending').length,
    failedSwaps: mappedCrossChainSwaps.filter(s => s.status === 'cancelled' || s.status === 'expired').length
  };

  return {
    isInitializing,
    swapProgress,
    crossChainSwaps: mappedCrossChainSwaps,
    activeTrades: activeTrades.filter(t => t.type === 'fusion_plus'),
    swapStats,
    
    initializeSwapClients,
    swapETHtoXRP,
    swapXRPtoETH,
    getSwapStatus
  };
};