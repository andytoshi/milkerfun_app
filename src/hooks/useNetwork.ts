import { useState, useCallback, useEffect } from 'react';
import { NETWORKS } from '../constants/solana';
import type { NetworkType } from '../constants/solana';

export const useNetwork = () => {
  const [currentNetwork, setCurrentNetwork] = useState<NetworkType>(() => {
    // Try to get saved network from localStorage
    const saved = localStorage.getItem('milkerfun-network');
    return (saved as NetworkType) || 'devnet';
  });

  const switchNetwork = useCallback((network: NetworkType) => {
    setCurrentNetwork(network);
    localStorage.setItem('milkerfun-network', network);
    
    // Force a page reload to ensure all components use the new network
    // This ensures all connections, PDAs, and data are refreshed
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }, []);

  const networkConfig = NETWORKS[currentNetwork];

  // Save network preference whenever it changes
  useEffect(() => {
    localStorage.setItem('milkerfun-network', currentNetwork);
  }, [currentNetwork]);

  return {
    currentNetwork,
    networkConfig,
    switchNetwork,
    isMainnet: currentNetwork === 'mainnet',
    isDevnet: currentNetwork === 'devnet',
  };
};