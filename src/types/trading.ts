export interface SwapData {
  toAmount: string;
  tx: {
    gas: string;
    gasPrice: string;
  };
}

export interface SwapQuote {
  fromTokenAmount: string;
  toTokenAmount: string;
  estimatedGas: string;
  route: string[];
  data?: string;
}

export interface ActiveTrade {
  id: string;
  fromToken: string;
  toToken: string;
  amount: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: number;
}