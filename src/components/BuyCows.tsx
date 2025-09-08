import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGameData } from '../hooks/useGameData';
import { useSolanaTransactions } from '../hooks/useSolanaTransactions';
import { ShoppingCart, AlertTriangle, Plus, Minus, TrendingUp } from 'lucide-react';
import { formatNumber } from '../utils/format';
import { GAME_CONFIG } from '../constants/solana';

export const BuyCows: React.FC = () => {
  const { publicKey } = useWallet();
  const { userStats, gameStats } = useGameData(publicKey?.toString(), true);
  const { buyCows } = useSolanaTransactions();
  
  const [numCows, setNumCows] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCost = (gameStats?.currentCowPrice || 0) * numCows;
  const canAfford = (userStats?.milkBalance || 0) >= totalCost;
  const maxAffordableCows = Math.min(
    Math.floor((userStats?.milkBalance || 0) / (gameStats?.currentCowPrice || 1)),
    GAME_CONFIG.MAX_COWS_PER_TRANSACTION
  );

  const handleBuyCows = async () => {
    if (!publicKey || !canAfford) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const signature = await buyCows(numCows);
      console.log('Successfully bought cows! Transaction:', signature);
      
      // Wait 3 seconds for blockchain state to update, then refresh data
      setTimeout(async () => {
        console.log('🔄 Refreshing data after successful cow purchase...');
        // Force page reload if state doesn't update properly
        window.location.reload();
      }, 3000);
      setNumCows(1);
    } catch (err) {
      console.error('Error buying cows:', err);
      
      let errorMessage = 'Failed to buy cows. ';
      if (err instanceof Error) {
        errorMessage += err.message;
      }
      
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes('insufficient funds')) {
        errorMessage = 'Insufficient SOL for transaction fees. Add more SOL to your wallet.';
      } else if (errorMsg.includes('TokenInsufficientFunds')) {
        errorMessage = 'Insufficient MILK tokens. Check your balance.';
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
            <ShoppingCart className="text-white" size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-4">🛒 Buy Cows</h3>
          <p className="text-white/70">Connect your wallet to buy cows!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <ShoppingCart className="text-white" size={24} />
        </div>
        <h3 className="text-xl font-bold text-white">🛒 Buy Cows</h3>
      </div>
      
      {/* Current Price Display */}
      <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20 backdrop-blur-sm transition-all duration-300">
        <div className="flex justify-between items-center mb-3">
          <span className="text-white/80 font-semibold">Cow price:</span>
          <span className="text-2xl font-bold text-purple-400 transition-all duration-300">
            {formatNumber(gameStats?.currentCowPrice || 0)} $MILK
          </span>
        </div>
        
        {(gameStats?.hoursElapsed || 0) < 168 && (gameStats?.greedMultiplier || 1) > 2 && (
          <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
            <TrendingUp size={16} />
            <span>Early adopter bonus active! Greed multiplier: {gameStats?.greedMultiplier ? `${gameStats.greedMultiplier.toFixed(2)}x` : '6.00x'}</span>
          </div>
        )}
        
        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1 text-sm text-white/80">
            <span>⚠️</span>
            <span>Max {GAME_CONFIG.MAX_COWS_PER_TRANSACTION} cows per transaction</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Cow Input */}
        <div>
          <label htmlFor="buyCows" className="block text-sm font-semibold text-white/90 mb-3">
            Number of Cows to Buy:
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
              id="buyCows"
              type="number"
              min="1"
              max={Math.min(maxAffordableCows, GAME_CONFIG.MAX_COWS_PER_TRANSACTION)}
              value={numCows}
              onChange={(e) => {
                const value = Math.max(1, Math.min(maxAffordableCows, GAME_CONFIG.MAX_COWS_PER_TRANSACTION, parseInt(e.target.value) || 1));
                setNumCows(value);
              }}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 text-center font-bold text-lg backdrop-blur-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
            />
            <button 
              onClick={() => setNumCows(Math.min(maxAffordableCows, GAME_CONFIG.MAX_COWS_PER_TRANSACTION, numCows + 1))}
              disabled={numCows >= maxAffordableCows || numCows >= GAME_CONFIG.MAX_COWS_PER_TRANSACTION}
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
          
          {maxAffordableCows > GAME_CONFIG.MAX_COWS_PER_TRANSACTION && (
            <div className="mt-2 text-sm text-yellow-400 bg-yellow-500/20 rounded-lg p-2 border border-yellow-400/30">
              <span>💡 You can afford more, but transactions are limited to {GAME_CONFIG.MAX_COWS_PER_TRANSACTION} cows for anti-whale protection</span>
            </div>
          )}
        </div>

        {/* Cost Summary */}
        <div className="bg-white/10 rounded-xl p-4 space-y-3 border border-white/20 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="font-medium text-white/80">
              Cost for {numCows} cow{numCows !== 1 ? 's' : ''}:
            </span>
            <span className="text-lg font-bold text-white">
              {formatNumber(totalCost)} $MILK
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-white/80">Balance:</span>
            <span className={`text-lg font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
              {formatNumber(userStats?.milkBalance || 0)} $MILK
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-white/80">Remaining:</span>
            <span className="text-lg font-bold text-green-400">
              {formatNumber(Math.max(0, (userStats?.milkBalance || 0) - totalCost))} $MILK
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

        {/* Buy Button */}
        <button
          onClick={handleBuyCows}
          disabled={!canAfford || loading || numCows < 1 || maxAffordableCows === 0}
          className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
            canAfford && !loading && maxAffordableCows > 0
              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
              : 'bg-white/10 text-white/50 cursor-not-allowed backdrop-blur-sm border border-white/20'
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Buying Cows...
            </>
          ) : (
            <>
              <ShoppingCart size={24} />
              Buy {numCows} Cow{numCows !== 1 ? 's' : ''} for {formatNumber(totalCost)} $MILK
            </>
          )}
        </button>

        {/* Insufficient Funds Warning */}
        {!canAfford && totalCost > 0 && (
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-yellow-400 flex-shrink-0" size={20} />
              <p className="text-yellow-300 font-medium">
                You need {formatNumber(totalCost - (userStats?.milkBalance || 0))} more MILK tokens
              </p>
            </div>
          </div>
        )}

        {/* Purchase Benefits */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span className="text-lg">📈</span>
            Purchase Benefits
          </h4>
          <ul className="space-y-2 text-white/70 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-green-400">•</span>
              <span>Immediate MILK production from new cows</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">•</span>
              <span>Higher cow count = higher daily earnings</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">•</span>
              <span>Early adopter greed bonus still active</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};