// ===================================
// 🔗 WEB3 CONNECTION HOOK
// ===================================

import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect, useNetwork, useBalance } from 'wagmi';
import { useGameStore } from '@/stores/gameStore';
import type { WalletState } from '@/types/game.types';

interface UseWeb3ConnectionReturn {
  isConnected: boolean;
  address?: string;
  chainId?: number;
  balance?: string;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
}

/**
 * Hook for managing Web3 wallet connections
 */
export const useWeb3Connection = (): UseWeb3ConnectionReturn => {
  const [error, setError] = useState<string | null>(null);
  
  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { connect: wagmiConnect, connectors, isLoading: connectLoading } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { chain } = useNetwork();
  const { data: balanceData } = useBalance({ address });
  
  // Game store
  const { updateWalletState, addNotification } = useGameStore();
  
  // Update store when wallet state changes
  useEffect(() => {
    const walletState: WalletState = {
      isConnected: isConnected || false,
      address: address || undefined,
      chainId: chain?.id || undefined,
      balance: balanceData?.formatted || undefined,
      ensName: undefined // Could be added with ENS resolution
    };
    
    updateWalletState(walletState);
  }, [isConnected, address, chain, balanceData, updateWalletState]);
  
  // Connection function
  const connect = async (): Promise<void> => {
    try {
      setError(null);
      
      if (connectors.length === 0) {
        throw new Error('No wallet connectors available');
      }
      
      // Use the first available connector (usually MetaMask)
      const connector = connectors[0];
      await wagmiConnect({ connector });
      
      addNotification({
        type: 'success',
        title: '🎉 Wallet Connected!',
        message: 'Successfully connected to your Web3 wallet.'
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      
      addNotification({
        type: 'error',
        title: '❌ Connection Failed',
        message: errorMessage
      });
    }
  };
  
  // Disconnect function
  const disconnect = (): void => {
    try {
      wagmiDisconnect();
      setError(null);
      
      addNotification({
        type: 'info',
        title: '👋 Wallet Disconnected',
        message: 'Your wallet has been disconnected.'
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect wallet';
      setError(errorMessage);
    }
  };
  
  // Switch network function
  const switchNetwork = async (chainId: number): Promise<void> => {
    try {
      setError(null);
      
      if (!window.ethereum) {
        throw new Error('No Ethereum provider found');
      }
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      
      addNotification({
        type: 'success',
        title: '🔄 Network Switched',
        message: `Successfully switched to network ${chainId}.`
      });
      
    } catch (err: any) {
      // If the chain hasn't been added to MetaMask
      if (err.code === 4902) {
        addNotification({
          type: 'warning',
          title: '⚠️ Network Not Found',
          message: 'Please add this network to your wallet first.'
        });
      } else {
        const errorMessage = err.message || 'Failed to switch network';
        setError(errorMessage);
        
        addNotification({
          type: 'error',
          title: '❌ Network Switch Failed',
          message: errorMessage
        });
      }
    }
  };
  
  return {
    isConnected: isConnected || false,
    address,
    chainId: chain?.id,
    balance: balanceData?.formatted,
    isLoading: connectLoading,
    error,
    connect,
    disconnect,
    switchNetwork
  };
};

export default useWeb3Connection;