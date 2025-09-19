import { useEffect, useCallback } from 'react';
import { useUserStore } from '../store/userStore';
import toast from 'react-hot-toast';

export const useGamification = (walletAddress?: string) => {
  const {
    profile,
    xpToNextLevel,
    dailyXPEarned,
    canEarnDailyXP,
    availableNFTs,
    addXP,
    markDailyActivity,
    claimNFT,
    setProfile
  } = useUserStore();

  // Initialize user profile only once
  useEffect(() => {
    if (walletAddress && !profile) {
      // Create a new profile or fetch from API
      const today = new Date().toISOString().split('T')[0];
      const newProfile = {
        walletAddress,
        totalXP: 0,
        level: 1,
        dailyStreak: 0,
        lastActiveDate: today,
        todayActivities: {
          platformUsed: false,
          commentPosted: false,
          tradeExecuted: false
        },
        nftsOwned: [],
        totalTrades: 0,
        totalVolumeUSD: '0',
        communityContributions: 0,
        badges: []
      };
      
      setProfile(newProfile);
    }
  }, [walletAddress, profile, setProfile]);

  // Track daily platform usage
  const markPlatformUsage = useCallback(() => {
    if (profile && !profile.todayActivities.platformUsed) {
      markDailyActivity('platformUsed');
      toast.success('🎉 +20 XP for your daily use', { duration: 2000 });
    }
  }, [profile, markDailyActivity]);

  // Reward relevant comments
  const rewardComment = useCallback(() => {
    if (profile && !profile.todayActivities.commentPosted) {
      markDailyActivity('commentPosted');
      toast.success('💬 +20 XP for your comment!', { duration: 2000 });
    }
  }, [profile, markDailyActivity]);

  // Reward executed trades
  const rewardTrade = useCallback(() => {
    if (profile && !profile.todayActivities.tradeExecuted) {
      markDailyActivity('tradeExecuted');
      toast.success('🔄 +10 XP for your trade!', { duration: 2000 });
    }
  }, [profile, markDailyActivity]);

  // Claim NFT with animation
  const claimNFTWithAnimation = useCallback(async (nftId: string) => {
    const nft = availableNFTs.find(n => n.id === nftId);
    if (!nft) return;

    try {
      claimNFT(nftId);
      toast.success(`🏆 NFT "${nft.name}" redeemed successfully !`, {
        duration: 4000,
        icon: '✨'
      });
    } catch (error) {
      toast.error('Error during the NFT redeem');
    }
  }, [availableNFTs, claimNFT]);

  // Calculate engagement metrics
  const engagementMetrics = {
    completionRate: profile ? (
      (Number(profile.todayActivities.platformUsed) +
       Number(profile.todayActivities.commentPosted) +
       Number(profile.todayActivities.tradeExecuted)) / 3
    ) * 100 : 0,
    
    levelProgress: profile ? ((profile.totalXP % 100) / 100) * 100 : 0,
    
    streakMultiplier: profile ? Math.min(1 + (profile.dailyStreak * 0.1), 2) : 1,
    
    nextReward: availableNFTs.length > 0 ? availableNFTs[0] : null
  };

  return {
    // Profile state
    profile,
    xpToNextLevel,
    dailyXPEarned,
    canEarnDailyXP,
    availableNFTs,
    engagementMetrics,
    
    // Actions
    markPlatformUsage,
    rewardComment,
    rewardTrade,
    claimNFTWithAnimation,
    addXP // For custom rewards
  };
};