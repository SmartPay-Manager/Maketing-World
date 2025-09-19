import { useEffect, useCallback } from 'react';
import { usePortfolioStore } from '../store/portfolioStore';

export const usePortfolio = (walletAddress?: string) => {
  const {
    portfolio,
    selectedWallet,
    totalValueUSD,
    totalPnL24h,
    topTokensByValue,
    isLoading,
    lastRefresh,
    setSelectedWallet,
    refreshPortfolio
  } = usePortfolioStore();

  // Sélectionner automatiquement le wallet si fourni
  useEffect(() => {
    if (walletAddress && walletAddress !== selectedWallet) {
      setSelectedWallet(walletAddress);
    }
  }, [walletAddress, selectedWallet, setSelectedWallet]);

  // Rafraîchir automatiquement le portefeuille
  const autoRefresh = useCallback(async () => {
    if (selectedWallet) {
      await refreshPortfolio();
    }
  }, [selectedWallet, refreshPortfolio]);

  // Rafraîchissement automatique toutes les 2 minutes
  useEffect(() => {
    const interval = setInterval(autoRefresh, 120000); // 2 minutes
    
    // Rafraîchissement initial
    autoRefresh();
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Calculer des métriques dérivées utiles pour l'UI
  const metrics = {
    totalValueUSD: parseFloat(totalValueUSD || '0'),
    totalPnL24h: parseFloat(totalPnL24h || '0'),
    pnlPercentage: portfolio ? (parseFloat(totalPnL24h) / parseFloat(totalValueUSD)) * 100 : 0,
    tokenCount: portfolio?.chains.reduce((sum, chain) => sum + chain.tokens.length, 0) || 0,
    chainCount: portfolio?.chains.length || 0,
    isProfit: parseFloat(totalPnL24h || '0') >= 0
  };

  return {
    portfolio,
    selectedWallet,
    topTokensByValue,
    isLoading,
    lastRefresh,
    metrics,
    refreshPortfolio: autoRefresh
  };
};