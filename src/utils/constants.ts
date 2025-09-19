export const CHAIN_IDS = {
  ETHEREUM: 1,
  POLYGON: 137,
  BSC: 56,
  ARBITRUM: 42161,
  OPTIMISM: 10,
  XRP: 'xrp'
} as const;

export const CHAIN_NAMES = {
  [CHAIN_IDS.ETHEREUM]: 'Ethereum',
  [CHAIN_IDS.POLYGON]: 'Polygon',
  [CHAIN_IDS.BSC]: 'BSC',
  [CHAIN_IDS.ARBITRUM]: 'Arbitrum',
  [CHAIN_IDS.OPTIMISM]: 'Optimism',
  [CHAIN_IDS.XRP]: 'XRP Ledger'
} as const;

export const TOKEN_ADDRESSES = {
  ETHEREUM: {
    USDC: '0xA0b86a33E6885D0c5906C0Ae01fAec12E7e9B85E',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
  }
} as const;

export const API_ENDPOINTS = {
  ONEINCH_BASE: 'https://api.1inch.dev',
  PROXY_BASE: '/api/1inch-proxy'
} as const;

export const REFRESH_INTERVALS = {
  MARKET_DATA: 30000,    // 30 seconds
  PORTFOLIO: 120000,     // 2 minutes
  ARBITRAGE: 15000,      // 15 seconds
  TRADES: 5000          // 5 seconds
} as const;

export const XP_REWARDS = {
  DAILY_USAGE: 20,
  TRADE_EXECUTION: 10,
  COMMUNITY_COMMENT: 20,
  ARBITRAGE_DISCOVERY: 15,
  CROSS_CHAIN_SWAP: 25
} as const;

export const NFT_REQUIREMENTS = {
  STARTER: 100,
  TRADER: 300,
  ARBITRAGER: 500,
  CROSS_CHAIN_MASTER: 750,
  DEFI_LEGEND: 1000
} as const;