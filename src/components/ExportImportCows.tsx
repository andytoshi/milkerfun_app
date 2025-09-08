import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGameData } from '../hooks/useGameData';
import { useSolanaTransactions } from '../hooks/useSolanaTransactions';
import { ArrowUpRight, ArrowDownLeft, AlertTriangle, Plus, Minus, HelpCircle, ExternalLink } from 'lucide-react';
import { formatNumber } from '../utils/format';
import { useNetwork } from '../hooks/useNetwork';

export const ExportImportCows: React.FC = () => {
  const { publicKey } = useWallet();
  const { networkConfig, currentNetwork } = useNetwork();
  const { userStats } = useGameData(publicKey?.toString(), true);
  const { exportCows, importCows } = useSolanaTransactions();
  
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [numCows, setNumCows] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userCows = userStats?.cows || 0;
  const cowBalance = userStats?.cowBalance || 0;
  
  const maxExportableCows = userCows;
  const maxImportableCows = Math.floor(cowBalance);
  
  const canExport = activeTab === 'export' && userCows >= numCows && numCows > 0;
  const canImport = activeTab === 'import' && cowBalance >= numCows && numCows > 0;

  const handleExport = async () => {
    if (!publicKey || !canExport) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const signature = await exportCows(numCows);
      console.log('Successfully exported cows! Transaction:', signature);
      
      // Wait 3 seconds for blockchain state to update, then refresh data
      setTimeout(async () => {
        console.log('🔄 Refreshing data after successful export...');
        window.location.reload();
      }, 3000);
      setNumCows(1);
    } catch (err) {
      console.error('Error exporting cows:', err);
      
      let errorMessage = 'Failed to export cows. ';
      if (err instanceof Error) {
        errorMessage += err.message;
      }
      
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes('insufficient funds')) {
        errorMessage = 'Insufficient SOL for transaction fees. Add more SOL to your wallet.';
      } else if (errorMsg.includes('InsufficientCows')) {
        errorMessage = 'Insufficient cows to export. You need more cows in your farm.';
      } else if (errorMsg.includes('User rejected')) {
        errorMessage = 'Transaction was cancelled by user.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!publicKey || !canImport) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const signature = await importCows(numCows);
      console.log('Successfully imported cows! Transaction:', signature);
      
      // Wait 3 seconds for blockchain state to update, then refresh data
      setTimeout(async () => {
        console.log('🔄 Refreshing data after successful import...');
        window.location.reload();
      }, 3000);
      setNumCows(1);
    } catch (err) {
      console.error('Error importing cows:', err);
      
      let errorMessage = 'Failed to import cows. ';
      if (err instanceof Error) {
        errorMessage += err.message;
      }
      
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes('insufficient funds')) {
        errorMessage = 'Insufficient SOL for transaction fees. Add more SOL to your wallet.';
      } else if (errorMsg.includes('TokenInsufficientFunds')) {
        errorMessage = 'Insufficient COW tokens. You need more COW tokens to import.';
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
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ArrowUpRight className="text-white" size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-4">🔄 Export/Import Cows</h3>
          <p className="text-white/70">Connect your wallet to trade cows!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <ArrowUpRight className="text-white" size={24} />
        </div>
        <h3 className="text-xl font-bold text-white">🔄 Export/Import Cows</h3>
        <div className="ml-auto">
          <div className="group/tooltip relative">
            <button className="text-white/60 hover:text-white/80 transition-colors">
              <HelpCircle size={20} />
            </button>
            <div className="absolute right-0 top-8 w-64 bg-black/90 text-white text-sm rounded-xl p-3 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 pointer-events-none z-10 backdrop-blur-sm border border-white/20">
              Export cows to tradeable COW tokens or import COW tokens back to farming cows. Perfect for trading on DEXs!
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-white/10 rounded-xl p-1 mb-6 backdrop-blur-sm border border-white/20">
        <button
          onClick={() => {
            setActiveTab('export');
            setNumCows(1);
            setError(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
            activeTab === 'export'
              ? 'bg-white/20 text-white shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <ArrowUpRight size={20} />
          Export to $COW
        </button>
        <button
          onClick={() => {
            setActiveTab('import');
            setNumCows(1);
            setError(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
            activeTab === 'import'
              ? 'bg-white/20 text-white shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <ArrowDownLeft size={20} />
          Import from $COW
        </button>
      </div>
      
      {/* Balance Display */}
      <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20 backdrop-blur-sm transition-all duration-300">
        {activeTab === 'export' ? (
          <div className="flex justify-between items-center mb-3">
            <span className="text-white/80 font-semibold">🐄 Farm Cows:</span>
            <span className="text-2xl font-bold text-purple-400 transition-all duration-300">
              {formatNumber(userCows)}
            </span>
          </div>
        ) : (
          <div className="flex justify-between items-center mb-3">
            <span className="text-white/80 font-semibold">🐮 $COW Tokens:</span>
            <span className="text-2xl font-bold text-orange-400 transition-all duration-300">
              {formatNumber(cowBalance)}
            </span>
          </div>
        )}
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/70">
            Max {activeTab === 'export' ? 'Exportable' : 'Importable'}:
          </span>
          <span className="font-bold text-white transition-all duration-300">
            {formatNumber(activeTab === 'export' ? maxExportableCows : maxImportableCows)}
          </span>
        </div>
      </div>

      {(activeTab === 'export' && userCows > 0) || (activeTab === 'import' && cowBalance > 0) ? (
        <div className="space-y-6">
          {/* Cow Input */}
          <div>
            <label htmlFor="cowAmount" className="block text-sm font-semibold text-white/90 mb-3">
              Number of {activeTab === 'export' ? 'Cows to Export' : '$COW Tokens to Import'}:
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
                id="cowAmount"
                type="number"
                min="1"
                max={activeTab === 'export' ? maxExportableCows : maxImportableCows}
                value={numCows}
                onChange={(e) => {
                  const maxValue = activeTab === 'export' ? maxExportableCows : maxImportableCows;
                  const value = Math.max(1, Math.min(maxValue, parseInt(e.target.value) || 1));
                  setNumCows(value);
                }}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 text-center font-bold text-lg backdrop-blur-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
              />
              <button 
                onClick={() => {
                  const maxValue = activeTab === 'export' ? maxExportableCows : maxImportableCows;
                  setNumCows(Math.min(maxValue, numCows + 1));
                }}
                disabled={numCows >= (activeTab === 'export' ? maxExportableCows : maxImportableCows)}
                className="w-12 h-12 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:text-white/30 text-white rounded-xl font-bold transition-all duration-300 flex items-center justify-center backdrop-blur-sm border border-white/20"
              >
                <Plus size={20} />
              </button>
            </div>
            <button
              onClick={() => {
                const maxValue = activeTab === 'export' ? maxExportableCows : maxImportableCows;
                setNumCows(maxValue);
              }}
              disabled={activeTab === 'export' ? maxExportableCows === 0 : maxImportableCows === 0}
              className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:text-white/30 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 text-sm backdrop-blur-sm border border-white/20"
            >
              MAX ({formatNumber(activeTab === 'export' ? maxExportableCows : maxImportableCows)})
            </button>
          </div>

          {/* Transaction Summary */}
          <div className="bg-white/10 rounded-xl p-4 space-y-3 border border-white/20 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium text-white/80">
                {activeTab === 'export' ? 'Cows to Export:' : '$COW Tokens to Import:'}
              </span>
              <span className="text-lg font-bold text-white">
                {formatNumber(numCows)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-white/80">
                {activeTab === 'export' ? '$COW Tokens Received:' : 'Cows Added to Farm:'}
              </span>
              <span className="text-lg font-bold text-green-400">
                {formatNumber(numCows)}
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

          {/* Action Button */}
          <button
            onClick={activeTab === 'export' ? handleExport : handleImport}
            disabled={loading || !(activeTab === 'export' ? canExport : canImport)}
            className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
              !loading && (activeTab === 'export' ? canExport : canImport)
                ? activeTab === 'export'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
                : 'bg-white/10 text-white/50 cursor-not-allowed backdrop-blur-sm border border-white/20'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {activeTab === 'export' ? 'Exporting...' : 'Importing...'}
              </>
            ) : (
              <>
                {activeTab === 'export' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                {activeTab === 'export' 
                  ? `Export ${numCows} Cow${numCows !== 1 ? 's' : ''}`
                  : `Import ${numCows} $COW Token${numCows !== 1 ? 's' : ''}`
                }
              </>
            )}
          </button>

          {/* Information Box */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-lg">{activeTab === 'export' ? '📤' : '📥'}</span>
              {activeTab === 'export' ? 'Export Benefits' : 'Import Benefits'}
            </h4>
            <ul className="space-y-2 text-white/70 text-sm">
              {activeTab === 'export' ? (
                <>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-400">•</span>
                    <span>Convert farm cows to tradeable $COW tokens</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-400">•</span>
                    <span>Trade $COW tokens on DEXs and marketplaces</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-400">•</span>
                    <span>Keep accumulated MILK rewards in your farm</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">•</span>
                    <span>Convert $COW tokens back to productive farm cows</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">•</span>
                    <span>Start earning MILK rewards immediately</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">•</span>
                    <span>Increase your daily earning potential</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* COW Token Info */}
          <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-xl p-4 border border-orange-400/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🐮</span>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-orange-400 mb-3">
                  $COW Token Information
                </h4>
                <div className="space-y-2 text-white/80 text-sm">
                  <div className="flex justify-between">
                    <span>Token Symbol:</span>
                    <span className="font-bold text-orange-400">COW</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Decimals:</span>
                    <span className="font-bold text-white">6</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversion Rate:</span>
                    <span className="font-bold text-white">1 Cow = 1 $COW</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Contract Address:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-orange-400">
                        {networkConfig.cowMint.toString().slice(0, 8)}...
                      </span>
                      <a
                        href={`${networkConfig.explorerUrl}/address/${networkConfig.cowMint.toString()}?cluster=${currentNetwork}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-400 hover:text-orange-300 transition-colors"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
            <span className="text-4xl">{activeTab === 'export' ? '🐄' : '🪙'}</span>
          </div>
          <h4 className="text-lg font-bold text-white mb-3">
            {activeTab === 'export' ? 'No Cows to Export' : 'No COW Tokens to Import'}
          </h4>
          <p className="text-white/70 mb-2">
            {activeTab === 'export' 
              ? 'You need cows in your farm to export them as COW tokens.'
              : 'You need COW tokens to import them back to your farm.'
            }
          </p>
          <p className="text-white/60 text-sm">
            {activeTab === 'export' 
              ? 'Buy some cows first to start exporting!'
              : 'Acquire COW tokens from DEXs or other players!'
            }
          </p>
        </div>
      )}
    </div>
  );
};