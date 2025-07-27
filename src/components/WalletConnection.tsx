import React, { useState, useEffect, useCallback } from 'react';

// ===================================
// 📋 TYPESCRIPT INTERFACES
// ===================================

interface WalletConnectionProps {
  onConnectionChange?: (connected: boolean, address: string | null) => void;
  isLoading?: boolean;
  error?: string | null;
}

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  networkId: number | null;
  isLoading: boolean;
  error: string | null;
}

interface WalletProvider {
  name: string;
  icon: string;
  isInstalled: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

// Define window ethereum interface
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      selectedAddress: string | null;
      networkVersion: string;
    };
  }
}

// ===================================
// 🔗 WALLET CONNECTION COMPONENT
// ===================================

const WalletConnection: React.FC<WalletConnectionProps> = ({
  onConnectionChange,
  isLoading: externalLoading = false,
  error: externalError = null
}) => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    networkId: null,
    isLoading: false,
    error: null
  });
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);

  // Check if wallet is already connected on component mount
  useEffect(() => {
    checkConnection();
    setupEventListeners();
    
    return () => {
      removeEventListeners();
    };
  }, []);

  // Notify parent of connection changes
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(walletState.isConnected, walletState.address);
    }
  }, [walletState.isConnected, walletState.address, onConnectionChange]);

  // Check existing connection
  const checkConnection = async (): Promise<void> => {
    if (!window.ethereum) return;
    
    try {
      setWalletState(prev => ({ ...prev, isLoading: true }));
      
      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });
      
      if (accounts.length > 0) {
        const address = accounts[0];
        const balance = await getBalance(address);
        const networkId = await getNetworkId();
        
        setWalletState({
          isConnected: true,
          address,
          balance,
          networkId,
          isLoading: false,
          error: null
        });
      } else {
        setWalletState(prev => ({
          ...prev,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to check wallet connection'
      }));
    }
  };

  // Get wallet balance
  const getBalance = async (address: string): Promise<string> => {
    try {
      const balance = await window.ethereum!.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      
      // Convert from wei to ETH
      const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
      return ethBalance.toFixed(4);
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0.0000';
    }
  };

  // Get network ID
  const getNetworkId = async (): Promise<number> => {
    try {
      const networkId = await window.ethereum!.request({
        method: 'net_version'
      });
      return parseInt(networkId, 10);
    } catch (error) {
      console.error('Error getting network ID:', error);
      return 1; // Default to mainnet
    }
  };

  // Setup event listeners
  const setupEventListeners = (): void => {
    if (!window.ethereum) return;
    
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);
  };

  // Remove event listeners
  const removeEventListeners = (): void => {
    if (!window.ethereum) return;
    
    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    window.ethereum.removeListener('chainChanged', handleChainChanged);
    window.ethereum.removeListener('disconnect', handleDisconnect);
  };

  // Handle account changes
  const handleAccountsChanged = useCallback(async (accounts: string[]): Promise<void> => {
    if (accounts.length === 0) {
      // User disconnected
      setWalletState({
        isConnected: false,
        address: null,
        balance: null,
        networkId: null,
        isLoading: false,
        error: null
      });
    } else {
      // Account changed
      const address = accounts[0];
      const balance = await getBalance(address);
      const networkId = await getNetworkId();
      
      setWalletState(prev => ({
        ...prev,
        address,
        balance,
        networkId
      }));
    }
  }, []);

  // Handle chain changes
  const handleChainChanged = useCallback(async (): Promise<void> => {
    // Reload the page when chain changes to avoid issues
    window.location.reload();
  }, []);

  // Handle disconnect
  const handleDisconnect = useCallback((): void => {
    setWalletState({
      isConnected: false,
      address: null,
      balance: null,
      networkId: null,
      isLoading: false,
      error: null
    });
  }, []);

  // Connect to MetaMask
  const connectMetaMask = async (): Promise<void> => {
    if (!window.ethereum) {
      setWalletState(prev => ({
        ...prev,
        error: 'MetaMask is not installed. Please install MetaMask to continue.'
      }));
      return;
    }

    try {
      setWalletState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts.length > 0) {
        const address = accounts[0];
        const balance = await getBalance(address);
        const networkId = await getNetworkId();
        
        setWalletState({
          isConnected: true,
          address,
          balance,
          networkId,
          isLoading: false,
          error: null
        });
        
        setShowWalletModal(false);
      }
    } catch (error: any) {
      console.error('Error connecting to MetaMask:', error);
      
      let errorMessage = 'Failed to connect to MetaMask';
      if (error.code === 4001) {
        errorMessage = 'Connection rejected by user';
      } else if (error.code === -32002) {
        errorMessage = 'Connection request already pending';
      }
      
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  };

  // Disconnect wallet
  const disconnectWallet = (): void => {
    setWalletState({
      isConnected: false,
      address: null,
      balance: null,
      networkId: null,
      isLoading: false,
      error: null
    });
    setShowAccountModal(false);
  };

  // Format address for display
  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get network name
  const getNetworkName = (networkId: number): string => {
    switch (networkId) {
      case 1: return 'Ethereum Mainnet';
      case 3: return 'Ropsten Testnet';
      case 4: return 'Rinkeby Testnet';
      case 5: return 'Goerli Testnet';
      case 42: return 'Kovan Testnet';
      case 137: return 'Polygon Mainnet';
      case 80001: return 'Polygon Mumbai';
      default: return `Network ${networkId}`;
    }
  };

  // Available wallet providers
  const walletProviders: WalletProvider[] = [
    {
      name: 'MetaMask',
      icon: '🦊',
      isInstalled: !!window.ethereum?.isMetaMask,
      connect: connectMetaMask,
      disconnect: disconnectWallet
    }
    // Add more wallets here (WalletConnect, Coinbase, etc.)
  ];

  const isLoading = walletState.isLoading || externalLoading;
  const error = walletState.error || externalError;

  return (
    <div className="wallet-connection">
      {/* Main Wallet Button */}
      {walletState.isConnected ? (
        <button 
          className="wallet-connected-btn"
          onClick={() => setShowAccountModal(true)}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="loading-spinner">⏳</span>
          ) : (
            <>
              <span className="wallet-icon">👤</span>
              <span className="wallet-address">{formatAddress(walletState.address!)}</span>
              <span className="connection-status">🟢</span>
            </>
          )}
        </button>
      ) : (
        <button 
          className="wallet-connect-btn"
          onClick={() => setShowWalletModal(true)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner">⏳</span>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <span className="wallet-icon">🔗</span>
              <span>Connect Wallet</span>
            </>
          )}
        </button>
      )}

      {/* Error Display */}
      {error && (
        <div className="wallet-error">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
        </div>
      )}

      {/* Wallet Selection Modal */}
      {showWalletModal && (
        <div className="wallet-modal-overlay" onClick={() => setShowWalletModal(false)}>
          <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Connect Your Wallet</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowWalletModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <p className="modal-description">
                Connect your wallet to start playing Virtual Building Empire and earn LUNC rewards!
              </p>
              
              <div className="wallet-providers">
                {walletProviders.map(provider => (
                  <button
                    key={provider.name}
                    className={`wallet-provider-btn ${!provider.isInstalled ? 'not-installed' : ''}`}
                    onClick={provider.isInstalled ? provider.connect : undefined}
                    disabled={!provider.isInstalled || isLoading}
                  >
                    <span className="provider-icon">{provider.icon}</span>
                    <span className="provider-name">{provider.name}</span>
                    {!provider.isInstalled && (
                      <span className="install-required">Install Required</span>
                    )}
                    {provider.isInstalled && (
                      <span className="connect-arrow">→</span>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="wallet-info">
                <h3>Why connect a wallet?</h3>
                <ul>
                  <li>🎮 Play the full Virtual Building Empire experience</li>
                  <li>💰 Earn and collect LUNC token rewards</li>
                  <li>🎆 Mint and trade unique NFT characters</li>
                  <li>🔒 Secure ownership of your digital assets</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Details Modal */}
      {showAccountModal && walletState.isConnected && (
        <div className="account-modal-overlay" onClick={() => setShowAccountModal(false)}>
          <div className="account-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Account Details</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowAccountModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="account-info">
                <div className="account-address">
                  <label>Wallet Address:</label>
                  <div className="address-display">
                    <span className="address">{walletState.address}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => {
                        if (walletState.address) {
                          navigator.clipboard.writeText(walletState.address);
                          alert('Address copied to clipboard!');
                        }
                      }}
                    >
                      📋
                    </button>
                  </div>
                </div>
                
                <div className="account-balance">
                  <label>ETH Balance:</label>
                  <span className="balance">{walletState.balance} ETH</span>
                </div>
                
                <div className="account-network">
                  <label>Network:</label>
                  <span className="network">
                    {walletState.networkId ? getNetworkName(walletState.networkId) : 'Unknown'}
                  </span>
                </div>
              </div>
              
              <div className="account-actions">
                <button 
                  className="refresh-btn"
                  onClick={checkConnection}
                  disabled={isLoading}
                >
                  🔄 Refresh
                </button>
                
                <button 
                  className="disconnect-btn"
                  onClick={disconnectWallet}
                >
                  🔗 Disconnect
                </button>
              </div>
              
              <div className="account-tips">
                <h3>Gaming Tips:</h3>
                <ul>
                  <li>🎯 Make sure you have enough ETH for transactions</li>
                  <li>🔒 Keep your wallet secure and never share your private keys</li>
                  <li>🚀 Join our Discord for the latest updates and events</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnection;