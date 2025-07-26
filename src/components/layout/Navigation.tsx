// ===================================
// 🧭 NAVIGATION COMPONENT
// ===================================

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, X, Home, Users, Building, Briefcase, ShoppingCart, Zap } from 'lucide-react';
import { clsx } from 'clsx';

// Store
import { useFamily, useLuncBalance } from '@/stores/gameStore';

// Utils
import { formatLuncBalance } from '@/utils/gameHelpers';

// ===================================
// 🧭 MAIN NAVIGATION
// ===================================

export const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const familyData = useFamily();
  const luncBalance = useLuncBalance();
  
  const navigationItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/family', label: 'Familie', icon: Users },
    { path: '/building', label: 'Gebäude', icon: Building },
    { path: '/jobs', label: 'Jobs', icon: Briefcase },
    { path: '/marketplace', label: 'Marktplatz', icon: ShoppingCart },
  ];
  
  const isActivePath = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors">
              <Building className="w-8 h-8 text-blue-500" />
              <span className="font-bold text-xl hidden sm:block">
                Virtual Building Empire
              </span>
              <span className="font-bold text-lg sm:hidden">
                VBE
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={clsx(
                      'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2',
                      isActivePath(item.path)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    )}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Mint Button */}
              <Link
                to="/mint"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ml-2"
              >
                <Zap className="w-4 h-4" />
                <span>Minten</span>
              </Link>
            </div>
          </div>
          
          {/* Right Side - LUNC Balance & Wallet */}
          <div className="flex items-center space-x-4">
            {/* LUNC Balance */}
            <div className="hidden sm:flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2">
              <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">L</span>
              </div>
              <span className="text-white font-medium">
                {formatLuncBalance(luncBalance)}
              </span>
            </div>
            
            {/* Family Size (Mobile) */}
            <div className="sm:hidden flex items-center space-x-1 text-gray-300">
              <Users className="w-4 h-4" />
              <span className="text-sm">{familyData.familySize}</span>
            </div>
            
            {/* Wallet Connection */}
            <div className="hidden sm:block">
              <ConnectButton
                chainStatus="icon"
                accountStatus={{
                  smallScreen: 'avatar',
                  largeScreen: 'full',
                }}
                showBalance={false}
              />
            </div>
            
            {/* Mobile Menu Button */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    'block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center space-x-3',
                    isActivePath(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {/* Mobile Mint Button */}
            <Link
              to="/mint"
              className="block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-2 rounded-md text-base font-medium flex items-center space-x-3 mt-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Zap className="w-5 h-5" />
              <span>Minten</span>
            </Link>
            
            {/* Mobile LUNC Balance */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded-md mt-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">L</span>
                </div>
                <span className="text-white font-medium">LUNC Balance</span>
              </div>
              <span className="text-white font-bold">
                {formatLuncBalance(luncBalance)}
              </span>
            </div>
            
            {/* Mobile Wallet Connection */}
            <div className="px-3 py-2">
              <ConnectButton
                chainStatus="icon"
                accountStatus="full"
                showBalance={false}
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;