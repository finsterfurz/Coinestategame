import { useState, useEffect, useCallback } from 'react';
import { isValidWalletAddress } from '../utils/gameHelpers';

// ===================================
// 🔗 WEB3 CONNECTION HOOK
// ===================================

const useWeb3Connection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null);
  const [chainId, setChainId] = useState(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!isMetaMaskInstalled()) {
        return;
      }

      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          
          // Get chain ID
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          setChainId(parseInt(chainId, 16));
        }
      } catch (error) {
        console.warn('Error checking MetaMask connection:', error);
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        setError(null);
      } else {
        setAccount(null);
        setIsConnected(false);
      }
    };

    const handleChainChanged = (chainId) => {
      setChainId(parseInt(chainId, 16));
      // Reload page on chain change as recommended by MetaMask
      window.location.reload();
    };

    const handleDisconnect = () => {
      setAccount(null);
      setIsConnected(false);
      setProvider(null);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  // Connect wallet
  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask ist nicht installiert. Bitte installiere MetaMask um fortzufahren.');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        const account = accounts[0];
        
        if (!isValidWalletAddress(account)) {
          throw new Error('Ungültige Wallet-Adresse erhalten');
        }

        setAccount(account);
        setIsConnected(true);
        
        // Get chain ID
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(parseInt(chainId, 16));
        
        return true;
      } else {
        throw new Error('Keine Konten verfügbar');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      
      if (error.code === 4001) {
        setError('Wallet-Verbindung vom Benutzer abgelehnt');
      } else if (error.code === -32002) {
        setError('Wallet-Verbindung bereits ausstehend. Bitte prüfe MetaMask.');
      } else {
        setError(error.message || 'Fehler beim Verbinden der Wallet');
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setProvider(null);
    setError(null);
  }, []);

  // Switch network
  const switchNetwork = useCallback(async (targetChainId) => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask ist nicht installiert');
      return false;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }]
      });
      
      setChainId(targetChainId);
      return true;
    } catch (error) {
      console.error('Error switching network:', error);
      setError(`Fehler beim Wechseln des Netzwerks: ${error.message}`);
      return false;
    }
  }, []);

  // Get balance
  const getBalance = useCallback(async () => {
    if (!isConnected || !account) {
      return null;
    }

    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [account, 'latest']
      });
      
      // Convert from wei to ether
      return parseFloat(parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
    } catch (error) {
      console.error('Error getting balance:', error);
      return null;
    }
  }, [isConnected, account]);

  // Format account address
  const formatAddress = useCallback((address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  return {
    isConnected,
    account,
    isLoading,
    error,
    provider,
    chainId,
    isMetaMaskInstalled: isMetaMaskInstalled(),
    connect,
    disconnect,
    switchNetwork,
    getBalance,
    formatAddress
  };
};

export default useWeb3Connection;