import React from 'react';
import { useEffect } from 'react';
import { Dashboard } from '../components/Dashboard';
import { BuyCows } from '../components/BuyCows';
import { CompoundCows } from '../components/CompoundCows';
import { WithdrawMilk } from '../components/WithdrawMilk';

export const GamePage: React.FC = () => {
  // This will trigger initial data load when the game page is visited
  useEffect(() => {
    console.log('Game page loaded - data will be fetched by components');
  }, []);

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 text-shadow-lg">
            🎮 Cow Farming Game
          </h1>
          <p className="text-lg sm:text-xl text-white/90 text-shadow">
            Manage your dairy empire and earn MILK tokens!
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
        <Dashboard />
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <BuyCows />
          <CompoundCows />
          <WithdrawMilk />
        </div>
      </div>
    </div>
  );
};