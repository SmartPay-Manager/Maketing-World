import { useState, useEffect } from 'react';

export const useProxyConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Simulate API check
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsConnected(true);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  return { isConnected, isLoading, error };
};