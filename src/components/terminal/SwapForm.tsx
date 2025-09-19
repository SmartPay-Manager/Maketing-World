import React, { useState, useCallback, useEffect } from 'react';
import { ArrowDownUp, Zap, Loader2, AlertCircle } from 'lucide-react';
import { useFusionPlusSwap } from '../../hooks/useFusionPlusSwap';
import { useAccount, useConnect, useChainId, useSwitchChain } from 'wagmi';
import type { SwapParams } from '../../hooks/useFusionPlus';
import { useMarketStore } from '../../store/marketStore';

interface SwapFormProps {
  walletAddress?: string;
}

export const SwapForm: React.FC<SwapFormProps> = ({ walletAddress }) => {
  const [fromToken, setFromToken] = useState('XRP');
  const [toToken, setToToken] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [swapDetails, setSwapDetails] = useState<SwapParams | null>(null);

  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const {
    swapETHtoXRP,
    swapXRPtoETH
  } = useFusionPlusSwap();

  useEffect(() => {
    if (!isConnected || !chainId || !switchChain) return;

    // Ensure we're on the correct network for the selected tokens
    const requiredChainId = fromToken === 'XRP' ? 1440002 : 1; // Using proper chain IDs
    if (chainId !== requiredChainId) {
      switchChain({ chainId: requiredChainId });
    }
  }, [isConnected, chainId, fromToken, switchChain]);

  const { marketData } = useMarketStore();

  const calculateExpectedOutput = useCallback((inputAmount: string) => {
    if (!inputAmount || !marketData) return '0';
    
    const fromTokenPrice = parseFloat(marketData[fromToken.toLowerCase()]?.price || '0');
    const toTokenPrice = parseFloat(marketData[toToken.toLowerCase()]?.price || '0');
    
    if (fromTokenPrice === 0 || toTokenPrice === 0) return '0';
    
    const inputValue = parseFloat(inputAmount) * fromTokenPrice;
    const expectedOutput = inputValue / toTokenPrice;
    
    // Apply a 0.3% slippage tolerance
    const outputWithSlippage = expectedOutput * 0.997;
    
    return outputWithSlippage.toFixed(6);
  }, [fromToken, toToken, marketData]);

  const calculatePriorityFee = useCallback(() => {
    // Base fee in GWEI
    const baseFee = 5;
    const networkCongestion = chainId === 1 ? 1.5 : 1; // Higher multiplier for Ethereum mainnet
    return Math.ceil(baseFee * networkCongestion);
  }, [chainId]);

  const handleSwap = useCallback(async () => {
    if (!amount || Number(amount) <= 0) return;
    if (!isConnected) {
      connect({ connector: connectors[0] });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const expectedOutput = calculateExpectedOutput(amount);
      const priorityFee = calculatePriorityFee();

      const result = fromToken === 'XRP' 
        ? await swapXRPtoETH(amount, expectedOutput, address as string)
        : await swapETHtoXRP(amount, expectedOutput, address as string);
      
      if (!result.success) {
        throw new Error(result.error || 'Swap failed');
      }
      
      // Only update swap details if successful
      if (result.txHash) {
        setSwapDetails({
          fromAmount: amount,
          toAmount: expectedOutput,
          fromToken,
          toToken,
          destinationAddress: address as string,
          options: {
            priorityFee: priorityFee.toString(),
            slippageTolerance: 0.3 // 0.3% slippage tolerance
          }
        });
      }
    } catch (error) {
      console.error('Error executing swap:', error);
      setError('Failed to execute swap. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [
    fromToken, 
    toToken, 
    amount, 
    address, 
    isConnected, 
    connect, 
    connectors, 
    swapXRPtoETH, 
    swapETHtoXRP,
    calculateExpectedOutput,
    calculatePriorityFee
  ]);



  return (
    <div className="bg-slate-800/50 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold text-green-400 mb-4">Swap Tokens</h2>
      
      {/* From Token */}
      <div className="space-y-2">
        <label className="text-sm text-slate-400">From</label>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-slate-700/50 rounded px-4 py-2 text-green-400">
            {fromToken} ({fromToken === 'XRP' ? 'XRP Network' : 'ETH Network'})
          </div>
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Amount in ${fromToken}`}
          className="w-full bg-slate-700/50 rounded px-4 py-2 text-green-400"
          min="0"
          step="0.000001"
        />
      </div>

      {/* Swap Direction Button */}
      <button 
        onClick={() => {
          setFromToken(fromToken === 'XRP' ? 'ETH' : 'XRP');
          setToToken(toToken === 'XRP' ? 'ETH' : 'XRP');
          setSwapDetails(null);
        }}
        className="mx-auto block p-2 rounded-full bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
      >
        <ArrowDownUp className="w-4 h-4 text-green-400" />
      </button>

      {/* To Token */}
      <div className="space-y-2">
        <label className="text-sm text-slate-400">To</label>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-slate-700/50 rounded px-4 py-2 text-green-400">
            {toToken} ({toToken === 'XRP' ? 'XRP Network' : 'ETH Network'})
          </div>
        </div>
      </div>

      {/* Quote Information */}
      {amount && Number(amount) > 0 && (
        <div className="mt-4 p-4 bg-slate-700/30 rounded">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Expected Output:</span>
              <span className="text-green-400">{calculateExpectedOutput(amount)} {toToken}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Priority Fee:</span>
              <span className="text-green-400">{calculatePriorityFee()} GWEI</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Route:</span>
              <span className="text-green-400">{fromToken} → Fusion+ → {toToken}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Price Impact:</span>
              <span className="text-yellow-400">~0.3%</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="pt-4">
        <button
          onClick={handleSwap}
          disabled={isLoading || !amount || Number(amount) <= 0}
          className="w-full px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 
                   rounded-lg text-white font-medium flex items-center justify-center space-x-2
                   transition-colors disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : !isConnected ? (
            <>
              <Zap className="w-4 h-4" />
              <span>Connect to Start Swap</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Execute Cross-Chain Swap</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
