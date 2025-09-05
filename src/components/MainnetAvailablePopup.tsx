import React, { useState, useEffect } from 'react';
import { X, Zap } from 'lucide-react';
import { useNetwork } from '../hooks/useNetwork';
import { isMainnetConfigured, isMainnetMilkConfigured } from '../constants/solana';

export const MainnetAvailablePopup: React.FC = () => {
  const { currentNetwork, switchNetwork } = useNetwork();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show popup if:
    // 1. Mainnet is configured and available
    // 2. User has devnet saved in localStorage (indicating preference for devnet)
    // 3. This is a fresh page load
    const savedNetwork = localStorage.getItem('milkerfun-network');
    const shouldShowPopup = isMainnetConfigured() && isMainnetMilkConfigured() && savedNetwork === 'devnet';
    
    if (shouldShowPopup) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentNetwork]); // Keep currentNetwork as dependency for reactivity

  const handleSwitchToMainnet = () => {
    switchNetwork('mainnet');
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Popup */}
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300 relative">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 sm:p-6 text-white relative">
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/20"
            >
              <X size={24} />
            </button>
            
            <div className="flex items-center gap-3 mb-2 pr-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Mainnet is LIVE!</h3>
                <div className="flex items-center gap-2 text-green-100">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  <span className="text-sm">online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            <p className="text-gray-700 mb-6 leading-relaxed">
              🎉 Great news! Milker.Fun is now live on Solana Mainnet. 
              Switch to mainnet to access the full protocol with real MILK tokens and live trading.
            </p>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-6 border border-green-200">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-base sm:text-lg">🚀</span>
                Mainnet Benefits
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">•</span>
                  <span>Real MILK token trading</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">•</span>
                  <span>Access to pump.fun integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">•</span>
                  <span>Full protocol functionality</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">•</span>
                  <span>Real rewards and earnings</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSwitchToMainnet}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Zap size={18} />
                Switch to Mainnet
              </button>
              
              <button
                onClick={handleClose}
                className="px-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-xl hover:bg-gray-100 sm:w-auto"
              >
                Stay on Devnet
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                You can always switch networks later using the network selector
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};