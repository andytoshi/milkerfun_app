import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useGameData } from '../hooks/useGameData';
import { useNetwork } from '../hooks/useNetwork';
import { Milk, Clock, TrendingUp, ExternalLink, User, Shield, AlertTriangle } from 'lucide-react';
import { formatNumber, formatTime, shortenAddress } from '../utils/format';

export const Dashboard: React.FC = () => {
  const { publicKey } = useWallet();
  const { networkConfig, currentNetwork } = useNetwork();
  const { userStats, gameStats, configData, loading } = useGameData(publicKey?.toString(), true);

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
      <div className="card p-8 lg:p-12 text-center">
        <div className="relative mb-8">
          <div className="text-6xl lg:text-8xl animate-bounce-slow">🐄</div>
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <Milk size={32} className="text-blue-500 animate-float" />
          </div>
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
          Connect Your Wallet to Start Farming! 🐄
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Join the mooooost profitable farming game on Solana!
        </p>
        <WalletMultiButton />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card p-8 lg:p-12 text-center">
        <div className="text-6xl lg:text-8xl animate-spin-slow mb-6">🐄</div>
        <p className="text-xl text-gray-600">Loading your farm data...</p>
      </div>
    );
  }

  return (
    <div className="card p-6 lg:p-8 transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            🧑‍🌾 Your Farm Dashboard
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-600">
              <User size={16} />
              <span className="font-mono text-sm">
                {shortenAddress(publicKey.toString())}
              </span>
            </div>
            <a 
              href={`${networkConfig.explorerUrl}/address/${publicKey.toString()}?cluster=${currentNetwork}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 transition-colors"
            >
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`stat-badge ${
            currentNetwork === 'mainnet' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              currentNetwork === 'mainnet' ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            {networkConfig.name}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300">
        {/* Farm Stats */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 transition-all duration-300">
          <div className="card-header">
            <div className="text-3xl">🐄</div>
            <h3 className="text-xl font-bold text-gray-800">Your Farm</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">🐄 Cows Owned:</span>
              <span className="text-2xl font-bold text-gray-800 transition-all duration-300">
                {formatNumber(userStats?.cows || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">🥛 MILK Balance:</span>
              <span className="text-2xl font-bold text-gray-800 transition-all duration-300">
                {formatNumber(userStats?.milkBalance || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">💰 Rewards:</span>
              <span className="text-2xl font-bold text-success-600 transition-all duration-300">
                {formatNumber(userStats?.totalRewards || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Game Stats */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 transition-all duration-300">
          <div className="card-header">
            <TrendingUp className="text-blue-600" size={32} />
            <h4 className="text-lg font-bold text-gray-800">⚡ Live Economics</h4>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">💰 Cow Price:</span>
              <span className="text-xl font-bold text-gray-800 transition-all duration-300">
                {formatNumber(gameStats?.currentCowPrice || 0)} MILK
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Daily ROI:</span>
              <span className="font-bold text-success-600 transition-all duration-300">
                {gameStats?.currentCowPrice && gameStats?.currentRewardRate 
                  ? `${((gameStats.currentRewardRate / gameStats.currentCowPrice) * 100).toFixed(2)}%`
                  : '0.00%'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">📅 Proto Live:</span>
              <span className="text-xl font-bold text-gray-800 transition-all duration-300">
                {(() => {
                  if (!configData || !configData.startTime) {
                    return '0s';
                  }
                  
                  const currentTime = Math.floor(Date.now() / 1000);
                  const startTime = typeof configData.startTime === 'number' 
                    ? configData.startTime 
                    : (configData.startTime.toNumber ? configData.startTime.toNumber() : 0);
                  
                  const elapsedSeconds = currentTime - startTime;
                  
                  return formatTime(elapsedSeconds);
                })()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">🚀 Greed Bonus:</span>
              <span className="text-xl font-bold text-success-600 transition-all duration-300">
                {gameStats?.greedMultiplier ? `${gameStats.greedMultiplier.toFixed(2)}x` : '1.00x'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200 transition-all duration-300">
          <div className="card-header">
            <Shield className="text-red-600" size={28} />
            <h4 className="text-lg font-bold text-gray-800">🛡️ Anti-Dump Status</h4>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Withdrawal status:</span>
              <span className={`font-bold ${withdrawalStatus.isPenaltyFree ? 'text-success-600' : 'text-warning-600'}`}>
                {withdrawalStatus.isPenaltyFree ? '✅ Penalty-free' : '⚠️ 50% penalty'}
              </span>
            </div>
            {!withdrawalStatus.isPenaltyFree && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Time to penalty-free:</span>
                <span className="text-lg font-bold text-gray-800 transition-all duration-300">
                  {formatTime(withdrawalStatus.timeRemaining)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Penalty rate:</span>
              <span className="font-bold text-gray-800">
                {withdrawalStatus.isPenaltyFree ? '0%' : '50%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Anti-Dump Protocol Info */}
      <div className="mt-8 bg-gradient-to-r from-red-100 to-red-200 border border-red-300 rounded-2xl p-6 transition-all duration-300">
        <div className="flex items-start gap-4">
          <Shield className="text-red-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h4 className="text-lg font-bold text-red-800 mb-2">
              🛡️ Anti-Dump Protection Active
            </h4>
            <p className="text-red-700 leading-relaxed">
              Our protocol implements a 24-hour cooling period with 50% penalty for rapid withdrawals. 
              This innovative mechanism reduces sell pressure and rewards patient farmers. 
              Penalty tokens stay in the pool, increasing TVL and benefiting all players.
            </p>
          </div>
        </div>
      </div>

      {/* Early Adopter Bonus */}
      {(gameStats?.greedMultiplier || 1) > 2 && (
        <div className="mt-4 bg-gradient-to-r from-warning-100 to-warning-200 border border-warning-300 rounded-2xl p-6 transition-all duration-300">
          <div className="flex items-start gap-4">
            <TrendingUp className="text-warning-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h4 className="text-lg font-bold text-warning-800 mb-2">
                🚀 Early Adopter Greed Bonus Active!
              </h4>
              <p className="text-warning-700 leading-relaxed">
                You're earning bonus rewards as an early adopter! 
                Current greed multiplier: <strong className="transition-all duration-300">{gameStats?.greedMultiplier.toFixed(2)}x</strong>. 
                This bonus decays as more players join the ecosystem.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};