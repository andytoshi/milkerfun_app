import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { NetworkSwitcher } from './NetworkSwitcher';
import { Home, BarChart3, Gamepad2, Menu, X, Info } from 'lucide-react';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Brand */}
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-white hover:scale-105 transition-transform duration-300"
              onClick={closeMobileMenu}
            >
              <span className="text-2xl lg:text-3xl animate-bounce-slow">🐄</span>
              <span className="text-xl lg:text-2xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Milker.Fun
              </span>
              <span className="text-2xl lg:text-3xl animate-bounce-slow">🥛</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                isActive('/') 
                  ? 'bg-white/20 text-white shadow-lg' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home size={20} />
              <span>Home</span>
            </Link>
            <Link 
              to="/game" 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                isActive('/game') 
                  ? 'bg-white/20 text-white shadow-lg' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Gamepad2 size={20} />
              <span>Game</span>
            </Link>
            <Link 
              to="/stats" 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                isActive('/stats') 
                  ? 'bg-white/20 text-white shadow-lg' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <BarChart3 size={20} />
              <span>Stats</span>
            </Link>
            <Link 
              to="/about" 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                isActive('/about') 
                  ? 'bg-white/20 text-white shadow-lg' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Info size={20} />
              <span>About</span>
            </Link>
          </div>

          {/* Desktop Wallet & Network Controls */}
          <div className="hidden md:flex items-center gap-3">
            <NetworkSwitcher />
            <WalletMultiButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <NetworkSwitcher />
            <button 
              onClick={toggleMobileMenu}
              className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-96 opacity-100 pb-4' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="flex flex-col space-y-2 pt-4">
            <Link 
              to="/" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isActive('/') 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              onClick={closeMobileMenu}
            >
              <Home size={20} />
              <span>Home</span>
            </Link>
            <Link 
              to="/game" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isActive('/game') 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              onClick={closeMobileMenu}
            >
              <Gamepad2 size={20} />
              <span>Game</span>
            </Link>
            <Link 
              to="/stats" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isActive('/stats') 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              onClick={closeMobileMenu}
            >
              <BarChart3 size={20} />
              <span>Stats</span>
            </Link>
            <Link 
              to="/about" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isActive('/about') 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              onClick={closeMobileMenu}
            >
              <Info size={20} />
              <span>About</span>
            </Link>
            
            {/* Mobile Wallet Button */}
            <div className="pt-4 border-t border-white/20">
              <WalletMultiButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};