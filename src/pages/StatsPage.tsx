import React from 'react';
import { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGameData } from '../hooks/useGameData';
import { useNetwork } from '../hooks/useNetwork';
import { isMainnetConfigured } from '../constants/solana';
import { calculateTotalStats } from '../utils/program';
import { GameStats } from '../components/GameStats';

export const StatsPage: React.FC = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { networkConfig } = useNetwork();
  const { gameStats, configData, globalStats, loading, error, refetch } = useGameData(publicKey?.toString(), false);
  
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

  useEffect(() => {
    fetchTotalStats();
  }, []);

  const handleRefresh = async () => {
    await Promise.all([refetch(), fetchTotalStats()]);
  };

  // Get network status for display
  const getNetworkBadge = () => {
    if (networkConfig.name === 'Mainnet' && isMainnetConfigured()) {
      return (
        <div className="glass-card px-4 py-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white/90 font-medium text-sm">Live on Mainnet</span>
        </div>
      );
    } else {
      return (
        <div className="glass-card px-4 py-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <span className="text-white/90 font-medium text-sm">Testing on Devnet</span>
        </div>
      );
    }
  };
  return (
    <div className="min-h-screen">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/12 text-4xl md:text-6xl opacity-5 animate-float">📊</div>
        <div className="absolute top-3/5 right-1/6 text-3xl md:text-5xl opacity-5 animate-float" style={{ animationDelay: '2s' }}>📈</div>
        <div className="absolute bottom-1/3 left-1/5 text-4xl md:text-6xl opacity-5 animate-float" style={{ animationDelay: '4s' }}>💰</div>
        <div className="absolute top-2/5 right-1/4 text-3xl md:text-5xl opacity-5 animate-float" style={{ animationDelay: '1s' }}>🐄</div>
      </div>

      {/* Header Section */}
      <div className="relative z-10">
        <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-6">
                <span className="text-4xl md:text-6xl animate-pulse-slow">📊</span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white text-shadow-lg">
                  Protocol Analytics
                </h1>
                <span className="text-4xl md:text-6xl animate-pulse-slow">📈</span>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 text-shadow max-w-4xl mx-auto leading-relaxed">
                Real-time blockchain data, economic metrics, and mathematical insights
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {getNetworkBadge()}
                <div className="glass-card px-4 py-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-white/90 font-medium text-sm">On-Chain</span>
                </div>
                <div className="glass-card px-4 py-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-white/90 font-medium text-sm">Decentralized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
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