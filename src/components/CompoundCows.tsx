import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGameData } from '../hooks/useGameData';
import { useSolanaTransactions } from '../hooks/useSolanaTransactions';
import { Recycle, AlertTriangle, Plus, Minus } from 'lucide-react';
import { formatNumber } from '../utils/format';

export const CompoundCows: React.FC = () => {
  const { publicKey } = useWallet();
  const { userStats, gameStats } = useGameData(publicKey?.toString(), true);
  const { compoundCows } = useSolanaTransactions();
  
  const [numCows, setNumCows] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalRewards = userStats?.totalRewards || 0;
  const cowPrice = gameStats?.currentCowPrice || 0;
  const totalCost = cowPrice * numCows;
  const maxAffordableCows = Math.floor(totalRewards / cowPrice);
  const canAfford = totalRewards >= totalCost && numCows <= maxAffordableCows;

  const handleCompound = async () => {
    if (!publicKey || !canAfford) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const signature = await compoundCows(numCows);
      console.log('Successfully compounded cows! Transaction:', signature);
      
      // Wait 3 seconds for blockchain state to update, then refresh data
      setTimeout(async () => {
        console.log('🔄 Refreshing data after successful compound...');
        // Force page reload if state doesn't update properly
        window.location.reload();
      }, 3000);
      setNumCows(1);
    } catch (err) {
      console.error('Error compounding cows:', err);
      setError('Failed to compound cows. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="card p-6 lg:p-8">
        <div className="card-header">
          <Recycle className="text-purple-600" size={32} />
          <h3 className="text-xl font-bold text-gray-800">🔄 Compound Cows</h3>
        </div>
        <p className="text-gray-600">Connect your wallet to compound rewards!</p>
      </div>
    );
  }

  return (
    <div className="card p-6 lg:p-8">
      <div className="card-header">
        <Recycle className="text-purple-600" size={32} />
        <h3 className="text-xl font-bold text-gray-800">🔄 Compound Cows</h3>
        <div className="ml-auto">
          <div className="group relative">
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="absolute right-0 top-8 w-64 bg-gray-800 text-white text-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
              Use your earned MILK to buy more cows without spending from your wallet!
            </div>
          </div>
        </div>
      </div>
      
      {/* Rewards Display */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 mb-6 border border-green-200 transition-all duration-300">
        <div className="flex justify-between items-center mb-3">
          <span className="text-green-700 font-semibold">Available Rewards:</span>
          <span className="text-2xl font-bold text-success-600 transition-all duration-300">
            {formatNumber(totalRewards)} MILK
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-green-600">Max Cows You Can Buy:</span>
          <span className="font-bold text-gray-800 transition-all duration-300">{formatNumber(maxAffordableCows)}</span>
        </div>
      </div>

      {totalRewards > 0 ? (
        <div className="space-y-6">
          {/* Cow Input */}
          <div>
            <label htmlFor="compoundCows" className="block text-sm font-semibold text-gray-700 mb-3">
              Number of Cows to Compound:
            </label>
            <div className="flex items-center gap-3 mb-3">
              <button 
                onClick={() => setNumCows(Math.max(1, numCows - 1))}
                disabled={numCows <= 1}
                className="w-10 h-10 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-xl font-bold transition-colors flex items-center justify-center"
              >
                <Minus size={20} />
              </button>
              <input
                id="compoundCows"
                type="number"
                min="1"
                max={maxAffordableCows}
                value={numCows}
                onChange={(e) => {
                  const value = Math.max(1, Math.min(maxAffordableCows, parseInt(e.target.value) || 1));
                  setNumCows(value);
                }}
                className="input-field text-center font-bold text-lg w-24"
              />
              <button 
                onClick={() => setNumCows(Math.min(maxAffordableCows, numCows + 1))}
                disabled={numCows >= maxAffordableCows}
                className="w-10 h-10 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-xl font-bold transition-colors flex items-center justify-center"
              >
                <Plus size={20} />
              </button>
            </div>
            <button
              onClick={() => setNumCows(maxAffordableCows)}
              disabled={maxAffordableCows === 0}
              className="btn-secondary text-sm py-2 px-4"
            >
              MAX
            </button>
          </div>

          {/* Cost Summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">
                Cost for {numCows} cow{numCows !== 1 ? 's' : ''}:
              </span>
              <span className="text-xl font-bold text-gray-800">
                {formatNumber(totalCost)} MILK
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Remaining Rewards:</span>
              <span className="text-xl font-bold text-success-600">
                {formatNumber(Math.max(0, totalRewards - totalCost))} MILK
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-error-50 border border-error-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-error-600 flex-shrink-0" size={20} />
                <p className="text-error-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Compound Button */}
          <button
            onClick={handleCompound}
            disabled={!canAfford || loading || numCows < 1 || maxAffordableCows === 0}
            className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
              canAfford && !loading && maxAffordableCows > 0
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Compounding...
              </>
            ) : (
              <>
                <Recycle size={24} />
                Compound {numCows} Cow{numCows !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-6xl mb-4 animate-bounce-slow">🐄</div>
          <p className="text-gray-600 mb-2 font-medium">No rewards available to compound yet.</p>
          <p className="text-gray-500">Buy some cows first and wait for them to produce MILK!</p>
        </div>
      )}
    </div>
  );
};