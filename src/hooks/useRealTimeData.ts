import { useEffect, useCallback, useRef } from 'react';
import { useMarketStore } from '../store/marketStore';
import { getOneInchService } from '../services/api/1inch/service';
import type { MarketData, ChartData } from '../types/api';
import { REFRESH_INTERVALS } from '../utils/constants';

interface UseRealTimeDataProps {
  tokens: string[];
  updateInterval?: number;
  enableArbitrage?: boolean;
  onError?: (error: string) => void;
}

export const useRealTimeData = ({
  tokens,
  updateInterval = REFRESH_INTERVALS.MARKET_DATA,
  enableArbitrage = true,
  onError
}: UseRealTimeDataProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const oneInchServiceRef = useRef<ReturnType<typeof getOneInchService> | null>(null);
  
  const {
    marketData,
    updateMarketData,
    batchUpdateMarketData,
    setArbitrageOpportunities,
    setConnectionStatus,
    setError,
    updateGlobalStats,
    isConnected,
    lastUpdate
  } = useMarketStore();

  // Initialiser l'API 1inch
  const initializeAPI = useCallback(() => {
    const apiKey = process.env.REACT_APP_1INCH_API_KEY;
    if (!apiKey) {
      setError('Clé API 1inch manquante');
      return false;
    }
    
    apiRef.current = createOneInchAPI(apiKey);
    return true;
  }, [setError]);

  // Fonction pour récupérer les données d'un token
  const fetchTokenData = useCallback(async (tokenAddress: string) => {
    if (!apiRef.current) return;

    try {
      const data = await apiRef.current.market.getMarketData(tokenAddress);
      updateMarketData(tokenAddress, data);
    } catch (error) {
      console.error(`Erreur lors de la récupération des données pour ${tokenAddress}:`, error);
    }
  }, [updateMarketData]);

  // Fonction pour détecter les opportunités d'arbitrage
  const detectArbitrageOpportunities = useCallback(async () => {
    if (!apiRef.current || !enableArbitrage) return;

    try {
      // Logique de détection d'arbitrage cross-chain
      const opportunities = [];
      
      for (const tokenAddress of tokens) {
        const tokenData = marketData[tokenAddress];
        if (!tokenData) continue;

        // Simuler la détection d'arbitrage (dans une vraie app, on comparerait les prix sur différentes chaînes)
        const currentPrice = parseFloat(tokenData.price);
        const fakeArbitragePrice = currentPrice * 1.02; // 2% d'écart simulé

        if (fakeArbitragePrice - currentPrice > 0.01) {
          opportunities.push({
            id: `arb_${tokenAddress}_${Date.now()}`,
            tokenSymbol: tokenData.symbol,
            prices: [
              {
                chain: 'ethereum',
                dex: '1inch',
                price: currentPrice,
                liquidity: '1000000'
              },
              {
                chain: 'xrp',
                dex: 'xrp_dex',
                price: fakeArbitragePrice,
                liquidity: '500000'
              }
            ],
            bestBuyPrice: currentPrice,
            bestSellPrice: fakeArbitragePrice,
            profitPercentage: 2.0,
            profitUSD: '200',
            minTradeSize: '100',
            maxTradeSize: '10000',
            estimatedGasCost: '50',
            netProfitUSD: '150',
            discoveredAt: Date.now(),
            validUntil: Date.now() + 300000 // Valide 5 minutes
          });
        }
      }

      if (opportunities.length > 0) {
        setArbitrageOpportunities(opportunities);
      }
    } catch (error) {
      console.error('Erreur lors de la détection d\'arbitrage:', error);
    }
  }, [tokens, marketData, enableArbitrage, setArbitrageOpportunities]);

  // Fonction principale de mise à jour des données
  const updateData = useCallback(async () => {
    if (!apiRef.current) {
      if (!initializeAPI()) return;
    }

    setConnectionStatus(true);
    setError(null);

    try {
      // Récupérer les données de tous les tokens en parallèle
      await Promise.all(tokens.map(fetchTokenData));
      
      // Détecter les opportunités d'arbitrage
      await detectArbitrageOpportunities();
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour des données:', error);
      setError('Erreur de connexion aux APIs');
      setConnectionStatus(false);
    }
  }, [tokens, initializeAPI, fetchTokenData, detectArbitrageOpportunities, setConnectionStatus, setError]);

  // Démarrer la surveillance en temps réel
  const startRealTimeUpdates = useCallback(() => {
    // Mise à jour immédiate
    updateData();
    
    // Puis mises à jour périodiques
    intervalRef.current = setInterval(updateData, updateInterval);
  }, [updateData, updateInterval]);

  // Arrêter la surveillance
  const stopRealTimeUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Effet pour démarrer/arrêter la surveillance
  useEffect(() => {
    startRealTimeUpdates();
    
    return () => {
      stopRealTimeUpdates();
    };
  }, [startRealTimeUpdates, stopRealTimeUpdates]);

  // Nettoyage à la déconnexion
  useEffect(() => {
    return () => {
      stopRealTimeUpdates();
    };
  }, [stopRealTimeUpdates]);

  return {
    marketData,
    isConnected,
    lastUpdate,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    updateData // Pour forcer une mise à jour manuelle
  };
};