import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, Clock, ExternalLink, Twitter } from 'lucide-react';
import { isMainnetConfigured, isMainnetMilkConfigured, SOCIAL_LINKS } from '../constants/solana';

interface ConfigStep {
  id: string;
  label: string;
  status: 'pending' | 'in-progress' | 'completed';
  description: string;
}

export const MainnetConfigPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [steps] = useState<ConfigStep[]>([
    {
      id: 'token-launch',
      label: 'Launching mainnet token MILK on pump.fun..',
      status: 'in-progress',
      description: 'Creating MILK token with proper metadata and initial liquidity'
    },
      {
      id: 'config-init',
      label: 'Initializing mainnet protocol config..',
      status: 'pending',
      description: 'Deploying configuration with mainnet parameters'
    }
  ]);

  useEffect(() => {
    // Show popup if mainnet program is configured but MILK token is not
    const shouldShowPopup = isMainnetConfigured() && !isMainnetMilkConfigured();
    
    if (shouldShowPopup) {
      setIsVisible(true);
    }
  }, []);

  // Keep first step in progress until mainnet MILK is configured
  // No auto-progression - stays on "Launching mainnet token MILK on pump.fun.." 
  // until you actually update the NETWORKS.mainnet configuration

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleFollowCommunity = () => {
    window.open(SOCIAL_LINKS.twitter, '_blank', 'noopener,noreferrer');
  };

  if (!isVisible) {
    return null;
  }

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Popup */}
        <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-hidden animate-in fade-in zoom-in duration-300 border border-gray-700 relative">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 text-white relative">
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/20"
            >
              <X size={24} />
            </button>
            
            <div className="flex items-center gap-3 mb-4 pr-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Mainnet Configuration</h3>
                <div className="flex items-center gap-2 text-purple-100">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm">in progress</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-right text-sm text-purple-100">
              <span className="text-xs sm:text-sm">{completedSteps}/{steps.length} steps completed</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 bg-gray-900 text-white max-h-[calc(95vh-140px)] overflow-y-auto">
            <div className="mb-4 sm:mb-6">
              <p className="text-gray-300 mb-4 leading-relaxed">
                🚀 We're currently configuring the MilkerFun protocol on Solana Mainnet. 
                This process involves deploying the MILK token and setting up all protocol infrastructure.
              </p>
            </div>

            {/* Configuration Steps */}
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              {steps.map((step) => (
                <div key={step.id} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {step.status === 'completed' ? (
                      <CheckCircle className="text-green-400" size={20} />
                    ) : step.status === 'in-progress' ? (
                      <Loader2 className="text-yellow-400 animate-spin" size={20} />
                    ) : (
                      <Clock className="text-gray-500" size={20} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`font-mono text-sm mb-1 ${
                      step.status === 'completed' ? 'text-green-400' :
                      step.status === 'in-progress' ? 'text-yellow-400' : 
                      'text-gray-500'
                    }`}>
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-400 leading-relaxed">
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Technical Info */}
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-purple-500/30">
              <h4 className="font-semibold text-purple-400 mb-3 flex items-center gap-2">
                <span className="text-base sm:text-lg">⚙️</span>
                <span className="text-sm sm:text-base">Technical Details</span>
              </h4>
              <div className="space-y-2 text-xs text-gray-300 font-mono">
                <div className="flex justify-between">
                  <span>Network:</span>
                  <span className="text-green-400">Solana Mainnet</span>
                </div>
                <div className="flex justify-between">
                  <span>Program Status:</span>
                  <span className="text-green-400">✅ Deployed</span>
                </div>
                <div className="flex justify-between">
                  <span>Token Status:</span>
                  <span className="text-yellow-400">🔄 Configuring</span>
                </div>
                <div className="flex justify-between">
                  <span>Protocol:</span>
                  <span className="text-blue-400">MilkerFun v1.0</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <button
                onClick={handleFollowCommunity}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Twitter size={18} />
                Follow for Latest Updates
                <ExternalLink size={16} />
              </button>
              
              <button
                onClick={handleClose}
                className="w-full px-4 py-3 text-gray-400 hover:text-white font-medium transition-colors rounded-xl hover:bg-gray-800 border border-gray-700"
              >
                Continue on Devnet
              </button>
            </div>

            <div className="mt-3 sm:mt-4 text-center">
              <p className="text-xs text-gray-500">
                Mainnet will be available once configuration is complete
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};