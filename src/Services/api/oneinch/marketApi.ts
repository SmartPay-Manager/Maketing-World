// src/services/api/1inch/marketApi.ts
import type { MarketData, ChartData } from '../../../types/api';
import OneInchClient, { getOneInchClient } from './client';

export class MarketAPI {
  private client: OneInchClient;

  constructor(apiKey: string) {
    this.client = getOneInchClient(apiKey);
  }

  // Prix spot d'un token (API Spot Price)
  async getSpotPrice(tokenAddress: string, currency: string = 'USD'): Promise<number> {
    try {
      const response = await this.client.request<{ [key: string]: number }>({
        method: 'GET',
        url: '/price/v1.1/1', // Ethereum mainnet
        params: {
          tokens: tokenAddress,
          currency: currency
        }
      });

      return response[tokenAddress] || 0;
    } catch (error) {
      console.error('Erreur lors de la récupération du prix:', error);
      return 0;
    }
  }

  // Données de graphique (API Charts)
  async getChartData(
    tokenAddress: string,
    timeframe: string = '1D',
    pointsCount: number = 100
  ): Promise<ChartData[]> {
    try {
      const response = await this.client.request<{ data: ChartData[] }>({
        method: 'GET',
        url: '/charts/v1.0/1/chart',
        params: {
          address: tokenAddress,
          timeframe: timeframe,
          pointsCount: pointsCount
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données de graphique:', error);
      return [];
    }
  }

  // Données de marché complètes pour un token
  async getMarketData(tokenAddress: string): Promise<MarketData> {
    try {
      // Combiner plusieurs APIs pour obtenir des données complètes
      const [price, chartData] = await Promise.all([
        this.getSpotPrice(tokenAddress),
        this.getChartData(tokenAddress, '1D', 2) // 2 points pour calculer le change 24h
      ]);

      // Calculer le changement sur 24h
      let priceChange24h = 0;
      if (chartData.length >= 2) {
        const currentPrice = chartData[chartData.length - 1].close;
        const previousPrice = chartData[0].close;
        priceChange24h = ((currentPrice - previousPrice) / previousPrice) * 100;
      }

      // Construction de l'objet MarketData
      const marketData: MarketData = {
        address: tokenAddress,
        symbol: await this.getTokenSymbol(tokenAddress),
        price: price.toString(),
        priceChange24h: priceChange24h,
        volume24h: '0', // À récupérer via une autre API si disponible
        marketCap: '0',  // À calculer si on a le supply
        liquidity: {
          usd: '0',
          base: '0',
          quote: '0'
        },
        lastUpdated: Date.now()
      };

      return marketData;
    } catch (error) {
      console.error('Erreur lors de la récupération des données de marché:', error);
      throw error;
    }
  }

  // Récupérer le symbole d'un token (API Token Details)
  private async getTokenSymbol(tokenAddress: string): Promise<string> {
    try {
      const response = await this.client.request<{ symbol: string }>({
        method: 'GET',
        url: `/tokens/v1.2/1/token-details/${tokenAddress}`
      });

      return response.symbol;
    } catch (error) {
      console.error('Erreur lors de la récupération du symbole:', error);
      return 'UNKNOWN';
    }
  }

  // Estimation des frais de gas (API Gas Price)
  async getGasPrice(): Promise<{ slow: string; standard: string; fast: string }> {
    try {
      const response = await this.client.request<{
        slow: { gasPrice: string };
        standard: { gasPrice: string };
        fast: { gasPrice: string };
      }>({
        method: 'GET',
        url: '/gas-price/v1.4/1' // Ethereum mainnet
      });

      return {
        slow: response.slow.gasPrice,
        standard: response.standard.gasPrice,
        fast: response.fast.gasPrice
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des prix de gas:', error);
      return { slow: '0', standard: '0', fast: '0' };
    }
  }
}