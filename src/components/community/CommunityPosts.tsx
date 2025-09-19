import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, Share2, Award, Trophy, Flame, TrendingUp } from 'lucide-react';

interface RankCard {
  id: string;
  address: string;
  rank: number;
  xp: number;
  trades: number;
  profit: string;
  profitPercentage: string;
}

interface Post {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  xpReward: number;
  userLiked: boolean;
}

const CommunityPosts: React.FC = () => {
  // Mock data - In production, this would come from your backend
  const [topRankers] = useState<RankCard[]>([
    {
      id: '1',
      address: '0x742d...8c8c',
      rank: 1,
      xp: 15000,
      trades: 342,
      profit: '125.5 ETH',
      profitPercentage: '+285%'
    },
    {
      id: '2',
      address: '0x123d...45ab',
      rank: 2,
      xp: 12800,
      trades: 256,
      profit: '98.2 ETH',
      profitPercentage: '+195%'
    },
    {
      id: '3',
      address: '0x456e...89cd',
      rank: 3,
      xp: 10500,
      trades: 198,
      profit: '76.8 ETH',
      profitPercentage: '+156%'
    }
  ]);

  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: '0x742d...8c8c',
      content: 'Just completed a successful arbitrage trade between Uniswap and SushiSwap! Made 2.5 ETH profit 🚀',
      timestamp: '2 hours ago',
      likes: 128,
      comments: 24,
      xpReward: 500,
      userLiked: false
    },
    {
      id: '2',
      author: '0x123d...45ab',
      content: 'New strategy alert: Using flash loans for cross-chain arbitrage opportunities. Check out my latest trades!',
      timestamp: '4 hours ago',
      likes: 95,
      comments: 18,
      xpReward: 300,
      userLiked: false
    },
    {
      id: '3',
      author: '0x456e...89cd',
      content: 'Market analysis: ETH/BTC correlation patterns suggest potential arbitrage opportunities in the next 24h',
      timestamp: '6 hours ago',
      likes: 76,
      comments: 12,
      xpReward: 200,
      userLiked: false
    }
  ]);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.userLiked ? post.likes - 1 : post.likes + 1,
          userLiked: !post.userLiked
        };
      }
      return post;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Rankers Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topRankers.map((ranker, index) => (
          <div key={ranker.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 transition-all hover:bg-slate-800/70">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-slate-700/50 border border-slate-600/50 flex items-center justify-center">
                    <span className="text-slate-300 font-medium">{ranker.address.slice(0, 2)}</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    {index === 0 && <Trophy className="w-4 h-4 text-white" />}
                    {index === 1 && <Flame className="w-4 h-4 text-white" />}
                    {index === 2 && <TrendingUp className="w-4 h-4 text-white" />}
                  </div>
                </div>
                <div>
                  <div className="text-slate-200 font-medium">{ranker.address}</div>
                  <div className="text-sm text-green-400">Rank #{ranker.rank}</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-slate-400">Total XP</div>
                <div className="text-lg font-medium text-slate-200">{ranker.xp.toLocaleString()}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-400">Total Trades</div>
                <div className="text-lg font-medium text-slate-200">{ranker.trades}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-400">Total Profit</div>
                <div className="text-lg font-medium text-green-400">{ranker.profit}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-400">ROI</div>
                <div className="text-lg font-medium text-green-400">{ranker.profitPercentage}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Post Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <textarea
          placeholder="Share your trading insights, strategies, or market analysis..."
          className="w-full bg-slate-700/30 rounded-xl p-4 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 border border-slate-600/30"
          rows={3}
        />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-400" />
            <div>
              <div className="text-sm font-medium text-slate-300">Earn XP for Quality Posts</div>
              <div className="text-xs text-slate-400">Share insights to earn up to 500 XP</div>
            </div>
          </div>
          <button className="w-full sm:w-auto px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
            Post Update
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 transition-all hover:bg-slate-800/70">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-700/50 border border-slate-600/50 flex items-center justify-center">
                  <span className="text-slate-300 font-medium">{post.author.slice(0, 2)}</span>
                </div>
                <div>
                  <div className="text-slate-200 font-medium flex items-center gap-2">
                    {post.author}
                    <span className="px-2 py-0.5 bg-slate-700/50 text-slate-400 text-xs rounded-full border border-slate-600/50">
                      Trader
                    </span>
                  </div>
                  <div className="text-sm text-slate-400">{post.timestamp}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg">
                <Award className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400">+{post.xpReward} XP</span>
              </div>
            </div>
            
            <p className="text-slate-300 mb-6 leading-relaxed">{post.content}</p>
            
            <div className="flex items-center gap-6 border-t border-slate-700/50 pt-4">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-2 ${
                  post.userLiked ? 'text-green-400' : 'text-slate-400'
                } hover:text-green-400 transition-colors`}
              >
                <ThumbsUp className="h-5 w-5" />
                <span className="font-medium">{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors">
                <MessageSquare className="h-5 w-5" />
                <span className="font-medium">{post.comments}</span>
              </button>
              <button className="flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors ml-auto">
                <Share2 className="h-5 w-5" />
                <span className="font-medium">Share</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityPosts;
