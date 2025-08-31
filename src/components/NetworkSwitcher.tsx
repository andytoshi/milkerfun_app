import React, { useState } from 'react';
import { ChevronDown, AlertTriangle, ExternalLink } from 'lucide-react';
import { useNetwork } from '../hooks/useNetwork';
import type { NetworkType } from '../constants/solana';

export const NetworkSwitcher: React.FC = () => {
  const { currentNetwork, switchNetwork } = useNetwork();
  const [isOpen, setIsOpen] = useState(false);
  const [showWalletWarning, setShowWalletWarning] = useState(false);

  const networks = [
    { key: 'devnet' as NetworkType, name: 'Devnet', color: 'bg-yellow-500' }
    // { key: 'mainnet' as NetworkType, name: 'Mainnet', color: 'bg-green-500' }
  ];

  const currentNetworkInfo = networks.find(n => n.key === currentNetwork);

  const handleNetworkChange = (network: NetworkType) => {
    switchNetwork(network);
    setIsOpen(false);
    setShowWalletWarning(true);
    
    // Auto-hide warning after 5 seconds
    setTimeout(() => setShowWalletWarning(false), 5000);
  };

  return (
    <div className="relative">
      {/* Network Switcher Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 border border-white/20 hover:bg-white/20 transition-all duration-200 min-w-[100px]"
        >
          <div className={`w-2 h-2 rounded-full ${currentNetworkInfo?.color}`} />
          <span className="text-white font-medium text-sm">{currentNetworkInfo?.name}</span>
          <ChevronDown 
            size={16} 
            className={`text-white/70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Content */}
            <div className="absolute top-full left-0 mt-2 w-full min-w-[140px] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-20">
              {networks.map((network) => (
                <button
                  key={network.key}
                  onClick={() => handleNetworkChange(network.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    currentNetwork === network.key ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${network.color}`} />
                  <span className="font-medium">{network.name}</span>
                  {currentNetwork === network.key && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Wallet Network Warning */}
      {showWalletWarning && (
        <div className="absolute top-full left-0 mt-2 w-80 max-w-[90vw] bg-white rounded-xl shadow-xl border border-orange-200 p-4 z-30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-orange-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Switch Wallet Network</h4>
              <p className="text-sm text-gray-600 mb-3">
                Please switch your wallet to <strong>{currentNetworkInfo?.name}</strong> to interact with the game.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowWalletWarning(false)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg transition-colors"
                >
                  Got it
                </button>
                <a
                  href="https://docs.solana.com/wallet-guide/web-wallets#changing-networks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                >
                  <ExternalLink size={12} />
                  Help
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};