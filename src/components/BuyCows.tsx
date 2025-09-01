import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGameData } from '../hooks/useGameData';
import { useSolanaTransactions } from '../hooks/useSolanaTransactions';
import { ShoppingCart, AlertTriangle, Plus, Minus } from 'lucide-react';
import { formatNumber } from '../utils/format';

export const BuyCows: React.FC = () => {
  const { publicKey } = useWallet();
  const { userStats, gameStats } = useGameData(publicKey?.toString(), true);
  const { buyCows } = useSolanaTransactions();
  
  const [numCows, setNumCows] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCost = (gameStats?.currentCowPrice || 0) * numCows;
  const canAfford = (userStats?.milkBalance || 0) >= totalCost;

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
      <div className="card p-6 lg:p-8">
        <div className="card-header">
          <ShoppingCart className="text-purple-600" size={32} />
          <h3 className="text-xl font-bold text-gray-800">🛒 Buy Cows</h3>
        </div>
        <p className="text-gray-600">Connect your wallet to buy cows!</p>
      </div>
    );
  }

  return (
    <div className="card p-6 lg:p-8">
      <div className="card-header">
        <ShoppingCart className="text-purple-600" size={32} />
        <h3 className="text-xl font-bold text-gray-800">🛒 Buy Cows</h3>
      </div>
      
      {/* Price Display */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3 transition-all duration-300">
        <div className="flex justify-between items-center mb-2">
          <span className="text-blue-700 font-semibold">Price per Cow:</span>
          <span className="text-xl font-bold text-gray-800 transition-all duration-300">
            {formatNumber(gameStats?.currentCowPrice || 0)} MILK
          </span>
        </div>
        
        {(gameStats?.hoursElapsed || 0) < 5 && (
          <div className="flex items-center gap-2 text-warning-700 text-sm font-medium">
            <AlertTriangle size={16} />
            <span>Early adopter greed bonus active! Current multiplier: {gameStats?.greedMultiplier ? `${gameStats.greedMultiplier.toFixed(2)}x` : '6.00x'}</span>
          </div>
        )}
      </div>

      {/* Buy Form */}
      <div className="space-y-6">
        <div>
          <label htmlFor="numCows" className="block text-sm font-semibold text-gray-700 mb-3">
            Number of Cows:
          </label>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setNumCows(Math.max(1, numCows - 1))}
              disabled={numCows <= 1}
              className="w-10 h-10 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-xl font-bold transition-colors flex items-center justify-center"
            >
              <Minus size={20} />
            </button>
            <input
              id="numCows"
              type="number"
              min="1"
              value={numCows}
              onChange={(e) => setNumCows(Math.max(1, parseInt(e.target.value) || 1))}
              className="input-field text-center font-bold text-lg w-24"
            />
            <button 
              onClick={() => setNumCows(numCows + 1)}
              className="w-10 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Total Cost:</span>
            <span className="text-xl font-bold text-gray-800">
              {formatNumber(totalCost)} MILK
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Your Balance:</span>
            <span className={canAfford ? 'text-xl font-bold text-success-600' : 'text-xl font-bold text-error-600'}>
              {formatNumber(userStats?.milkBalance || 0)} MILK
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

        {/* Buy Button */}
        <button
          onClick={handleBuyCows}
          disabled={!canAfford || loading || numCows < 1}
          className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
            canAfford && !loading
              ? 'bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
              Buy {numCows} Cow{numCows !== 1 ? 's' : ''} for {formatNumber(totalCost)} MILK
            </>
          )}
        </button>

        {/* Insufficient Funds Warning */}
        {!canAfford && totalCost > 0 && (
          <div className="text-center">
            <p className="text-error-600 font-medium">
              You need {formatNumber(totalCost - (userStats?.milkBalance || 0))} more MILK tokens
            </p>
          </div>
        )}
      </div>
    </div>
  );
};