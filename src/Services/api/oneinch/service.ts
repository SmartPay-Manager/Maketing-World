import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../utils/constants';
import type { MarketData, ChartData } from '../../../types/api';

class OneInchService {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: API_ENDPOINTS.ONEINCH_BASE,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('1inch API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          endpoint: error.config?.url
        });
        throw error;
      }
    );
  }

  // Market Data Methods
  async getSpotPrice(tokenAddress: string): Promise<number> {
    try {
      const response = await this.client.get('/v5.0/1/quote', {
        params: {
          fromTokenAddress: tokenAddress,
          toTokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
          amount: '1000000000000000000' // 1 token in wei
        }
      });
      return parseFloat(response.data.toTokenAmount) / 1e6; // Convert from USDT decimals
    } catch (error) {
      console.error('Error fetching spot price:', error);
      throw error;
    }
  }

  async getMarketData(tokenAddress: string): Promise<MarketData> {
    try {
      const [price, volumeData] = await Promise.all([
        this.getSpotPrice(tokenAddress),
        this.get24hVolume(tokenAddress)
      ]);

      // Get token info and liquidity data in parallel
      const [tokenInfo, liquidityData] = await Promise.all([
        this.client.get(`/v5.0/1/token/${tokenAddress}`),
        this.client.get(`/v5.0/1/liquidity/${tokenAddress}`)
      ]);
      
      return {
        price: Number(price),
        volume24h: Number(volumeData.volume),
        change24h: volumeData.priceChange,
        high24h: price * 1.1, // Estimated since API doesn't provide this
        low24h: price * 0.9,  // Estimated since API doesn't provide this
        marketCap: Number(volumeData.marketCap || 0),
        lastUpdated: Date.now(),
        address: tokenAddress,
        symbol: tokenInfo.data.symbol,
        priceChange24h: volumeData.priceChange,
        liquidity: Number(liquidityData.data.totalLiquidity || 0)
      };
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw error;
    }
  }

  async get24hVolume(tokenAddress: string): Promise<{
    volume: number;
    priceChange: number;
    marketCap: number;
  }> {
    try {
      const response = await this.client.get('/v5.0/1/tokens/info', {
        params: {
          addresses: [tokenAddress]
        }
      });
      
      return {
        volume: response.data[tokenAddress].volume24h || 0,
        priceChange: response.data[tokenAddress].priceChange24h || 0,
        marketCap: response.data[tokenAddress].marketCap || 0
      };
    } catch (error) {
      console.error('Error fetching 24h volume:', error);
      throw error;
    }
  }

  async getChartData(
    tokenAddress: string,
    timeframe: string = '1D'
  ): Promise<ChartData[]> {
    try {
      const response = await this.client.get('/v5.0/1/history/token', {
        params: {
          address: tokenAddress,
          timeframe: timeframe
        }
      });

      interface HistoryPoint {
        timestamp: number;
        price: number;
        volume: number;
      }
      
      return response.data.history.map((point: HistoryPoint) => ({
        timestamp: point.timestamp,
        price: point.price,
        volume: point.volume
      }));
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  }
}

// Singleton instance
let instance: OneInchService | null = null;

export const getOneInchService = (apiKey?: string): OneInchService => {
  if (!instance && apiKey) {
    instance = new OneInchService(apiKey);
  }
  
  if (!instance) {
    throw new Error('OneInchService not initialized. Please provide an API key.');
  }
  
  return instance;
};
