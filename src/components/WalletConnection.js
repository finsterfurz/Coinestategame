import React, { useState, useEffect } from 'react';

const WalletConnection = ({ onConnectionChange }) => {
  // ===================================
  // 🔗 WALLET CONNECTION STATE
  // ===================================
  
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [walletType, setWalletType] = useState('');

  // ===================================
  // 🎯 WALLET DETECTION & CONNECTION
  // ===================================

  // Prüfe ob MetaMask installiert ist
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
  };

  // Prüfe bestehende Verbindung beim Laden
  useEffect(() => {
    checkExistingConnection();
    
    // Listen für Account-Änderungen
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

  // Prüfe ob bereits verbunden
  const checkExistingConnection = async () => {
    if (!isMetaMaskInstalled()) return;

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      });

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        setWalletType('MetaMask');
        onConnectionChange?.(true, accounts[0]);
      }
    } catch (error) {
      console.error('Error checking existing connection:', error);
    }
  };

  // Handle Account-Änderungen
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User hat Wallet disconnected
      handleDisconnect();
    } else {
      // Account gewechselt
      setWalletAddress(accounts[0]);
      onConnectionChange?.(true, accounts[0]);
    }
  };

  // Handle Chain-Änderungen
  const handleChainChanged = () => {
    // Page reload bei Chain-Änderung (empfohlene Praxis)
    window.location.reload();
  };

  // ===================================
  // 🔌 CONNECTION FUNCTIONS
  // ===================================

  // MetaMask Verbindung
  const connectMetaMask = async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask ist nicht installiert!');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      // Request Account Zugriff
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        setWalletType('MetaMask');
        onConnectionChange?.(true, accounts[0]);
        
        // Optional: Switch zu richtigem Network
        await switchToCorrectNetwork();
      }
    } catch (error) {
      console.error('Connection error:', error);
      
      if (error.code === 4001) {
        setError('Verbindung vom User abgelehnt');
      } else {
        setError('Fehler beim Verbinden mit MetaMask');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Network zu Ethereum Mainnet wechseln (oder gewünschtes Network)
  const switchToCorrectNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }], // Ethereum Mainnet
      });
    } catch (error) {
      console.error('Network switch error:', error);
      // Ignoriere Network-Fehler, da nicht kritisch für Demo
    }
  };

  // Wallet disconnecten
  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress('');
    setWalletType('');
    setError('');
    onConnectionChange?.(false, '');
  };

  // ===================================
  // 🎨 UTILITY FUNCTIONS
  // ===================================

  // Adresse kürzen für Anzeige
  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // ===================================
  // 🖼️ RENDER COMPONENT
  // ===================================

  return (
    <div className="wallet-connection">
      
      {/* Nicht verbunden - Buttons anzeigen */}
      {!isConnected && (
        <div className="wallet-connect-options">
          
          {/* MetaMask Connection Button */}
          <button 
            className={`wallet-button metamask ${isConnecting ? 'connecting' : ''}`}
            onClick={connectMetaMask}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <span className="loading-spinner">⏳</span>
                Verbinde...
              </>
            ) : (
              <>
                🦊 <span>MetaMask verbinden</span>
              </>
            )}
          </button>

          {/* Install MetaMask Link */}
          {!isMetaMaskInstalled() && (
            <a 
              href="https://metamask.io/download/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="install-wallet-link"
            >
              📥 MetaMask installieren
            </a>
          )}

          {/* Error Message */}
          {error && (
            <div className="wallet-error">
              ⚠️ {error}
            </div>
          )}

          {/* Info Text */}
          <p className="wallet-info">
            💡 Verbinde deine Wallet um Charaktere zu sammeln und LUNC zu verdienen!
          </p>
        </div>
      )}

      {/* Verbunden - Wallet Info anzeigen */}
      {isConnected && (
        <div className="wallet-connected">
          
          {/* Wallet Status */}
          <div className="wallet-status">
            <div className="wallet-indicator">
              <span className="status-dot connected">🟢</span>
              <span className="wallet-type">{walletType}</span>
            </div>
            
            <div className="wallet-address">
              <span className="address-label">Adresse:</span>
              <span className="address-value" title={walletAddress}>
                {shortenAddress(walletAddress)}
              </span>
              
              {/* Copy Address Button */}
              <button 
                className="copy-address-btn"
                onClick={() => {
                  navigator.clipboard.writeText(walletAddress);
                  // Optional: Toast notification
                }}
                title="Adresse kopieren"
              >
                📋
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="wallet-actions">
            <button className="wallet-action mint">
              🎯 Charakter minten
            </button>
            
            <button className="wallet-action marketplace">
              🛒 Zum Marktplatz
            </button>
            
            <button 
              className="wallet-action disconnect"
              onClick={handleDisconnect}
              title="Wallet trennen"
            >
              🔌 Trennen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnection;