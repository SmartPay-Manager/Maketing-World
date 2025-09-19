import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Activity,
  Filter,
  ExternalLink
} from 'lucide-react';

import type { MarketData } from '../../types/api';
import { formatCurrency, formatPercentage, getPriceChangeColor } from '../../utils/formatters';

interface Tokenomics {
  burningMechanism: string;
  stakingYield: string;
  inflationRate: number;
  totalStaked: string;
}

interface TokenData extends MarketData {
  name: string;
  circulatingSupply: number;
  maxSupply: number | null;
  tokenomics: Tokenomics;
}

interface MarketOverviewProps {
  marketData: Record<string, MarketData>;
  className?: string;
  detailed?: boolean;
  showTokenomics?: boolean;
  assets?: TokenData[];
}

type FilterType = 'all' | 'gainers' | 'losers';
type TimeframeType = '1h' | '24h' | '7d';

const MOCK_MARKET_DATA: MarketData[] = [
  {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    symbol: 'WETH',
    price: '2001.50',
    priceChange24h: 2.1,
    volume24h: '1250000000',
    marketCap: '241800000000',
    liquidity: { 
      usd: '500000000', 
      base: '250000', 
      quote: '500000000' 
    },
    lastUpdated: Date.now(),
    high24h: 2050.75,
    low24h: 1985.25,
    change24h: 2.1
  },
  // Add more mock data as needed
];

const MarketData: React.FC<MarketOverviewProps> = ({ 
  marketData,
  className = '' 
}) => {
  console.log('MarketData component:', { marketData });
  const [filter, setFilter] = useState<FilterType>('all');
  const [timeframe, setTimeframe] = useState<TimeframeType>('24h');

  // Combine real data with mock data for demo purposes
  const allMarketData = useMemo(() => {
    const realTokens = Object.values(marketData);
    const mockTokens = MOCK_MARKET_DATA.filter(mock => !marketData[mock.address]);
    return [...realTokens, ...mockTokens];
  }, [marketData]);

  // Filter and sort market data
  const filteredData = useMemo(() => {
    return allMarketData
      .filter((data: MarketData) => {
        if (filter === 'gainers') return data.priceChange24h > 0;
        if (filter === 'losers') return data.priceChange24h < 0;
        return true;
      })
      .sort((a: MarketData, b: MarketData) => {
        if (filter === 'gainers') return b.priceChange24h - a.priceChange24h;
        if (filter === 'losers') return a.priceChange24h - b.priceChange24h;
        return parseFloat(b.marketCap) - parseFloat(a.marketCap);
      });
  }, [allMarketData, filter]);

  // Calculate market statistics
  const marketStats = useMemo(() => ({
    totalMarketCap: allMarketData.reduce((sum: number, data: MarketData) => sum + parseFloat(data.marketCap), 0),
    totalVolume24h: allMarketData.reduce((sum: number, data: MarketData) => sum + parseFloat(data.volume24h), 0),
    gainersCount: allMarketData.filter(data => data.priceChange24h > 0).length,
    losersCount: allMarketData.filter(data => data.priceChange24h < 0).length,
    avgChange: allMarketData.reduce((sum: number, data: MarketData) => sum + data.priceChange24h, 0) / allMarketData.length
  }), [allMarketData]);

  const handleAssetClick = (asset: MarketData) => {
    console.log('Asset clicked:', asset);
    // Add your click handler logic here
  };

  return (
    <div className={`rounded-lg bg-slate-800/50 backdrop-blur-sm min-h-[200px] ${className}`} style={{ border: '1px solid red' }}>
      {/* Market Overview Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-green-400" />
            <h2 className="text-lg font-semibold text-green-400">Market Overview</h2>
          </div>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">
              {formatCurrency(marketStats.totalMarketCap, { compact: true })}
            </div>
            <div className="text-xs text-slate-400">Total Market Cap</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">
              {formatCurrency(marketStats.totalVolume24h, { compact: true })}
            </div>
            <div className="text-xs text-slate-400">24h Volume</div>
          </div>
          
          <div className="text-center">
            <div className={`text-lg font-bold ${marketStats.avgChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercentage(marketStats.avgChange)}
            </div>
            <div className="text-xs text-slate-400">Avg Change</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-slate-300">
              <span className="text-green-400">{marketStats.gainersCount}</span>
              <span className="text-slate-500 mx-1">/</span>
              <span className="text-red-400">{marketStats.losersCount}</span>
            </div>
            <div className="text-xs text-slate-400">Gainers/Losers</div>
          </div>
        </div>

        {/* Filters and timeframe */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <div className="flex space-x-1">
              {[
                { id: 'all' as const, label: 'All Assets' },
                { id: 'gainers' as const, label: 'Gainers', count: marketStats.gainersCount },
                { id: 'losers' as const, label: 'Losers', count: marketStats.losersCount }
              ].map(filterOption => (
                <button
                  key={filterOption.id}
                  onClick={() => setFilter(filterOption.id)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filter === filterOption.id
                      ? 'bg-blue-600/30 text-blue-400 border border-blue-600/50'
                      : 'bg-slate-700/30 text-slate-400 hover:text-white hover:bg-slate-600/30'
                  }`}
                >
                  {filterOption.label}
                  {filterOption.count !== undefined && (
                    <span className="ml-1 text-xs opacity-75">({filterOption.count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-1">
            {(['1h', '24h', '7d'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  timeframe === tf
                    ? 'bg-slate-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="p-6">
        {filteredData.length > 0 ? (
          <div className="space-y-2">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-slate-400 border-b border-slate-700/50">
              <div className="col-span-3">Asset</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">24h Change</div>
              <div className="col-span-2 text-right">Volume</div>
              <div className="col-span-2 text-right">Market Cap</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* Asset Rows */}
            {filteredData.slice(0, 12).map((asset, index) => (
              <motion.div
                key={asset.address}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="grid grid-cols-12 gap-4 px-4 py-3 rounded-lg hover:bg-slate-900/50 transition-colors group cursor-pointer"
                onClick={() => handleAssetClick(asset)}
              >
                {/* Asset Info */}
                <div className="col-span-3 flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{asset.symbol.slice(0, 2)}</span>
                  </div>
                  <div>
                    <div className="font-medium text-slate-200">{asset.symbol}</div>
                    <div className="text-xs text-slate-400">
                      {asset.address.slice(0, 6)}...{asset.address.slice(-4)}
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-2 text-right">
                  <div className="font-medium text-slate-200">
                    {formatCurrency(parseFloat(asset.price))}
                  </div>
                  <div className="text-xs text-slate-400">
                    {formatCurrency(parseFloat(asset.liquidity.usd), { compact: true })} Liquidity
                  </div>
                </div>

                {/* 24h Change */}
                <div className="col-span-2 text-right">
                  <div className={`font-medium ${getPriceChangeColor(asset.priceChange24h)}`}>
                    {formatPercentage(asset.priceChange24h)}
                  </div>
                </div>

                {/* Volume */}
                <div className="col-span-2 text-right">
                  <div className="font-medium text-slate-200">
                    {formatCurrency(parseFloat(asset.volume24h), { compact: true })}
                  </div>
                </div>

                {/* Market Cap */}
                <div className="col-span-2 text-right">
                  <div className="font-medium text-slate-200">
                    {formatCurrency(parseFloat(asset.marketCap), { compact: true })}
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1 text-right">
                  <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-slate-700/50 rounded-lg transition-all">
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-400">No assets found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketData;
