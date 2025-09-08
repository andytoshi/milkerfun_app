import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useGameData } from '../hooks/useGameData';
import { useNetwork } from '../hooks/useNetwork';
import { Milk, TrendingUp, ExternalLink, User, Shield, Activity } from 'lucide-react';
import { formatNumber, formatTime, shortenAddress } from '../utils/format';

export const Dashboard: React.FC = () => {
  const { publicKey } = useWallet();
  const { networkConfig } = useNetwork();
  const { userStats, gameStats, loading } = useGameData(publicKey?.toString(), true);

  // Calculate withdrawal penalty status
  const getWithdrawalStatus = () => {
    if (!userStats || !userStats.lastWithdrawTime) {
      return { isPenaltyFree: true, timeRemaining: 0, message: 'First withdrawal will be penalty-free' };
    }
    
    const currentTime = Date.now();
    const lastWithdrawTime = userStats.lastWithdrawTime * 1000; // Convert to milliseconds
    const hoursSinceLastWithdraw = (currentTime - lastWithdrawTime) / (1000 * 60 * 60);
    const isPenaltyFree = hoursSinceLastWithdraw >= 24;
    const timeRemaining = isPenaltyFree ? 0 : (24 - hoursSinceLastWithdraw) * 3600; // in seconds
    
    return {
      isPenaltyFree,
      timeRemaining,
      message: isPenaltyFree 
        ? 'Next withdrawal will be penalty-free' 
        : `50% penalty for ${formatTime(timeRemaining)}`
    };
  };

  const withdrawalStatus = getWithdrawalStatus();

  if (!publicKey) {
    return (
      <div className="glass-card p-8 md:p-12 lg:p-16 text-center">
        <div className="relative mb-8">
          <div className="text-6xl lg:text-8xl animate-bounce-slow">🐄</div>
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <Milk size={32} className="text-blue-400 animate-float" />
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 text-shadow-lg">
          Connect Your Wallet to Start Farming! 🐄
        </h2>
        <p className="text-lg md:text-xl text-white/80 mb-8 text-shadow max-w-2xl mx-auto leading-relaxed">
          Join the mooooost profitable farming game on Solana! Experience revolutionary DeFi through gamification.
        </p>
        <div className="flex justify-center">
          <WalletMultiButton />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass-card p-8 md:p-12 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Activity className="text-white animate-pulse" size={32} />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Loading Your Farm</h3>
        <p className="text-lg text-white/70">Fetching your data from the blockchain...</p>
        <div className="flex justify-center mt-6">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header Card */}
      <div className="glass-card p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
              <User className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">My wallet</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-white/70 font-mono text-sm">
                  {shortenAddress(publicKey.toString())}
                </span>
                <a 
                  href={`${networkConfig.explorerUrl}/address/${publicKey.toString()}?cluster=${networkConfig.name.toLowerCase()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            <div className="bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm border border-white/20">
              <div className="flex items-center gap-3">
                <Milk className="text-blue-400" size={20} />
                <div>
                  <div className="text-white/70 text-xs font-medium">$MILK Balance</div>
                  <div className="text-lg font-bold text-blue-400">
                    {formatNumber(userStats?.milkBalance || 0)}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm border border-white/20">
              <div className="flex items-center gap-3">
                <span className="text-orange-400 text-xl">🐮</span>
                <div>
                  <div className="text-white/70 text-xs font-medium">$COW Balance</div>
                  <div className="text-lg font-bold text-orange-400">
                    {formatNumber(userStats?.cowBalance || 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Farm Stats */}
        <div className="glass-card p-6 md:p-8 group hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">🐄</span>
            </div>
            <h3 className="text-xl font-bold text-white">Your Farm</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/70 font-medium">🐄 Cows Owned:</span>
              <span className="text-2xl font-bold text-purple-400 transition-all duration-300">
                {formatNumber(userStats?.cows || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 font-medium">💰 MILK Rewards:</span>
              <span className="text-2xl font-bold text-green-400 transition-all duration-300">
                {formatNumber(userStats?.totalRewards || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 font-medium">🌐 Network:</span>
              <span className={`text-xl font-bold transition-all duration-300 ${
                networkConfig.name === 'Mainnet' ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {networkConfig.name}
              </span>
            </div>
          </div>
        </div>

        {/* Economic Stats */}
        <div className="glass-card p-6 md:p-8 group hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Live Economics</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/70 font-medium">💰 Cow Price:</span>
              <span className="text-xl font-bold text-green-400 transition-all duration-300">
                {formatNumber(gameStats?.currentCowPrice || 0)} $MILK
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 font-medium">⚡ Daily ROI:</span>
              <span className="text-lg font-bold text-yellow-400 transition-all duration-300">
                {gameStats?.currentCowPrice && gameStats?.currentRewardRate 
                  ? `${((gameStats.currentRewardRate / gameStats.currentCowPrice) * 100).toFixed(2)}%`
                  : '0.00%'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 font-medium">🚀 Greed Bonus:</span>
              <span className="text-xl font-bold text-yellow-400 transition-all duration-300">
                {gameStats?.greedMultiplier ? `${gameStats.greedMultiplier.toFixed(2)}x` : '1.00x'}
              </span>
            </div>
          </div>
        </div>

        {/* Anti-Dump Protocol */}
        <div className="glass-card p-6 md:p-8 bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-400/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl flex items-center justify-center">
              <Shield className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">🛡️ Anti-Dump Status</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/70 font-medium">Your Status:</span>
              <span className={`font-bold ${withdrawalStatus.isPenaltyFree ? 'text-green-400' : 'text-red-400'}`}>
                {withdrawalStatus.isPenaltyFree ? '✅ Safe' : '⚠️ Penalty'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 font-medium">Penalty Rate:</span>
              <span className="text-white font-bold">
                {withdrawalStatus.isPenaltyFree ? '0%' : '50%'}
              </span>
            </div>
            {!withdrawalStatus.isPenaltyFree && (
              <div className="flex justify-between items-center">
                <span className="text-white/70 font-medium">Time to Safe:</span>
                <span className="text-yellow-400 font-bold">
                  {formatTime(withdrawalStatus.timeRemaining)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {(gameStats?.greedMultiplier || 1) > 2.5 && (
        <div className="glass-card p-6 md:p-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🚀</span>
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-yellow-400 mb-3">
                Early Adopter Greed Bonus Active!
              </h4>
              <p className="text-white/80 leading-relaxed mb-4">
                Current greed multiplier: <strong className="text-yellow-400 transition-all duration-300">{gameStats?.greedMultiplier.toFixed(2)}x</strong>. 
                This bonus decays exponentially as more players join the ecosystem.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};