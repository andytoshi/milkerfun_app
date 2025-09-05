import { useState, useCallback, useEffect } from 'react';
import { NETWORKS, getDefaultNetwork, getAvailableNetworks } from '../constants/solana';
import type { NetworkType } from '../constants/solana';

export const useNetwork = () => {
  const [currentNetwork, setCurrentNetwork] = useState<NetworkType>(() => {
    // Try to get saved network from localStorage
    const saved = localStorage.getItem('milkerfun-network');
    const savedNetwork = saved as NetworkType;
    
    // Check if saved network is available
    const availableNetworks = getAvailableNetworks();
    if (savedNetwork && availableNetworks.includes(savedNetwork)) {
      return savedNetwork;
    }
    
    // Return default network based on configuration
    return getDefaultNetwork();
  });

  const switchNetwork = useCallback((network: NetworkType) => {
    // Only allow switching to available networks
    const availableNetworks = getAvailableNetworks();
    if (!availableNetworks.includes(network)) {
      console.warn(`Network ${network} is not available`);
      return;
    }
    
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
    availableNetworks: getAvailableNetworks(),
    switchNetwork,
    isMainnet: currentNetwork === 'mainnet',
    isDevnet: currentNetwork === 'devnet',
  };
};