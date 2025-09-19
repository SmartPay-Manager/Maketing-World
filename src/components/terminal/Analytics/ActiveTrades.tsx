// components/terminal/ActiveTrades.tsx - Suivi des trades en temps réel
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Loader2,
  ExternalLink,
  ArrowRight,
  Zap,
  Shield,
  Eye,
  MoreHorizontal
} from 'lucide-react';

import { useTradingStore } from '../../../store/tradingStore';
import type { ActiveTrade, XRPAtomicSwap } from '../../../types/api';
import { formatCurrency, formatTimeAgo } from '../../../utils/formatters';

interface ActiveTradesProps {
  expanded?: boolean;
  className?: string;
}

const ActiveTrades: React.FC<ActiveTradesProps> = ({ 
  expanded = false,
  className = '' 
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed'>('all');
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);

  const { activeTrades, tradeHistory } = useTradingStore();

  // Calculate network-specific stats
  const networkStats = {
    eth: {
      total: 0,
      pending: 0,
      completed: 0,
      failed: 0
    },
    xrp: {
      total: 0,
      pending: 0,
      completed: 0,
      failed: 0
    }
  };

  // Combine all trades and calculate stats
  const allTrades = [
    ...activeTrades,
    ...tradeHistory.slice(0, expanded ? 10 : 3)
  ].map(trade => {
    // Update network stats
    if (trade.type === 'fusion_plus' || trade.type === 'classic') {
      networkStats.eth.total++;
      if (trade.status === 'pending' || trade.status === 'processing') networkStats.eth.pending++;
      if (trade.status === 'completed') networkStats.eth.completed++;
      if (trade.status === 'failed') networkStats.eth.failed++;
    }
    if (trade.type === 'orderbook' || (trade.crossChainDetails?.destinationChain === 'xrp')) {
      networkStats.xrp.total++;
      if (trade.status === 'pending' || trade.status === 'processing') networkStats.xrp.pending++;
      if (trade.status === 'completed') networkStats.xrp.completed++;
      if (trade.status === 'failed') networkStats.xrp.failed++;
    }
    return trade;
  });

  // Add mock trades for demo purposes
  const mockTrades: ActiveTrade[] = [
  {
    id: 'demo_trade_1',
    type: 'fusion_plus',
    fromToken: 'ETH',
    toToken: 'XRP',
    fromAmount: '1.5',
    expectedAmount: '3000',
    actualAmount: '2998.5',
    status: 'completed',
    createdAt: Date.now() - 300000, // 5 minutes ago
    completedAt: Date.now() - 120000, // 2 minutes ago
    crossChainDetails: {
      sourceChain: 'ethereum',
      destinationChain: 'xrp',
      atomicSwapId: 'atomic_swap_demo_1'
    },
    txHash: '0x1234567890abcdef...',
    explorerUrl: 'https://etherscan.io/tx/0x1234567890abcdef',
    estimatedGas: '52000',
    gasPrice: '20000000000',
    networkFee: '0.00104'
  },
  {
    id: 'demo_trade_2',
    type: 'fusion_plus',
    fromToken: 'XRP',
    toToken: 'ETH',
    fromAmount: '5000',
    expectedAmount: '2.48',
    status: 'processing',
    createdAt: Date.now() - 180000, // 3 minutes ago
    crossChainDetails: {
      sourceChain: 'xrp',
      destinationChain: 'ethereum',
      atomicSwapId: 'atomic_swap_demo_2',
    },
    estimatedGas: '48000',
    gasPrice: '22000000000',
    networkFee: '0.001056',
  },
  {
    id: 'demo_trade_3',
    type: 'classic',
    fromToken: 'USDC',
    toToken: 'WETH',
    fromAmount: '5000',
    expectedAmount: '2.499',
    status: 'pending',
    createdAt: Date.now() - 30000, // 30 seconds ago
    estimatedGas: '45000',
    gasPrice: '19000000000',
    networkFee: '0.000855',
  },
];

  const combinedTrades = [...allTrades, ...mockTrades];

  // Filtrer les trades
  const filteredTrades = combinedTrades.filter(trade => {
    if (filter === 'all') return true;
    return trade.status === filter;
  });

  // Obtenir l'icône de statut
  const getStatusIcon = (status: ActiveTrade['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status: ActiveTrade['status']) => {
    switch (status) {
      case 'pending': return 'text-amber-400 bg-amber-900/20 border-amber-600/30';
      case 'processing': return 'text-blue-400 bg-blue-900/20 border-blue-600/30';
      case 'completed': return 'text-green-400 bg-green-900/20 border-green-600/30';
      case 'failed': return 'text-red-400 bg-red-900/20 border-red-600/30';
      default: return 'text-slate-400 bg-slate-900/20 border-slate-600/30';
    }
  };

  // Calculer les statistiques globales et par réseau
  const stats = {
    total: combinedTrades.length,
    pending: combinedTrades.filter(t => t.status === 'pending').length,
    processing: combinedTrades.filter(t => t.status === 'processing').length,
    completed: combinedTrades.filter(t => t.status === 'completed').length,
    failed: combinedTrades.filter(t => t.status === 'failed').length,
    networks: {
      ethereum: {
        total: combinedTrades.filter(t => t.type === 'classic' || t.type === 'fusion_plus').length,
        pending: combinedTrades.filter(t => (t.type === 'classic' || t.type === 'fusion_plus') && t.status === 'pending').length,
        processing: combinedTrades.filter(t => (t.type === 'classic' || t.type === 'fusion_plus') && t.status === 'processing').length,
        completed: combinedTrades.filter(t => (t.type === 'classic' || t.type === 'fusion_plus') && t.status === 'completed').length,
        failed: combinedTrades.filter(t => (t.type === 'classic' || t.type === 'fusion_plus') && t.status === 'failed').length
      },
      xrp: {
        total: combinedTrades.filter(t => t.type === 'orderbook' || t.crossChainDetails?.destinationChain === 'xrp').length,
        pending: combinedTrades.filter(t => (t.type === 'orderbook' || t.crossChainDetails?.destinationChain === 'xrp') && t.status === 'pending').length,
        processing: combinedTrades.filter(t => (t.type === 'orderbook' || t.crossChainDetails?.destinationChain === 'xrp') && t.status === 'processing').length,
        completed: combinedTrades.filter(t => (t.type === 'orderbook' || t.crossChainDetails?.destinationChain === 'xrp') && t.status === 'completed').length,
        failed: combinedTrades.filter(t => (t.type === 'orderbook' || t.crossChainDetails?.destinationChain === 'xrp') && t.status === 'failed').length
      }
    }
  };

  return (
    <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl backdrop-blur-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-400">
                Active Trades
              </h3>
              <p className="text-sm text-slate-400">
                Real-time trade monitoring
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">Live</span>
            </div>
          </div>
        </div>

        {/* Stats overview */}
        {/* Global Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 p-4 bg-slate-900/50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">{stats.total}</div>
            <div className="text-xs text-slate-400">Total Trades</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-amber-400">{stats.processing}</div>
            <div className="text-xs text-slate-400">Processing</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{stats.completed}</div>
            <div className="text-xs text-slate-400">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-slate-400">
              {stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(0) : '0'}%
            </div>
            <div className="text-xs text-slate-400">Success Rate</div>
          </div>
        </div>

        {/* Network-specific Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Ethereum Network */}
          <div className="p-4 bg-slate-900/50 rounded-lg border border-blue-900/30">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-sm font-medium text-blue-400">Ethereum Network</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-400">Active</div>
                <div className="text-lg font-bold text-blue-400">
                  {stats.networks.ethereum.processing}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Total</div>
                <div className="text-lg font-bold text-slate-300">
                  {stats.networks.ethereum.total}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Success Rate</div>
                <div className="text-sm font-bold text-green-400">
                  {stats.networks.ethereum.total > 0 
                    ? ((stats.networks.ethereum.completed / stats.networks.ethereum.total) * 100).toFixed(0)
                    : '0'}%
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Failed</div>
                <div className="text-sm font-bold text-red-400">
                  {stats.networks.ethereum.failed}
                </div>
              </div>
            </div>
          </div>

          {/* XRP Network */}
          <div className="p-4 bg-slate-900/50 rounded-lg border border-green-900/30">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm font-medium text-green-400">XRP Network</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-400">Active</div>
                <div className="text-lg font-bold text-green-400">
                  {stats.networks.xrp.processing}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Total</div>
                <div className="text-lg font-bold text-slate-300">
                  {stats.networks.xrp.total}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Success Rate</div>
                <div className="text-sm font-bold text-green-400">
                  {stats.networks.xrp.total > 0 
                    ? ((stats.networks.xrp.completed / stats.networks.xrp.total) * 100).toFixed(0)
                    : '0'}%
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Failed</div>
                <div className="text-sm font-bold text-red-400">
                  {stats.networks.xrp.failed}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres (si expanded) */}
        {expanded && (
          <div className="flex items-center space-x-2 mt-4">
            {[
              { id: 'all', label: 'All', count: stats.total },
              { id: 'pending', label: 'Pending', count: stats.pending },
              { id: 'processing', label: 'Processing', count: stats.processing },
              { id: 'completed', label: 'Completed', count: stats.completed }
            ].map(filterOption => (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id as any)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption.id
                    ? 'bg-blue-600/30 text-blue-400 border border-blue-600/50'
                    : 'bg-slate-700/30 text-slate-400 hover:text-white hover:bg-slate-600/30'
                }`}
              >
                {filterOption.label}
                {filterOption.count > 0 && (
                  <span className="ml-1 text-xs opacity-75">
                    ({filterOption.count})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Liste des trades */}
      <div className="p-6">
        {filteredTrades.length > 0 ? (
          <div className="space-y-3">
            {filteredTrades.slice(0, expanded ? undefined : 5).map((trade, index) => (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group bg-slate-900/50 hover:bg-slate-900/70 border border-slate-700/50 rounded-lg p-4 transition-all cursor-pointer ${
                  selectedTrade === trade.id ? 'ring-2 ring-blue-500/50' : ''
                }`}
                onClick={() => setSelectedTrade(selectedTrade === trade.id ? null : trade.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Icône du type de trade */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      trade.type === 'fusion_plus' 
                        ? 'bg-gradient-to-br from-purple-600 to-blue-600'
                        : trade.type === 'fusion'
                        ? 'bg-gradient-to-br from-green-600 to-blue-600'
                        : 'bg-gradient-to-br from-blue-600 to-cyan-600'
                    }`}>
                      {trade.type === 'fusion_plus' ? (
                        <Shield className="w-5 h-5 text-white" />
                      ) : (
                        <Zap className="w-5 h-5 text-white" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white">
                          {trade.fromToken} → {trade.toToken}
                        </span>
                        
                        {trade.type === 'fusion_plus' && (
                          <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-1 rounded-full font-semibold">
                            Cross-Chain
                          </span>
                        )}
                        
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${getStatusColor(trade.status)}`}>
                          {trade.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="text-sm text-slate-400 mt-1 flex items-center space-x-4">
                        <span>{trade.fromAmount} {trade.fromToken}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span>
                          {trade.actualAmount || trade.expectedAmount} {trade.toToken}
                        </span>
                        <span>•</span>
                        <span>{formatTimeAgo(trade.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Statut visuel */}
                    {getStatusIcon(trade.status)}
                    
                    {/* Actions rapides */}
                    <div className="flex items-center space-x-1">
                      {trade.txHash && (
                        <button className="p-1 hover:bg-slate-700/50 rounded transition-colors">
                          <ExternalLink className="w-3 h-3 text-slate-400 hover:text-blue-400" />
                        </button>
                      )}
                      
                      <button className="p-1 hover:bg-slate-700/50 rounded transition-colors">
                        <MoreHorizontal className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Détails étendus */}
                <AnimatePresence>
                  {selectedTrade === trade.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-slate-700/50 space-y-3"
                    >
                      {/* Informations détaillées */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-slate-400">Network Fee</div>
                          <div className="text-white font-semibold">
                            {trade.networkFee} ETH
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-slate-400">Gas Used</div>
                          <div className="text-white font-semibold">
                            {parseInt(trade.estimatedGas).toLocaleString()}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-slate-400">Trade ID</div>
                          <div className="text-white font-mono text-xs">
                            {trade.id.slice(0, 12)}...
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-slate-400">Type</div>
                          <div className="text-white font-semibold capitalize">
                            {trade.type.replace('_', ' ')}
                          </div>
                        </div>
                      </div>

                      {/* Détails cross-chain si applicable */}
                      {trade.crossChainDetails && (
                        <div className="p-3 bg-purple-900/20 border border-purple-600/30 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Shield className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-semibold text-purple-400">
                              Cross-Chain Details
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-slate-400">Source Chain</div>
                              <div className="text-white capitalize">
                                {trade.crossChainDetails.sourceChain}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-400">Destination Chain</div>
                              <div className="text-white capitalize">
                                {trade.crossChainDetails.destinationChain}
                              </div>
                            </div>
                          </div>
                          
                          {trade.crossChainDetails.atomicSwapId && (
                            <div className="mt-2">
                              <div className="text-slate-400 text-xs">Atomic Swap ID</div>
                              <div className="text-purple-300 font-mono text-xs">
                                {trade.crossChainDetails.atomicSwapId}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Timeline de progression (pour les trades en cours) */}
                      {(trade.status === 'processing' || trade.status === 'pending') && (
                        <div className="space-y-2">
                          <div className="text-sm font-semibold text-slate-300">Progress</div>
                          <div className="space-y-2">
                            {[
                              { step: 'Order Created', completed: true, time: formatTimeAgo(trade.createdAt) },
                              { step: 'Escrow Locked', completed: trade.status !== 'pending', time: trade.status !== 'pending' ? '2m ago' : null },
                              { step: 'Counterparty Found', completed: trade.status === 'processing', time: trade.status === 'processing' ? '1m ago' : null },
                              { step: 'Funds Released', completed: false, time: null }
                            ].map((step, stepIndex) => (
                              <div key={stepIndex} className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  step.completed 
                                    ? 'bg-green-400' 
                                    : trade.status === 'processing' && stepIndex === 2
                                    ? 'bg-blue-400 animate-pulse'
                                    : 'bg-slate-600'
                                }`} />
                                <span className={`text-sm ${
                                  step.completed ? 'text-white' : 'text-slate-400'
                                }`}>
                                  {step.step}
                                </span>
                                {step.time && (
                                  <span className="text-xs text-slate-500">{step.time}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions détaillées */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                        <div className="flex items-center space-x-2">
                          {trade.txHash && (
                            <a
                              href={trade.explorerUrl || `https://etherscan.io/tx/${trade.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 rounded text-xs text-blue-400 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>View on Explorer</span>
                            </a>
                          )}
                          
                          <button className="flex items-center space-x-1 px-3 py-1 bg-slate-600/20 hover:bg-slate-600/30 border border-slate-600/30 rounded text-xs text-slate-400 transition-colors">
                            <Eye className="w-3 h-3" />
                            <span>View Details</span>
                          </button>
                        </div>

                        {trade.status === 'pending' && (
                          <button className="flex items-center space-x-1 px-3 py-1 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded text-xs text-red-400 transition-colors">
                            <XCircle className="w-3 h-3" />
                            <span>Cancel</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-slate-400 mb-2">
              No Active Trades
            </h4>
            <p className="text-sm text-slate-500">
              {filter === 'all' 
                ? 'Execute your first trade to see it here'
                : `No trades with status: ${filter}`
              }
            </p>
          </div>
        )}

        {/* Link pour voir plus (si pas expanded) */}
        {!expanded && filteredTrades.length > 5 && (
          <div className="text-center mt-4 pt-4 border-t border-slate-700/50">
            <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              View {filteredTrades.length - 5} more trades →
            </button>
          </div>
        )}
      </div>

      {/* Footer avec stats en temps réel */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/30">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-4">
            <span>🔄 Auto-refresh: ON</span>
            <span>Last update: {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Real-time monitoring</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveTrades;