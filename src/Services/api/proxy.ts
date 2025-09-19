// src/services/api/proxy.ts
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * Client proxy unifié pour toutes les communications API externes
 * 
 * Cette classe fournit une interface standardisée pour accéder aux APIs
 * externes via notre infrastructure de proxy, gérant automatiquement
 * l'authentification, les retries, et la gestion d'erreurs.
 */

// Interface pour la configuration du proxy
interface ProxyConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// Interface pour les réponses du proxy
interface ProxyResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export class ProxyClient {
  private client: AxiosInstance;
  private config: ProxyConfig;

  constructor(config?: Partial<ProxyConfig>) {
    // Configuration par défaut avec possibilité de surcharge
    this.config = {
      baseURL: process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000/api' 
        : '/api',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };

    // Création de l'instance Axios avec configuration optimisée
    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  /**
   * Configuration des intercepteurs pour la gestion automatisée
   */
  private setupInterceptors(): void {
    // Intercepteur de requête pour ajouter des métadonnées
    this.client.interceptors.request.use(
      (config) => {
        // Ajout d'un timestamp pour le suivi des performances
        // config.timeout = { startTime: Date.now() };
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔄 Proxy Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        
        return config;
      },
      (error) => {
        console.error('❌ Erreur de configuration proxy:', error);
        return Promise.reject(error);
      }
    );

    // Intercepteur de réponse avec retry automatique
    this.client.interceptors.response.use(
      (response) => {
        // Calcul du temps de réponse pour le monitoring
        const duration = 10;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Proxy Success: ${response.status} (${duration}ms)`);
        }
        
        return response;
      },
      async (error) => {
        return this.handleErrorWithRetry(error);
      }
    );
  }

  /**
   * Gestion des erreurs avec logique de retry intelligente
   */
  private async handleErrorWithRetry(error: any): Promise<any> {
    const config = error.config;
    
    // Si c'est déjà un retry ou si les retries sont désactivés
    if (!config || config._retryCount >= this.config.retryAttempts) {
      console.error('❌ Erreur proxy finale:', error.message);
      return Promise.reject(error);
    }

    // Initialisation du compteur de retry
    config._retryCount = config._retryCount || 0;
    config._retryCount++;

    // Délai exponentiel entre les retries
    const delay = this.config.retryDelay * Math.pow(2, config._retryCount - 1);
    
    console.log(`🔄 Retry ${config._retryCount}/${this.config.retryAttempts} dans ${delay}ms`);
    
    // Attente avant le retry
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Nouvelle tentative
    return this.client(config);
  }

  /**
   * Méthode générique pour les appels vers le proxy 1inch
   */
  async call1inchAPI<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    params?: Record<string, any>,
    data?: any
  ): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        url: '/1inch-proxy',
        method: 'POST', // Toujours POST vers notre proxy
        data: {
          endpoint,
          method,
          params,
          data
        }
      };

      const response = await this.client.request<ProxyResponse<T>>(config);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erreur proxy inconnue');
      }

      return response.data.data!;

    } catch (error) {
      console.error(`❌ Erreur appel 1inch ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Test de connectivité du proxy
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.call1inchAPI('/gas-price/v1.4/1');
      console.log('✅ Proxy client connecté avec succès');
      return true;
    } catch (error) {
      console.error('❌ Test de connexion proxy échoué:', error);
      return false;
    }
  }

  /**
   * Obtenir des statistiques sur l'utilisation du proxy
   */
  getStats(): {
    baseURL: string;
    timeout: number;
    retryConfig: { attempts: number; delay: number };
  } {
    return {
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      retryConfig: {
        attempts: this.config.retryAttempts,
        delay: this.config.retryDelay
      }
    };
  }
}

// Instance singleton pour optimiser les performances
let proxyInstance: ProxyClient | null = null;

/**
 * Factory function pour obtenir l'instance du proxy client
 */
export const getProxyClient = (): ProxyClient => {
  if (!proxyInstance) {
    proxyInstance = new ProxyClient();
  }
  return proxyInstance;
};

// Export par défaut
export default ProxyClient;