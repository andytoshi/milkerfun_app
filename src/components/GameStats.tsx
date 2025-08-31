import React from 'react';
import { useNetwork } from '../hooks/useNetwork';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Calendar, Zap, Target, Users, RefreshCw } from 'lucide-react';
import { formatNumber, formatTime } from '../utils/format';
import { GAME_CONFIG } from '../constants/solana';
import type { GameCalculations, ConfigAccount } from '../types/program';

interface GameStatsProps {
  gameStats: GameCalculations | null;
  configData: ConfigAccount | null;
  totalStats: { totalPlayers: number; totalCows: number };
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
}

export const GameStats: React.FC<GameStatsProps> = ({
  gameStats,
  configData,
  totalStats,
  loading,
  error,
  onRefresh
}) => {
  const { currentNetwork, networkConfig } = useNetwork();

  // Calculate detailed time since game start
  const getTimeSinceStart = () => {
    if (!configData) return 'Loading...';
    
    const currentTime = Math.floor(Date.now() / 1000);
    const elapsedSeconds = currentTime - configData.startTime.toNumber();
    
    return formatTime(elapsedSeconds);
  };

  if (loading) {
    return (
      <div className="card p-8 lg:p-12">
        <div className="card-header">
          <TrendingUp className="text-purple-600" size={32} />
          <h3 className="text-2xl font-bold text-gray-800">📊 Game Statistics & Progress</h3>
        </div>
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading real-time game data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 lg:p-12">
        <div className="card-header">
          <TrendingUp className="text-purple-600" size={32} />
          <h3 className="text-2xl font-bold text-gray-800">📊 Game Statistics & Progress</h3>
        </div>
        <div className="text-center py-12">
          <p className="text-error-600 font-medium mb-2">Error loading game data: {error}</p>
          <p className="text-gray-500">Please check your connection and try again.</p>
          <button
            onClick={onRefresh}
            className="mt-4 btn-primary flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={20} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Generate chart data
  const priceData = Array.from({ length: 25 }, (_, hour) => {
    const basePrice = configData?.cowInitialCost.toNumber() / 1_000_000 || GAME_CONFIG.INITIAL_COW_PRICE;
    return {
      hour,
      price: basePrice * Math.pow(2, Math.min(hour, 4)),
    };
  });

  const rewardData = Array.from({ length: 11 }, (_, period) => {
    const baseRate = configData?.baseMilkPerCowPerMin.toNumber() / 1_000_000 || GAME_CONFIG.BASE_REWARD_RATE;
    return {
      period: period + 1,
      rate: Math.max(baseRate / Math.pow(2, period), GAME_CONFIG.MIN_REWARD_RATE),
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="card-header">
            <TrendingUp className="text-purple-600" size={32} />
            <h3 className="text-2xl font-bold text-gray-800">📊 Game Statistics & Progress</h3>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
              loading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="card-header">
            <Calendar className="text-purple-600" size={28} />
            <h4 className="text-lg font-bold text-gray-800">🎮 Game Progress</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Time since start:</span>
              <span className="font-bold text-gray-800">{getTimeSinceStart()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Halving stage:</span>
              <span className="font-bold text-gray-800">
                #{(gameStats?.halvingPeriod || 0) + 1} / {GAME_CONFIG.MAX_HALVING_PERIODS}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Network:</span>
              <span className="font-bold text-gray-800 capitalize">{currentNetwork}</span>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="card-header">
            <Zap className="text-green-600" size={28} />
            <h4 className="text-lg font-bold text-gray-800">⚡ Live Rates</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Reward rate:</span>
              <span className="font-bold text-success-600 transition-all duration-300">
                {formatNumber(gameStats?.currentRewardRate || 0)}/min
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cow price:</span>
              <span className="font-bold text-success-600 transition-all duration-300">
                {formatNumber(gameStats?.currentCowPrice || 0)} MILK
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price multiplier:</span>
              <span className="font-bold text-success-600 transition-all duration-300">
                {gameStats?.priceMultiplier || 1}x
              </span>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="card-header">
            <Target className="text-orange-600" size={28} />
            <h4 className="text-lg font-bold text-gray-800">⏰ Next Events</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Next halving:</span>
              <span className="font-bold text-gray-800">
                {formatTime(gameStats?.timeToNextHalving || 0)}
              </span>
            </div>
            {(gameStats?.hoursElapsed || 0) < 5 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Price update:</span>
                <span className="font-bold text-gray-800">
                  {formatTime(gameStats?.timeToNextPriceUpdate || 0)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Reward floor:</span>
              <span className="font-bold text-gray-800">{GAME_CONFIG.MIN_REWARD_RATE}/min</span>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="card-header">
            <Users className="text-blue-600" size={28} />
            <h4 className="text-lg font-bold text-gray-800">🌐 Network Stats</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Players:</span>
              <span className="font-bold text-success-600 transition-all duration-300">
                {formatNumber(totalStats.totalPlayers)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Cows:</span>
              <span className="font-bold text-success-600 transition-all duration-300">
                {formatNumber(totalStats.totalCows)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-xs">Program ID:</span>
              <code className="text-xs bg-gray-200 px-2 py-1 rounded font-mono text-purple-600">
                {networkConfig.programId.toString().slice(0, 8)}...
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card p-6 lg:p-8">
          <h4 className="text-xl font-bold text-gray-800 mb-6 text-center">
            🐄 Live Cow Price Growth Curve (First 24 Hours)
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip 
                  formatter={(value) => [formatNumber(value as number), 'Price (MILK)']}
                  labelFormatter={(label) => `Hour ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2, fill: '#a855f7' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-500 text-center mt-4 italic">
            ⚠️ Price doubles every hour for the first 4 hours, then remains constant at 16x
          </p>
        </div>

        <div className="card p-6 lg:p-8">
          <h4 className="text-xl font-bold text-gray-800 mb-6 text-center">
            ⚡ Live Reward Rate Halving Schedule
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rewardData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="period" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip 
                  formatter={(value) => [formatNumber(value as number), 'Rate (MILK/cow/min)']}
                  labelFormatter={(label) => `Period ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey="rate" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-500 text-center mt-4 italic">
            📉 Reward rate halves every 10 days, with a minimum floor of {GAME_CONFIG.MIN_REWARD_RATE} MILK/cow/min
          </p>
        </div>
      </div>

      {/* Game Mechanics */}
      <div className="card p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <h4 className="text-2xl font-bold text-center text-gray-800 mb-8">
          🎮 How Milker.fun Works (Live Game Rules)
        </h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3 text-center">🐄</div>
            <h5 className="text-lg font-bold text-purple-600 mb-3">Buy Cows</h5>
            <p className="text-gray-600 text-sm leading-relaxed">
              Purchase cows with MILK tokens. Current price: 
              <strong className="text-success-600"> {formatNumber(gameStats?.currentCowPrice || 0)} MILK</strong>. 
              Price doubles every hour for the first 4 hours.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3 text-center">🥛</div>
            <h5 className="text-lg font-bold text-green-600 mb-3">Earn Rewards</h5>
            <p className="text-gray-600 text-sm leading-relaxed">
              Each cow produces MILK automatically. Current rate: 
              <strong className="text-success-600"> {formatNumber(gameStats?.currentRewardRate || 0)} MILK/cow/min</strong>. 
              Rate halves every 10 days.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3 text-center">🔄</div>
            <h5 className="text-lg font-bold text-blue-600 mb-3">Compound</h5>
            <p className="text-gray-600 text-sm leading-relaxed">
              Use earned rewards to buy more cows without spending from your wallet. 
              Maximize your farming efficiency!
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3 text-center">💰</div>
            <h5 className="text-lg font-bold text-orange-600 mb-3">Withdraw</h5>
            <p className="text-gray-600 text-sm leading-relaxed">
              Cash out your accumulated MILK rewards to your wallet anytime. 
              No fees, instant transfers!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};