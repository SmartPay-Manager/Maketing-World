import { create } from 'zustand';
import type { ActiveTrade, XRPAtomicSwap } from '../types/api';

interface TradingStoreState {
  activeTrades: ActiveTrade[];
  tradeHistory: ActiveTrade[];
  crossChainSwaps: XRPAtomicSwap[];
}
interface TradingState {
  // Trades en cours - Critical pour le suivi temps réel
  activeTrades: ActiveTrade[];
  tradeHistory: ActiveTrade[];
  
  // Swaps cross-chain spéciaux (Fusion+)
  crossChainSwaps: XRPAtomicSwap[];
  
  // Configuration de trading
  slippage: number;
  gasPrice: 'slow' | 'standard' | 'fast';
  
  // État de l'interface
  isSwapping: boolean;
  selectedFromToken: string | null;
  selectedToToken: string | null;
  
  // Actions pour gérer les trades
  addActiveTrade: (trade: ActiveTrade) => void;
  updateTradeStatus: (tradeId: string, status: ActiveTrade['status']) => void;
  updateTrade: (tradeId: string, updates: Partial<ActiveTrade>) => void;
  completeTrade: (tradeId: string, actualAmount: string, txHash: string) => void;
  
  // Actions pour les swaps cross-chain
  initiateCrossChainSwap: (swap: XRPAtomicSwap) => void;
  updateSwapStatus: (swapId: string, status: XRPAtomicSwap['status']) => void;
  updateCrossChainDetails: (tradeId: string, details: Partial<ActiveTrade['crossChainDetails']>) => void;
  
  // Configuration
  setSlippage: (slippage: number) => void;
  setGasPrice: (gasPrice: 'slow' | 'standard' | 'fast') => void;
}

export const useTradingStore = create<TradingState>()((set, get) => ({
  // État initial
  activeTrades: [],
  tradeHistory: [],
  crossChainSwaps: [],
  slippage: 0.5, // 0.5% par défaut
  gasPrice: 'standard',
  isSwapping: false,
  selectedFromToken: null,
  selectedToToken: null,

  // Ajouter un trade actif
  addActiveTrade: (trade) => set((state) => ({
    activeTrades: [...state.activeTrades, trade]
  })),

  // Mettre à jour le statut d'un trade
  updateTradeStatus: (tradeId, status) => set((state) => ({
    activeTrades: state.activeTrades.map(trade =>
      trade.id === tradeId ? { ...trade, status } : trade
    )
  })),

  // Mettre à jour un trade avec des modifications partielles
  updateTrade: (tradeId, updates) => set((state) => ({
    activeTrades: state.activeTrades.map(trade =>
      trade.id === tradeId ? { ...trade, ...updates } : trade
    )
  })),

  // Compléter un trade (le déplacer vers l'historique)
  completeTrade: (tradeId, actualAmount, txHash) => set((state) => {
    const trade = state.activeTrades.find(t => t.id === tradeId);
    if (!trade) return state;

    const completedTrade: ActiveTrade = {
      ...trade,
      status: 'completed',
      actualAmount,
      txHash,
      completedAt: Date.now()
    };

    return {
      activeTrades: state.activeTrades.filter(t => t.id !== tradeId),
      tradeHistory: [completedTrade, ...state.tradeHistory]
    };
  }),

  // Gestion des swaps cross-chain (pour le prix XRP)
  initiateCrossChainSwap: (swap) => set((state) => ({
    crossChainSwaps: [...state.crossChainSwaps, swap]
  })),

  updateSwapStatus: (swapId, status) => set((state) => ({
    crossChainSwaps: state.crossChainSwaps.map(swap =>
      swap.swapId === swapId ? { ...swap, status } : swap
    )
  })),

  updateCrossChainDetails: (tradeId, details) => set((state) => ({
    activeTrades: state.activeTrades.map(trade =>
      trade.id === tradeId && trade.crossChainDetails
        ? {
            ...trade,
            crossChainDetails: {
              ...trade.crossChainDetails,
              ...details,
              lastUpdate: Date.now()
            }
          }
        : trade
    )
  })),

  // Configuration
  setSlippage: (slippage) => set({ slippage }),
  setGasPrice: (gasPrice) => set({ gasPrice })
}));