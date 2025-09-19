import { useCallback } from 'react';
import { useMarketStore } from '../store/marketStore';
import { getOneInchService } from '../services/api/oneinch/index';
import type { SwapQuoteParams, SwapExecuteParams } from '../types/swap';

export const use1InchSwap = (walletAddress?: string) => {
  const { updateSwapStatus, setError } = useMarketStore();

  const getSwapQuote = useCallback(async (params: SwapQuoteParams) => {
    try {
      const service = getOneInchService(import.meta.env.VITE_1INCH_API_KEY);
      const quoteData = await service.swapApi.getQuote({
        fromTokenAddress: params.fromToken,
        toTokenAddress: params.toToken,
        amount: params.amount
      });
      
      return {
        ...quoteData,
        estimatedGas: quoteData.estimatedGas,
        toTokenAmount: quoteData.toTokenAmount
      };
    } catch (error) {
      setError('Error fetching swap quote');
      throw error;
    }
  }, [setError]);

  const executeSwap = useCallback(async (params: SwapExecuteParams) => {
    if (!walletAddress) throw new Error('Wallet not connected');

    try {
      const service = getOneInchService(import.meta.env.VITE_1INCH_API_KEY);
      
      // 1. Get approve spender
      const spender = await service.swapApi.getApproveSpender();
      
      // 2. Get approval transaction if needed
      const approvalData = await service.swapApi.getApproveCalldata({
        tokenAddress: params.fromToken,
        amount: params.amount
      });

      // 3. Get swap transaction
      const swapData = await service.swapApi.getSwapData({
        fromTokenAddress: params.fromToken,
        toTokenAddress: params.toToken,
        amount: params.amount,
        fromAddress: walletAddress,
        slippage: params.slippage || 1
      });

      return {
        approve: approvalData,
        swap: swapData,
        spender
      };
    } catch (error) {
      setError('Error executing swap');
      throw error;
    }
  }, [walletAddress, setError]);

  const getGasPrice = useCallback(async () => {
    try {
      const service = getOneInchService(import.meta.env.VITE_1INCH_API_KEY);
      return await service.portfolioApi.getGasPrice();
    } catch (error) {
      setError('Error fetching gas price');
      throw error;
    }
  }, [setError]);

  return {
    getSwapQuote,
    executeSwap,
    getGasPrice
  };
};
