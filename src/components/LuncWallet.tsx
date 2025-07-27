import React, { useState, useEffect } from 'react';
import { formatLuncBalance } from '../utils/gameHelpers';

// ===================================
// 📋 TYPESCRIPT INTERFACES
// ===================================

interface LuncWalletProps {
  balance: number;
  formatted?: string;
  showDetails?: boolean;
  onBalanceClick?: () => void;
}

interface TransactionHistory {
  id: string;
  type: 'earned' | 'spent' | 'bonus' | 'mint' | 'trade';
  amount: number;
  description: string;
  timestamp: Date;
  characterName?: string;
  jobType?: string;
}

interface LuncStats {
  totalEarned: number;
  totalSpent: number;
  dailyAverage: number;
  weeklyTotal: number;
  monthlyTotal: number;
  bestDay: number;
  currentStreak: number;
}

// ===================================
// 💰 LUNC WALLET COMPONENT
// ===================================

const LuncWallet: React.FC<LuncWalletProps> = ({
  balance,
  formatted,
  showDetails = false,
  onBalanceClick
}) => {
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  const [stats, setStats] = useState<LuncStats>({
    totalEarned: 0,
    totalSpent: 0,
    dailyAverage: 0,
    weeklyTotal: 0,
    monthlyTotal: 0,
    bestDay: 0,
    currentStreak: 0
  });
  const [balanceAnimation, setBalanceAnimation] = useState<boolean>(false);
  const [previousBalance, setPreviousBalance] = useState<number>(balance);

  // Load transaction history from localStorage
  useEffect(() => {
    loadTransactionHistory();
    calculateStats();
  }, []);

  // Animate balance changes
  useEffect(() => {
    if (balance !== previousBalance) {
      setBalanceAnimation(true);
      setTimeout(() => setBalanceAnimation(false), 1000);
      
      // Add transaction for balance increase
      if (balance > previousBalance) {
        const gainAmount = balance - previousBalance;
        addTransaction({
          type: 'earned',
          amount: gainAmount,
          description: 'Daily earnings collected',
          timestamp: new Date()
        });
      }
      
      setPreviousBalance(balance);
    }
  }, [balance, previousBalance]);

  // Load transactions from localStorage
  const loadTransactionHistory = (): void => {
    try {
      const saved = localStorage.getItem('vbe_lunc_transactions');
      if (saved) {
        const parsedTransactions = JSON.parse(saved).map((tx: any) => ({
          ...tx,
          timestamp: new Date(tx.timestamp)
        }));
        setTransactions(parsedTransactions);
      }
    } catch (error) {
      console.error('Error loading transaction history:', error);
    }
  };

  // Save transactions to localStorage
  const saveTransactionHistory = (newTransactions: TransactionHistory[]): void => {
    try {
      localStorage.setItem('vbe_lunc_transactions', JSON.stringify(newTransactions));
    } catch (error) {
      console.error('Error saving transaction history:', error);
    }
  };

  // Add new transaction
  const addTransaction = (transaction: Omit<TransactionHistory, 'id'>): void => {
    const newTransaction: TransactionHistory = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    const updatedTransactions = [newTransaction, ...transactions].slice(0, 100); // Keep last 100
    setTransactions(updatedTransactions);
    saveTransactionHistory(updatedTransactions);
    calculateStats(updatedTransactions);
  };

  // Calculate wallet statistics
  const calculateStats = (txList: TransactionHistory[] = transactions): void => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalEarned = 0;
    let totalSpent = 0;
    let weeklyTotal = 0;
    let monthlyTotal = 0;
    let todayTotal = 0;
    let bestDay = 0;
    
    // Daily earnings tracking for streak calculation
    const dailyEarnings: { [key: string]: number } = {};

    txList.forEach(tx => {
      const txDate = new Date(tx.timestamp);
      const dayKey = txDate.toDateString();
      
      if (tx.type === 'earned' || tx.type === 'bonus') {
        totalEarned += tx.amount;
        
        if (txDate >= weekStart) weeklyTotal += tx.amount;
        if (txDate >= monthStart) monthlyTotal += tx.amount;
        if (txDate >= todayStart) todayTotal += tx.amount;
        
        // Track daily earnings
        dailyEarnings[dayKey] = (dailyEarnings[dayKey] || 0) + tx.amount;
      } else if (tx.type === 'spent' || tx.type === 'mint' || tx.type === 'trade') {
        totalSpent += tx.amount;
      }
    });

    // Calculate best day
    Object.values(dailyEarnings).forEach(dayTotal => {
      if (dayTotal > bestDay) bestDay = dayTotal;
    });

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayKey = checkDate.toDateString();
      
      if (dailyEarnings[dayKey] && dailyEarnings[dayKey] > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    const dailyAverage = txList.length > 0 
      ? totalEarned / Math.max(1, Math.ceil((now.getTime() - new Date(txList[txList.length - 1]?.timestamp || now).getTime()) / (24 * 60 * 60 * 1000)))
      : 0;

    setStats({
      totalEarned,
      totalSpent,
      dailyAverage,
      weeklyTotal,
      monthlyTotal,
      bestDay,
      currentStreak
    });
  };

  // Get transaction icon
  const getTransactionIcon = (type: TransactionHistory['type']): string => {
    switch (type) {
      case 'earned': return '💰';
      case 'spent': return '💸';
      case 'bonus': return '🎁';
      case 'mint': return '🎯';
      case 'trade': return '🔄';
      default: return '💵';
    }
  };

  // Get transaction color class
  const getTransactionColor = (type: TransactionHistory['type']): string => {
    switch (type) {
      case 'earned':
      case 'bonus': return 'positive';
      case 'spent':
      case 'mint':
      case 'trade': return 'negative';
      default: return 'neutral';
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  // Handle wallet click
  const handleWalletClick = (): void => {
    if (onBalanceClick) {
      onBalanceClick();
    } else {
      setShowWalletModal(true);
    }
  };

  const displayBalance = formatted || formatLuncBalance(balance);
  const recentTransactions = transactions.slice(0, 10);

  return (
    <div className="lunc-wallet">
      {/* Main Wallet Display */}
      <div 
        className={`wallet-display ${balanceAnimation ? 'balance-updated' : ''}`}
        onClick={handleWalletClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleWalletClick();
          }
        }}
      >
        <div className="wallet-icon">💰</div>
        <div className="wallet-content">
          <div className="balance-amount">
            <span className="balance-number">{displayBalance}</span>
            <span className="balance-currency">LUNC</span>
          </div>
          {showDetails && (
            <div className="balance-details">
              <span className="daily-change">+{stats.dailyAverage.toFixed(0)}/day avg</span>
            </div>
          )}
        </div>
        <div className="wallet-arrow">▼</div>
      </div>

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="wallet-modal-overlay" onClick={() => setShowWalletModal(false)}>
          <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💰 LUNC Wallet</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowWalletModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              {/* Current Balance */}
              <div className="current-balance">
                <div className="balance-display">
                  <span className="balance-amount">{displayBalance}</span>
                  <span className="balance-label">LUNC Balance</span>
                </div>
                
                <div className="balance-usd">
                  ≈ $0.00 USD
                  <span className="disclaimer">(Display only - Gaming tokens)</span>
                </div>
              </div>

              {/* Statistics */}
              <div className="wallet-stats">
                <h3>📊 Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-value">{formatLuncBalance(stats.totalEarned)}</span>
                    <span className="stat-label">Total Earned</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-value">{formatLuncBalance(stats.totalSpent)}</span>
                    <span className="stat-label">Total Spent</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-value">{formatLuncBalance(stats.weeklyTotal)}</span>
                    <span className="stat-label">This Week</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-value">{stats.currentStreak}</span>
                    <span className="stat-label">Day Streak</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-value">{formatLuncBalance(stats.bestDay)}</span>
                    <span className="stat-label">Best Day</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-value">{formatLuncBalance(stats.dailyAverage)}</span>
                    <span className="stat-label">Daily Avg</span>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="transaction-history">
                <h3>📋 Recent Activity</h3>
                {recentTransactions.length > 0 ? (
                  <div className="transactions-list">
                    {recentTransactions.map(tx => (
                      <div key={tx.id} className={`transaction-item ${getTransactionColor(tx.type)}`}>
                        <div className="transaction-icon">
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div className="transaction-details">
                          <div className="transaction-description">{tx.description}</div>
                          {tx.characterName && (
                            <div className="transaction-character">{tx.characterName}</div>
                          )}
                          <div className="transaction-time">{formatTimeAgo(tx.timestamp)}</div>
                        </div>
                        <div className={`transaction-amount ${getTransactionColor(tx.type)}`}>
                          {tx.type === 'earned' || tx.type === 'bonus' ? '+' : '-'}
                          {formatLuncBalance(tx.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-transactions">
                    <p>No transactions yet. Start playing to earn LUNC!</p>
                  </div>
                )}
              </div>

              {/* Wallet Actions */}
              <div className="wallet-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => {
                    // Add demo transaction for testing
                    addTransaction({
                      type: 'earned',
                      amount: 50,
                      description: 'Daily collection bonus',
                      timestamp: new Date()
                    });
                  }}
                >
                  🏠 Collect Daily Bonus
                </button>
                
                <button 
                  className="action-btn secondary"
                  onClick={() => {
                    setShowWalletModal(false);
                    // Navigate to family management
                  }}
                >
                  👥 Manage Family
                </button>
              </div>

              {/* Wallet Info */}
              <div className="wallet-info">
                <h3>ℹ️ About LUNC Rewards</h3>
                <ul>
                  <li>🎮 LUNC tokens are earned through active gameplay</li>
                  <li>💰 Use LUNC to mint new characters and trade in marketplace</li>
                  <li>📈 Higher level characters earn more LUNC per day</li>
                  <li>🔄 All LUNC transactions are tracked for transparency</li>
                  <li>🎆 Entertainment gaming tokens - not financial investments</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Balance Animation */}
      {balanceAnimation && (
        <div className="balance-animation">
          <span className="floating-lunc">+{balance - previousBalance} LUNC</span>
        </div>
      )}
    </div>
  );
};

export default LuncWallet;