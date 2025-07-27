import React, { createContext, useContext, useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

// Enhanced Web3 types for better TypeScript support
export interface Web3Provider {
  request: (request: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
  isConnected?: () => boolean;
}

export interface Web3ContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  account: string | null;
  chainId: number | null;
  provider: Web3Provider | null;
  
  // Supported networks
  supportedNetworks: SupportedNetwork[];
  currentNetwork: SupportedNetwork | null;
  
  // Connection methods
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
  
  // Wallet state
  balance: string;
  isCorrectNetwork: boolean;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

export interface SupportedNetwork {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  testnet?: boolean;
}

// Supported networks configuration
const SUPPORTED_NETWORKS: SupportedNetwork[] = [
  {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    chainId: 5,
    name: 'Goerli Testnet',
    rpcUrl: 'https://goerli.infura.io/v3/YOUR_INFURA_KEY',
    blockExplorer: 'https://goerli.etherscan.io',
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'gETH',
      decimals: 18,
    },
    testnet: true,
  },
  {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  {
    chainId: 80001,
    name: 'Polygon Mumbai',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    blockExplorer: 'https://mumbai.polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    testnet: true,
  },
];

const Web3Context = createContext<Web3ContextType | null>(null);

export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: React.ReactNode;
  defaultChainId?: number;
  autoConnect?: boolean;
}

export const EnhancedWeb3Provider: React.FC<Web3ProviderProps> = ({
  children,
  defaultChainId = 1, // Ethereum mainnet
  autoConnect = true,
}) => {
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<Web3Provider | null>(null);
  const [balance, setBalance] = useState('0');
  const [error, setError] = useState<string | null>(null);

  // Game store integration
  const { connectWallet, disconnectWallet, addNotification } = useGameStore();

  // Computed values
  const supportedNetworks = SUPPORTED_NETWORKS;
  const currentNetwork = supportedNetworks.find(network => network.chainId === chainId) || null;
  const isCorrectNetwork = chainId === defaultChainId;

  // Initialize Web3 provider detection
  useEffect(() => {
    const initializeProvider = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        const web3Provider = window.ethereum as Web3Provider;
        setProvider(web3Provider);

        // Set up event listeners
        web3Provider.on('accountsChanged', handleAccountsChanged);
        web3Provider.on('chainChanged', handleChainChanged);
        web3Provider.on('disconnect', handleDisconnect);

        // Auto-connect if previously connected
        if (autoConnect) {
          try {
            const accounts = await web3Provider.request({
              method: 'eth_accounts',
            });
            
            if (accounts.length > 0) {
              await connect();
            }
          } catch (error) {
            console.error('Auto-connect failed:', error);
          }
        }
      } else {
        setError('MetaMask or compatible wallet not detected');
      }
    };

    initializeProvider();

    // Cleanup event listeners
    return () => {
      if (provider) {
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('chainChanged', handleChainChanged);
        provider.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  // Event handlers
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      handleDisconnect();
    } else {
      setAccount(accounts[0]);
      updateBalance(accounts[0]);
    }
  };

  const handleChainChanged = (chainIdHex: string) => {
    const newChainId = parseInt(chainIdHex, 16);
    setChainId(newChainId);
    
    const network = supportedNetworks.find(n => n.chainId === newChainId);
    if (network) {
      addNotification({
        type: 'info',
        title: 'Netzwerk gewechselt',
        message: `Verbunden mit ${network.name}`,
        read: false,
      });
    } else {
      addNotification({
        type: 'warning',
        title: 'Nicht unterstütztes Netzwerk',
        message: 'Bitte wechsle zu einem unterstützten Netzwerk.',
        read: false,
      });
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAccount(null);
    setChainId(null);
    setBalance('0');
    disconnectWallet();
    
    addNotification({
      type: 'info',
      title: 'Wallet getrennt',
      message: 'Deine Wallet wurde erfolgreich getrennt.',
      read: false,
    });
  };

  // Connection methods
  const connect = async (): Promise<void> => {
    if (!provider) {
      throw new Error('No wallet provider found');
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request account access
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts returned from wallet');
      }

      // Get chain ID
      const chainIdHex = await provider.request({
        method: 'eth_chainId',
      });
      const currentChainId = parseInt(chainIdHex, 16);

      // Update state
      setAccount(accounts[0]);
      setChainId(currentChainId);
      setIsConnected(true);

      // Update game store
      connectWallet(accounts[0], currentChainId);

      // Update balance
      await updateBalance(accounts[0]);

      // Check if on correct network
      if (currentChainId !== defaultChainId) {
        addNotification({
          type: 'warning',
          title: 'Falsches Netzwerk',
          message: 'Bitte wechsle zum korrekten Netzwerk für das Spiel.',
          read: false,
          action: {
            label: 'Netzwerk wechseln',
            callback: () => switchNetwork(defaultChainId),
          },
        });
      } else {
        addNotification({
          type: 'success',
          title: 'Wallet verbunden',
          message: `Erfolgreich verbunden mit ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
          read: false,
        });
      }
    } catch (error: any) {
      console.error('Connection failed:', error);
      setError(error.message || 'Failed to connect wallet');
      
      addNotification({
        type: 'error',
        title: 'Verbindung fehlgeschlagen',
        message: error.message || 'Wallet-Verbindung konnte nicht hergestellt werden.',
        read: false,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async (): Promise<void> => {
    handleDisconnect();
  };

  const switchNetwork = async (targetChainId: number): Promise<void> => {
    if (!provider) {
      throw new Error('No wallet provider found');
    }

    const targetNetwork = supportedNetworks.find(n => n.chainId === targetChainId);
    if (!targetNetwork) {
      throw new Error('Unsupported network');
    }

    try {
      // Try to switch to the target network
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${targetChainId.toString(16)}`,
                chainName: targetNetwork.name,
                rpcUrls: [targetNetwork.rpcUrl],
                blockExplorerUrls: [targetNetwork.blockExplorer],
                nativeCurrency: targetNetwork.nativeCurrency,
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add network:', addError);
          throw addError;
        }
      } else {
        console.error('Failed to switch network:', switchError);
        throw switchError;
      }
    }
  };

  // Utility methods
  const updateBalance = async (accountAddress: string) => {
    if (!provider) return;

    try {
      const balanceHex = await provider.request({
        method: 'eth_getBalance',
        params: [accountAddress, 'latest'],
      });
      
      // Convert from wei to ether
      const balanceWei = parseInt(balanceHex, 16);
      const balanceEth = (balanceWei / Math.pow(10, 18)).toFixed(4);
      setBalance(balanceEth);
    } catch (error) {
      console.error('Failed to update balance:', error);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Context value
  const contextValue: Web3ContextType = {
    // Connection state
    isConnected,
    isConnecting,
    account,
    chainId,
    provider,
    
    // Network info
    supportedNetworks,
    currentNetwork,
    
    // Methods
    connect,
    disconnect,
    switchNetwork,
    
    // Wallet state
    balance,
    isCorrectNetwork,
    
    // Error handling
    error,
    clearError,
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
};

// Utility hooks for specific Web3 operations
export const useWalletConnection = () => {
  const { isConnected, isConnecting, connect, disconnect, error } = useWeb3();
  return { isConnected, isConnecting, connect, disconnect, error };
};

export const useNetworkInfo = () => {
  const { currentNetwork, isCorrectNetwork, switchNetwork, supportedNetworks } = useWeb3();
  return { currentNetwork, isCorrectNetwork, switchNetwork, supportedNetworks };
};

export const useAccountInfo = () => {
  const { account, balance, chainId } = useWeb3();
  return { account, balance, chainId };
};

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      on: (eventName: string, handler: (...args: any[]) => void) => void;
      removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
      isConnected?: () => boolean;
    };
  }
}