import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';
import { useNetwork } from './useNetwork';
import { GAME_CONFIG } from '../constants/solana';
import { 
  findProgramAddresses, 
  calculateDynamicCowPrice,
  calculateDynamicRewardRate,
  calculateGreedMultiplier,
} from '../utils/program';
import type { GameCalculations } from '../types/program';
import type { UserStats } from '../types/game';

export const useGameData = (walletAddress?: string, autoRefresh: boolean = false) => {
  const { networkConfig } = useNetwork();
  const [connection, setConnection] = useState(() => new Connection(networkConfig.rpcUrl));
  const [farmData, setFarmData] = useState<any>(null);
  const [configData, setConfigData] = useState<any>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [gameStats, setGameStats] = useState<GameCalculations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [globalStats, setGlobalStats] = useState<{ globalCows: number; tvl: number } | null>(null);

  // Update connection when network changes
  useEffect(() => {
    setConnection(new Connection(networkConfig.rpcUrl));
    setFarmData(null);
    setConfigData(null);
    setUserStats(null);
    setGameStats(null);
  }, [networkConfig.rpcUrl]);

  const fetchGlobalStats = useCallback(async () => {
    try {
      console.log('Fetching global stats from pool account:', networkConfig.poolTokenAccount.toString());
      
      // Get pool token account to read TVL
      const poolAccount = await getAccount(connection, networkConfig.poolTokenAccount, 'confirmed');
      const tvl = Number(poolAccount.amount);
      
      console.log('Pool TVL (raw):', tvl);
      console.log('Pool TVL (MILK):', tvl / 1_000_000);
      
      // Get config account to read global cows count
      const { configPda } = findProgramAddresses(networkConfig.programId);
      const configAccountInfo = await connection.getAccountInfo(configPda, 'confirmed');
      
      let globalCows = 0;
      if (configAccountInfo && configAccountInfo.data.length > 0) {
        // Parse config account data to get global_cows_count
        // Config structure: discriminator(8) + admin(32) + milk_mint(32) + pool_token_account(32) + start_time(8) + global_cows_count(8) + initial_tvl(8)
        const dataView = new DataView(configAccountInfo.data.buffer);
        globalCows = Number(dataView.getBigUint64(8 + 32 + 32 + 32 + 8, true)); // global_cows_count at offset 112
        console.log('Global cows from config:', globalCows);
      } else {
        console.warn('Config account not found or empty, using default');
      }
      
      const stats = { globalCows, tvl };
      setGlobalStats(stats);
      
      // Calculate dynamic game stats with real data
      const dynamicCowPrice = calculateDynamicCowPrice(stats.globalCows);
      const dynamicRewardRate = calculateDynamicRewardRate(stats.globalCows, stats.tvl);
      const greedMultiplier = calculateGreedMultiplier(stats.globalCows);
      
      const currentTime = Math.floor(Date.now() / 1000);
      const gameStartTime = configData?.startTime?.toNumber ? configData.startTime.toNumber() : (currentTime - (7 * 24 * 3600));
      const elapsedSeconds = currentTime - gameStartTime;
      
      const newGameStats: GameCalculations = {
        currentCowPrice: dynamicCowPrice,
        currentRewardRate: dynamicRewardRate,
        pendingRewards: 0,
        timeToNextHalving: 0, // Not applicable in new model
        timeToNextPriceUpdate: 0, // Not applicable in new model
        daysElapsed: Math.floor(elapsedSeconds / 86400),
        hoursElapsed: Math.floor(elapsedSeconds / 3600),
        halvingPeriod: 0, // Not applicable in new model
        priceMultiplier: dynamicCowPrice / GAME_CONFIG.COW_BASE_PRICE,
        greedMultiplier: greedMultiplier,
      };
      
      console.log('Calculated game stats:', {
        cowPrice: dynamicCowPrice,
        rewardRate: dynamicRewardRate,
        greedMultiplier: greedMultiplier,
        priceMultiplier: newGameStats.priceMultiplier
      });
      
      setGameStats(newGameStats);
      
      return stats;
    } catch (err) {
      console.error('Error fetching global stats:', err);
      // Use default values
      const defaultStats = { globalCows: 0, tvl: GAME_CONFIG.INITIAL_TVL };
      setGlobalStats(defaultStats);
      
      const defaultGameStats: GameCalculations = {
        currentCowPrice: GAME_CONFIG.COW_BASE_PRICE,
        currentRewardRate: GAME_CONFIG.REWARD_BASE,
        pendingRewards: 0,
        timeToNextHalving: 0,
        timeToNextPriceUpdate: 0,
        daysElapsed: 0,
        hoursElapsed: 0,
        halvingPeriod: 0,
        priceMultiplier: 1.0,
        greedMultiplier: 9.0, // Maximum greed multiplier for 0 cows
      };
      
      setGameStats(defaultGameStats);
      setError('Failed to fetch global game stats');
      return defaultStats;
    }
  }, [connection, networkConfig]);

  const fetchConfigData = useCallback(async () => {
    try {
      const stats = await fetchGlobalStats();
      
      // Get real config data from blockchain
      const { configPda } = findProgramAddresses(networkConfig.programId);
      const configAccountInfo = await connection.getAccountInfo(configPda, 'confirmed');
      
      let realStartTime = Math.floor(Date.now() / 1000) - (7 * 24 * 3600); // fallback
      
      if (configAccountInfo && configAccountInfo.data.length > 0) {
        // Parse config account data to get real start_time
        // Config structure: discriminator(8) + admin(32) + milk_mint(32) + pool_token_account(32) + start_time(8) + global_cows_count(8) + initial_tvl(8)
        const dataView = new DataView(configAccountInfo.data.buffer);
        realStartTime = Number(dataView.getBigUint64(8 + 32 + 32 + 32, true)); // start_time at offset 104
        console.log('Real start time from blockchain:', realStartTime, new Date(realStartTime * 1000).toISOString());
      } else {
        console.warn('Config account not found, using fallback start time');
      }
      
      const realConfig = {
        admin: networkConfig.programId,
        milkMint: networkConfig.milkMint,
        baseMilkPerCowPerMin: { toNumber: () => GAME_CONFIG.REWARD_BASE },
        cowInitialCost: { toNumber: () => GAME_CONFIG.COW_BASE_PRICE },
        startTime: { toNumber: () => realStartTime },
        globalCows: stats.globalCows,
        tvl: stats.tvl,
      };
      
      setConfigData(realConfig);
      return realConfig;
    } catch (err) {
      console.error('Error fetching config:', err);
      setError('Failed to fetch game configuration');
      return null;
    }
  }, [fetchGlobalStats, networkConfig]);

  const fetchFarmData = useCallback(async (walletPubkey: PublicKey) => {
    try {
      const { farmPda } = findProgramAddresses(networkConfig.programId, walletPubkey);
      
      console.log('Fetching farm data for:', walletPubkey.toString());
      console.log('Farm PDA:', farmPda!.toString());
      
      const farmAccount = await connection.getAccountInfo(farmPda!, 'confirmed');
      if (!farmAccount || farmAccount.data.length === 0) {
        console.log('Farm account not found or empty');
        return null;
      }
      
      console.log('Farm account data length:', farmAccount.data.length);
      
      // Parse farm account data
      // Farm structure: discriminator(8) + owner(32) + cows(8) + last_update_time(8) + accumulated_rewards(8) + last_reward_rate(8) + last_withdraw_time(8)
      const dataView = new DataView(farmAccount.data.buffer);
      
      const owner = new PublicKey(farmAccount.data.slice(8, 40));
      const cows = Number(dataView.getBigUint64(40, true));
      const lastUpdateTime = Number(dataView.getBigUint64(48, true));
      const accumulatedRewards = Number(dataView.getBigUint64(56, true));
      const lastRewardRate = Number(dataView.getBigUint64(64, true));
      const lastWithdrawTime = Number(dataView.getBigUint64(72, true));
      
      console.log('Parsed farm data:', {
        owner: owner.toString(),
        cows,
        lastUpdateTime,
        accumulatedRewards: accumulatedRewards / 1_000_000,
        lastRewardRate: lastRewardRate / 1_000_000,
        lastWithdrawTime
      });
      
      const farmData = {
        owner: walletPubkey,
        cows: { toNumber: () => cows, isZero: () => cows === 0 },
        lastUpdateTime: { toNumber: () => lastUpdateTime },
        accumulatedRewards: { toNumber: () => accumulatedRewards },
        lastRewardRate: { toNumber: () => lastRewardRate },
        lastWithdrawTime: { toNumber: () => lastWithdrawTime },
      };
      
      setFarmData(farmData);
      return farmData;
    } catch (err) {
      console.error('Error fetching farm data:', err);
      return null;
    }
  }, [connection, networkConfig.programId]);

  const fetchUserTokenBalance = useCallback(async (walletPubkey: PublicKey) => {
    try {
      const associatedTokenAccount = await getAssociatedTokenAddress(networkConfig.milkMint, walletPubkey);
      const tokenAccount = await getAccount(connection, associatedTokenAccount);
      const balance = Number(tokenAccount.amount) / Math.pow(10, 6);
      console.log('User MILK balance:', balance);
      return balance;
    } catch (err) {
      console.error('Error fetching token balance:', err);
      return 0;
    }
  }, [connection, networkConfig.milkMint]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUserStats(null); // Clear first
    
    try {
      console.log('Starting data fetch...');
      const config = await fetchConfigData();
      
      if (walletAddress && config) {
        const walletPubkey = new PublicKey(walletAddress);
        
        const [farm, milkBalance] = await Promise.all([
          fetchFarmData(walletPubkey),
          fetchUserTokenBalance(walletPubkey),
        ]);
        
        // Calculate pending rewards using stored rate and current time
        let pendingRewards = 0;
        if (farm && farm.cows.toNumber() > 0) {
          const currentTime = Math.floor(Date.now() / 1000);
          const timeSinceUpdate = currentTime - farm.lastUpdateTime.toNumber();
          const storedRate = farm.lastRewardRate.toNumber();
          
          if (storedRate > 0 && timeSinceUpdate > 0) {
            // Convert daily rate to per-second rate
            const rewardPerSecond = storedRate / 86400;
            pendingRewards = (farm.cows.toNumber() * rewardPerSecond * timeSinceUpdate) / 1_000_000;
          }
        }
        
        console.log('Calculated pending rewards:', pendingRewards);
        
        const newUserStats = {
          walletAddress,
          cows: farm ? farm.cows.toNumber() : 0,
          accumulatedRewards: farm ? farm.accumulatedRewards.toNumber() / Math.pow(10, 6) : 0,
          milkBalance,
          estimatedPendingRewards: pendingRewards,
          totalRewards: farm ? 
            (farm.accumulatedRewards.toNumber() / Math.pow(10, 6)) + pendingRewards : 0,
          lastWithdrawTime: farm ? farm.lastWithdrawTime.toNumber() : undefined,
        };
        
        console.log('Final user stats:', newUserStats);
        
        // Delayed update to ensure React detects change
        setTimeout(() => setUserStats(newUserStats), 100);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch game data');
    } finally {
      setLoading(false);
    }
  }, [walletAddress, fetchConfigData, fetchFarmData, fetchUserTokenBalance]);

  // Initial data load
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Live reward counter
  useEffect(() => {
    if (!autoRefresh || !userStats || !configData || !farmData || farmData.cows.isZero() || userStats.cows === 0) {
      return;
    }
    
    const timer = setInterval(() => {
      // Calculate pending rewards using stored rate
      const currentTime = Math.floor(Date.now() / 1000);
      const timeSinceUpdate = currentTime - farmData.lastUpdateTime.toNumber();
      const storedRate = farmData.lastRewardRate.toNumber();
      
      let pendingRewards = 0;
      if (storedRate > 0 && timeSinceUpdate > 0) {
        const rewardPerSecond = storedRate / 86400;
        pendingRewards = (userStats.cows * rewardPerSecond * timeSinceUpdate) / 1_000_000;
      }
      
      const totalRewards = userStats.accumulatedRewards + pendingRewards;
      
      setUserStats(prev => {
        if (!prev) return null;
        
        const diff = Math.abs(prev.totalRewards - totalRewards);
        if (diff < 0.01) return prev; // Skip tiny updates
        
        return {
          ...prev,
          estimatedPendingRewards: pendingRewards,
          totalRewards: totalRewards,
        };
      });
    }, 3000); // Update every 3 seconds
    
    return () => clearInterval(timer);
  }, [autoRefresh, userStats?.cows, configData, farmData, gameStats]);

  return {
    farmData,
    configData,
    userStats,
    gameStats,
    loading,
    error,
    globalStats,
    refetch: fetchAllData,
  };
};