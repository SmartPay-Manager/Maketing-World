import { useCallback, useEffect, useRef } from 'react';
import { useTradingStore } from '../store/tradingStore';
import { fusionPlusApi } from '../services/api/1inch/fusionPlusApi';
import type { FusionPlusActiveOrder } from '../types/api';

const POLL_INTERVAL = 15000; // 15 seconds

export const useFusionPlusOrder = () => {
  const {
    updateTrade,
    updateCrossChainDetails
  } = useTradingStore();

  const pollTimerRef = useRef<NodeJS.Timeout>();
  const pollErrorCountRef = useRef<number>(0);
  const MAX_ERRORS = 3;

  const clearPollTimer = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = undefined;
    }
  }, []);

  const submitSecret = useCallback(async (tradeId: string, orderHash: string, secret: string) => {
    try {
      await fusionPlusApi.submitSecret({ secret, orderHash });
      updateCrossChainDetails(tradeId, {
        stage: 'secret_submitted',
        progress: 80,
        lastUpdate: Date.now()
      });
      pollErrorCountRef.current = 0;
    } catch (error) {
      console.error('Error submitting secret:', error);
      pollErrorCountRef.current += 1;
      if (pollErrorCountRef.current >= MAX_ERRORS) {
        updateTrade(tradeId, { 
          status: 'failed',
          error: 'Failed to submit secret after multiple attempts'
        });
        clearPollTimer();
      }
    }
  }, [updateCrossChainDetails, updateTrade, clearPollTimer]);

  const startOrderPolling = useCallback(async (tradeId: string, orderHash: string) => {
    if (pollTimerRef.current) {
      stopPolling();
    }

    const pollStatus = async () => {
      try {
        const orderStatus = await fusionPlusApi.pollOrderStatus(orderHash);
        
        if (orderStatus) {
          const stage = getStageFromStatus(orderStatus);
          const progress = calculateProgress(orderStatus);

          // Update the trade with the latest status
          updateCrossChainDetails(tradeId, {
            orderHash: orderStatus.orderHash,
            srcEscrowAddress: orderStatus.srcEscrowAddress,
            dstEscrowAddress: orderStatus.dstEscrowAddress,
            stage,
            progress,
            lastUpdate: Date.now()
          });

          // Update trade status based on order status
          if (orderStatus.status === 'filled') {
            updateTrade(tradeId, { status: 'completed' });
          } else if (orderStatus.status === 'cancelled') {
            updateTrade(tradeId, { status: 'failed' });
          }

          // Submit secret when conditions are met
          if (stage === 'finality_confirmed' && progress >= 60) {
            const trade = useTradingStore.getState().activeTrades.find(t => t.id === tradeId);
            if (trade?.crossChainDetails?.atomicSwapId) {
              await submitSecret(tradeId, orderHash, trade.crossChainDetails.atomicSwapId);
            }
          }

          // If the order is complete, stop polling
          if (isOrderComplete(orderStatus)) {
            stopPolling();
          }
        }
      } catch (error) {
        console.error('Error polling order status:', error);
        updateTrade(tradeId, { 
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
        stopPolling();
      }
    };

    // Initial poll
    await pollStatus();

    // Start polling
    pollTimerRef.current = setInterval(pollStatus, POLL_INTERVAL);
  }, [updateCrossChainDetails, updateTrade, submitSecret, stopPolling]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = undefined;
    }
  }, []);

  // Start polling function
  const startOrderPolling = useCallback(async (tradeId: string, orderHash: string) => {
    // Clear any existing poll
    clearPollTimer();
    pollErrorCountRef.current = 0;

    const pollStatus = async () => {
      try {
        const orderStatus = await fusionPlusApi.pollOrderStatus(orderHash);
        
        if (orderStatus) {
          const stage = orderStatus.status === 'filled' ? 'completed' :
            orderStatus.secretSubmitted ? 'secret_submitted' :
            orderStatus.chainFinality ? 'finality_confirmed' :
            orderStatus.srcEscrowAddress && orderStatus.dstEscrowAddress ? 'escrow_deployed' :
            'initiated';

          const progress = orderStatus.status === 'filled' ? 100 :
            orderStatus.secretSubmitted ? 80 :
            orderStatus.chainFinality ? 60 :
            orderStatus.srcEscrowAddress && orderStatus.dstEscrowAddress ? 40 :
            orderStatus.status === 'active' ? 20 : 0;

          // Update the trade with the latest status
          updateCrossChainDetails(tradeId, {
            orderHash: orderStatus.orderHash,
            srcEscrowAddress: orderStatus.srcEscrowAddress,
            dstEscrowAddress: orderStatus.dstEscrowAddress,
            stage,
            progress,
            lastUpdate: Date.now()
          });

          // Update trade status based on order status
          if (orderStatus.status === 'filled') {
            updateTrade(tradeId, { status: 'completed' });
            clearPollTimer();
          } else if (orderStatus.status === 'cancelled') {
            updateTrade(tradeId, { 
              status: 'failed',
              error: 'Order was cancelled'
            });
            clearPollTimer();
          }

          // Submit secret when conditions are met
          if (stage === 'finality_confirmed' && progress >= 60) {
            const trade = useTradingStore.getState().activeTrades.find(t => t.id === tradeId);
            if (trade?.crossChainDetails?.atomicSwapId) {
              await submitSecret(tradeId, orderHash, trade.crossChainDetails.atomicSwapId);
            }
          }
        }
      } catch (error) {
        console.error('Error polling order status:', error);
        pollErrorCountRef.current += 1;
        
        if (pollErrorCountRef.current >= MAX_ERRORS) {
          updateTrade(tradeId, { 
            status: 'failed',
            error: error instanceof Error ? error.message : 'Failed to poll order status'
          });
          clearPollTimer();
        }
      }
    };

    // Initial poll
    await pollStatus();

    // Start polling
    pollTimerRef.current = setInterval(pollStatus, POLL_INTERVAL);
  }, [clearPollTimer, submitSecret, updateCrossChainDetails, updateTrade]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearPollTimer();
    };
  }, [clearPollTimer]);

  return {
    startOrderPolling,
    clearPollTimer
  };
};
