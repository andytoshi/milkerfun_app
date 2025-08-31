import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGameData } from '../hooks/useGameData';
import { useSolanaTransactions } from '../hooks/useSolanaTransactions';
import { Download, Milk, AlertTriangle, ExternalLink, Clock } from 'lucide-react';
import { formatNumber } from '../utils/format';
import { useNetwork } from '../hooks/useNetwork';

export const WithdrawMilk: React.FC = () => {
  const { publicKey } = useWallet();
  const { networkConfig, currentNetwork } = useNetwork();
  const { userStats } = useGameData(publicKey?.toString(), true);
  const { withdrawMilk } = useSolanaTransactions();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [withdrawalHistory, setWithdrawalHistory] = useState<Array<{
    timestamp: number;
    amount: number;
    signature: string;
  }>>([]);

  const totalRewards = userStats?.totalRewards || 0;

  const handleWithdraw = async () => {
    if (!publicKey || totalRewards <= 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const signature = await withdrawMilk();
      console.log('Successfully withdrew MILK! Transaction:', signature);
      
      const newWithdrawal = {
        timestamp: Date.now(),
        amount: totalRewards,
        signature,
      };
      setWithdrawalHistory(prev => [newWithdrawal, ...prev]);
      
      // Wait 3 seconds for blockchain state to update, then refresh data
      setTimeout(async () => {
        console.log('🔄 Refreshing data after successful withdrawal...');
        // Force page reload if state doesn't update properly
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.error('Error withdrawing MILK:', err);
      setError('Failed to withdraw MILK. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="card p-6 lg:p-8">
        <div className="card-header">
          <Download className="text-purple-600" size={32} />
          <h3 className="text-xl font-bold text-gray-800">💰 Withdraw MILK</h3>
        </div>
        <p className="text-gray-600">Connect your wallet to withdraw rewards!</p>
      </div>
    );
  }

  return (
    <div className="card p-6 lg:p-8">
      <div className="card-header">
        <Download className="text-purple-600" size={32} />
        <h3 className="text-xl font-bold text-gray-800">💰 Withdraw MILK</h3>
      </div>
      
      {/* Rewards Display */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 mb-6 border border-blue-200 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Milk className="text-blue-600" size={24} />
            <span className="text-blue-700 font-semibold">Available Rewards:</span>
          </div>
          <span className="text-2xl font-bold text-success-600 transition-all duration-300">
            {formatNumber(totalRewards)} MILK
          </span>
        </div>
      </div>

      {totalRewards > 0 ? (
        <div className="space-y-6">
          {/* Withdraw Info */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-blue-700 leading-relaxed">
              Withdraw all your accumulated MILK rewards to your wallet. 
              After withdrawal, your reward counter will reset to 0.
            </p>
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

          {/* Withdraw Button */}
          <button
            onClick={handleWithdraw}
            disabled={loading || totalRewards <= 0}
            className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
              !loading && totalRewards > 0
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Withdrawing...
              </>
            ) : (
              <>
                <Download size={24} />
                Withdraw {formatNumber(totalRewards)} MILK
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="text-center py-8">
          <Milk className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-600 mb-2 font-medium">No rewards available to withdraw yet.</p>
          <p className="text-gray-500">Your cows need time to produce MILK!</p>
        </div>
      )}

      {/* Withdrawal History */}
      {withdrawalHistory.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={20} />
            📜 Withdrawal History
          </h4>
          <div className="space-y-3">
            {withdrawalHistory.slice(0, 5).map((withdrawal, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                <div>
                  <div className="font-bold text-gray-800">
                    {formatNumber(withdrawal.amount)} MILK
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(withdrawal.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <a
                  href={`${networkConfig.explorerUrl}/tx/${withdrawal.signature}?cluster=${currentNetwork}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};