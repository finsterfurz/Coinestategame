import React, { useState, useEffect } from 'react';

const WalletConnection = ({ onConnectionChange }) => {
  // ===================================
  // 🔗 STATE MANAGEMENT
  // ===================================
  
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [walletType, setWalletType] = useState('');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // ===================================
  // 🎯 WALLET DETECTION & CONNECTION
  // ===================================

  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
  };

  const isWalletConnectAvailable = () => {
    // Prüfe ob WalletConnect verfügbar ist
    return typeof window !== 'undefined' && window.WalletConnect;
  };

  const isCoinbaseAvailable = () => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isCoinbaseWallet;
  };

  useEffect(() => {
    checkExistingConnection();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkExistingConnection = async () => {
    if (!isMetaMaskInstalled()) return;

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      });

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        setWalletType(detectWalletType());
        onConnectionChange?.(true, accounts[0]);
      }
    } catch (error) {
      console.error('Error checking existing connection:', error);
    }
  };

  const detectWalletType = () => {
    if (window.ethereum?.isMetaMask) return 'MetaMask';
    if (window.ethereum?.isCoinbaseWallet) return 'Coinbase';
    return 'Wallet';
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      handleDisconnect();
    } else {
      setWalletAddress(accounts[0]);
      onConnectionChange?.(true, accounts[0]);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  // ===================================
  // 🔌 CONNECTION FUNCTIONS
  // ===================================

  const connectWallet = async (walletProvider) => {
    setIsConnecting(true);
    setError('');

    try {
      let accounts = [];
      
      if (walletProvider === 'metamask') {
        if (!isMetaMaskInstalled()) {
          setError('MetaMask ist nicht installiert');
          return;
        }
        
        accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        setWalletType('MetaMask');
        
      } else if (walletProvider === 'walletconnect') {
        // WalletConnect Logic hier implementieren
        setError('WalletConnect wird bald verfügbar sein');
        return;
        
      } else if (walletProvider === 'coinbase') {
        if (!isCoinbaseAvailable()) {
          setError('Coinbase Wallet ist nicht installiert');
          return;
        }
        
        accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        setWalletType('Coinbase');
      }

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        onConnectionChange?.(true, accounts[0]);
        setShowWalletModal(false);
        
        await switchToCorrectNetwork();
      }
    } catch (error) {
      console.error('Connection error:', error);
      
      if (error.code === 4001) {
        setError('Verbindung wurde abgelehnt');
      } else {
        setError('Fehler beim Verbinden');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToCorrectNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }],
      });
    } catch (error) {
      console.error('Network switch error:', error);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress('');
    setWalletType('');
    setError('');
    setShowUserMenu(false);
    onConnectionChange?.(false, '');
  };

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Optional: Show toast notification
  };

  // ===================================
  // 🖼️ RENDER COMPONENT
  // ===================================

  return (
    <div className=\"wallet-connection\">
      
      {/* Connect Button - Subtil und dezent */}
      {!isConnected && (
        <button 
          className=\"connect-wallet-btn\"
          onClick={() => setShowWalletModal(true)}
        >
          <span className=\"wallet-icon\">👛</span>
          <span className=\"connect-text\">Wallet</span>
        </button>
      )}

      {/* Connected User Menu */}
      {isConnected && (
        <div className=\"connected-wallet\">
          <button 
            className=\"wallet-user-btn\"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className=\"wallet-info\">
              <span className=\"wallet-avatar\">🎮</span>
              <div className=\"wallet-details\">
                <span className=\"wallet-address\">{shortenAddress(walletAddress)}</span>
                <span className=\"wallet-type\">{walletType}</span>
              </div>
            </div>
            <span className=\"dropdown-arrow\">{showUserMenu ? '▲' : '▼'}</span>
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className=\"wallet-dropdown\">
              <div className=\"dropdown-section\">
                <div className=\"wallet-address-full\">
                  <span className=\"address-label\">Adresse</span>
                  <div className=\"address-container\">
                    <span className=\"address-text\" title={walletAddress}>
                      {shortenAddress(walletAddress)}
                    </span>
                    <button 
                      className=\"copy-btn\"
                      onClick={() => copyToClipboard(walletAddress)}
                      title=\"Kopieren\"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>

              <div className=\"dropdown-divider\"></div>

              <div className=\"dropdown-section\">
                <button className=\"dropdown-item\" onClick={() => setShowUserMenu(false)}>
                  <span className=\"item-icon\">👤</span>
                  <span className=\"item-text\">Profil</span>
                </button>
                
                <button className=\"dropdown-item\" onClick={() => setShowUserMenu(false)}>
                  <span className=\"item-icon\">🎯</span>
                  <span className=\"item-text\">Charaktere</span>
                </button>
                
                <button className=\"dropdown-item\" onClick={() => setShowUserMenu(false)}>
                  <span className=\"item-icon\">💰</span>
                  <span className=\"item-text\">LUNC Wallet</span>
                </button>
              </div>

              <div className=\"dropdown-divider\"></div>

              <div className=\"dropdown-section\">
                <button 
                  className=\"dropdown-item disconnect\"
                  onClick={handleDisconnect}
                >
                  <span className=\"item-icon\">🚪</span>
                  <span className=\"item-text\">Trennen</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Wallet Selection Modal - Weniger aufdringlich */}
      {showWalletModal && (
        <div className=\"wallet-modal-overlay\" onClick={() => setShowWalletModal(false)}>
          <div className=\"wallet-modal\" onClick={(e) => e.stopPropagation()}>
            
            <div className=\"modal-header\">
              <h3 className=\"modal-title\">Wallet verbinden</h3>
              <button 
                className=\"modal-close\"
                onClick={() => setShowWalletModal(false)}
              >
                ✕
              </button>
            </div>

            <div className=\"modal-content\">
              <p className=\"modal-description\">
                Wähle deine bevorzugte Wallet um mit Virtual Building Empire zu spielen
              </p>

              <div className=\"wallet-options\">
                
                {/* MetaMask Option */}
                <button 
                  className={`wallet-option ${!isMetaMaskInstalled() ? 'disabled' : ''}`}
                  onClick={() => connectWallet('metamask')}
                  disabled={isConnecting || !isMetaMaskInstalled()}
                >
                  <div className=\"wallet-option-content\">
                    <div className=\"wallet-icon-large\">🦊</div>
                    <div className=\"wallet-info\">
                      <span className=\"wallet-name\">MetaMask</span>
                      <span className=\"wallet-desc\">
                        {isMetaMaskInstalled() ? 'Browser Extension' : 'Nicht installiert'}
                      </span>
                    </div>
                  </div>
                  {!isMetaMaskInstalled() && (
                    <a 
                      href=\"https://metamask.io/download/\" 
                      target=\"_blank\" 
                      rel=\"noopener noreferrer\"
                      className=\"install-link\"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Installieren
                    </a>
                  )}
                </button>

                {/* WalletConnect Option */}
                <button 
                  className=\"wallet-option\"
                  onClick={() => connectWallet('walletconnect')}
                  disabled={isConnecting}
                >
                  <div className=\"wallet-option-content\">
                    <div className=\"wallet-icon-large\">🔗</div>
                    <div className=\"wallet-info\">
                      <span className=\"wallet-name\">WalletConnect</span>
                      <span className=\"wallet-desc\">Mobile Wallets</span>
                    </div>
                  </div>
                  <span className=\"coming-soon\">Bald verfügbar</span>
                </button>

                {/* Coinbase Option */}
                <button 
                  className={`wallet-option ${!isCoinbaseAvailable() ? 'disabled' : ''}`}
                  onClick={() => connectWallet('coinbase')}
                  disabled={isConnecting || !isCoinbaseAvailable()}
                >
                  <div className=\"wallet-option-content\">
                    <div className=\"wallet-icon-large\">🅲</div>
                    <div className=\"wallet-info\">
                      <span className=\"wallet-name\">Coinbase Wallet</span>
                      <span className=\"wallet-desc\">
                        {isCoinbaseAvailable() ? 'Browser Extension' : 'Nicht installiert'}
                      </span>
                    </div>
                  </div>
                </button>

              </div>

              {/* Error Message */}
              {error && (
                <div className=\"wallet-error\">
                  <span className=\"error-icon\">⚠️</span>
                  <span className=\"error-text\">{error}</span>
                </div>
              )}

              {/* Loading State */}
              {isConnecting && (
                <div className=\"wallet-connecting\">
                  <span className=\"loading-icon\">⏳</span>
                  <span className=\"loading-text\">Verbinde Wallet...</span>
                </div>
              )}

              <div className=\"modal-footer\">
                <p className=\"modal-disclaimer\">
                  Durch das Verbinden deiner Wallet stimmst du unseren 
                  <a href=\"#terms\" className=\"terms-link\"> Nutzungsbedingungen</a> zu.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnection;