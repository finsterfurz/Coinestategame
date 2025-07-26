// ===================================
// ⏳ LOADING SPINNER COMPONENTS
// ===================================

import React from 'react';
import { clsx } from 'clsx';

// ===================================
// 🎮 GAME LOADER
// ===================================

export const GameLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated Building Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto">
            <div className="building-animation">
              <div className="building-floor bg-blue-500 opacity-80"></div>
              <div className="building-floor bg-purple-500 opacity-80 animation-delay-200"></div>
              <div className="building-floor bg-indigo-500 opacity-80 animation-delay-400"></div>
              <div className="building-floor bg-blue-400 opacity-80 animation-delay-600"></div>
              <div className="building-floor bg-purple-400 opacity-80 animation-delay-800"></div>
            </div>
          </div>
        </div>
        
        {/* Loading Text */}
        <h2 className="text-3xl font-bold text-white mb-4 animate-pulse">
          🏢 Virtual Building Empire
        </h2>
        
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce animation-delay-100"></div>
          <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce animation-delay-200"></div>
        </div>
        
        <p className="text-gray-300 text-lg mb-4">Lade dein Gebäude-Imperium...</p>
        
        {/* Progress Bar */}
        <div className="w-64 h-2 bg-gray-700 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full loading-progress"></div>
        </div>
        
        <p className="text-gray-400 text-sm mt-4">Web3 Gaming • LUNC Rewards • NFT Characters</p>
      </div>
      
      <style jsx>{`
        .building-animation {
          animation: buildingGlow 2s ease-in-out infinite alternate;
        }
        
        .building-floor {
          width: 100%;
          height: 16px;
          margin-bottom: 2px;
          border-radius: 2px;
          animation: floorLight 2s ease-in-out infinite;
        }
        
        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-800 { animation-delay: 0.8s; }
        
        .loading-progress {
          animation: loadingBar 3s ease-in-out infinite;
        }
        
        @keyframes buildingGlow {
          0% { filter: brightness(1) drop-shadow(0 0 10px rgba(59, 130, 246, 0.5)); }
          100% { filter: brightness(1.2) drop-shadow(0 0 20px rgba(147, 51, 234, 0.8)); }
        }
        
        @keyframes floorLight {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @keyframes loadingBar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

// ===================================
// 🌀 SIMPLE SPINNER
// ===================================

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'purple' | 'white' | 'gray';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  color = 'blue',
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  const colorClasses = {
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    white: 'text-white',
    gray: 'text-gray-500'
  };
  
  return (
    <div className={clsx(
      'animate-spin',
      sizeClasses[size],
      colorClasses[color],
      className
    )}>
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

// ===================================
// 📊 LOADING SKELETON
// ===================================

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, lines = 1 }) => {
  return (
    <div className={clsx('animate-pulse', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={clsx(
            'bg-gray-300 rounded',
            i === 0 ? 'h-4' : 'h-3 mt-2',
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
};

// ===================================
// 🎯 BUTTON LOADING STATE
// ===================================

interface LoadingButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  children,
  className,
  onClick,
  disabled = false
}) => {
  return (
    <button
      className={clsx(
        'relative transition-all duration-200',
        loading && 'cursor-not-allowed',
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" color="white" />
        </div>
      )}
      <span className={clsx(loading && 'opacity-0')}>
        {children}
      </span>
    </button>
  );
};

export default GameLoader;