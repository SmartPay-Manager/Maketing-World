// components/terminal/Dashboard.tsx - Main DeFi terminal view
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Activity, 
  DollarSign, 
  Zap, 
  Globe, 
  RefreshCw,
  Settings,
  Bell
} from 'lucide-react';

import { use1InchMarketData } from '../../hooks/use1InchMarketData';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useGamification } from '../../hooks/useGamification';
import { useFusionPlusSwap } from '../../hooks/useFusionPlusSwap';
import { useMarketStore } from '../../store/marketStore';
import TabContent from './TabContent';

// Types pour les onglets du terminal
type TerminalTab = 'overview' | 'portfolio' | 'trading' | 'analytics' | 'community';

interface DashboardProps {
  walletAddress?: string;
  className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  walletAddress,
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState<TerminalTab>('overview');
  const { markPlatformUsage } = useGamification(walletAddress);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasMarkedUsage, setHasMarkedUsage] = useState(false);

  // Hooks for data
  const { marketData, isConnected, lastUpdate } = useMarketStore();
  
  // Mark platform usage when wallet connects
  React.useEffect(() => {
    if (walletAddress && !hasMarkedUsage) {
      markPlatformUsage();
      setHasMarkedUsage(true);
    }
  }, [walletAddress, hasMarkedUsage, markPlatformUsage]);
  console.log('Dashboard marketData:', marketData, 'isConnected:', isConnected);
  const { refresh } = use1InchMarketData({
    tokens: [
      '0xA0b86a33E6886D0c5906C0Ae01fAec12E7e9B85E', // USDC
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
      '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    ],
    updateInterval: 30000
  });

  const { metrics: portfolioMetrics, isLoading: portfolioLoading } = usePortfolio(walletAddress);
  const { profile, engagementMetrics } = useGamification(walletAddress);
  const { swapStats } = useFusionPlusSwap();

  // Force data refresh
  const handleRefresh = () => {
    refresh();
    setRefreshKey(prev => prev + 1);
  };

  // Calculate global statistics with safe defaults
  const globalStats = useMemo(() => ({
    totalValue: typeof portfolioMetrics?.totalValueUSD === 'string' 
      ? parseFloat(portfolioMetrics.totalValueUSD) 
      : 0,
    pnl24h: portfolioMetrics?.totalPnL24h ?? 0,
    pnlPercentage: portfolioMetrics?.pnlPercentage ?? 0,
    activeSwaps: swapStats?.activeSwaps ?? 0,
    userLevel: profile?.level ?? 1,
    xpProgress: engagementMetrics?.levelProgress ?? 0
  }), [portfolioMetrics, swapStats, profile, engagementMetrics]);

  // Show loading state if portfolio data is loading
  if (portfolioLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-green-400 font-mono flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <motion.div 
            className="w-16 h-16 border-4 border-green-400/30 border-t-green-400 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <div className="text-green-400 text-sm">Loading portfolio data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-900 text-green-400 font-mono ${className}`}>
      {/* Header Terminal - Style Bloomberg */}
      <header className="border-b border-green-800/30 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo et titre */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-6 h-6 text-green-400" />
              <h1 className="text-xl font-bold text-green-400">
                DeFi PulseX Pro
              </h1>
            </div>
            
            {/* Indicateur de connexion */}
            <motion.div 
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
                isConnected 
                  ? 'bg-green-900/30 text-green-400' 
                  : 'bg-red-900/30 text-red-400'
              }`}
              animate={{ scale: isConnected ? 1 : [1, 1.05, 1] }}
              transition={{ repeat: isConnected ? 0 : Infinity, duration: 2 }}
            >
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-400' : 'bg-red-400'
              }`} />
              <span>{isConnected ? 'LIVE' : 'DISCONNECTED'}</span>
            </motion.div>
          </div>

          {/* Global stats in header */}
          <div className="hidden lg:flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-slate-300">Portfolio:</span>
              {portfolioLoading ? (
                <motion.div 
                  className="w-2 h-2 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              ) : (
                <span className="text-green-400 font-semibold">
                  ${globalStats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-slate-300">24h P&L:</span>
              {portfolioLoading ? (
                <motion.div 
                  className="w-2 h-2 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              ) : (
                <span className={`font-semibold ${
                  globalStats.pnl24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {globalStats.pnl24h >= 0 ? '+' : ''}{globalStats.pnl24h.toLocaleString(undefined, { 
                    style: 'currency', 
                    currency: 'USD',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                  {' '}({globalStats.pnlPercentage >= 0 ? '+' : ''}{globalStats.pnlPercentage.toFixed(2)}%)
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span className="text-slate-300">Active Swaps:</span>
              <span className="text-amber-400 font-semibold">
                {globalStats.activeSwaps}
              </span>
              {globalStats.activeSwaps > 0 && (
                <motion.div 
                  className="w-1.5 h-1.5 bg-amber-400 rounded-full"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-300">Level:</span>
              <span className="text-purple-400 font-semibold">
                {globalStats.userLevel}
              </span>
              {globalStats.xpProgress > 0 && (
                <div className="w-16 h-1 bg-purple-900/30 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-purple-400"
                    style={{ width: `${Math.min(globalStats.xpProgress, 100)}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(globalStats.xpProgress, 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Contrôles */}
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={handleRefresh}
              className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95, rotate: 180 }}
              disabled={!isConnected}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.button>

            <button className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors">
              <Bell className="w-4 h-4" />
            </button>

            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation des onglets */}
        <nav className="flex space-x-0 px-6">
          {[
            { id: 'overview', label: 'OVERVIEW', icon: Activity },
            { id: 'portfolio', label: 'PORTFOLIO', icon: DollarSign },
            { id: 'trading', label: 'TRADING', icon: Zap },
            { id: 'analytics', label: 'ANALYTICS', icon: TrendingUp },
            { id: 'community', label: 'COMMUNITY', icon: Globe }
          ].map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TerminalTab)}
              className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-green-400 text-green-400 bg-green-900/10'
                  : 'border-transparent text-slate-400 hover:text-green-400 hover:border-green-800'
              }`}
              whileHover={{ y: -1 }}
              whileTap={{ y: 0 }}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-semibold">{tab.label}</span>
            </motion.button>
          ))}
        </nav>
      </header>

      {/* Main content */}
      <main className="p-6">
        <TabContent
          activeTab={activeTab}
          refreshKey={refreshKey}
          walletAddress={walletAddress}
          portfolioLoading={portfolioLoading}
          marketData={marketData}
          profile={profile || undefined}
        />
      </main>

      {/* System information footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-800/50 backdrop-blur-sm border-t border-green-800/30 px-6 py-2">
        <div className="flex justify-between text-xs text-slate-400">
          <div>Last update: {new Date(lastUpdate).toLocaleTimeString()}</div>
          <div>Version: 1.0.0-alpha</div>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;