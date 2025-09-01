import React from 'react';
import { useNetwork } from '../hooks/useNetwork';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Calendar, Zap, Target, Users, RefreshCw, DollarSign, Shield } from 'lucide-react';
import { formatNumber, formatTime } from '../utils/format';
import { GAME_CONFIG } from '../constants/solana';
import { calculateDynamicCowPrice, calculateDynamicRewardRate, calculateGreedMultiplier } from '../utils/program';
import type { GameCalculations } from '../types/program';

interface GameStatsProps {
  gameStats: GameCalculations | null;
  configData: any;
  totalStats: { totalPlayers: number; totalCows: number };
  globalStats: { globalCows: number; tvl: number } | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
}

export const GameStats: React.FC<GameStatsProps> = ({
  gameStats,
  configData,
  totalStats,
  globalStats,
  loading,
  error,
  onRefresh
}) => {
  const { currentNetwork, networkConfig } = useNetwork();

  // Calculate detailed time since game start
  const getTimeSinceStart = () => {
    if (!configData) return 'Loading...';
    
    const currentTime = Math.floor(Date.now() / 1000);
    const startTime = configData.startTime?.toNumber ? configData.startTime.toNumber() : (currentTime - (7 * 24 * 3600));
    const elapsedSeconds = currentTime - startTime;
    
    console.log('Time calculation:', {
      currentTime,
      startTime,
      elapsedSeconds,
      formatted: formatTime(elapsedSeconds)
    });
    
    return formatTime(elapsedSeconds);
  };

  // Calculate real TVL metrics
  const getTVLMetrics = () => {
    if (!globalStats) return { tvlInMilk: 0, tvlPerCow: 0 };
    
    const tvlInMilk = globalStats.tvl / 1_000_000;
    const tvlPerCow = globalStats.globalCows > 0 ? tvlInMilk / globalStats.globalCows : 0;
    
    return { tvlInMilk, tvlPerCow };
  };

  const { tvlInMilk, tvlPerCow } = getTVLMetrics();

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

  // Generate chart data for price curve
  const priceData = Array.from({ length: 101 }, (_, index) => {
    const globalCows = index * 50; // 0, 50, 100, ... 5000 cows
    const price = calculateDynamicCowPrice(globalCows);
    return {
      cows: globalCows,
      price: price,
    };
  });

  // Generate chart data for reward rates
  const rewardData = Array.from({ length: 101 }, (_, index) => {
    const globalCows = index * 50; // 0, 50, 100, ... 5000 cows
    const tvl = globalStats?.tvl || 50000000 * 1_000_000; // Use real TVL or default
    const rewardRate = calculateDynamicRewardRate(globalCows, tvl);
    const greedMultiplier = calculateGreedMultiplier(globalCows);
    return {
      cows: globalCows,
      rate: rewardRate,
      greedMultiplier: greedMultiplier,
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
            <h4 className="text-lg font-bold text-gray-800">🎮 Protocol Status</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Time since start:</span>
              <span className="font-bold text-gray-800">{getTimeSinceStart()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total TVL:</span>
              <span className="font-bold text-success-600">
                {formatNumber(tvlInMilk)} MILK
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">TVL per Cow:</span>
              <span className="font-bold text-gray-800">
                {formatNumber(tvlPerCow)} MILK
              </span>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="card-header">
            <DollarSign className="text-green-600" size={28} />
            <h4 className="text-lg font-bold text-gray-800">💰 ROI Metrics</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Daily ROI:</span>
              <span className="font-bold text-success-600 transition-all duration-300">
                {gameStats?.currentCowPrice && gameStats?.currentRewardRate 
                  ? `${((gameStats.currentRewardRate / gameStats.currentCowPrice) * 100).toFixed(2)}%`
                  : '0.00%'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Break-even time:</span>
              <span className="font-bold text-success-600 transition-all duration-300">
                {gameStats?.currentCowPrice && gameStats?.currentRewardRate 
                  ? `${(gameStats.currentCowPrice / gameStats.currentRewardRate).toFixed(1)} days`
                  : 'N/A'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price multiplier:</span>
              <span className="font-bold text-success-600 transition-all duration-300">
                {gameStats?.priceMultiplier ? `${gameStats.priceMultiplier.toFixed(2)}x` : '1.00x'}
              </span>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="card-header">
            <Shield className="text-red-600" size={28} />
            <h4 className="text-lg font-bold text-gray-800">🛡️ Anti-Dump Status</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-bold text-success-600">✅ Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Penalty rate:</span>
              <span className="font-bold text-gray-800">50%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cooling period:</span>
              <span className="font-bold text-gray-800">24 hours</span>
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
              <span className="text-gray-600">Global Cows:</span>
              <span className="font-bold text-success-600 transition-all duration-300">
                {formatNumber(globalStats?.globalCows || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Price:</span>
              <span className="font-bold text-success-600 transition-all duration-300">
                {formatNumber(gameStats?.currentCowPrice || GAME_CONFIG.COW_BASE_PRICE)} MILK
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Network:</span>
              <span className="font-bold text-gray-800 capitalize">{currentNetwork}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card p-6 lg:p-8">
          <h4 className="text-xl font-bold text-gray-800 mb-6 text-center">
            🐄 Dynamic Cow Price Bonding Curve
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="cows" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip 
                  formatter={(value) => [formatNumber(value as number), 'Price (MILK)']}
                  labelFormatter={(label) => `${formatNumber(label)} Cows`}
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
                  dot={false}
                  activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2, fill: '#a855f7' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-500 text-center mt-4 italic">
            📈 Price follows bonding curve: P(c) = 6,000 × (1 + (c/1,000)^1.0)
            {globalStats && (
              <span className="block text-red-600 font-semibold mt-1">
                Current: {formatNumber(globalStats.globalCows)} cows at {formatNumber(calculateDynamicCowPrice(globalStats.globalCows))} MILK
              </span>
            )}
          </p>
        </div>

        <div className="card p-6 lg:p-8">
          <h4 className="text-xl font-bold text-gray-800 mb-6 text-center">
            ⚡ Dynamic Reward Rate
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rewardData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="cows" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip 
                  formatter={(value) => [formatNumber(value as number), 'Rate (MILK/cow/day)']}
                  labelFormatter={(label) => `${formatNumber(label)} Cows`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Line 
                  type="monotone"
                  dataKey="rate" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#22c55e' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-500 text-center mt-4 italic">
            📊 R = 150k / (1 + 0.8 × TVL/Cow / 50k) × (1 + 5 × e^(-C/250))
            {globalStats && (
              <span className="block text-red-600 font-semibold mt-1">
                Current: {formatNumber(calculateDynamicRewardRate(globalStats.globalCows, globalStats.tvl))} MILK/cow/day
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Protocol Innovation */}
      <div className="card p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <h4 className="text-2xl font-bold text-center text-gray-800 mb-8">
          🧮 Advanced Economic Protocol
        </h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3 text-center">🐄</div>
            <h5 className="text-lg font-bold text-purple-600 mb-3">Dynamic Pricing</h5>
            <p className="text-gray-600 text-sm leading-relaxed">
              Exponential bonding curve prevents infinite supply. 
              Current price: <strong className="text-success-600">{formatNumber(gameStats?.currentCowPrice || GAME_CONFIG.COW_BASE_PRICE)} MILK</strong>. 
              Creates natural supply constraints.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3 text-center">🥛</div>
            <h5 className="text-lg font-bold text-green-600 mb-3">TVL-Responsive Rewards</h5>
            <p className="text-gray-600 text-sm leading-relaxed">
              Anti-inflationary mechanism adjusts rewards based on TVL concentration. 
              Current rate: <strong className="text-success-600">{formatNumber(gameStats?.currentRewardRate || GAME_CONFIG.REWARD_BASE)} MILK/cow/day</strong>.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3 text-center">🚀</div>
            <h5 className="text-lg font-bold text-blue-600 mb-3">Greed Multiplier</h5>
            <p className="text-gray-600 text-sm leading-relaxed">
              Early adopter bonus decays exponentially from 6x to 1x. 
              Current multiplier: <strong className="text-success-600">{gameStats?.greedMultiplier?.toFixed(2) || '6.00'}x</strong>.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3 text-center">🛡️</div>
            <h5 className="text-lg font-bold text-red-600 mb-3">Anti-Dump Protocol</h5>
            <p className="text-gray-600 text-sm leading-relaxed">
              24-hour cooling mechanism with 50% penalty redistribution. 
              Penalties increase TVL, benefiting all holders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};