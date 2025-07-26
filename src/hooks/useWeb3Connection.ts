import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';

interface UseWeb3ConnectionReturn {
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchChain: (chainId: number) => Promise<void>;
  sendTransaction: (transaction: any) => Promise<any>;
  error: string | null;
}

export const useWeb3Connection = (): UseWeb3ConnectionReturn => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum;
  };

  // Initialize provider and check connection
  useEffect(() => {
    const init = async () => {
      if (!isMetaMaskInstalled()) {
        setError('MetaMask not detected. Please install MetaMask to continue.');
        return;
      }

      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        // Check if already connected
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          setSigner(provider.getSigner());
          
          const network = await provider.getNetwork();
          setChainId(network.chainId);
        }
      } catch (err: any) {
        console.error('Web3 initialization error:', err);
        setError(err.message);
      }
    };

    init();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAccount(accounts[0]);
        setIsConnected(true);
        if (provider) {
          setSigner(provider.getSigner());
        }
      }
    };

    const handleChainChanged = (chainId: string) => {
      setChainId(parseInt(chainId, 16));
      // Reload the page to reset state
      window.location.reload();
    };

    const handleDisconnect = () => {
      disconnect();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [provider]);

  const connect = async (): Promise<void> => {
    if (!isMetaMaskInstalled()) {
      const installUrl = 'https://metamask.io/download/';
      window.open(installUrl, '_blank');
      toast.error('Please install MetaMask first');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      
      const signer = provider.getSigner();
      setSigner(signer);
      
      const address = await signer.getAddress();
      setAccount(address);
      
      const network = await provider.getNetwork();
      setChainId(network.chainId);
      
      setIsConnected(true);
      toast.success('Wallet connected successfully!');
    } catch (err: any) {
      console.error('Connection error:', err);
      setError(err.message);
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = (): void => {
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    setProvider(null);
    setSigner(null);
    setError(null);
    toast.success('Wallet disconnected');
  };

  const switchChain = async (targetChainId: number): Promise<void> => {
    if (!isMetaMaskInstalled()) {
      toast.error('MetaMask not detected');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          // Add the chain to MetaMask
          const chainData = getChainData(targetChainId);
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [chainData],
          });
        } catch (addError: any) {
          console.error('Error adding chain:', addError);
          toast.error('Failed to add network to MetaMask');
        }
      } else {
        console.error('Error switching chain:', switchError);
        toast.error('Failed to switch network');
      }
    }
  };

  const sendTransaction = async (transaction: any): Promise<any> => {
    if (!signer) {
      throw new Error('No signer available');
    }

    try {
      const tx = await signer.sendTransaction(transaction);
      toast.success('Transaction sent! Waiting for confirmation...');
      
      const receipt = await tx.wait();
      toast.success('Transaction confirmed!');
      
      return {
        hash: receipt.transactionHash,
        from: receipt.from,
        to: receipt.to,
        value: transaction.value || '0',
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: tx.gasPrice?.toString() || '0',
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        timestamp: new Date(),
      };
    } catch (err: any) {
      console.error('Transaction error:', err);
      toast.error('Transaction failed');
      throw err;
    }
  };

  return {
    account,
    chainId,
    isConnected,
    isConnecting,
    provider,
    signer,
    connect,
    disconnect,
    switchChain,
    sendTransaction,
    error,
  };
};

// Helper function to get chain data for adding to MetaMask
const getChainData = (chainId: number) => {
  const chains: Record<number, any> = {
    1: {
      chainId: '0x1',
      chainName: 'Ethereum Mainnet',
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_KEY'],
      blockExplorerUrls: ['https://etherscan.io'],
    },
    137: {
      chainId: '0x89',
      chainName: 'Polygon Mainnet',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
      rpcUrls: ['https://polygon-rpc.com/'],
      blockExplorerUrls: ['https://polygonscan.com/'],
    },
    56: {
      chainId: '0x38',
      chainName: 'Binance Smart Chain',
      nativeCurrency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18,
      },
      rpcUrls: ['https://bsc-dataseed.binance.org/'],
      blockExplorerUrls: ['https://bscscan.com/'],
    },
    5: {
      chainId: '0x5',
      chainName: 'Goerli Test Network',
      nativeCurrency: {
        name: 'Goerli ETH',
        symbol: 'gETH',
        decimals: 18,
      },
      rpcUrls: ['https://goerli.infura.io/v3/YOUR_INFURA_KEY'],
      blockExplorerUrls: ['https://goerli.etherscan.io'],
    },
  };

  return chains[chainId] || chains[1]; // Default to Ethereum mainnet
};
