import React from 'react';
import LeaderboardCard from './LeaderboardCard';
import CommunityPosts from './CommunityPosts';

const Community: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Community</h1>
          <p className="text-slate-400">Connect, share, and learn from other traders</p>
        </div>
        
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Leaderboard */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <LeaderboardCard />
          </div>

          {/* Right Column - Posts */}
          <div className="col-span-12 lg:col-span-8">
            <CommunityPosts />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
