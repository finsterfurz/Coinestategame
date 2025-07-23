import React, { useState } from 'react';

const LuncWallet = ({ balance }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="lunc-wallet-container">
      <div 
        className="lunc-wallet" 
        onClick={() => setShowDetails(!showDetails)}
      >
        💰 {balance.toLocaleString()} LUNC
      </div>
      
      {showDetails && (
        <div className="wallet-dropdown">
          <div className="wallet-item">
            <span>Verfügbar:</span>
            <span>{balance.toLocaleString()} LUNC</span>
          </div>
          <div className="wallet-item">
            <span>Heute verdient:</span>
            <span>+127 LUNC</span>
          </div>
          <div className="wallet-item">
            <span>Diese Woche:</span>
            <span>+892 LUNC</span>
          </div>
          <hr />
          <button className="wallet-action">
            🔄 LUNC übertragen
          </button>
          <button className="wallet-action">
            📊 Verdienst-Historie
          </button>
        </div>
      )}
    </div>
  );
};

export default LuncWallet;