import { getOneInchClient } from './client';
import type { SwapQuote, ActiveTrade, SwapData } from '../../../types/trading';

export class SwapAPI {
  private client;

  constructor(apiKey: string) {
    this.client = getOneInchClient(apiKey);
  }

  // Classic Swap - Quote (estimation du swap)
  async getSwapQuote(
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    fromAddress: string,
    slippage: number = 1
  ): Promise<SwapQuote> {
    try {
      const response = await this.client.request<SwapQuote>({
        method: 'GET',
        url: '/swap/v6.0/1/quote', // Ethereum mainnet
        params: {
          src: fromTokenAddress,
          dst: toTokenAddress,
          amount: amount,
          from: fromAddress,
          slippage: slippage,
          disableEstimate: false,
          allowPartialFill: true, // Important pour Fusion
        }
      });

      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération du quote:', error);
      throw error;
    }
  }

  // Classic Swap - Exécution du swap
  async executeSwap(
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    fromAddress: string,
    slippage: number = 1
  ): Promise<ActiveTrade> {
    try {
      const swapData = await this.client.request({
        method: 'GET',
        url: '/swap/v6.0/1/swap',
        params: {
          src: fromTokenAddress,
          dst: toTokenAddress,
          amount: amount,
          from: fromAddress,
          slippage: slippage,
          disableEstimate: false,
          allowPartialFill: true,
        }
      });

      // Create an ActiveTrade object for tracking
      const trade: ActiveTrade = {
        id: `trade_${Date.now()}`,
        fromToken: fromTokenAddress,
        toToken: toTokenAddress,
        amount: amount,
        status: 'pending',
        timestamp: Date.now()
      };

      return trade;
    } catch (error) {
      console.error('Erreur lors de l\'exécution du swap:', error);
      throw error;
    }
  }

  // Fusion+ Cross-chain Swap - Pour le prix XRP ($32k)
  async initiateFusionPlusSwap(
    sourceChain: string,
    destinationChain: string,
    fromToken: string,
    toToken: string,
    amount: string,
    userAddress: string
  ): Promise<string> {
    try {
      // Cette API est plus complexe et nécessite le SDK TypeScript
      // Voir la documentation Fusion+ dans les documents fournis
      const orderData: { orderHash: string } = await this.client.request({
        method: 'POST',
        url: '/fusion-plus/v1.0/orders',
        data: {
          srcChainId: sourceChain,
          dstChainId: destinationChain,
          srcTokenAddress: fromToken,
          dstTokenAddress: toToken,
          amount: amount,
          walletAddress: userAddress,
          // Paramètres du Dutch Auction (voir whitepaper)
          auctionStartRate: '1.0', // Rate maximum
          auctionEndRate: '0.98',  // Rate minimum (2% de slippage max)
          duration: 300, // 5 minutes d'enchère
        }
      });

      return orderData.orderHash;
    } catch (error) {
      console.error('Erreur lors de l\'initiation du Fusion+ swap:', error);
      throw error;
    }
  }
}