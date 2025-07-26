import React from 'react';

// ===================================
// 🔄 LOADING SPINNER COMPONENT
// ===================================

const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Lade...', 
  overlay = false,
  color = 'primary'
}) => {
  const sizeClasses = {
    small: 'loading-small',
    medium: 'loading-medium',
    large: 'loading-large'
  };

  const colorClasses = {
    primary: 'loading-primary',
    secondary: 'loading-secondary',
    success: 'loading-success',
    warning: 'loading-warning'
  };

  const spinnerContent = (
    <div className={`loading-spinner ${sizeClasses[size]} ${colorClasses[color]}`}>
      <div className="loading-spinner-inner">
        <div className="loading-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        {message && (
          <div className="loading-message">
            {message}
          </div>
        )}
      </div>
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

// ===================================
// 🎮 GAME-SPECIFIC LOADING STATES
// ===================================

export const MintingLoader = () => (
  <LoadingSpinner 
    size="large" 
    message="🎯 Charaktere werden geminted..."
    color="primary"
  />
);

export const WalletLoader = () => (
  <LoadingSpinner 
    size="medium" 
    message="🔗 Wallet wird verbunden..."
    color="secondary"
  />
);

export const TransactionLoader = () => (
  <LoadingSpinner 
    size="medium" 
    message="⛓️ Transaktion wird verarbeitet..."
    color="warning"
    overlay={true}
  />
);

export const GameLoader = () => (
  <LoadingSpinner 
    size="large" 
    message="🏢 Virtual Building Empire wird geladen..."
    color="primary"
    overlay={true}
  />
);

export default LoadingSpinner;