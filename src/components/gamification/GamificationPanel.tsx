// components/gamification/GamificationPanel.tsx - Système de récompenses
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Zap, 
  Calendar, 
  Award, 
  Gift,
  TrendingUp,
  MessageCircle,
  Activity,
  Crown,
  Sparkles,
  ExternalLink
} from 'lucide-react';

import type { UserProfile, NFTReward } from '../../../types/api';
import { useGamification } from '../../hooks/useGamification';

interface GamificationPanelProps {
  profile: UserProfile | null;
  expanded?: boolean;
  className?: string;
}

const GamificationPanel: React.FC<GamificationPanelProps> = ({ 
  profile, 
  expanded = false,
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'nfts' | 'leaderboard'>('overview');
  
  const {
    xpToNextLevel,
    dailyXPEarned,
    availableNFTs,
    engagementMetrics,
    markPlatformUsage,
    rewardComment,
    claimNFTWithAnimation
  } = useGamification(profile?.walletAddress);

  if (!profile) {
    return (
      <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 ${className}`}>
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-400 mb-2">
            Connect Wallet
          </h3>
          <p className="text-sm text-slate-500">
            Start earning XP and collecting NFTs
          </p>
        </div>
      </div>
    );
  }

  const levelProgress = ((profile.totalXP % 100) / 100) * 100;

  return (
    <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl backdrop-blur-sm ${className}`}>
      {/* Header avec niveau et XP */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {profile.level}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Level {profile.level}
              </h3>
              <p className="text-sm text-slate-400">
                {profile.totalXP.toLocaleString()} XP Total
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-slate-400">Streak</div>
            <div className="text-xl font-bold text-orange-400">
              {profile.dailyStreak} 🔥
            </div>
          </div>
        </div>

        {/* Barre de progression niveau */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Progress to Level {profile.level + 1}</span>
            <span className="text-purple-400 font-semibold">
              {xpToNextLevel} XP to go
            </span>
          </div>
          
          <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>
      </div>

      {/* Navigation des onglets (si expanded) */}
      {expanded && (
        <div className="flex border-b border-slate-700/50">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'nfts', label: 'NFTs', icon: Gift },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-400 bg-purple-900/20 border-b-2 border-purple-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Contenu principal */}
      <div className="p-6">
        {/* Vue Overview ou contenu compact */}
        {(!expanded || activeTab === 'overview') && (
          <div className="space-y-4">
            {/* Activités quotidiennes */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Today's Activities</span>
                <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded-full">
                  {dailyXPEarned} XP earned
                </span>
              </h4>

              <div className="space-y-2">
                {/* Utilisation plateforme */}
                <motion.div 
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    profile.todayActivities.platformUsed
                      ? 'bg-green-900/20 border-green-600/30'
                      : 'bg-slate-700/30 border-slate-600/30'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-3">
                    <Activity className={`w-5 h-5 ${
                      profile.todayActivities.platformUsed 
                        ? 'text-green-400' 
                        : 'text-slate-400'
                    }`} />
                    <span className="text-sm text-white">Use Platform Daily</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-green-400">+20 XP</span>
                    {profile.todayActivities.platformUsed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <span className="text-white text-xs">✓</span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Trade exécuté */}
                <motion.div 
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    profile.todayActivities.tradeExecuted
                      ? 'bg-green-900/20 border-green-600/30'
                      : 'bg-slate-700/30 border-slate-600/30'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-3">
                    <Zap className={`w-5 h-5 ${
                      profile.todayActivities.tradeExecuted 
                        ? 'text-green-400' 
                        : 'text-slate-400'
                    }`} />
                    <span className="text-sm text-white">Execute a Trade</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-green-400">+10 XP</span>
                    {profile.todayActivities.tradeExecuted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <span className="text-white text-xs">✓</span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Commentaire posté */}
                <motion.div 
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    profile.todayActivities.commentPosted
                      ? 'bg-green-900/20 border-green-600/30'
                      : 'bg-slate-700/30 border-slate-600/30'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-3">
                    <MessageCircle className={`w-5 h-5 ${
                      profile.todayActivities.commentPosted 
                        ? 'text-green-400' 
                        : 'text-slate-400'
                    }`} />
                    <span className="text-sm text-white">Share Insight</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-green-400">+20 XP</span>
                    {profile.todayActivities.commentPosted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <span className="text-white text-xs">✓</span>
                      </motion.div>
                    ) : (
                      <button
                        onClick={rewardComment}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors"
                      >
                        Post
                      </button>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* NFTs disponibles */}
            {availableNFTs.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
                  <Gift className="w-4 h-4" />
                  <span>Available Rewards</span>
                  <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-1 rounded-full">
                    {availableNFTs.length} new
                  </span>
                </h4>

                <div className="space-y-2">
                  {availableNFTs.slice(0, expanded ? availableNFTs.length : 2).map(nft => (
                    <motion.div
                      key={nft.id}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-600/30 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                      layout
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{nft.name}</div>
                          <div className="text-xs text-slate-400">{nft.description}</div>
                          <div className={`text-xs font-semibold ${
                            nft.rarity === 'legendary' ? 'text-yellow-400' :
                            nft.rarity === 'epic' ? 'text-purple-400' :
                            nft.rarity === 'rare' ? 'text-blue-400' : 'text-green-400'
                          }`}>
                            {nft.rarity.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      
                      <motion.button
                        onClick={() => claimNFTWithAnimation(nft.id)}
                        className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm rounded-lg font-semibold transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Claim
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats rapides */}
            {!expanded && (
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700/50">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">
                    {profile.nftsOwned.length}
                  </div>
                  <div className="text-xs text-slate-400">NFTs Owned</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">
                    {profile.totalTrades}
                  </div>
                  <div className="text-xs text-slate-400">Total Trades</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vue NFTs Collection (expanded seulement) */}
        {expanded && activeTab === 'nfts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">NFT Collection</h4>
              <span className="text-sm text-slate-400">
                {profile.nftsOwned.length} owned
              </span>
            </div>

            {profile.nftsOwned.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {profile.nftsOwned.map(nft => (
                  <motion.div
                    key={nft.id}
                    className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-4 hover:border-purple-500/50 transition-colors"
                    whileHover={{ y: -2 }}
                  >
                    <div className="w-full h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg mb-3 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-white mb-1">
                      {nft.name}
                    </div>
                    <div className="text-xs text-slate-400 mb-2">
                      {nft.description}
                    </div>
                    <div className={`text-xs font-semibold ${
                      nft.rarity === 'legendary' ? 'text-yellow-400' :
                      nft.rarity === 'epic' ? 'text-purple-400' :
                      nft.rarity === 'rare' ? 'text-blue-400' : 'text-green-400'
                    }`}>
                      {nft.rarity.toUpperCase()}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Gift className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">No NFTs collected yet</p>
                <p className="text-sm text-slate-500 mt-1">
                  Complete activities to earn your first NFT!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Vue Leaderboard (expanded seulement) */}
        {expanded && activeTab === 'leaderboard' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">Community Leaderboard</h4>
              <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                View Full Ranking
              </button>
            </div>

            <div className="space-y-2">
              {/* Simuler un leaderboard */}
              {[
                { rank: 1, address: '0x1234...5678', level: 15, xp: 1567, isUser: false },
                { rank: 2, address: profile.walletAddress, level: profile.level, xp: profile.totalXP, isUser: true },
                { rank: 3, address: '0x9876...5432', level: 12, xp: 1234, isUser: false },
                { rank: 4, address: '0xabcd...efgh', level: 11, xp: 1156, isUser: false },
                { rank: 5, address: '0x5555...4444', level: 10, xp: 1045, isUser: false }
              ].map(entry => (
                <motion.div
                  key={entry.rank}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    entry.isUser 
                      ? 'bg-purple-900/30 border border-purple-600/50' 
                      : 'bg-slate-700/30'
                  }`}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      entry.rank === 1 ? 'bg-yellow-500 text-black' :
                      entry.rank === 2 ? 'bg-gray-400 text-black' :
                      entry.rank === 3 ? 'bg-amber-600 text-white' :
                      'bg-slate-600 text-white'
                    }`}>
                      {entry.rank}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {entry.isUser ? 'You' : `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`}
                      </div>
                      <div className="text-xs text-slate-400">
                        Level {entry.level}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-purple-400">
                      {entry.xp.toLocaleString()} XP
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer avec lien vers plus d'infos */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/30">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>🎮 Gamification powered by community</span>
          <button className="flex items-center space-x-1 hover:text-purple-400 transition-colors">
            <ExternalLink className="w-3 h-3" />
            <span>Learn More</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamificationPanel;