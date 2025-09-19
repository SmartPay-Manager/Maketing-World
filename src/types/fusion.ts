// ========================================
// FUSION PLUS - Types for cross-chain swaps
// ========================================

export interface FusionOrder {
  id: string;
  status: 'pending' | 'active' | 'filled' | 'cancelled' | 'expired';
  fromChainId: number;
  toChainId: number | string; // string for XRPL
  fromTokenAddress: string;
  toTokenAddress: string;
  fromAmount: string;
  toAmount: string;
  walletAddress: string;
  createdAt: number;
  expiresAt: number;
}

export interface FusionPlusQuote {
  fromToken: {
    chainId: number;
    address: string;
    symbol: string;
    decimals: number;
  };
  toToken: {
    chainId: number | string;
    address: string;
    symbol: string;
    decimals: number;
  };
  toAmount: string;
  estimatedGas: {
    fromChain: string;
    toChain: string;
  };
  route: {
    fromChainBridge: string;
    toChainBridge: string;
    estimatedTime: number;
  };
  fees: {
    bridgeFee: string;
    servicesFee: string;
    totalFee: string;
  };
}

export interface CrossChainSwapParams {
  fromChainId: number;
  toChainId: number | string;
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  walletAddress: string;
}

export interface FusionPlusState {
  activeOrders: FusionOrder[];
  currentQuote: FusionPlusQuote | null;
  isLoading: boolean;
  error: string | null;
}
