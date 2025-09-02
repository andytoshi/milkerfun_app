import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGameData } from '../hooks/useGameData';
import { useSolanaTransactions } from '../hooks/useSolanaTransactions';
import { Recycle, AlertTriangle, Plus, Minus, HelpCircle } from 'lucide-react';
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
      
      let errorMessage = 'Failed to compound cows. ';
      if (err instanceof Error) {
        errorMessage += err.message;
      }
      
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes('insufficient funds')) {
        errorMessage = 'Insufficient SOL for transaction fees. Add more SOL to your wallet.';
      } else if (errorMsg.includes('InsufficientRewards')) {
        errorMessage = 'Insufficient rewards to compound. Wait for more rewards to accumulate.';
      } else if (errorMsg.includes('User rejected')) {
        errorMessage = 'Transaction was cancelled by user.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="glass-card p-6 lg:p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Recycle className="text-white" size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-4">🔄 Compound Cows</h3>
          <p className="text-white/70">Connect your wallet to compound rewards!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Recycle className="text-white" size={24} />
        </div>
        <h3 className="text-xl font-bold text-white">🔄 Compound Cows</h3>
        <div className="ml-auto">
          <div className="group/tooltip relative">
            <button className="text-white/60 hover:text-white/80 transition-colors">
              <HelpCircle size={20} />
            </button>
            <div className="absolute right-0 top-8 w-64 bg-black/90 text-white text-sm rounded-xl p-3 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 pointer-events-none z-10 backdrop-blur-sm border border-white/20">
              Use your earned MILK rewards to buy more cows without spending from your wallet! This creates exponential growth.
            </div>
          </div>
        </div>
      </div>
      
      {/* Rewards Display */}
      <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20 backdrop-blur-sm transition-all duration-300">
        <div className="flex justify-between items-center mb-3">
          <span className="text-white/80 font-semibold">Available:</span>
          <span className="text-2xl font-bold text-green-400 transition-all duration-300">
            {formatNumber(totalRewards)} MILK
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/70">Max Cows You Can Buy:</span>
          <span className="font-bold text-white transition-all duration-300">{formatNumber(maxAffordableCows)}</span>
        </div>
      </div>

      {totalRewards > 0 ? (
        <div className="space-y-6">
          {/* Cow Input */}
          <div>
            <label htmlFor="compoundCows" className="block text-sm font-semibold text-white/90 mb-3">
              Number of Cows to Compound:
            </label>
            <div className="flex items-center gap-3 mb-3">
              <button 
                onClick={() => setNumCows(Math.max(1, numCows - 1))}
                disabled={numCows <= 1}
                className="w-12 h-12 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:text-white/30 text-white rounded-xl font-bold transition-all duration-300 flex items-center justify-center backdrop-blur-sm border border-white/20"
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
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 text-center font-bold text-lg backdrop-blur-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
              />
              <button 
                onClick={() => setNumCows(Math.min(maxAffordableCows, numCows + 1))}
                disabled={numCows >= maxAffordableCows}
                className="w-12 h-12 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:text-white/30 text-white rounded-xl font-bold transition-all duration-300 flex items-center justify-center backdrop-blur-sm border border-white/20"
              >
                <Plus size={20} />
              </button>
            </div>
            <button
              onClick={() => setNumCows(maxAffordableCows)}
              disabled={maxAffordableCows === 0}
              className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:text-white/30 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 text-sm backdrop-blur-sm border border-white/20"
            >
              MAX ({formatNumber(maxAffordableCows)})
            </button>
          </div>

          {/* Cost Summary */}
          <div className="bg-white/10 rounded-xl p-4 space-y-3 border border-white/20 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium text-white/80">
                Cost for {numCows} cow{numCows !== 1 ? 's' : ''}:
              </span>
              <span className="text-lg font-bold text-white">
                {formatNumber(totalCost)} MILK
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-white/80">Remaining:</span>
              <span className="text-lg font-bold text-green-400">
                {formatNumber(Math.max(0, totalRewards - totalCost))} MILK
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-red-400 flex-shrink-0" size={20} />
                <p className="text-red-300 font-medium">{error}</p>
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
                : 'bg-white/10 text-white/50 cursor-not-allowed backdrop-blur-sm border border-white/20'
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

          {/* Compound Benefits */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-lg">📈</span>
              Compound Benefits
            </h4>
            <ul className="space-y-2 text-white/70 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-400">•</span>
                <span>No wallet MILK required - uses earned rewards</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">•</span>
                <span>Exponential growth through reinvestment</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">•</span>
                <span>Higher cow count = higher daily earnings</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
            <span className="text-4xl">🐄</span>
          </div>
          <h4 className="text-lg font-bold text-white mb-3">No Rewards Available</h4>
          <p className="text-white/70 mb-2">No rewards available to compound yet.</p>
          <p className="text-white/60 text-sm">Buy some cows first and wait for them to produce MILK!</p>
        </div>
      )}
    </div>
  );
};