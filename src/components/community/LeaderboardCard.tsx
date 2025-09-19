import React from 'react';
import { Trophy, Award, Star, TrendingUp } from 'lucide-react';

interface Trader {
  rank: number;
  address: string;
  totalValue: number;
  xp: number;
  swapCount: number;
  profitPercentage: number;
}

const LeaderboardCard: React.FC = () => {
  // Mock data - In production, this would come from your backend
  const topTraders: Trader[] = [
    { rank: 1, address: '0x742d...8c8c', totalValue: 2500000, xp: 15000, swapCount: 345, profitPercentage: 125.4 },
    { rank: 2, address: '0x123d...45ab', totalValue: 1800000, xp: 12000, swapCount: 289, profitPercentage: 98.2 },
    { rank: 3, address: '0x456e...89cd', totalValue: 1500000, xp: 10000, swapCount: 256, profitPercentage: 87.5 },
    { rank: 4, address: '0x789f...12ef', totalValue: 1200000, xp: 8500, swapCount: 198, profitPercentage: 76.3 },
    { rank: 5, address: '0xabc0...34gh', totalValue: 1000000, xp: 7200, swapCount: 167, profitPercentage: 65.8 },
    { rank: 6, address: '0xdef1...56ij', totalValue: 800000, xp: 6800, swapCount: 145, profitPercentage: 54.2 },
    { rank: 7, address: '0xghi2...78kl', totalValue: 700000, xp: 5500, swapCount: 134, profitPercentage: 48.9 },
    { rank: 8, address: '0xmno3...90pm', totalValue: 600000, xp: 4900, swapCount: 123, profitPercentage: 42.1 },
    { rank: 9, address: '0xqrs4...12tu', totalValue: 500000, xp: 4200, swapCount: 112, profitPercentage: 38.7 },
    { rank: 10, address: '0xvwx5...34yz', totalValue: 400000, xp: 3800, swapCount: 98, profitPercentage: 35.4 }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-400" />;
      case 2:
        return <Award className="h-5 w-5 text-gray-300" />;
      case 3:
        return <Star className="h-5 w-5 text-amber-600" />;
      default:
        return <TrendingUp className="h-5 w-5 text-slate-400" />;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-400/10 border-yellow-400/20';
      case 2:
        return 'bg-gray-300/10 border-gray-300/20';
      case 3:
        return 'bg-amber-600/10 border-amber-600/20';
      default:
        return 'bg-slate-700/50 border-slate-600/20';
    }
  };

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="h-7 w-7 text-yellow-400" />
          <div>
            <h2 className="text-xl font-bold text-slate-200">Top Traders</h2>
            <p className="text-sm text-slate-400">Last 30 days performance</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {topTraders.map((trader) => (
          <div
            key={trader.address}
            className={`flex items-center justify-between p-4 rounded-lg border ${getRankStyle(trader.rank)} transition-all hover:scale-102 hover:bg-opacity-75`}
          >
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                trader.rank <= 3 ? 'bg-slate-800/50' : 'bg-slate-800/30'
              }`}>
                {getRankIcon(trader.rank)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-200 font-medium">{trader.address}</span>
                  {trader.rank <= 3 && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                      {trader.rank === 1 ? 'Elite' : trader.rank === 2 ? 'Pro' : 'Expert'}
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-400 mt-1">
                  <span className="text-slate-500">{trader.swapCount} trades</span>
                  <span className="mx-2">·</span>
                  <span className="text-green-400">{trader.xp} XP</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-medium text-lg">
                {formatValue(trader.totalValue)}
              </div>
              <div className="flex items-center justify-end gap-1 text-sm text-green-500 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>+{trader.profitPercentage}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardCard;
