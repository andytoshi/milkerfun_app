import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useGameData } from '../hooks/useGameData';
import { useNetwork } from '../hooks/useNetwork';
import { Milk, Clock, TrendingUp, ExternalLink, User } from 'lucide-react';
import { formatNumber, formatTime, shortenAddress } from '../utils/format';

export const Dashboard: React.FC = () => {
  const { publicKey } = useWallet();
  const { networkConfig, currentNetwork } = useNetwork();
  const { userStats, gameStats, loading } = useGameData(publicKey?.toString(), true);
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
            <h3 className="text-xl font-bold text-gray-800">Game Stats</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">💰 Cow Price:</span>
              <span className="text-xl font-bold text-gray-800 transition-all duration-300">
                {formatNumber(gameStats?.currentCowPrice || 0)} MILK
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">⚡ Reward Rate:</span>
              <span className="text-xl font-bold text-gray-800 transition-all duration-300">
                {formatNumber(gameStats?.currentRewardRate || 0)}/min
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">📅 Days Elapsed:</span>
              <span className="text-xl font-bold text-gray-800 transition-all duration-300">
                {gameStats?.daysElapsed || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Timing Stats */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200 md:col-span-2 lg:col-span-1 transition-all duration-300">
          <div className="card-header">
            <Clock className="text-orange-600" size={32} />
            <h3 className="text-xl font-bold text-gray-800">Timing</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">⏰ Next Halving:</span>
              <span className="text-lg font-bold text-gray-800 transition-all duration-300">
                {formatTime(gameStats?.timeToNextHalving || 0)}
              </span>
            </div>
            {(gameStats?.hoursElapsed || 0) < 5 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">📈 Price Update:</span>
                <span className="text-lg font-bold text-gray-800 transition-all duration-300">
                  {formatTime(gameStats?.timeToNextPriceUpdate || 0)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">🔄 Halving Period:</span>
              <span className="text-lg font-bold text-gray-800 transition-all duration-300">
                #{(gameStats?.halvingPeriod || 0) + 1} / 10
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Price Warning */}
      {(gameStats?.hoursElapsed || 0) < 5 && (
        <div className="mt-8 bg-gradient-to-r from-warning-100 to-warning-200 border border-warning-300 rounded-2xl p-6 transition-all duration-300">
          <div className="flex items-start gap-4">
            <TrendingUp className="text-warning-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h4 className="text-lg font-bold text-warning-800 mb-2">
                ⚠️ Price Escalation Active!
              </h4>
              <p className="text-warning-700 leading-relaxed">
                Cow prices double every hour for the first 4 hours. 
                Current multiplier: <strong className="transition-all duration-300">{gameStats?.priceMultiplier}x</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};