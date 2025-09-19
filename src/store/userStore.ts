// src/store/userStore.ts
import { create } from 'zustand';
import type { UserProfile, NFTReward } from '../types/api';

interface UserState {
  // Profil utilisateur complet
  profile: UserProfile | null;
  isLoggedIn: boolean;
  
  // Calculs temps réel pour la gamification
  xpToNextLevel: number;
  dailyXPEarned: number;
  canEarnDailyXP: boolean;
  
  // NFTs disponibles à minter
  availableNFTs: NFTReward[];
  
  // Actions utilisateur
  setProfile: (profile: UserProfile) => void;
  addXP: (amount: number, reason: string) => void;
  markDailyActivity: (activity: keyof UserProfile['todayActivities']) => void;
  claimNFT: (nftId: string) => void;
  
  // Calculs dérivés
  calculateXPMetrics: () => void;
  checkAvailableNFTs: () => void;
}

export const useUserStore = create<UserState>()((set, get) => ({
  // État initial
  profile: null,
  isLoggedIn: false,
  xpToNextLevel: 100,
  dailyXPEarned: 0,
  canEarnDailyXP: true,
  availableNFTs: [],

  // Définir le profil utilisateur
  setProfile: (profile) => {
    set({ profile, isLoggedIn: true });
    get().calculateXPMetrics();
    get().checkAvailableNFTs();
  },

  // Ajouter de l'XP avec raison (pour les notifications)
  addXP: (amount, reason) => {
    const { profile } = get();
    if (!profile) return;

    const newTotalXP = profile.totalXP + amount;
    const newLevel = Math.floor(newTotalXP / 100) + 1;

    set({
      profile: {
        ...profile,
        totalXP: newTotalXP,
        level: newLevel
      },
      dailyXPEarned: get().dailyXPEarned + amount
    });

    // Recalculer les métriques et vérifier les nouveaux NFTs
    get().calculateXPMetrics();
    get().checkAvailableNFTs();

    // Ici, nous pourrions ajouter une notification
    console.log(`+${amount} XP: ${reason}`);
  },

  // Marquer une activité quotidienne comme complétée
  markDailyActivity: (activity) => {
    const { profile } = get();
    if (!profile || profile.todayActivities[activity]) return;

    // Récompenses XP par activité
    const xpRewards = {
      platformUsed: 20,
      commentPosted: 20,
      tradeExecuted: 10
    };

    set({
      profile: {
        ...profile,
        todayActivities: {
          ...profile.todayActivities,
          [activity]: true
        }
      }
    });

    // Ajouter l'XP correspondant
    get().addXP(xpRewards[activity], `Activité quotidienne: ${activity}`);
  },

  // Réclamer un NFT
  claimNFT: (nftId) => {
    const { profile, availableNFTs } = get();
    if (!profile) return;

    const nft = availableNFTs.find(n => n.id === nftId);
    if (!nft) return;

    set({
      profile: {
        ...profile,
        nftsOwned: [...profile.nftsOwned, { ...nft, unlockedAt: Date.now() }]
      },
      availableNFTs: availableNFTs.filter(n => n.id !== nftId)
    });
  },

  // Calculer les métriques XP
  calculateXPMetrics: () => {
    const { profile } = get();
    if (!profile) return;

    const currentLevelXP = (profile.level - 1) * 100;
    const xpInCurrentLevel = profile.totalXP - currentLevelXP;
    const xpToNextLevel = 100 - xpInCurrentLevel;

    set({ xpToNextLevel });
  },

  // Vérifier quels NFTs sont disponibles à réclamer
  checkAvailableNFTs: () => {
    const { profile } = get();
    if (!profile) return;

    // NFTs disponibles basés sur l'XP total
    const possibleNFTs: NFTReward[] = [
      {
        id: 'starter',
        name: 'DeFi Starter',
        description: 'Bienvenue dans le monde DeFi !',
        rarity: 'common',
        requiredXP: 100,
        unlockedAt: 0,
        imageUrl: '/nfts/starter.png',
        metadata: { traits: [{ trait_type: 'Type', value: 'Starter' }] }
      },
      {
        id: 'trader',
        name: 'Cross-Chain Trader',
        description: 'Maître des swaps cross-chain',
        rarity: 'rare',
        requiredXP: 300,
        unlockedAt: 0,
        imageUrl: '/nfts/trader.png',
        metadata: { traits: [{ trait_type: 'Type', value: 'Trader' }] }
      },
      {
        id: 'master',
        name: 'DeFi Master',
        description: 'Expertise complète en DeFi',
        rarity: 'epic',
        requiredXP: 500,
        unlockedAt: 0,
        imageUrl: '/nfts/master.png',
        metadata: { traits: [{ trait_type: 'Type', value: 'Master' }] }
      }
    ];

    // Filtrer les NFTs disponibles (assez d'XP, pas déjà possédés)
    const availableNFTs = possibleNFTs.filter(nft => 
      profile.totalXP >= nft.requiredXP && 
      !profile.nftsOwned.some(owned => owned.id === nft.id)
    );

    set({ availableNFTs });
  }
}));