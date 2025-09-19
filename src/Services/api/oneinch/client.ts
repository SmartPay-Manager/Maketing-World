// src/services/api/1inch/client.ts
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import axios from 'axios';

class OneInchClient {
  private client: AxiosInstance;
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // Utiliser le proxy Vercel pour contourner CORS
    this.baseURL = '/api/1inch-proxy';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });

    // Intercepteur pour ajouter l'API key et gérer les erreurs
    this.client.interceptors.request.use((config) => {
      config.headers['X-API-Key'] = this.apiKey;
      return config;
    });

    // Intercepteur pour gérer les erreurs de manière unifiée
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Erreur API 1inch:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  // Méthode générique pour faire des requêtes
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<T>(config);
    return response.data;
  }
}

// Instance singleton du client
let clientInstance: OneInchClient | null = null;

export const getOneInchClient = (apiKey: string): OneInchClient => {
  if (!clientInstance) {
    clientInstance = new OneInchClient(apiKey);
  }
  return clientInstance;
};

export default OneInchClient;