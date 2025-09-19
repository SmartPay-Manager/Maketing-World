import axios from 'axios';
import type { 
  FusionPlusSubmitOrderRequest, 
  FusionPlusSubmitSecretRequest, 
  FusionPlusActiveOrder 
} from '../../../types/api';

const BASE_URL = 'https://api.1inch.dev/fusion-plus';
const API_KEY = process.env.VITE_1INCH_API_KEY;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
  },
});

export const fusionPlusApi = {
  /**
   * Get active cross-chain swap orders
   */
  getActiveOrders: async (): Promise<FusionPlusActiveOrder[]> => {
    const { data } = await api.get('/orders/v1.0/order/active');
    return data;
  },

  /**
   * Submit a new cross-chain swap order
   */
  submitOrder: async (orderRequest: FusionPlusSubmitOrderRequest): Promise<{ orderHash: string }> => {
    const { data } = await api.post('/relayer/v1.0/submit', orderRequest);
    return data;
  },

  /**
   * Submit the secret for an order after escrow deployment and chain finality
   */
  submitSecret: async (secretRequest: FusionPlusSubmitSecretRequest): Promise<{ success: boolean }> => {
    const { data } = await api.post('/relayer/v1.0/submit/secret', secretRequest);
    return data;
  },

  /**
   * Poll for order status updates
   */
  pollOrderStatus: async (orderHash: string): Promise<FusionPlusActiveOrder | null> => {
    try {
      const { data: orders } = await api.get('/orders/v1.0/order/active');
      return orders.find((order: FusionPlusActiveOrder) => order.orderHash === orderHash) || null;
    } catch (error) {
      console.error('Error polling order status:', error);
      return null;
    }
  }
};
