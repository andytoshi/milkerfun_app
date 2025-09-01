import React from 'react';
import { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGameData } from '../hooks/useGameData';
import { useNetwork } from '../hooks/useNetwork';
import { calculateTotalStats } from '../utils/program';
import { GameStats } from '../components/GameStats';

export const StatsPage: React.FC = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { networkConfig } = useNetwork();
  const { gameStats, configData, globalStats, loading, error, refetch } = useGameData(publicKey?.toString(), false); // No auto-refresh
  
  const [totalStats, setTotalStats] = useState<{ totalPlayers: number; totalCows: number }>({ totalPlayers: 0, totalCows: 0 });
  const [totalStatsLoading, setTotalStatsLoading] = useState(false);
  const [totalStatsError, setTotalStatsError] = useState<string | null>(null);

  const fetchTotalStats = async () => {
    setTotalStatsLoading(true);
    setTotalStatsError(null);
    try {
      const stats = await calculateTotalStats(connection, networkConfig.programId);
      setTotalStats(stats);
    } catch (err) {
      console.error('Error fetching total stats:', err);
      setTotalStatsError('Failed to fetch network statistics');
    } finally {
      setTotalStatsLoading(false);
    }
  };

  // Fetch total stats on component mount
  useEffect(() => {
    fetchTotalStats();
  }, []);

  const handleRefresh = async () => {
    await Promise.all([refetch(), fetchTotalStats()]);
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 text-shadow-lg">
            📊 Game Statistics
          </h1>
          <p className="text-lg sm:text-xl text-white/90 text-shadow">
            Real-time blockchain data, economic metrics, and protocol analytics!
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <GameStats 
          gameStats={gameStats}
          configData={configData}
          totalStats={globalStats ? { totalPlayers: globalStats.globalCows, totalCows: globalStats.globalCows } : totalStats}
          globalStats={globalStats}
          loading={loading || totalStatsLoading}
          error={error || totalStatsError}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
};