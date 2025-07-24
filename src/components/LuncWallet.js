import React, { useState, useEffect } from 'react';

const LuncWallet = ({ balance }) => {
  // ===================================
  // 🎯 STATE MANAGEMENT
  // ===================================
  
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [transactions, setTransactions] = useState([]);

  // ===================================
  // 🎮 UTILITY FUNCTIONS
  // ===================================
  
  // Formatiere LUNC Balance für Anzeige
  const formatBalance = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toLocaleString('de-DE');
  };

  // Animiere Balance-Änderungen
  useEffect(() => {
    if (balance !== displayBalance) {
      setIsAnimating(true);
      
      // Animiere zu neuer Balance
      const difference = balance - displayBalance;
      const steps = 20;
      const stepSize = difference / steps;
      let currentStep = 0;
      
      const animation = setInterval(() => {
        currentStep++;
        setDisplayBalance(prev => {
          const newBalance = prev + stepSize;
          return currentStep >= steps ? balance : newBalance;
        });
        
        if (currentStep >= steps) {
          clearInterval(animation);
          setIsAnimating(false);
        }
      }, 50);
      
      return () => clearInterval(animation);
    }
  }, [balance, displayBalance]);

  // Demo Transaktionen (später aus echten Daten)
  useEffect(() => {
    const demoTransactions = [
      {
        id: 1,
        type: 'earned',
        amount: 127,
        source: 'Daily Work Rewards',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
        character: 'Max Manager'
      },
      {
        id: 2,
        type: 'earned',
        amount: 85,
        source: 'Building Management',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        character: 'Lisa Legend'
      },
      {
        id: 3,
        type: 'bonus',
        amount: 25,
        source: 'Familie Bonus',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        character: null
      },
      {
        id: 4,
        type: 'earned',
        amount: 45,
        source: 'IT Support Work',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        character: 'Tom Tech'
      }
    ];
    
    setTransactions(demoTransactions);
  }, []);

  // Zeit seit Transaction formatieren
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
    } else if (diffHours > 0) {
      return `vor ${diffHours} Std`;
    } else if (diffMins > 0) {
      return `vor ${diffMins} Min`;
    } else {
      return 'gerade eben';
    }
  };

  // Transaction Icon
  const getTransactionIcon = (type) => {
    switch(type) {
      case 'earned': return '💰';
      case 'bonus': return '🎁';
      case 'spent': return '💸';
      default: return '💰';
    }
  };

  // Transaction Color
  const getTransactionColor = (type) => {
    switch(type) {
      case 'earned': return '#28a745';
      case 'bonus': return '#ffc107';
      case 'spent': return '#dc3545';
      default: return '#28a745';
    }
  };

  return (
    <div className="lunc-wallet">
      
      {/* Wallet Display */}
      <div 
        className={`wallet-display ${isAnimating ? 'animating' : ''}`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="wallet-icon">
          💎
        </div>
        
        <div className="wallet-content">
          <div className="wallet-balance">
            <span className="balance-amount">
              {Math.floor(displayBalance).toLocaleString('de-DE')}
            </span>
            <span className="balance-currency">LUNC</span>
          </div>
          
          <div className="wallet-label">
            Gaming Rewards
          </div>
        </div>
        
        <div className="wallet-toggle">
          <span className={`toggle-icon ${showDetails ? 'expanded' : ''}`}>
            {showDetails ? '▼' : '▶'}
          </span>
        </div>
      </div>

      {/* Details Dropdown */}
      {showDetails && (
        <div className="wallet-details">
          
          {/* Balance Breakdown */}
          <div className="balance-breakdown">
            <h4>💰 Balance Details</h4>
            
            <div className="breakdown-item">
              <span className="breakdown-label">💎 Gesamt LUNC:</span>
              <span className="breakdown-value">{formatBalance(balance)}</span>
            </div>
            
            <div className="breakdown-item">
              <span className="breakdown-label">📅 Heute verdient:</span>
              <span className="breakdown-value">+{formatBalance(282)} LUNC</span>
            </div>
            
            <div className="breakdown-item">
              <span className="breakdown-label">🏆 Diese Woche:</span>
              <span className="breakdown-value">+{formatBalance(1847)} LUNC</span>
            </div>
            
            <div className="breakdown-item">
              <span className="breakdown-label">📈 Wachstum:</span>
              <span className="breakdown-value positive">+12.5%</span>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="recent-transactions">
            <h4>📋 Letzte Transaktionen</h4>
            
            <div className="transactions-list">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="transaction-item">
                  <div className="transaction-icon">
                    {getTransactionIcon(tx.type)}
                  </div>
                  
                  <div className="transaction-info">
                    <div className="transaction-source">{tx.source}</div>
                    {tx.character && (
                      <div className="transaction-character">{tx.character}</div>
                    )}
                    <div className="transaction-time">{formatTimeAgo(tx.timestamp)}</div>
                  </div>
                  
                  <div 
                    className="transaction-amount"
                    style={{ color: getTransactionColor(tx.type) }}
                  >
                    +{tx.amount} LUNC
                  </div>
                </div>
              ))}
            </div>
            
            <div className="transactions-footer">
              <button className="view-all-btn">
                📊 Alle Transaktionen anzeigen
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="wallet-actions">
            <button className="wallet-action claim">
              🎯 LUNC einsammeln
            </button>
            
            <button className="wallet-action withdraw">
              💸 Auszahlen
            </button>
            
            <button className="wallet-action stats">
              📊 Statistiken
            </button>
          </div>

          {/* Disclaimer */}
          <div className="wallet-disclaimer">
            <p>
              💡 <strong>Gaming Rewards:</strong> LUNC Token sind Gameplay-Belohnungen 
              für deine aktive Teilnahme im Virtual Building Empire. 
              Keine Investment-Beratung.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LuncWallet;