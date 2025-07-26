// ===================================
// ❌ ERROR FALLBACK COMPONENT
// ===================================

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  message?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  title = '🚨 Etwas ist schiefgelaufen',
  message
}) => {
  const handleReload = () => {
    window.location.reload();
  };
  
  const handleGoHome = () => {
    window.location.href = '/';
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-2xl p-8 text-center">
        {/* Error Icon */}
        <div className="mb-6">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
        </div>
        
        {/* Error Message */}
        <div className="mb-8">
          <p className="text-gray-300 mb-4">
            {message || 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.'}
          </p>
          
          {process.env.NODE_ENV === 'development' && error && (
            <details className="text-left bg-gray-900 rounded p-4 mt-4">
              <summary className="text-red-400 cursor-pointer mb-2">
                Fehlerdetails (Development)
              </summary>
              <pre className="text-xs text-gray-400 overflow-auto">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          {resetError && (
            <button
              onClick={resetError}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Erneut versuchen</span>
            </button>
          )}
          
          <button
            onClick={handleReload}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Seite neu laden</span>
          </button>
          
          <button
            onClick={handleGoHome}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Zur Startseite</span>
          </button>
        </div>
        
        {/* Support Info */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-gray-400 text-sm mb-2">
            Problem weiterhin vorhanden?
          </p>
          <a
            href="https://github.com/finsterfurz/Coinestategame/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            Problem melden 🐛
          </a>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;