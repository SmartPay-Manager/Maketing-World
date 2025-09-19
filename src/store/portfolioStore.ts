// src/store/portfolioStore.ts
import { create } from 'zustand';
import type { Portfolio, TokenBalance } from '../types/api';

interface PortfolioState {
  // Données du portefeuille - Central pour l'expérience utilisateur
  portfolio: Portfolio | null;
  selectedWallet: string | null;
  
  // Calculs dérivés - Optimisés pour l'affichage
  totalValueUSD: string;
  totalPnL24h: string;
  topTokensByValue: TokenBalance[];
  
  // État de chargement
  isLoading: boolean;
  lastRefresh: number;
  
  // Actions
  setPortfolio: (portfolio: Portfolio) => void;
  setSelectedWallet: (wallet: string) => void;
  refreshPortfolio: () => Promise<void>;
  calculateDerivedData: () => void;
}

export const usePortfolioStore = create<PortfolioState>()((set, get) => ({
  // État initial
  portfolio: null,
  selectedWallet: null,
  totalValueUSD: '0',
  totalPnL24h: '0',
  topTokensByValue: [],
  isLoading: false,
  lastRefresh: 0,

  // Définir le portefeuille et calculer les métriques dérivées
  setPortfolio: (portfolio) => {
    set({ portfolio, lastRefresh: Date.now() });
    get().calculateDerivedData();
  },

  setSelectedWallet: (wallet) => set({ selectedWallet: wallet }),

  // Rafraîchir les données du portefeuille via l'API 1inch
  refreshPortfolio: async () => {
    const { selectedWallet } = get();
    if (!selectedWallet) return;

    set({ isLoading: true });
    try {
      // Ici, nous appellerons l'API Portfolio de 1inch
      // const portfolio = await portfolioApi.getPortfolio(selectedWallet);
      // get().setPortfolio(portfolio);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du portefeuille:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Calculs dérivés pour optimiser l'affichage
  calculateDerivedData: () => {
    const { portfolio } = get();
    if (!portfolio) return;

    // Calculer la valeur totale et le P&L 24h
    let totalPnL = 0;
    const allTokens: TokenBalance[] = [];

    portfolio.chains.forEach(chain => {
      chain.tokens.forEach(token => {
        allTokens.push(token);
        const tokenValueUSD = parseFloat(token.balanceUSD);
        totalPnL += tokenValueUSD * (token.change24h / 100);
      });
    });

    // Top tokens par valeur (pour l'affichage prioritaire)
    const topTokens = allTokens
      .sort((a, b) => parseFloat(b.balanceUSD) - parseFloat(a.balanceUSD))
      .slice(0, 10);

    set({
      totalValueUSD: portfolio.totalValueUSD,
      totalPnL24h: totalPnL.toFixed(2),
      topTokensByValue: topTokens
    });
  }
}));