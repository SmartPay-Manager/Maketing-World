// components/terminal/Analytics/ArbitrageScanner.tsx - Détection d'opportunités cross-chain
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  Zap,
  Eye,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Target
} from 'lucide-react';

import { useMarketStore } from '../../../store/marketStore';
import type { ArbitrageOpportunity } from '../../../types/api';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';

interface ArbitrageScannerProps {
  expanded?: boolean;
  className?: string;
}

const ArbitrageScanner: React.FC<ArbitrageScannerProps> = ({ 
  expanded = false,
  className = '' 
}) => {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'profit' | 'volume' | 'time'>('profit');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<number>(Date.now());

  const { arbitrageOpportunities } = useMarketStore();

  // Simuler des opportunités d'arbitrage supplémentaires pour la démo
  const mockOpportunities: ArbitrageOpportunity[] = [
    {
      id: 'arb_eth_usdc_1',
      tokenSymbol: 'USDC',
      prices: [
        { chain: 'Ethereum', dex: 'Uniswap V3', price: 1.002, liquidity: '2500000' },
        { chain: 'XRP Ledger', dex: 'XRPL DEX', price: 0.998, liquidity: '850000' }
      ],
      bestBuyPrice: 0.998,
      bestSellPrice: 1.002,
      profitPercentage: 0.4,
      profitUSD: '340',
      minTradeSize: '1000',
      maxTradeSize: '50000',
      estimatedGasCost: '45',
      netProfitUSD: '295',
      discoveredAt: Date.now() - 120000, // 2 minutes ago
      validUntil: Date.now() + 180000 // Valid for 3 more minutes
    },
    {
      id: 'arb_eth_weth_2',
      tokenSymbol: 'WETH',
      prices: [
        { chain: 'Ethereum', dex: '1inch', price: 2001.5, liquidity: '15000000' },
        { chain: 'Polygon', dex: 'QuickSwap', price: 1998.2, liquidity: '3200000' }
      ],
      bestBuyPrice: 1998.2,
      bestSellPrice: 2001.5,
      profitPercentage: 0.165,
      profitUSD: '825',
      minTradeSize: '0.5',
      maxTradeSize: '100',
      estimatedGasCost: '120',
      netProfitUSD: '705',
      discoveredAt: Date.now() - 45000, // 45 seconds ago
      validUntil: Date.now() + 255000 // Valid for 4+ minutes
    },
    {
      id: 'arb_xrp_usdt_3',
      tokenSymbol: 'XRP',
      prices: [
        { chain: 'XRP Ledger', dex: 'XRPL DEX', price: 0.502, liquidity: '8500000' },
        { chain: 'Binance Smart Chain', dex: 'PancakeSwap', price: 0.507, liquidity: '4200000' }
      ],
      bestBuyPrice: 0.502,
      bestSellPrice: 0.507,
      profitPercentage: 1.0,
      profitUSD: '1250',
      minTradeSize: '500',
      maxTradeSize: '25000',
      estimatedGasCost: '25',
      netProfitUSD: '1225',
      discoveredAt: Date.now() - 30000, // 30 seconds ago
      validUntil: Date.now() + 270000 // Valid for 4.5 minutes
    }
  ];

  // Combiner les vraies opportunités avec les mock pour la démo
  const allOpportunities = [...arbitrageOpportunities, ...mockOpportunities];

  // Filtrer les opportunités selon les critères
  const filteredOpportunities = allOpportunities
    .filter(opp => {
      if (filter === 'all') return true;
      if (filter === 'high') return opp.profitPercentage >= 0.5;
      if (filter === 'medium') return opp.profitPercentage >= 0.2 && opp.profitPercentage < 0.5;
      if (filter === 'low') return opp.profitPercentage < 0.2;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'profit') return parseFloat(b.netProfitUSD) - parseFloat(a.netProfitUSD);
      if (sortBy === 'volume') return parseFloat(b.maxTradeSize) - parseFloat(a.maxTradeSize);
      if (sortBy === 'time') return b.discoveredAt - a.discoveredAt;
      return 0;
    });

  // Simuler un scan manuel
  const performScan = async () => {
    setIsScanning(true);
    // Simuler le temps de scan
    setTimeout(() => {
      setIsScanning(false);
      setLastScanTime(Date.now());
    }, 2000);
  };

  // Calculer le temps restant pour chaque opportunité
  const getTimeRemaining = (validUntil: number) => {
    const remaining = validUntil - Date.now();
    if (remaining < 0) return 'Expired';
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl backdrop-blur-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-900/30 rounded-lg">
              <Target className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-400">
                Arbitrage Scanner
              </h3>
              <p className="text-sm text-slate-400">
                Cross-chain profit opportunities
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right text-sm">
              <div className="text-slate-400">Last Scan</div>
              <div className="text-amber-400 font-semibold">
                {Math.floor((Date.now() - lastScanTime) / 1000)}s ago
              </div>
            </div>
            
            <motion.button
              onClick={performScan}
              disabled={isScanning}
              className="p-2 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/30 rounded-lg transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${isScanning ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-slate-900/50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-amber-400">
              {filteredOpportunities.length}
            </div>
            <div className="text-xs text-slate-400">Active Opportunities</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">
              {filteredOpportunities.reduce((sum, opp) => sum + parseFloat(opp.netProfitUSD), 0).toFixed(0)}
            </div>
            <div className="text-xs text-slate-400">Total Profit ($)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">
              {filteredOpportunities.length > 0 
                ? Math.max(...filteredOpportunities.map(opp => opp.profitPercentage)).toFixed(2)
                : '0'
              }%
            </div>
            <div className="text-xs text-slate-400">Best Opportunity</div>
          </div>
        </div>

        {/* Filtres et tri (si expanded) */}
        {expanded && (
          <div className="flex items-center justify-between mt-4 p-3 bg-slate-900/30 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400">Filter:</span>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                >
                  <option value="all">All</option>
                  <option value="high">High (&gt;0.5%)</option>
                  <option value="medium">Medium (0.2-0.5%)</option>
                  <option value="low">Low (&lt;0.2%)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                >
                  <option value="profit">Profit</option>
                  <option value="volume">Volume</option>
                  <option value="time">Time</option>
                </select>
              </div>
            </div>

            <button className="flex items-center space-x-1 px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 rounded-lg text-sm text-blue-400 transition-colors">
              <Eye className="w-3 h-3" />
              <span>Auto-Execute</span>
            </button>
          </div>
        )}
      </div>

      {/* Liste des opportunités */}
      <div className="p-6">
        {isScanning ? (
          <div className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-amber-400/30 border-t-amber-400 rounded-full mx-auto mb-4"
            />
            <p className="text-amber-400 font-semibold">Scanning for opportunities...</p>
            <p className="text-sm text-slate-400 mt-1">Analyzing cross-chain prices</p>
          </div>
        ) : filteredOpportunities.length > 0 ? (
          <div className="space-y-3">
            {filteredOpportunities.slice(0, expanded ? undefined : 3).map((opportunity, index) => (
              <motion.div
                key={opportunity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-slate-900/50 hover:bg-slate-900/70 border border-slate-700/50 hover:border-amber-600/50 rounded-lg p-4 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {opportunity.tokenSymbol.slice(0, 3)}
                      </span>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white">
                          {opportunity.tokenSymbol}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          opportunity.profitPercentage >= 0.5 
                            ? 'bg-green-900/30 text-green-400'
                            : opportunity.profitPercentage >= 0.2
                            ? 'bg-amber-900/30 text-amber-400'
                            : 'bg-blue-900/30 text-blue-400'
                        }`}>
                          {opportunity.profitPercentage.toFixed(2)}% profit
                        </span>
                      </div>
                      
                      <div className="text-sm text-slate-400 mt-1">
                        {opportunity.prices[0].chain} → {opportunity.prices[1].chain}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
                      ${opportunity.netProfitUSD}
                    </div>
                    <div className="text-sm text-slate-400">
                      Net profit
                    </div>
                  </div>
                </div>

                {/* Détails étendus (si expanded) */}
                {expanded && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-slate-400">Buy Price</div>
                      <div className="text-green-400 font-semibold">
                        ${opportunity.bestBuyPrice}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Sell Price</div>
                      <div className="text-red-400 font-semibold">
                        ${opportunity.bestSellPrice}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Max Size</div>
                      <div className="text-white font-semibold">
                        ${opportunity.maxTradeSize}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Time Left</div>
                      <div className="text-amber-400 font-semibold flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{getTimeRemaining(opportunity.validUntil)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/50">
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <DollarSign className="w-3 h-3" />
                    <span>Min: ${opportunity.minTradeSize}</span>
                    <span>•</span>
                    <span>Gas: ${opportunity.estimatedGasCost}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-1 px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 rounded text-xs text-blue-400 transition-colors">
                      <Eye className="w-3 h-3" />
                      <span>Analyze</span>
                    </button>
                    
                    <button className="flex items-center space-x-1 px-3 py-1 bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 rounded text-xs text-green-400 transition-colors">
                      <Zap className="w-3 h-3" />
                      <span>Execute</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-slate-400 mb-2">
              No Opportunities Found
            </h4>
            <p className="text-sm text-slate-500 mb-4">
              Market conditions don't show profitable arbitrage opportunities right now
            </p>
            <button
              onClick={performScan}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/30 rounded-lg text-amber-400 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Scan</span>
            </button>
          </div>
        )}

        {/* Link pour plus d'opportunités (si pas expanded) */}
        {!expanded && filteredOpportunities.length > 3 && (
          <div className="text-center mt-4 pt-4 border-t border-slate-700/50">
            <button className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
              View {filteredOpportunities.length - 3} more opportunities →
            </button>
          </div>
        )}
      </div>

      {/* Footer avec disclaimer */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/30">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Opportunities change rapidly. Execute quickly.</span>
          </div>
          <button className="flex items-center space-x-1 hover:text-amber-400 transition-colors">
            <ExternalLink className="w-3 h-3" />
            <span>Risk Disclaimer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArbitrageScanner;