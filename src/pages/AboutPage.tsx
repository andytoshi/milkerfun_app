import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, TrendingUp, Zap, Github, Twitter } from 'lucide-react';

import { SOCIAL_LINKS } from '../constants/solana';

export const AboutPage: React.FC = () => {

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 text-shadow-lg">
            🧮 About MilkerFun Protocol
          </h1>
          <p className="text-xl sm:text-2xl text-white/90 text-shadow max-w-4xl mx-auto leading-relaxed">
            Revolutionary DeFi protocol disguised as a simple cow farming game. 
            Advanced mathematical models create sustainable, anti-inflationary tokenomics.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16">
        {/* Protocol Overview */}
        <div className="card p-8 lg:p-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🎭 The Cow Game is Just the Interface
          </h2>
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                While users see a fun cow farming game, MilkerFun is actually a sophisticated DeFi protocol 
                implementing cutting-edge economic mechanisms. The "cows" are simply a user-friendly wrapper 
                around complex mathematical models that solve real problems in decentralized finance.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our protocol introduces three revolutionary innovations: dynamic bonding curves for supply control, 
                TVL-responsive reward mechanisms for sustainability, and time-based penalty systems for market stability.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-8 border border-purple-200">
              <h3 className="text-xl font-bold text-purple-800 mb-4">🧮 What's Really Happening</h3>
              <ul className="space-y-3 text-purple-700">
                <li className="flex items-start gap-3">
                  <span className="text-purple-500">•</span>
                  <span><strong>Cows</strong> = Staking positions with dynamic pricing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-500">•</span>
                  <span><strong>MILK rewards</strong> = Yield with anti-inflationary mechanics</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-500">•</span>
                  <span><strong>Compounding</strong> = Automated reinvestment optimization</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-500">•</span>
                  <span><strong>Farm management</strong> = Portfolio optimization</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      

        {/* Economic Models */}
        <div className="card p-8 lg:p-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            📊 Advanced Economic Models
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <h3 className="text-xl font-bold text-purple-800 mb-4">🐄 Dynamic Pricing Model</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-center font-mono text-lg font-bold text-purple-600 mb-2">
                    P(c) = 6,000 × (1 + (c/1,000)^1.0)
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Exponential bonding curve prevents infinite supply
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-purple-700">
                  <li><strong>P₀:</strong> Base price (6,000 MILK)</li>
                  <li><strong>c:</strong> Global cow count</li>
                  <li><strong>C_pivot:</strong> Pivot point (1,000 cows)</li>
                  <li><strong>α:</strong> Steepness factor (1.0)</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <h3 className="text-xl font-bold text-green-800 mb-4">🥛 Reward Distribution Model</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-center font-mono text-sm font-bold text-green-600 mb-2">
                    R = max(B / (1 + α × (TVL/C) / S), R_min) × G(C)
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    TVL-responsive rewards with greed multiplier
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-green-700">
                  <li><strong>B:</strong> Base reward (150,000 MILK)</li>
                  <li><strong>α:</strong> Sensitivity (0.8)</li>
                  <li><strong>S:</strong> Normalization (50,000 MILK)</li>
                  <li><strong>G(C):</strong> Greed multiplier function</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-4 text-center">🚀 Greed Multiplier Function</h3>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="font-mono text-lg font-bold text-blue-600 mb-2">
                G(C) = 1 + 5 × e^(-C/250)
              </div>
              <p className="text-sm text-gray-600">
                Early adopter bonus: starts at 6x, exponentially decays to 1x as ecosystem grows
              </p>
            </div>
          </div>
        </div>

          {/* Anti-Dump Protocol Deep Dive */}
        <div className="card p-8 lg:p-12 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🛡️ Anti-Dump Protocol: Mathematical Innovation
          </h2>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4 text-center">⏰</div>
              <h3 className="text-xl font-bold text-red-600 mb-4">24-Hour Cooling Period</h3>
              <p className="text-gray-700 leading-relaxed">
                Withdrawals within 24 hours of the last withdrawal incur a 50% penalty. 
                This creates a natural cooling-off period that reduces panic selling and market volatility.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4 text-center">💰</div>
              <h3 className="text-xl font-bold text-red-600 mb-4">Penalty Redistribution</h3>
              <p className="text-gray-700 leading-relaxed">
                Penalty tokens don't disappear - they stay in the TVL pool, increasing rewards for all remaining participants. 
                This creates a positive feedback loop that benefits patient holders.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4 text-center">📈</div>
              <h3 className="text-xl font-bold text-red-600 mb-4">Market Stability</h3>
              <p className="text-gray-700 leading-relaxed">
                By discouraging rapid extraction, the protocol maintains stable TVL levels, 
                ensuring consistent rewards and reducing the boom-bust cycles common in DeFi.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 lg:p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              🧮 Mathematical Implementation
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-bold text-red-600 mb-4">Penalty Calculation Logic</h4>
                <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                  <div className="text-gray-600 mb-2">// Rust implementation</div>
                  <div className="text-blue-600">let hours_since_last = </div>
                  <div className="ml-4 text-gray-800">(current_time - last_withdraw) / 3600;</div>
                  <div className="text-blue-600 mt-2">if hours_since_last &gt;= 24 {`{`}</div>
                  <div className="ml-4 text-green-600">// No penalty - full withdrawal</div>
                  <div className="ml-4 text-gray-800">(total_rewards, 0)</div>
                  <div className="text-blue-600">{`}`} else {`{`}</div>
                  <div className="ml-4 text-red-600">// 50% penalty</div>
                  <div className="ml-4 text-gray-800">(total_rewards / 2, total_rewards / 2)</div>
                  <div className="text-blue-600">{`}`}</div>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-bold text-red-600 mb-4">Economic Impact</h4>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">•</span>
                    <span><strong>Reduces sell pressure</strong> by 24-hour holding incentive</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">•</span>
                    <span><strong>Increases TVL</strong> through penalty redistribution</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">•</span>
                    <span><strong>Rewards patience</strong> with full reward access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">•</span>
                    <span><strong>Punishes extraction</strong> with 50% penalties</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Why This Matters */}
        <div className="card p-8 lg:p-12 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🌟 Why This Protocol Matters
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <Shield className="text-indigo-600 mb-4" size={32} />
              <h3 className="text-xl font-bold text-indigo-800 mb-3">Sustainable Economics</h3>
              <p className="text-gray-700 leading-relaxed">
                Unlike traditional DeFi protocols that suffer from hyperinflation or death spirals, 
                our TVL-responsive rewards create a self-regulating economy that adapts to market conditions.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <TrendingUp className="text-indigo-600 mb-4" size={32} />
              <h3 className="text-xl font-bold text-indigo-800 mb-3">Anti-Whale Mechanics</h3>
              <p className="text-gray-700 leading-relaxed">
                Exponential pricing curves prevent single players from dominating the ecosystem. 
                Large purchases become prohibitively expensive, ensuring fair distribution.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <Zap className="text-indigo-600 mb-4" size={32} />
              <h3 className="text-xl font-bold text-indigo-800 mb-3">Market Stability</h3>
              <p className="text-gray-700 leading-relaxed">
                The 24-hour cooling period with penalty redistribution creates natural market stability, 
                reducing volatility and encouraging long-term participation over speculation.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Innovation */}
        <div className="card p-8 lg:p-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🔬 Technical Innovation
          </h2>
          
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">🧮 Mathematical Elegance</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Our protocol implements sophisticated mathematical models that create emergent economic behaviors:
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-bold text-purple-600 mb-2">Exponential Bonding Curves</h4>
                  <p className="text-sm text-gray-600">
                    Prevent infinite supply through exponentially increasing costs
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-bold text-green-600 mb-2">TVL Density Response</h4>
                  <p className="text-sm text-gray-600">
                    Rewards automatically adjust based on capital concentration
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-bold text-blue-600 mb-2">Temporal Incentive Decay</h4>
                  <p className="text-sm text-gray-600">
                    Early adopter bonuses decay exponentially over time
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">🛡️ Anti-Dump Mechanism Deep Dive</h3>
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-bold text-red-600 mb-3">How It Works</h4>
                  <ol className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                      <span>User accumulates MILK rewards from their cows</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                      <span>First withdrawal or 24+ hours since last = penalty-free</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                      <span>Withdrawal within 24 hours = 50% penalty applied</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                      <span>Penalty tokens remain in pool, increasing TVL for all</span>
                    </li>
                  </ol>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-red-600 mb-3">Economic Benefits</h4>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="text-red-500">✓</span>
                      <span><strong>Reduces sell pressure</strong> during market downturns</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500">✓</span>
                      <span><strong>Increases TVL</strong> through penalty redistribution</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500">✓</span>
                      <span><strong>Rewards long-term thinking</strong> over speculation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500">✓</span>
                      <span><strong>Creates positive feedback loops</strong> for holders</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500">✓</span>
                      <span><strong>Prevents bank runs</strong> and panic selling</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Protocol Comparison */}
        <div className="card p-8 lg:p-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            ⚖️ Protocol Comparison
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-4 font-bold text-gray-800 border border-gray-200">Feature</th>
                  <th className="text-center p-4 font-bold text-gray-800 border border-gray-200">Traditional DeFi</th>
                  <th className="text-center p-4 font-bold text-gray-800 border border-gray-200">MilkerFun Protocol</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 font-semibold border border-gray-200">Supply Control</td>
                  <td className="p-4 text-center text-red-600 border border-gray-200">❌ Fixed or unlimited</td>
                  <td className="p-4 text-center text-green-600 border border-gray-200">✅ Dynamic bonding curves</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-4 font-semibold border border-gray-200">Reward Sustainability</td>
                  <td className="p-4 text-center text-red-600 border border-gray-200">❌ Fixed rates lead to inflation</td>
                  <td className="p-4 text-center text-green-600 border border-gray-200">✅ TVL-responsive anti-inflation</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold border border-gray-200">Market Stability</td>
                  <td className="p-4 text-center text-red-600 border border-gray-200">❌ Vulnerable to dumps</td>
                  <td className="p-4 text-center text-green-600 border border-gray-200">✅ 24h cooling + penalties</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-4 font-semibold border border-gray-200">Early Adopter Incentives</td>
                  <td className="p-4 text-center text-yellow-600 border border-gray-200">⚠️ Often unfair or unsustainable</td>
                  <td className="p-4 text-center text-green-600 border border-gray-200">✅ Mathematical decay function</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold border border-gray-200">Whale Protection</td>
                  <td className="p-4 text-center text-red-600 border border-gray-200">❌ Whales can dominate</td>
                  <td className="p-4 text-center text-green-600 border border-gray-200">✅ Exponential cost scaling</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Community & Development */}
        <div className="card p-8 lg:p-12 bg-gradient-to-br from-gray-50 to-gray-100">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🤝 Community & Development
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">🔓 Open Source</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                All smart contract code is open source and auditable. The mathematical models are transparent, 
                and the economic mechanisms are fully documented in our comprehensive whitepaper.
              </p>
              <div className="flex gap-4">
                <a 
                  href={SOCIAL_LINKS.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center gap-2"
                >
                  <Github size={20} />
                  View Code
                </a>
                <a 
                  href={SOCIAL_LINKS.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center gap-2"
                >
                  <Twitter size={20} />
                  Community
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">🔒 Security & Trust</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-green-500">✓</span>
                  <span><strong>Immutable smart contracts</strong> - no admin backdoors</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500">✓</span>
                  <span><strong>100% on-chain logic</strong> - no centralized components</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500">✓</span>
                  <span><strong>Transparent economics</strong> - all formulas are public</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500">✓</span>
                  <span><strong>Auditable code</strong> - open source on GitHub</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="card p-8 lg:p-12 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              🚀 Ready to Experience the Future of DeFi?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join the most mathematically sophisticated idle farming protocol on Solana. 
              Experience sustainable tokenomics, anti-dump protection, and fair economic distribution.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/farming-hub"
                className="btn-primary text-lg px-8 py-4"
              >
                🚜 Start Farming
              </Link>
              <Link 
                to="/stats"
                className="btn-secondary text-black text-lg px-8 py-4"
              >
                📊 View Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};