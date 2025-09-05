import React from 'react';
import { Link } from 'react-router-dom';
import { useNetwork } from '../hooks/useNetwork';
import { SOCIAL_LINKS, isMainnetConfigured, NETWORKS } from '../constants/solana';
import { ExternalLink, Github, Twitter, TrendingUp, Shield, Zap, Copy } from 'lucide-react';

export const Hero: React.FC = () => {
  const { networkConfig, currentNetwork } = useNetwork();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Get mainnet MILK mint address for pump.fun link
  const mainnetMilkMint = NETWORKS.mainnet.milkMint.toString();
  const pumpFunLink = `https://pump.fun/coin/${mainnetMilkMint}`;

  // Show Trade MILK button only on mainnet
  const showTradeMilkButton = currentNetwork === 'mainnet' && isMainnetConfigured();
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/12 text-6xl opacity-10 animate-float">🐄</div>
        <div className="absolute top-3/5 right-1/6 text-5xl opacity-10 animate-float" style={{ animationDelay: '2s' }}>🥛</div>
        <div className="absolute bottom-1/3 left-1/5 text-6xl opacity-10 animate-float" style={{ animationDelay: '4s' }}>🐄</div>
        <div className="absolute top-2/5 right-1/4 text-5xl opacity-10 animate-float" style={{ animationDelay: '1s' }}>🥛</div>
        <div className="absolute bottom-1/5 right-1/12 text-5xl opacity-10 animate-float" style={{ animationDelay: '3s' }}>🥛</div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Hero Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-6 text-shadow-lg">
            <span className="inline-block animate-bounce-slow mr-4">🐄</span>
            Milker.Fun
            <span className="inline-block animate-bounce-slow ml-4">🥛</span>
          </h1>
          <p className="text-xl sm:text-2xl lg:text-3xl text-white/90 max-w-4xl mx-auto leading-relaxed text-shadow">
            We reimagined DeFi on Solana. Every crash = more cash.
            <br className="hidden sm:block" />
            Revolutionary yield farming protocol.
          </p>
        </div>
        
        {/* Features */}
        <div className="flex flex-wrap justify-center gap-4 lg:gap-6 mb-12 lg:mb-16">
          <div className="glass-card px-6 py-4 flex items-center gap-3">
            <Shield className="text-red-400 flex-shrink-0" size={24} />
            <span className="text-white font-semibold">Anti-Dump Protocol</span>
          </div>
          <div className="glass-card px-6 py-4 flex items-center gap-3">
            <Zap className="text-yellow-400 flex-shrink-0" size={24} />
            <span className="text-white font-semibold">Dynamic Economics</span>
          </div>
          <div className="glass-card px-6 py-4 flex items-center gap-3">
            <TrendingUp className="text-yellow-400 flex-shrink-0" size={24} />
            <span className="text-white font-semibold">Sustainable Yields</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 lg:gap-6 mb-16 lg:mb-20">
          <a 
            href={SOCIAL_LINKS.twitter} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-2"
          >
            <Twitter size={20} />
            Community
          </a>
          <a 
            href={SOCIAL_LINKS.github} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-2"
          >
            <Github size={20} />
            Open Source
          </a>
          {showTradeMilkButton && (
            <a 
              href={pumpFunLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-success flex items-center gap-2"
            >
              <TrendingUp size={20} />
              Trade MILK
            </a>
          )}
          <Link 
            to="/farming-hub"
            className="btn-warning flex items-center gap-2 text-lg px-8 py-4"
          >
            <span>🚜</span>
            Start Farming
          </Link>
        </div>

        {/* Technical Information */}
        <div className="max-w-6xl mx-auto">
          <div className="glass-card p-6 lg:p-8">
            <h3 className="text-2xl lg:text-3xl font-bold text-white text-center mb-6">
              🔧 Technical Information
            </h3>
            <p className="text-white/90 text-lg leading-relaxed mb-8 text-center max-w-4xl mx-auto">
              MilkerFun is a revolutionary DeFi protocol implementing advanced mathematical models for sustainable tokenomics. 
              While the interface shows a fun cow farming game, the underlying system features dynamic bonding curves, 
              TVL-responsive rewards, and innovative anti-dump mechanisms that solve real problems in decentralized finance.
            </p>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contract Addresses */}
              <div className="lg:col-span-1">
                <h4 className="text-xl font-bold text-yellow-400 mb-4">📋 Contract Addresses ({networkConfig.name})</h4>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <span className="block text-white/80 font-semibold mb-2">Program ID:</span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <code className="bg-black/30 text-yellow-400 px-3 py-2 rounded-lg text-sm font-mono break-all flex-1">
                        {networkConfig.programId.toString()}
                      </code>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => copyToClipboard(networkConfig.programId.toString())}
                          className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
                        >
                          <Copy size={16} />
                        </button>
                        <a 
                          href={`${networkConfig.explorerUrl}/address/${networkConfig.programId.toString()}?cluster=${networkConfig.name.toLowerCase()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <span className="block text-white/80 font-semibold mb-2">MILK Token:</span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <code className="bg-black/30 text-yellow-400 px-3 py-2 rounded-lg text-sm font-mono break-all flex-1">
                        {networkConfig.milkMint.toString()}
                      </code>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => copyToClipboard(networkConfig.milkMint.toString())}
                          className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
                        >
                          <Copy size={16} />
                        </button>
                        <a 
                          href={`${networkConfig.explorerUrl}/address/${networkConfig.milkMint.toString()}?cluster=${networkConfig.name.toLowerCase()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Safety Features */}
              <div className="lg:col-span-1">
                <h4 className="text-xl font-bold text-yellow-400 mb-4">🛡️ Protocol Innovations</h4>
                <ul className="space-y-3 text-white/90">
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 flex-shrink-0">✅</span>
                    <span><strong>Anti-Dump Protection:</strong> 24h cooling period with 50% penalty redistribution</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 flex-shrink-0">✅</span>
                    <span><strong>Dynamic Pricing:</strong> Exponential bonding curves prevent whale dominance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 flex-shrink-0">✅</span>
                    <span><strong>TVL-Responsive Rewards:</strong> Anti-inflationary yield mechanisms</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 flex-shrink-0">✅</span>
                    <span><strong>Greed Decay:</strong> Mathematical early adopter incentives</span>
                  </li>
                </ul>
              </div>

              {/* How It Works */}
              <div className="lg:col-span-1">
                <h4 className="text-xl font-bold text-yellow-400 mb-4">⚙️ Protocol Mechanics</h4>
                <ol className="space-y-3 text-white/90">
                  <li className="flex items-start gap-3">
                    <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                    <span><strong>Stake Capital:</strong> Buy "cows" at dynamic prices (bonding curve)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                    <span><strong>Earn Yield:</strong> TVL-responsive rewards with greed multiplier</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                    <span><strong>Compound:</strong> Reinvest rewards for exponential growth</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                    <span><strong>Withdraw:</strong> Extract yield (24h cooling period applies)</span>
                  </li>
                </ol>
              </div>
            </div>

            {/* Protocol Innovation */}
            <div className="mt-8 bg-gradient-to-r from-purple-400/20 to-blue-500/20 rounded-2xl p-6 border border-purple-400/30">
              <h4 className="text-xl font-bold text-purple-400 mb-3 text-center">🧮 The Innovation</h4>
              <p className="text-white/90 text-center text-lg leading-relaxed">
                MilkerFun proves that complex mathematical models can be made accessible through gamification. 
                We've created the <strong className="text-purple-400"> first truly sustainable DeFi protocol </strong> 
                that solves inflation, whale dominance, and market manipulation through pure mathematics! 🧮✨
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};