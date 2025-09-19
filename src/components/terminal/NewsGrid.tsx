import React, { useState } from 'react';
import { Newspaper, ThumbsUp, ThumbsDown, TrendingUp, Globe, Clock } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  votes: number;
  category: 'market' | 'regulation' | 'technology' | 'adoption';
}

interface NewsGridProps {
  className?: string;
}

// Mock news data - will be replaced with API data
const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'SEC Approves Multiple Spot Bitcoin ETF Applications',
    source: 'Bloomberg',
    url: '#',
    timestamp: '10 minutes ago',
    sentiment: 'positive',
    votes: 156,
    category: 'regulation'
  },
  {
    id: '2',
    title: 'Ethereum Layer 2 TVL Reaches All-Time High of $50B',
    source: 'CoinDesk',
    url: '#',
    timestamp: '25 minutes ago',
    sentiment: 'positive',
    votes: 89,
    category: 'market'
  },
  {
    id: '3',
    title: 'Major Bank Integrates USDC for Cross-Border Payments',
    source: 'Reuters',
    url: '#',
    timestamp: '45 minutes ago',
    sentiment: 'positive',
    votes: 234,
    category: 'adoption'
  },
  {
    id: '4',
    title: 'New Zero-Knowledge Protocol Claims 1M TPS Breakthrough',
    source: 'The Block',
    url: '#',
    timestamp: '1 hour ago',
    sentiment: 'neutral',
    votes: 67,
    category: 'technology'
  },
  {
    id: '5',
    title: 'Asian Markets Show Volatility Amid Regulatory Concerns',
    source: 'Nikkei',
    url: '#',
    timestamp: '2 hours ago',
    sentiment: 'negative',
    votes: 45,
    category: 'market'
  },
  {
    id: '6',
    title: 'DeFi Protocol Launches $100M Ecosystem Fund',
    source: 'Decrypt',
    url: '#',
    timestamp: '3 hours ago',
    sentiment: 'positive',
    votes: 122,
    category: 'market'
  }
];

const NewsGrid: React.FC<NewsGridProps> = ({ className = '' }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'votes'>('latest');

  const categories = [
    { id: 'all', label: 'All News' },
    { id: 'market', label: 'Market' },
    { id: 'regulation', label: 'Regulation' },
    { id: 'technology', label: 'Technology' },
    { id: 'adoption', label: 'Adoption' }
  ];

  const filteredNews = mockNews
    .filter(news => selectedCategory === 'all' || news.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'votes') {
        return b.votes - a.votes;
      }
      return 0; // For 'latest', we assume the mock data is already sorted by time
    });

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500/20 text-green-400';
      case 'negative':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-200">Crypto News</h2>
        </div>
        <div className="flex gap-4">
          <div className="flex gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  selectedCategory === category.id
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                sortBy === 'latest'
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              <Clock className="w-4 h-4" />
              Latest
            </button>
            <button
              onClick={() => setSortBy('votes')}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                sortBy === 'votes'
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Popular
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNews.map(news => (
          <div
            key={news.id}
            className="bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 rounded-lg p-4 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-slate-200 font-medium leading-snug flex-grow">
                <a href={news.url} target="_blank" rel="noopener noreferrer" className="hover:text-green-400">
                  {news.title}
                </a>
              </h3>
              <div className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(news.sentiment)}`}>
                {news.sentiment}
              </div>
            </div>
            
            <div className="mt-3 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Globe className="w-4 h-4" />
                <span>{news.source}</span>
                <span>•</span>
                <span>{news.timestamp}</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1 hover:bg-slate-600/30 rounded">
                  <ThumbsUp className="w-4 h-4 text-green-400" />
                </button>
                <span className="text-slate-300 min-w-[2ch] text-center">{news.votes}</span>
                <button className="p-1 hover:bg-slate-600/30 rounded">
                  <ThumbsDown className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsGrid;
