import React, { useState } from 'react';
import { ChevronDown} from 'lucide-react';
import { useNetwork } from '../hooks/useNetwork';
import type { NetworkType } from '../constants/solana';
import { isMainnetConfigured, isMainnetMilkConfigured } from '../constants/solana';

export const NetworkSwitcher: React.FC = () => {
  const { currentNetwork, switchNetwork, availableNetworks } = useNetwork();
  const [isOpen, setIsOpen] = useState(false);


  // Build networks list with mainnet first if available
  const networks = availableNetworks
    .sort((a, b) => {
      // Mainnet first, then devnet
      if (a === 'mainnet') return -1;
      if (b === 'mainnet') return 1;
      return 0;
    })
    .map(networkKey => {
      if (networkKey === 'mainnet') {
        return { key: 'mainnet' as NetworkType, name: 'Mainnet', color: 'bg-green-500' };
      } else {
        return { key: 'devnet' as NetworkType, name: 'Devnet', color: 'bg-yellow-500' };
      }
    });

  const currentNetworkInfo = networks.find(n => n.key === currentNetwork);

  const handleNetworkChange = (network: NetworkType) => {
    if (!availableNetworks.includes(network)) {
      console.warn(`Network ${network} is not available`);
      return;
    }
    switchNetwork(network);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Network Switcher Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={!isMainnetConfigured() || !isMainnetMilkConfigured()}
          className={`flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 border border-white/20 transition-all duration-200 min-w-[100px] ${
            (isMainnetConfigured() && isMainnetMilkConfigured()) ? 'hover:bg-white/20 cursor-pointer' : 'opacity-75 cursor-not-allowed'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${currentNetworkInfo?.color}`} />
          <span className="text-white font-medium text-sm">{currentNetworkInfo?.name}</span>
          {isMainnetConfigured() && isMainnetMilkConfigured() && (
            <ChevronDown 
              size={16} 
              className={`text-white/70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            />
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && isMainnetConfigured() && isMainnetMilkConfigured() && (
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

    
    </div>
  );
};