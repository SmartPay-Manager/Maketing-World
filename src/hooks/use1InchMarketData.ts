import { useEffect, useRef, useCallback } from 'react';
import { useMarketStore } from '../store/marketStore';
import { getOneInchService } from '../services/api/oneinch/service';
import { OneInchWebSocket } from '../services/api/oneinch/websocket';
import type { MarketData } from '../types/api';

interface Use1InchMarketDataProps {
  tokens: string[];
  updateInterval?: number;
}

interface WebSocketResponse {
  type: string;
  channel?: string;
  data: Record<string, unknown>;
}

export const use1InchMarketData = ({ tokens, updateInterval = 30000 }: Use1InchMarketDataProps) => {
  const wsRef = useRef<OneInchWebSocket | null>(null);
  const { updateMarketData, setConnectionStatus, setError } = useMarketStore();

  // Initialize HTTP service
  const initializeService = useCallback(() => {
    try {
      return getOneInchService(import.meta.env.VITE_1INCH_API_KEY);
    } catch (error) {
      console.error('Failed to initialize 1inch service:', error);
      setError('Failed to initialize market data service');
      return null;
    }
  }, [setError]);

  // Initialize WebSocket connection
  const initializeWebSocket = useCallback(() => {
    if (!wsRef.current) {
      wsRef.current = new OneInchWebSocket(import.meta.env.VITE_1INCH_API_KEY);
      
      wsRef.current.connect((data: WebSocketResponse) => {
        if (data.type === 'price') {
          // Update price data in store
          const priceData = data.data as unknown as MarketData;
          updateMarketData(priceData.address, priceData);
        }
      });

      // Subscribe to price updates for our tokens
      wsRef.current.subscribe('prices', { tokens });
    }
  }, [tokens, updateMarketData]);

  // Fetch initial market data
  const fetchMarketData = useCallback(async () => {
    const service = initializeService();
    if (!service) return;

    try {
      const marketDataPromises = tokens.map(async (token) => {
        const data = await service.getMarketData(token);
        return [token, data] as [string, MarketData];
      });

      const results = await Promise.all(marketDataPromises);
      const marketData = Object.fromEntries(results);
      
      // updateMarketData(marketData);
      setConnectionStatus(true);
    } catch (error) {
      console.error('Error fetching market data:', error);
      setError('Failed to fetch market data');
      setConnectionStatus(false);
    }
  }, [tokens, updateMarketData, setConnectionStatus, setError, initializeService]);

  // Setup effect
  useEffect(() => {
    // Initial fetch
    fetchMarketData();

    // Setup WebSocket
    initializeWebSocket();

    // Setup polling interval as backup
    const intervalId = setInterval(fetchMarketData, updateInterval);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, [fetchMarketData, initializeWebSocket, updateInterval]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  return { refresh };
};
