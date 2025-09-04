import React from 'react';
import { useNetwork } from '../hooks/useNetwork';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, RefreshCw, DollarSign, Shield, Activity, Zap, Target, Clock } from 'lucide-react';
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
  globalStats,
  loading,
  error,
  onRefresh
}) => {
  const { currentNetwork } = useNetwork();

  const getTimeSinceStart = () => {
    if (!configData) return 'Loading...';
    
    const currentTime = Math.floor(Date.now() / 1000);
    const startTime = configData.startTime?.toNumber ? configData.startTime.toNumber() : (currentTime - (7 * 24 * 3600));
    const elapsedSeconds = currentTime - startTime;
    
    return formatTime(elapsedSeconds);
  };

  const getTVLMetrics = () => {
    if (!globalStats) return { tvlInMilk: 0, tvlPerCow: 0 };
    
    const tvlInMilk = globalStats.tvl / 1_000_000;
    const tvlPerCow = globalStats.globalCows > 0 ? tvlInMilk / globalStats.globalCows : 0;
    
    return { tvlInMilk, tvlPerCow };
  };

  const { tvlInMilk, tvlPerCow } = getTVLMetrics();

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Header */}
        <div className="glass-card p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Activity className="text-white animate-pulse" size={24} />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">Loading Analytics</h2>
                <p className="text-white/70">Fetching real-time blockchain data...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="w-8 h-8 bg-white/20 rounded-lg mb-4"></div>
              <div className="h-4 bg-white/20 rounded mb-2"></div>
              <div className="h-6 bg-white/20 rounded"></div>
            </div>
          ))}
        </div>

        {/* Loading Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card p-6 md:p-8 animate-pulse">
              <div className="h-6 bg-white/20 rounded mb-6"></div>
              <div className="h-64 bg-white/10 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 md:p-8 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield className="text-red-400" size={32} />
        </div>
        <h3 className="text-xl font-bold text-white mb-4">Failed to Load Analytics</h3>
        <p className="text-white/70 mb-6">{error}</p>
        <button
          onClick={onRefresh}
          className="btn-primary flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={20} />
          Retry Loading
        </button>
      </div>
    );
  }

  // Generate chart data
  const priceData = Array.from({ length: 61 }, (_, index) => {
    const globalCows = index * 167; // 0, 167, 334, ... ~10,000 cows
    const price = calculateDynamicCowPrice(globalCows);
    return { cows: globalCows, price: price };
  });

  const rewardData = Array.from({ length: 61 }, (_, index) => {
    const globalCows = index * 167;
    const tvl = globalStats?.tvl || 100000000 * 1_000_000;
    const rewardRate = calculateDynamicRewardRate(globalCows, tvl);
    const greedMultiplier = calculateGreedMultiplier(globalCows);
    return {
      cows: globalCows,
      rate: rewardRate,
      greedMultiplier: greedMultiplier,
    };
  });

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header Card */}
      <div className="glass-card p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
              <Activity className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Protocol Analytics</h2>
              <p className="text-white/70">Real-time economic data and insights</p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
              loading 
                ? 'bg-white/10 text-white/50 cursor-not-allowed' 
                : 'bg-white/20 hover:bg-white/30 text-white shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm'
            }`}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Protocol Status */}
        <div className="glass-card p-6 group hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Clock className="text-white" size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Protocol Status</h3>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col">
              <span className="text-white/60 text-sm font-medium">Time Live</span>
              <span className="text-xl font-bold text-white">{getTimeSinceStart()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white/60 text-sm font-medium">Network</span>
              <span className="text-lg font-semibold text-green-400 capitalize">{currentNetwork}</span>
            </div>
          </div>
        </div>

        {/* TVL Metrics */}
        <div className="glass-card p-6 group hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="text-white" size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">TVL Metrics</h3>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col">
              <span className="text-white/60 text-sm font-medium">Total Value Locked</span>
              <span className="text-xl font-bold text-blue-400">{formatNumber(tvlInMilk)} MILK</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white/60 text-sm font-medium">TVL per Cow</span>
              <span className="text-lg font-semibold text-white">{formatNumber(tvlPerCow)} MILK</span>
            </div>
          </div>
        </div>

        {/* Economic Metrics */}
        <div className="glass-card p-6 group hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="text-white" size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Economics</h3>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col">
              <span className="text-white/60 text-sm font-medium">Cow Price</span>
              <span className="text-xl font-bold text-purple-400">{formatNumber(gameStats?.currentCowPrice || GAME_CONFIG.COW_BASE_PRICE)} MILK</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white/60 text-sm font-medium">Daily ROI</span>
              <span className="text-lg font-semibold text-green-400">
                {gameStats?.currentCowPrice && gameStats?.currentRewardRate 
                  ? `${((gameStats.currentRewardRate / gameStats.currentCowPrice) * 100).toFixed(2)}%`
                  : '0.00%'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Network Stats */}
        <div className="glass-card p-6 group hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Users className="text-white" size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Network</h3>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col">
              <span className="text-white/60 text-sm font-medium">Global Cows</span>
              <span className="text-xl font-bold text-orange-400">{formatNumber(globalStats?.globalCows || 0)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white/60 text-sm font-medium">Greed Multiplier</span>
              <span className="text-lg font-semibold text-yellow-400">
                {gameStats?.greedMultiplier ? `${gameStats.greedMultiplier.toFixed(2)}x` : '6.00x'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Metrics */}
      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        {/* ROI Analysis */}
        <div className="glass-card p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center">
              <Target className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">ROI Analysis</h3>
          </div>
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70 font-medium">Break-even Time</span>
                <span className="text-2xl font-bold text-green-400">
                  {gameStats?.currentCowPrice && gameStats?.currentRewardRate 
                    ? `${(gameStats.currentCowPrice / gameStats.currentRewardRate).toFixed(1)} days`
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-1000"
                  style={{ 
                    width: gameStats?.currentCowPrice && gameStats?.currentRewardRate 
                      ? `${Math.min(100, (gameStats.currentRewardRate / gameStats.currentCowPrice) * 100 * 10)}%`
                      : '0%'
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Daily ROI:</span>
                <span className="font-bold text-green-400">
                  {gameStats?.currentCowPrice && gameStats?.currentRewardRate 
                    ? `${((gameStats.currentRewardRate / gameStats.currentCowPrice) * 100).toFixed(2)}%`
                    : '0.00%'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Hourly ROI:</span>
                <span className="font-bold text-white">
                  {gameStats?.currentCowPrice && gameStats?.currentRewardRate 
                    ? `${((gameStats.currentRewardRate / gameStats.currentCowPrice / 24) * 100).toFixed(4)}%`
                    : '0.0000%'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Price Multiplier:</span>
                <span className="font-bold text-purple-400">
                  {gameStats?.priceMultiplier ? `${gameStats.priceMultiplier.toFixed(2)}x` : '1.00x'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Protocol Mechanics */}
        <div className="glass-card p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center">
              <Zap className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Protocol Mechanics</h3>
          </div>
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="text-white font-semibold mb-3">Dynamic Pricing</h4>
              <div className="text-center">
                <div className="text-sm text-white/60 mb-1">P(c) = 6,000 × (1 + (c/1,000)¹·⁰)</div>
                <div className="text-lg font-bold text-purple-400">
                  Current: {formatNumber(gameStats?.currentCowPrice || GAME_CONFIG.COW_BASE_PRICE)} MILK
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="text-white font-semibold mb-3">Reward Distribution</h4>
              <div className="text-center">
                <div className="text-sm text-white/60 mb-1">R = B/(1+α×TVL/C/S) × G(C)</div>
                <div className="text-lg font-bold text-green-400">
                  {formatNumber(gameStats?.currentRewardRate || GAME_CONFIG.REWARD_BASE)} MILK/day
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="text-white font-semibold mb-3">Greed Multiplier</h4>
              <div className="text-center">
                <div className="text-sm text-white/60 mb-1">G(C) = 1 + 5 × e^(-C/250)</div>
                <div className="text-lg font-bold text-yellow-400">
                  {gameStats?.greedMultiplier?.toFixed(2) || '6.00'}x
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Anti-Dump Protocol */}
        <div className="glass-card p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl flex items-center justify-center">
              <Shield className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Anti-Dump Protocol</h3>
          </div>
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70">Status</span>
                <span className="text-green-400 font-bold flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70">Cooling Period</span>
                <span className="text-white font-bold">24 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Penalty Rate</span>
                <span className="text-red-400 font-bold">50%</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm text-white/80 leading-relaxed">
                <strong className="text-white">How it works:</strong>
              </div>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>24h cooling period between withdrawals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>50% penalty for early withdrawals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>Penalties stay in pool, boosting TVL</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
        {/* Price Curve Chart */}
        <div className="glass-card p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white" size={20} />
            </div>
            <h4 className="text-xl font-bold text-white">Dynamic Pricing Curve</h4>
          </div>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="cows" 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip 
                  formatter={(value) => [formatNumber(value as number), 'Price (MILK)']}
                  labelFormatter={(label) => `${formatNumber(label)} Cows`}
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    color: 'white'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fill="url(#priceGradient)"
                  dot={false}
                  activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2, fill: '#a855f7' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-white/60 italic">
              Exponential bonding curve prevents infinite supply
            </p>
            {globalStats && (
              <p className="text-sm font-semibold text-purple-400 mt-2">
                Current: {formatNumber(globalStats.globalCows)} cows → {formatNumber(calculateDynamicCowPrice(globalStats.globalCows))} MILK
              </p>
            )}
          </div>
        </div>

        {/* Reward Rate Chart */}
        <div className="glass-card p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center">
              <Activity className="text-white" size={20} />
            </div>
            <h4 className="text-xl font-bold text-white">Reward Rate Evolution</h4>
          </div>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rewardData}>
                <defs>
                  <linearGradient id="rewardGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="cows" 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    formatNumber(value as number), 
                    name === 'rate' ? 'Rate (MILK/cow/day)' : 'Greed Multiplier'
                  ]}
                  labelFormatter={(label) => `${formatNumber(label)} Cows`}
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    color: 'white'
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
          <div className="mt-4 text-center">
            <p className="text-sm text-white/60 italic">
              TVL-responsive rewards with greed multiplier decay
            </p>
            {globalStats && (
              <p className="text-sm font-semibold text-green-400 mt-2">
                Current: {formatNumber(calculateDynamicRewardRate(globalStats.globalCows, globalStats.tvl))} MILK/cow/day
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Protocol Innovation Section */}
      <div className="glass-card p-6 md:p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            🧮 Mathematical Protocol Innovation
          </h3>
          <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed">
            MilkerFun implements sophisticated mathematical models that create sustainable, 
            anti-inflationary tokenomics through dynamic pricing and reward mechanisms.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
            <div className="text-3xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">🐄</div>
            <h4 className="text-lg font-bold text-purple-400 mb-3 text-center">Dynamic Pricing</h4>
            <p className="text-white/70 text-sm leading-relaxed text-center">
              Exponential bonding curve prevents infinite supply through mathematically increasing costs.
            </p>
            <div className="mt-4 text-center">
              <div className="text-xs text-white/50 font-mono">P(c) = 6k × (1 + (c/1k)¹)</div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
            <div className="text-3xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">🥛</div>
            <h4 className="text-lg font-bold text-green-400 mb-3 text-center">TVL-Responsive</h4>
            <p className="text-white/70 text-sm leading-relaxed text-center">
              Anti-inflationary rewards that automatically adjust based on capital concentration.
            </p>
            <div className="mt-4 text-center">
              <div className="text-xs text-white/50 font-mono">R = B/(1+α×TVL/C/S)</div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
            <div className="text-3xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">🚀</div>
            <h4 className="text-lg font-bold text-yellow-400 mb-3 text-center">Greed Decay</h4>
            <p className="text-white/70 text-sm leading-relaxed text-center">
              Early adopter bonuses decay exponentially from 6x to 1x as ecosystem grows.
            </p>
            <div className="mt-4 text-center">
              <div className="text-xs text-white/50 font-mono">G = 1 + 5×e^(-C/250)</div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
            <div className="text-3xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">🛡️</div>
            <h4 className="text-lg font-bold text-red-400 mb-3 text-center">Anti-Dump</h4>
            <p className="text-white/70 text-sm leading-relaxed text-center">
              24-hour cooling period with penalty redistribution creates market stability.
            </p>
            <div className="mt-4 text-center">
              <div className="text-xs text-white/50 font-mono">50% penalty → TVL</div>
            </div>
          </div>
        </div>
      </div>

      {/* Economic Comparison Table */}
      <div className="glass-card p-6 md:p-8">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          ⚖️ Protocol vs Traditional DeFi
        </h3>
        
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Mobile-friendly table */}
            <div className="block md:hidden space-y-4">
              {[
                { feature: 'Supply Control', traditional: '❌ Fixed/unlimited', milker: '✅ Dynamic bonding curves' },
                { feature: 'Reward Sustainability', traditional: '❌ Fixed rates → inflation', milker: '✅ TVL-responsive anti-inflation' },
                { feature: 'Market Stability', traditional: '❌ Vulnerable to dumps', milker: '✅ 24h cooling + penalties' },
                { feature: 'Early Adopter Incentives', traditional: '⚠️ Often unfair', milker: '✅ Mathematical decay function' },
                { feature: 'Whale Protection', traditional: '❌ Whales dominate', milker: '✅ Exponential cost scaling' }
              ].map((row, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="text-white font-bold mb-3">{row.feature}</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-white/60 text-sm font-medium min-w-[80px]">Traditional:</span>
                      <span className="text-sm text-white/80">{row.traditional}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-white/60 text-sm font-medium min-w-[80px]">MilkerFun:</span>
                      <span className="text-sm text-white/80">{row.milker}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <table className="hidden md:table w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-4 font-bold text-white">Feature</th>
                  <th className="text-center p-4 font-bold text-white">Traditional DeFi</th>
                  <th className="text-center p-4 font-bold text-white">MilkerFun Protocol</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-semibold text-white">Supply Control</td>
                  <td className="p-4 text-center text-red-400">❌ Fixed or unlimited</td>
                  <td className="p-4 text-center text-green-400">✅ Dynamic bonding curves</td>
                </tr>
                <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-semibold text-white">Reward Sustainability</td>
                  <td className="p-4 text-center text-red-400">❌ Fixed rates lead to inflation</td>
                  <td className="p-4 text-center text-green-400">✅ TVL-responsive anti-inflation</td>
                </tr>
                <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-semibold text-white">Market Stability</td>
                  <td className="p-4 text-center text-red-400">❌ Vulnerable to dumps</td>
                  <td className="p-4 text-center text-green-400">✅ 24h cooling + penalties</td>
                </tr>
                <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-semibold text-white">Early Adopter Incentives</td>
                  <td className="p-4 text-center text-yellow-400">⚠️ Often unfair or unsustainable</td>
                  <td className="p-4 text-center text-green-400">✅ Mathematical decay function</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-semibold text-white">Whale Protection</td>
                  <td className="p-4 text-center text-red-400">❌ Whales can dominate</td>
                  <td className="p-4 text-center text-green-400">✅ Exponential cost scaling</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mathematical Formulas */}
      <div className="glass-card p-6 md:p-8">
        <h3 className="text-2xl font-bold text-white mb-8 text-center">
          🧮 Core Mathematical Models
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
            <h4 className="text-lg font-bold text-purple-400 mb-4 text-center">Dynamic Pricing</h4>
            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <div className="text-center font-mono text-white text-lg font-bold">
                P(c) = 6,000 × (1 + (c/3,000)²·⁰)
              </div>
            </div>
            <div className="space-y-2 text-sm text-white/70">
              <div><strong className="text-white">P₀:</strong> Base price (6,000 MILK)</div>
              <div><strong className="text-white">c:</strong> Global cow count</div>
              <div><strong className="text-white">C_pivot:</strong> Pivot point (3,000)</div>
              <div><strong className="text-white">α:</strong> Steepness (2.0)</div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-green-500/30 hover:border-green-400/50 transition-all duration-300">
            <h4 className="text-lg font-bold text-green-400 mb-4 text-center">Reward Distribution</h4>
            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <div className="text-center font-mono text-white text-sm font-bold leading-relaxed">
                R = max(25k / (1 + 0.5 × (TVL/C) / 100k), 1k) × G(C)
              </div>
            </div>
            <div className="space-y-2 text-sm text-white/70">
              <div><strong className="text-white">B:</strong> Base reward (25k MILK)</div>
              <div><strong className="text-white">α:</strong> Sensitivity (0.5)</div>
              <div><strong className="text-white">S:</strong> Normalization (100k)</div>
              <div><strong className="text-white">G(C):</strong> Greed function</div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300">
            <h4 className="text-lg font-bold text-yellow-400 mb-4 text-center">Greed Multiplier</h4>
            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <div className="text-center font-mono text-white text-lg font-bold">
                G(C) = 1 + 8 × e^(-C/1500)
              </div>
            </div>
            <div className="space-y-2 text-sm text-white/70">
              <div><strong className="text-white">β:</strong> Multiplier (8.0)</div>
              <div><strong className="text-white">C₀:</strong> Decay pivot (1,500)</div>
              <div><strong className="text-white">Range:</strong> 9x → 1x</div>
              <div><strong className="text-white">Current:</strong> {gameStats?.greedMultiplier?.toFixed(2) || '9.00'}x</div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Metrics Footer */}
      <div className="glass-card p-6 md:p-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-400/30">
        <div className="text-center">
          <h4 className="text-xl font-bold text-white mb-4">
            🔴 Live Protocol Metrics
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-1">
                {formatNumber(globalStats?.globalCows || 0)}
              </div>
              <div className="text-white/60 text-sm font-medium">Total Cows</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-1">
                {formatNumber(tvlInMilk)}
              </div>
              <div className="text-white/60 text-sm font-medium">TVL (MILK)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-400 mb-1">
                {formatNumber(gameStats?.currentCowPrice || GAME_CONFIG.COW_BASE_PRICE)}
              </div>
              <div className="text-white/60 text-sm font-medium">Cow Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1">
                {gameStats?.greedMultiplier?.toFixed(2) || '9.00'}x
              </div>
              <div className="text-white/60 text-sm font-medium">Greed Bonus</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};