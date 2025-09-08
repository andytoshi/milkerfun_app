import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGameData } from '../hooks/useGameData';
import { useSolanaTransactions } from '../hooks/useSolanaTransactions';
import { Download, Milk, AlertTriangle, ExternalLink, Clock, Shield } from 'lucide-react';
import { formatNumber, formatTime } from '../utils/format';
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

  // Calculate withdrawal penalty status
  const getWithdrawalStatus = () => {
    if (!userStats || !userStats.lastWithdrawTime) {
      return { 
        isPenaltyFree: true, 
        timeRemaining: 0, 
        penaltyAmount: 0,
        withdrawableAmount: totalRewards,
        message: 'First withdrawal will be penalty-free' 
      };
    }
    
    const currentTime = Date.now();
    const lastWithdrawTime = userStats.lastWithdrawTime * 1000;
    const hoursSinceLastWithdraw = (currentTime - lastWithdrawTime) / (1000 * 60 * 60);
    const isPenaltyFree = hoursSinceLastWithdraw >= 24;
    const timeRemaining = isPenaltyFree ? 0 : (24 - hoursSinceLastWithdraw) * 3600;
    
    const penaltyAmount = isPenaltyFree ? 0 : totalRewards * 0.5;
    const withdrawableAmount = isPenaltyFree ? totalRewards : totalRewards * 0.5;
    
    return {
      isPenaltyFree,
      timeRemaining,
      penaltyAmount,
      withdrawableAmount,
      message: isPenaltyFree 
        ? 'Next withdrawal will be penalty-free' 
        : `50% penalty for ${formatTime(timeRemaining)}`
    };
  };

  const withdrawalStatus = getWithdrawalStatus();

  const handleWithdraw = async () => {
    if (!publicKey || totalRewards <= 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const signature = await withdrawMilk();
      console.log('Successfully withdrew MILK! Transaction:', signature);
      
      const newWithdrawal = {
        timestamp: Date.now(),
        amount: withdrawalStatus.withdrawableAmount,
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
      
      let errorMessage = 'Failed to withdraw MILK. ';
      if (err instanceof Error) {
        errorMessage += err.message;
      }
      
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes('insufficient funds')) {
        errorMessage = 'Insufficient SOL for transaction fees. Add more SOL to your wallet.';
      } else if (errorMsg.includes('NoRewardsAvailable')) {
        errorMessage = 'No rewards available to withdraw. Wait for rewards to accumulate.';
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
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Download className="text-white" size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-4">💰 Withdraw MILK</h3>
          <p className="text-white/70">Connect your wallet to withdraw rewards!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Download className="text-white" size={24} />
        </div>
        <h3 className="text-xl font-bold text-white">💰 Withdraw MILK</h3>
      </div>
      
      {/* Rewards Display */}
      <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20 backdrop-blur-sm transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Milk className="text-blue-400" size={24} />
            <span className="text-white/80 font-semibold">Available:</span>
          </div>
          <span className="text-xl font-bold text-green-400 transition-all duration-300">
            {formatNumber(totalRewards)} MILK
          </span>
        </div>
        
        {/* Withdrawal Status */}
        <div className="flex items-center justify-between">
          <span className="text-white/70 text-sm">Withdrawal Status:</span>
          <span className={`text-sm font-bold ${withdrawalStatus.isPenaltyFree ? 'text-green-400' : 'text-red-400'}`}>
            {withdrawalStatus.isPenaltyFree ? '✅ Penalty-free' : '⚠️ 50% penalty'}
          </span>
        </div>
      </div>

      {totalRewards > 0 ? (
        <div className="space-y-6">
          {/* Withdrawal Details */}
          <div className="bg-white/10 rounded-xl p-4 space-y-3 border border-white/20 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium text-white/80">You'll Receive:</span>
              <span className="text-lg font-bold text-green-400">
                {formatNumber(withdrawalStatus.withdrawableAmount)} $MILK
              </span>
            </div>
            {!withdrawalStatus.isPenaltyFree && (
              <>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white/80">Penalty:</span>
                  <span className="text-lg font-bold text-red-400">
                    {formatNumber(withdrawalStatus.penaltyAmount)} MILK
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white/80">Time to penalty-free:</span>
                  <span className="text-lg font-bold text-white">
                    {formatTime(withdrawalStatus.timeRemaining)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Anti-Dump Warning */}
          {!withdrawalStatus.isPenaltyFree && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <Shield className="text-red-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="text-red-400 font-bold mb-2">Anti-Dump Protection Active</h4>
                  <p className="text-red-300 text-sm leading-relaxed">
                    Withdrawing now will incur a 50% penalty. The penalty tokens remain in the pool, 
                    increasing TVL and benefiting all players. Wait {formatTime(withdrawalStatus.timeRemaining)} for penalty-free withdrawal.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-red-400 flex-shrink-0" size={20} />
                <p className="text-red-300 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Withdraw Button */}
          <button
            onClick={handleWithdraw}
            disabled={loading || totalRewards <= 0}
            className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
              !loading && totalRewards > 0
                ? withdrawalStatus.isPenaltyFree
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
                : 'bg-white/10 text-white/50 cursor-not-allowed backdrop-blur-sm border border-white/20'
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
                {withdrawalStatus.isPenaltyFree 
                  ? `Withdraw ${formatNumber(totalRewards)} MILK`
                  : `Withdraw ${formatNumber(withdrawalStatus.withdrawableAmount)} MILK (50% penalty)`
                }
              </>
            )}
          </button>

          {/* Withdrawal Strategy Tip */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-lg">💡</span>
              Strategy Tip
            </h4>
            <p className="text-white/70 text-sm leading-relaxed">
              {withdrawalStatus.isPenaltyFree 
                ? "Perfect timing! You can withdraw without any penalty. Consider your strategy: withdraw for immediate liquidity or compound for exponential growth."
                : "Consider waiting for penalty-free withdrawal or compound your rewards instead to maximize long-term gains."
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
            <Milk className="text-white/60" size={32} />
          </div>
          <h4 className="text-lg font-bold text-white mb-3">No Rewards Yet</h4>
          <p className="text-white/70 mb-2">No rewards available to withdraw yet.</p>
          <p className="text-white/60 text-sm">Your cows need time to produce MILK!</p>
        </div>
      )}

      {/* Withdrawal History */}
      {withdrawalHistory.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/20">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock size={20} />
            📜 Recent Withdrawals
          </h4>
          <div className="space-y-3">
            {withdrawalHistory.slice(0, 3).map((withdrawal, index) => (
              <div key={index} className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                <div>
                  <div className="font-bold text-white">
                    {formatNumber(withdrawal.amount)} MILK
                  </div>
                  <div className="text-sm text-white/60">
                    {new Date(withdrawal.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <a
                  href={`${networkConfig.explorerUrl}/tx/${withdrawal.signature}?cluster=${currentNetwork}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 p-2 rounded-lg hover:bg-white/10 transition-colors"
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