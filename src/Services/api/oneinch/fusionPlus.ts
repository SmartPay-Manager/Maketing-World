import type { AxiosInstance } from 'axios';
import type { FusionOrder, FusionPlusQuote, CrossChainSwapParams } from '../../types/fusion';

export class FusionPlusService {
  constructor(private client: AxiosInstance) {}

  async getActiveOrders(): Promise<FusionOrder[]> {
    try {
      const response = await this.client.get('/fusion-plus/orders/v1.0/order/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active orders:', error);
      throw error;
    }
  }

  async getQuote(params: CrossChainSwapParams): Promise<FusionPlusQuote> {
    try {
      const response = await this.client.get('/fusion-plus/quote/v1.0/quote', {
        params: {
          fromChainId: params.fromChainId,
          toChainId: params.toChainId,
          fromTokenAddress: params.fromTokenAddress,
          toTokenAddress: params.toTokenAddress,
          amount: params.amount,
          walletAddress: params.walletAddress
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting cross-chain quote:', error);
      throw error;
    }
  }

  async submitOrder(orderData: {
    fromChainId: number;
    toChainId: number | string;
    fromTokenAddress: string;
    toTokenAddress: string;
    amount: string;
    walletAddress: string;
    signature: string;
  }) {
    try {
      const response = await this.client.post('/fusion-plus/orders/v1.0/order', orderData);
      return response.data;
    } catch (error) {
      console.error('Error submitting order:', error);
      throw error;
    }
  }

  async getOrderStatus(orderId: string) {
    try {
      const response = await this.client.get(`/fusion-plus/orders/v1.0/order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting order status:', error);
      throw error;
    }
  }
}
