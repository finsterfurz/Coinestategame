// ===================================
// 🔗 WEB3 CONFIGURATION
// ===================================

import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { mainnet, goerli, sepolia, polygon, polygonMumbai, bsc, bscTestnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { infuraProvider } from 'wagmi/providers/infura';

// ===================================
// 🌐 CHAIN CONFIGURATION
// ===================================

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet,
    polygon,
    bsc,
    ...(process.env.NODE_ENV === 'development' ? [goerli, sepolia, polygonMumbai, bscTestnet] : [])
  ],
  [
    // Use Alchemy if API key is available
    ...(process.env.REACT_APP_ALCHEMY_API_KEY
      ? [alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_API_KEY })]
      : []),
    
    // Use Infura if API key is available
    ...(process.env.REACT_APP_INFURA_API_KEY
      ? [infuraProvider({ apiKey: process.env.REACT_APP_INFURA_API_KEY })]
      : []),
    
    // Fallback to public providers
    publicProvider()
  ]
);

// ===================================
// 👛 WALLET CONFIGURATION
// ===================================

const { connectors } = getDefaultWallets({
  appName: 'Virtual Building Empire',
  projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || 'default-project-id',
  chains
});

// ===================================
// ⚙️ WAGMI CONFIGURATION
// ===================================

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient
});

// ===================================
// 📝 CONTRACT ADDRESSES
// ===================================

export const contractAddresses = {
  // Mainnet addresses
  [mainnet.id]: {
    characterNFT: process.env.REACT_APP_CHARACTER_CONTRACT_MAINNET || '',
    luncToken: process.env.REACT_APP_LUNC_TOKEN_MAINNET || '',
    marketplace: process.env.REACT_APP_MARKETPLACE_CONTRACT_MAINNET || '',
    buildingManager: process.env.REACT_APP_BUILDING_MANAGER_MAINNET || ''
  },
  
  // Polygon addresses
  [polygon.id]: {
    characterNFT: process.env.REACT_APP_CHARACTER_CONTRACT_POLYGON || '',
    luncToken: process.env.REACT_APP_LUNC_TOKEN_POLYGON || '',
    marketplace: process.env.REACT_APP_MARKETPLACE_CONTRACT_POLYGON || '',
    buildingManager: process.env.REACT_APP_BUILDING_MANAGER_POLYGON || ''
  },
  
  // BSC addresses
  [bsc.id]: {
    characterNFT: process.env.REACT_APP_CHARACTER_CONTRACT_BSC || '',
    luncToken: process.env.REACT_APP_LUNC_TOKEN_BSC || '',
    marketplace: process.env.REACT_APP_MARKETPLACE_CONTRACT_BSC || '',
    buildingManager: process.env.REACT_APP_BUILDING_MANAGER_BSC || ''
  },
  
  // Testnet addresses
  [goerli.id]: {
    characterNFT: process.env.REACT_APP_CHARACTER_CONTRACT_GOERLI || '',
    luncToken: process.env.REACT_APP_LUNC_TOKEN_GOERLI || '',
    marketplace: process.env.REACT_APP_MARKETPLACE_CONTRACT_GOERLI || '',
    buildingManager: process.env.REACT_APP_BUILDING_MANAGER_GOERLI || ''
  }
} as const;

// ===================================
// 🎯 UTILITY FUNCTIONS
// ===================================

/**
 * Get contract address for current chain
 */
export const getContractAddress = (
  chainId: number,
  contractName: keyof typeof contractAddresses[number]
): string => {
  return contractAddresses[chainId]?.[contractName] || '';
};

/**
 * Check if chain is supported
 */
export const isSupportedChain = (chainId: number): boolean => {
  return chainId in contractAddresses;
};

/**
 * Get chain display name
 */
export const getChainName = (chainId: number): string => {
  const chain = chains.find(c => c.id === chainId);
  return chain?.name || `Chain ${chainId}`;
};

export default wagmiConfig;