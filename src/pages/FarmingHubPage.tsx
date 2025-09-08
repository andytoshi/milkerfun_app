import React from 'react';
import { useEffect } from 'react';
import { Dashboard } from '../components/Dashboard';
import { BuyCows } from '../components/BuyCows';
import { CompoundCows } from '../components/CompoundCows';
import { WithdrawMilk } from '../components/WithdrawMilk';
import { ExportImportCows } from '../components/ExportImportCows';

export const FarmingHubPage: React.FC = () => {
  // This will trigger initial data load when the game page is visited
  useEffect(() => {
    console.log('Farming Hub page loaded - data will be fetched by components');
  }, []);

  return (
    <div className="min-h-screen">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/12 text-4xl md:text-6xl opacity-5 animate-float">🐄</div>
        <div className="absolute top-3/5 right-1/6 text-3xl md:text-5xl opacity-5 animate-float" style={{ animationDelay: '2s' }}>🥛</div>
        <div className="absolute bottom-1/3 left-1/5 text-4xl md:text-6xl opacity-5 animate-float" style={{ animationDelay: '4s' }}>🎮</div>
        <div className="absolute top-2/5 right-1/4 text-3xl md:text-5xl opacity-5 animate-float" style={{ animationDelay: '1s' }}>💰</div>
        <div className="absolute bottom-1/5 right-1/12 text-3xl md:text-5xl opacity-5 animate-float" style={{ animationDelay: '3s' }}>🚀</div>
      </div>

      {/* Page Header */}
      <div className="relative z-10">
        <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-6">
                <span className="text-4xl md:text-6xl animate-bounce-slow">🎮</span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white text-shadow-lg">
                  Farming Hub
                </h1>
                <span className="text-4xl md:text-6xl animate-bounce-slow">🐄</span>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 text-shadow max-w-4xl mx-auto leading-relaxed">
                Manage your dairy empire, earn MILK and compound your way to the moon!
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <div className="glass-card px-4 py-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white/90 font-medium text-sm">Live Rewards</span>
                </div>
                <div className="glass-card px-4 py-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-white/90 font-medium text-sm">Dynamic Pricing</span>
                </div>
                <div className="glass-card px-4 py-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-white/90 font-medium text-sm">Anti-Dump Protection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16 space-y-8 md:space-y-12">
        {/* Dashboard Section */}
        <div className="transition-all duration-500">
          <Dashboard />
        </div>
        
        {/* Game Actions Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-shadow-lg">
              🎯 Farm Management
            </h2>
            <p className="text-lg text-white/80 text-shadow max-w-2xl mx-auto leading-relaxed">
              Buy cows with MILK tokens, compound your rewards for exponential growth, or withdraw your earnings
            </p>
          </div>
          
          {/* Action Cards Grid */}
          <div className="space-y-6 lg:space-y-8">
            {/* First Row: Buy, Compound, Withdraw */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="transform transition-all duration-500 hover:scale-105">
                <BuyCows />
              </div>
              <div className="transform transition-all duration-500 hover:scale-105">
                <CompoundCows />
              </div>
              <div className="transform transition-all duration-500 hover:scale-105">
                <WithdrawMilk />
              </div>
            </div>
            
            {/* Second Row: Export/Import */}
            <div className="flex justify-center">
              <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl transform transition-all duration-500 hover:scale-105">
                <ExportImportCows />
              </div>
            </div>
          </div>
        </div>

        {/* Protocol Information */}
        <div className="glass-card p-6 md:p-8 lg:p-10">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              🧮 How the Protocol Works
            </h3>
            <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed">
              MilkerFun implements sophisticated mathematical models that create sustainable, 
              anti-inflationary tokenomics through dynamic pricing and reward mechanisms.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group text-center">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🛒</div>
              <h4 className="text-lg font-bold text-purple-400 mb-3">1. Buy Cows</h4>
              <p className="text-white/70 text-sm leading-relaxed">
                Purchase cows at dynamic prices that increase with global supply using exponential bonding curves.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group text-center">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🥛</div>
              <h4 className="text-lg font-bold text-green-400 mb-3">2. Earn Rewards</h4>
              <p className="text-white/70 text-sm leading-relaxed">
                Your cows generate MILK tokens with TVL-responsive rates and early adopter greed bonuses.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group text-center">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🔄</div>
              <h4 className="text-lg font-bold text-blue-400 mb-3">3. Compound</h4>
              <p className="text-white/70 text-sm leading-relaxed">
                Reinvest your MILK rewards to buy more cows for exponential growth and higher yields.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group text-center">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">💰</div>
              <h4 className="text-lg font-bold text-yellow-400 mb-3">4. Withdraw</h4>
              <p className="text-white/70 text-sm leading-relaxed">
                Extract your MILK tokens to your wallet (24h cooling period with anti-dump protection).
              </p>
            </div>
          </div>

          {/* Export/Import Section */}
          <div className="mt-8 pt-8 border-t border-white/20">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group text-center">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🔄</div>
              <h4 className="text-lg font-bold text-orange-400 mb-3">5. Export/Import $COW Tokens</h4>
              <p className="text-white/70 text-sm leading-relaxed max-w-2xl mx-auto">
                Convert your farm cows to tradeable $COW tokens for DEX trading, or import $COW tokens back to productive farm cows. 
                Perfect for liquidity provision, trading, and portfolio management.
              </p>
            </div>
          </div>
        </div>

        {/* Economic Innovation */}
        <div className="glass-card p-6 md:p-8 lg:p-10 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-400/30">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              🚀 Revolutionary DeFi Innovation
            </h3>
            <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed">
              While you see a fun cow farming game, you're actually interacting with the most mathematically 
              sophisticated DeFi protocol on Solana, featuring anti-dump mechanisms and sustainable tokenomics.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-white/5 rounded-xl p-6 border border-red-500/30 hover:border-red-400/50 transition-all duration-300">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h4 className="text-xl font-bold text-red-400 mb-3">Anti-Dump Protocol</h4>
              </div>
              <ul className="space-y-2 text-white/70 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-red-400">•</span>
                  <span>24-hour cooling period</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-400">•</span>
                  <span>50% penalty redistribution</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-400">•</span>
                  <span>Market stability protection</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-400">•</span>
                  <span>Max 50 cows per transaction</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h4 className="text-xl font-bold text-purple-400 mb-3">Dynamic Bonding Curves</h4>
              </div>
              <ul className="space-y-2 text-white/70 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">•</span>
                  <span>Exponential price scaling</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">•</span>
                  <span>Anti-whale mechanics</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">•</span>
                  <span>Supply control algorithms</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔄</span>
                </div>
                <h4 className="text-xl font-bold text-orange-400 mb-3">Export/Import System</h4>
              </div>
              <ul className="space-y-2 text-white/70 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-orange-400">•</span>
                  <span>Convert cows to tradeable tokens</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-400">•</span>
                  <span>Trade on DEXs and marketplaces</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-400">•</span>
                  <span>Import back to productive cows</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};