import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';
import { useNetwork } from './useNetwork';
import { 
  findProgramAddresses, 
  deserializeConfig, 
  deserializeFarm, 
  calculateGameStats, 
  calculatePendingRewards
} from '../utils/program';
import type { ConfigAccount, FarmAccount, GameCalculations } from '../types/program';
import type { UserStats } from '../types/game';

export const useGameData = (walletAddress?: string, autoRefresh: boolean = false) => {
  const { networkConfig } = useNetwork();
  const [connection, setConnection] = useState(() => new Connection(networkConfig.rpcUrl));
  const [farmData, setFarmData] = useState<FarmAccount | null>(null);
  const [configData, setConfigData] = useState<ConfigAccount | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [gameStats, setGameStats] = useState<GameCalculations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update connection when network changes
  useEffect(() => {
    setConnection(new Connection(networkConfig.rpcUrl));
    setFarmData(null);
    setConfigData(null);
    setUserStats(null);
    setGameStats(null);
  }, [networkConfig.rpcUrl]);

  const fetchConfigData = useCallback(async () => {
    try {
      const configAccount = await connection.getAccountInfo(networkConfig.configPda, 'confirmed');
      if (!configAccount) throw new Error('Config account not found');
      
      const config = deserializeConfig(configAccount.data);
      setConfigData(config);
      setGameStats(calculateGameStats(config));
      return config;
    } catch (err) {
      console.error('Error fetching config:', err);
      setError('Failed to fetch game configuration');
      return null;
    }
  }, [connection, networkConfig.configPda]);

  const fetchFarmData = useCallback(async (walletPubkey: PublicKey) => {
    try {
      const { farmPda } = findProgramAddresses(networkConfig.programId, walletPubkey);
      
      const farmAccount = await connection.getAccountInfo(farmPda!, 'confirmed');
      if (!farmAccount) {
        return null;
      }
      
      const farm = deserializeFarm(farmAccount.data);
      setFarmData(farm);
      return farm;
    } catch (err) {
      console.error('Error fetching farm data:', err);
      return null;
    }
  }, [connection, networkConfig.programId]);

  const fetchUserTokenBalance = useCallback(async (walletPubkey: PublicKey) => {
    try {
      const associatedTokenAccount = await getAssociatedTokenAddress(networkConfig.milkMint, walletPubkey);
      const tokenAccount = await getAccount(connection, associatedTokenAccount);
      return Number(tokenAccount.amount) / Math.pow(10, 6);
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
      const config = await fetchConfigData();
      
      if (walletAddress && config) {
        const walletPubkey = new PublicKey(walletAddress);
        
        const [farm, milkBalance] = await Promise.all([
          fetchFarmData(walletPubkey),
          fetchUserTokenBalance(walletPubkey),
        ]);
        
        const newUserStats = {
          walletAddress,
          cows: farm ? farm.cows.toNumber() : 0,
          accumulatedRewards: farm ? farm.accumulatedRewards.toNumber() / Math.pow(10, 6) : 0,
          milkBalance,
          estimatedPendingRewards: farm && config ? calculatePendingRewards(farm, config) : 0,
          totalRewards: farm && config ? 
            (farm.accumulatedRewards.toNumber() / Math.pow(10, 6)) + calculatePendingRewards(farm, config) : 0,
        };
        
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
      const pendingRewards = calculatePendingRewards(farmData, configData);
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
  }, [autoRefresh, userStats?.cows, configData, farmData]);

  return {
    farmData,
    configData,
    userStats,
    gameStats,
    loading,
    error,
    refetch: fetchAllData,
  };
};