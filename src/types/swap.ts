// ========================================
// SWAP - Types for 1inch swap operations
// ========================================

export interface SwapQuoteParams {
  fromToken: string;
  toToken: string;
  amount: string;
  slippage?: number;
}

export interface SwapQuote {
  fromTokenAmount: string;
  toTokenAmount: string;
  estimatedGas: string;
  route: string[];
  data?: string;
  tx?: {
    gas: string;
    gasPrice: string;
  };
}

export interface SwapExecuteParams extends SwapQuoteParams {
  fromAddress: string;
}

export interface SwapQuoteResponse {
  fromToken: {
    address: string;
    symbol: string;
    decimals: number;
  };
  toToken: {
    address: string;
    symbol: string;
    decimals: number;
  };
  toTokenAmount: string;
  estimatedGas: number;
}

export interface ApproveCallData {
  data: string;
  gasPrice: string;
  to: string;
  value: string;
}

export interface SwapTransaction {
  data: string;
  gasPrice: string;
  to: string;
  value: string;
  gas: number;
}

// ========================================
// PORTFOLIO - Types for portfolio tracking
// ========================================

export interface PortfolioBalance {
  tokenAddress: string;
  balance: string;
  balanceUSD: string;
  token: {
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
  };
}

export interface PortfolioHistory {
  timestamp: number;
  balanceUSD: string;
  tokenBalances: PortfolioBalance[];
}

// ========================================
// GAS - Types for gas price estimation
// ========================================

export interface GasPrice {
  low: string;
  medium: string;
  high: string;
  instant: string;
  baseFee: string;
}
