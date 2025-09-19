import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { MarketData, ChartData, ArbitrageOpportunity } from '../types/api';
import { REFRESH_INTERVALS } from '../utils/constants';

interface MarketState {
  // Market Data
  marketData: Record<string, MarketData>;
  chartData: Record<string, ChartData[]>;
  arbitrageOpportunities: ArbitrageOpportunity[];
  
  // Trading Pairs
  tradingPairs: string[];
  selectedPair: string | null;
  
  // Connection State
  isConnected: boolean;
  lastUpdate: number;
  error: string | null;
  
  // Stats
  globalStats: {
    totalMarketCap: number;
    totalVolume24h: number;
    dominanceIndex: Record<string, number>;
  };
  
  // Actions
  updateMarketData: (tokenAddress: string, data: MarketData) => void;
  updateChartData: (pair: string, data: ChartData[]) => void;
  setArbitrageOpportunities: (opportunities: ArbitrageOpportunity[]) => void;
  setSelectedPair: (pair: string) => void;
  setConnectionStatus: (connected: boolean) => void;
  setError: (error: string | null) => void;
  updateGlobalStats: () => void;
  batchUpdateMarketData: (updates: Record<string, MarketData>) => void;
}

// Store principal pour les données de marché
export const useMarketStore = create<MarketState>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    marketData: {},
    chartData: {},
    arbitrageOpportunities: [],
    tradingPairs: [],
    selectedPair: null,
    isConnected: false,
    lastUpdate: 0,
    error: null,
    globalStats: {
      totalMarketCap: 0,
      totalVolume24h: 0,
      dominanceIndex: {},
    },

    // Market Data Updates
    updateMarketData: (tokenAddress, data) => 
      set((state) => ({
        marketData: {
          ...state.marketData,
          [tokenAddress]: {
            ...data,
            lastUpdated: Date.now()
          }
        },
        lastUpdate: Date.now()
      })),

    batchUpdateMarketData: (updates) =>
      set((state) => ({
        marketData: {
          ...state.marketData,
          ...Object.entries(updates).reduce((acc, [address, data]) => ({
            ...acc,
            [address]: {
              ...data,
              lastUpdated: Date.now()
            }
          }), {})
        },
        lastUpdate: Date.now()
      })),

    // Chart Data Updates
    updateChartData: (pair, data) =>
      set((state) => ({
        chartData: {
          ...state.chartData,
          [pair]: data
        },
        lastUpdate: Date.now()
      })),

    // Arbitrage Opportunities
    setArbitrageOpportunities: (opportunities) =>
      set({
        arbitrageOpportunities: opportunities,
        lastUpdate: Date.now()
      }),

    // Pair Selection
    setSelectedPair: (pair) =>
      set({ selectedPair: pair }),

    // Connection Management
    setConnectionStatus: (connected) =>
      set({ isConnected: connected }),

    setError: (error) =>
      set({ error }),

    // Global Stats Calculation
    updateGlobalStats: () => {
      const { marketData } = get();
      const tokens = Object.values(marketData);
      
      const totalMarketCap = tokens.reduce((sum, token) => 
        sum + token.marketCap, 0);
      
      const totalVolume24h = tokens.reduce((sum, token) => 
        sum + parseFloat(token.volume24h), 0);
      
      const dominanceIndex = tokens.reduce((acc, token) => ({
        ...acc,
        [token.symbol]: (token.marketCap / totalMarketCap) * 100
      }), {});

      set({
        globalStats: {
          totalMarketCap,
          totalVolume24h,
          dominanceIndex
        }
      });
    }
  }))
);