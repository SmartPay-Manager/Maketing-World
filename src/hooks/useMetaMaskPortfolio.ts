import { useState, useEffect } from 'react';
import { useAccount, useBalance, useToken } from 'wagmi';
import { formatUnits } from 'viem';

interface TokenData {
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceUSD: string;
  price: number;
  change24h: number;
  address: string;
}

interface PortfolioData {
  totalValueUSD: string;
  tokens: TokenData[];
  isLoading: boolean;
  error: Error | null;
}

export function useMetaMaskPortfolio() {
  const { address, isConnected } = useAccount();
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    totalValueUSD: "0",
    tokens: [],
    isLoading: true,
    error: null
  });

  // Common ERC20 tokens to track
  const commonTokens = [
    { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH' },
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC' },
    { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI' },
    { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC' },
  ];

  // Native ETH balance
  const { data: ethBalance } = useBalance({
    address,
  });

  // Get price data from CoinGecko
  const fetchTokenPrices = async (tokens: string[]) => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/v3/simple/token_price/ethereum?contract_addresses=${tokens.join(',')}&vs_currencies=usd&include_24hr_change=true`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching token prices:', error);
      return {};
    }
  };

  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!isConnected || !address) {
        setPortfolioData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        setPortfolioData(prev => ({ ...prev, isLoading: true }));

        // Fetch token balances and prices in parallel
        const [tokenBalances, prices] = await Promise.all([
          Promise.all(
            commonTokens.map(async token => {
              const tokenData = await fetch(
                `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${token.address}&address=${address}&tag=latest&apikey=${process.env.VITE_ETHERSCAN_API_KEY}`
              ).then(res => res.json());
              
              return {
                ...token,
                balance: tokenData.result
              };
            })
          ),
          fetchTokenPrices(commonTokens.map(t => t.address))
        ]);

        // Calculate total portfolio value
        let totalValue = ethBalance ? 
          parseFloat(ethBalance.formatted) * (prices['ethereum']?.usd || 0) : 0;

        // Process token data
        const tokens: TokenData[] = [
          // Add ETH
          {
            symbol: 'ETH',
            name: 'Ethereum',
            decimals: 18,
            balance: ethBalance ? ethBalance.formatted : '0',
            balanceUSD: totalValue.toFixed(2),
            price: prices['ethereum']?.usd || 0,
            change24h: prices['ethereum']?.usd_24h_change || 0,
            address: '0x0000000000000000000000000000000000000000'
          },
          // Add other tokens
          ...tokenBalances.map(token => {
            const price = prices[token.address.toLowerCase()]?.usd || 0;
            const change24h = prices[token.address.toLowerCase()]?.usd_24h_change || 0;
            const balanceNum = parseFloat(formatUnits(BigInt(token.balance), 18));
            const balanceUSD = (balanceNum * price).toFixed(2);
            
            totalValue += parseFloat(balanceUSD);

            return {
              symbol: token.symbol,
              name: token.symbol,
              decimals: 18,
              balance: balanceNum.toString(),
              balanceUSD,
              price,
              change24h,
              address: token.address
            };
          })
        ];

        setPortfolioData({
          totalValueUSD: totalValue.toFixed(2),
          tokens: tokens.filter(t => parseFloat(t.balanceUSD) > 0),
          isLoading: false,
          error: null
        });

      } catch (error) {
        setPortfolioData(prev => ({
          ...prev,
          isLoading: false,
          error: error as Error
        }));
      }
    };

    fetchPortfolioData();
  }, [address, isConnected, ethBalance]);

  return portfolioData;
}
