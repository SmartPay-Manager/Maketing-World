import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Wallet,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

import { useMetaMaskPortfolio } from '../../hooks/useMetaMaskPortfolio';
import WalletConnect from '../../components/WalletConnect';

interface PortfolioSummaryProps {
  walletAddress?: string;
  detailed?: boolean;
  isLoading?: boolean;
  className?: string;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ 
  walletAddress,
  detailed = false,
  className = '' 
}) => {
  const [showBalances, setShowBalances] = useState(true);
  const portfolioData = useMetaMaskPortfolio();
  
  // Transform MetaMask portfolio data into the expected format
  const displayData = {
    totalValueUSD: parseFloat(portfolioData.totalValueUSD),
    totalPnL24h: portfolioData.tokens.reduce((sum, token) => sum + (parseFloat(token.balanceUSD) * (token.change24h / 100)), 0),
    pnlPercentage: portfolioData.tokens.reduce((sum, token) => sum + token.change24h, 0) / portfolioData.tokens.length,
    chains: [
      {
        chainId: 1,
        name: 'Ethereum',
        totalValueUSD: portfolioData.totalValueUSD,
        tokens: portfolioData.tokens.map(token => ({
          ...token,
          logoURI: `/tokens/${token.symbol.toLowerCase()}.png`
        }))
      }
    ]
  };

  const isProfit = displayData.totalPnL24h >= 0;

  if (!walletAddress) {
    return (
      <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 ${className}`}>
        <div className="text-center py-8">
          <Wallet className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-400 mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-sm text-slate-500">
            View your MetaMask portfolio and track performance
          </p>
          <div className="mt-4">
            <WalletConnect />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl backdrop-blur-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-400">
                Portfolio Overview
              </h3>
              <p className="text-sm text-slate-400">
                MetaMask assets tracking
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {!walletAddress ? (
              <WalletConnect />
            ) : (
              <>
                <button
                  onClick={() => setShowBalances(!showBalances)}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  {showBalances ? (
                    <Eye className="w-4 h-4 text-slate-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                
                <motion.button
                  onClick={() => window.location.reload()}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                  whileTap={{ rotate: 180 }}
                  disabled={portfolioData.isLoading}
                >
                  <RefreshCw className={`w-4 h-4 text-slate-400 ${portfolioData.isLoading ? 'animate-spin' : ''}`} />
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main metrics */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Total value */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-sm text-slate-400 mb-1">Total Portfolio Value</div>
            <div className="text-3xl font-bold text-white mb-2">
              {showBalances ? (
                `$${displayData.totalValueUSD.toLocaleString()}`
              ) : (
                '••••••••'
              )}
            </div>
            <div className="text-xs text-slate-500">
              {portfolioData.tokens.length} tokens on Ethereum
            </div>
          </motion.div>

          {/* P&L 24h */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-sm text-slate-400 mb-1">24h Change</div>
            <div className={`text-2xl font-bold mb-2 flex items-center justify-center space-x-1 ${
              isProfit ? 'text-green-400' : 'text-red-400'
            }`}>
              {isProfit ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : (
                <ArrowDownRight className="w-5 h-5" />
              )}
              <span>
                {showBalances ? (
                  `${isProfit ? '+' : ''}$${Math.abs(displayData.totalPnL24h).toFixed(2)}`
                ) : (
                  '••••••'
                )}
              </span>
            </div>
            <div className={`text-sm ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
              {showBalances ? (
                `${isProfit ? '+' : ''}${displayData.pnlPercentage.toFixed(2)}%`
              ) : (
                '••••'
              )}
            </div>
          </motion.div>

          {/* Assets */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-sm text-slate-400 mb-1">Assets</div>
            <div className="text-2xl font-bold text-white mb-2">
              {portfolioData.tokens.length}
            </div>
            <div className="text-xs text-slate-500">
              Tokens tracked
            </div>
          </motion.div>
        </div>

        {/* Asset list */}
        {detailed && (
          <div className="mt-6">
            <div className="border-b border-slate-700/50 pb-2 mb-4">
              <h4 className="text-sm font-semibold text-slate-400">Token Holdings</h4>
            </div>
            <div className="space-y-3">
              {displayData.chains[0].tokens
                .sort((a, b) => parseFloat(b.balanceUSD) - parseFloat(a.balanceUSD))
                .map((token, index) => (
                  <motion.div
                    key={token.address}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Token icon */}
                      <div className="w-8 h-8 bg-slate-700 rounded-full overflow-hidden">
                        <img 
                          src={token.logoURI} 
                          alt={token.symbol}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/tokens/placeholder.png';
                          }}
                        />
                      </div>
                      
                      {/* Token info */}
                      <div>
                        <div className="font-medium text-white">{token.symbol}</div>
                        <div className="text-sm text-slate-400">
                          {showBalances ? (
                            parseFloat(token.balance).toFixed(4)
                          ) : (
                            '•••••'
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Value and change */}
                    <div className="text-right">
                      <div className="font-medium text-white">
                        {showBalances ? (
                          `$${parseFloat(token.balanceUSD).toLocaleString()}`
                        ) : (
                          '•••••'
                        )}
                      </div>
                      <div className={`text-sm ${
                        token.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioSummary;