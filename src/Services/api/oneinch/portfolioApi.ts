// src/services/api/1inch/portfolioApi.ts
import type { Portfolio, TokenBalance } from '../../../types/api';
import OneInchClient, { getOneInchClient } from './client';

export class PortfolioAPI {
  private client: OneInchClient;

  constructor(apiKey: string) {
    this.client = getOneInchClient(apiKey);
  }

  // Récupérer le portefeuille complet d'un utilisateur
  async getPortfolio(walletAddress: string): Promise<Portfolio> {
    try {
      const response = await this.client.request<Portfolio>({
        method: 'GET',
        url: `/portfolio/v4/overview/erc20/${walletAddress}`,
        params: {
          addresses: walletAddress,
          chain_id: 'all', // Toutes les chaînes supportées
        }
      });

      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération du portefeuille:', error);
      throw error;
    }
  }

  // Balance pour une chaîne spécifique (plus rapide)
  async getChainBalance(walletAddress: string, chainId: number): Promise<TokenBalance[]> {
    try {
      const response = await this.client.request<{ balances: TokenBalance[] }>({
        method: 'GET',
        url: `/balance/v1.2/${chainId}/balances/${walletAddress}`,
      });

      return response.balances;
    } catch (error) {
      console.error('Erreur lors de la récupération des balances:', error);
      throw error;
    }
  }

  // Valeur totale en USD (métrique cruciale pour le dashboard)
  async getTotalValueUSD(walletAddress: string): Promise<string> {
    try {
      const portfolio = await this.getPortfolio(walletAddress);
      return portfolio.totalValueUSD;
    } catch (error) {
      console.error('Erreur lors du calcul de la valeur totale:', error);
      return '0';
    }
  }
}