import { useContract, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';

// Contract ABIs (these should be imported from actual ABI files)
const CharacterNFTAbi = [
  'function mintCharacter() external payable',
  'function getMintPrice() external view returns (uint256)',
  'function balanceOf(address owner) external view returns (uint256)',
  'function getCharactersByOwner(address owner) external view returns (tuple(uint256 id, string name, uint8 rarity, uint256 level, uint256 dailyEarnings)[])',
  'event CharacterMinted(address indexed owner, uint256 indexed tokenId, uint8 rarity)'
];

const LuncTokenAbi = [
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)'
];

const MarketplaceAbi = [
  'function listCharacter(uint256 tokenId, uint256 price) external',
  'function buyCharacter(uint256 listingId) external payable',
  'function getActiveListings() external view returns (tuple(uint256 id, uint256 tokenId, uint256 price, address seller)[])',
  'event CharacterListed(uint256 indexed listingId, uint256 indexed tokenId, uint256 price, address indexed seller)',
  'event CharacterSold(uint256 indexed listingId, uint256 indexed tokenId, uint256 price, address indexed buyer)'
];

const CONTRACT_ADDRESSES = {
  CHARACTER_NFT: process.env.REACT_APP_CHARACTER_NFT_ADDRESS || '0x0000000000000000000000000000000000000000',
  LUNC_TOKEN: process.env.REACT_APP_LUNC_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
  MARKETPLACE: process.env.REACT_APP_MARKETPLACE_ADDRESS || '0x0000000000000000000000000000000000000000',
} as const;

export const useGameContracts = () => {
  // Character NFT Contract
  const { data: characterContract } = useContract({
    address: CONTRACT_ADDRESSES.CHARACTER_NFT,
    abi: CharacterNFTAbi,
  });

  // LUNC Token Contract
  const { data: luncContract } = useContract({
    address: CONTRACT_ADDRESSES.LUNC_TOKEN,
    abi: LuncTokenAbi,
  });

  // Marketplace Contract
  const { data: marketplaceContract } = useContract({
    address: CONTRACT_ADDRESSES.MARKETPLACE,
    abi: MarketplaceAbi,
  });

  return {
    characterContract,
    luncContract,
    marketplaceContract,
    addresses: CONTRACT_ADDRESSES,
  };
};

// Character minting hook
export const useCharacterMinting = () => {
  const { characterContract } = useGameContracts();

  // Get minting price
  const { data: mintPrice, isLoading: isPriceLoading } = useContractRead({
    address: CONTRACT_ADDRESSES.CHARACTER_NFT,
    abi: CharacterNFTAbi,
    functionName: 'getMintPrice',
    watch: true,
  });

  // Prepare mint transaction
  const { config: mintConfig, error: prepareError } = usePrepareContractWrite({
    address: CONTRACT_ADDRESSES.CHARACTER_NFT,
    abi: CharacterNFTAbi,
    functionName: 'mintCharacter',
    value: mintPrice,
    enabled: !!mintPrice,
  });

  // Execute mint
  const {
    data: mintData,
    write: mintCharacter,
    isLoading: isMinting,
    error: mintError,
  } = useContractWrite(mintConfig);

  return {
    mintPrice: mintPrice ? ethers.formatEther(mintPrice) : '0',
    isPriceLoading,
    mintCharacter,
    isMinting,
    mintData,
    error: prepareError || mintError,
  };
};

// LUNC balance hook
export const useLuncBalance = (address?: string) => {
  const { data: balance, isLoading } = useContractRead({
    address: CONTRACT_ADDRESSES.LUNC_TOKEN,
    abi: LuncTokenAbi,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address,
    watch: true,
  });

  return {
    balance: balance ? ethers.formatEther(balance) : '0',
    rawBalance: balance,
    isLoading,
  };
};

// Character collection hook
export const useCharacterCollection = (address?: string) => {
  // Get user's character count
  const { data: characterCount } = useContractRead({
    address: CONTRACT_ADDRESSES.CHARACTER_NFT,
    abi: CharacterNFTAbi,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address,
    watch: true,
  });

  // Get characters owned by user
  const { data: characters, isLoading } = useContractRead({
    address: CONTRACT_ADDRESSES.CHARACTER_NFT,
    abi: CharacterNFTAbi,
    functionName: 'getCharactersByOwner',
    args: [address],
    enabled: !!address && !!characterCount,
    watch: true,
  });

  return {
    characterCount: characterCount ? Number(characterCount) : 0,
    characters: characters || [],
    isLoading,
  };
};

// Marketplace hooks
export const useMarketplace = () => {
  // Get listed characters
  const { data: listedCharacters, isLoading: isLoadingListings } = useContractRead({
    address: CONTRACT_ADDRESSES.MARKETPLACE,
    abi: MarketplaceAbi,
    functionName: 'getActiveListings',
    watch: true,
  });

  // List character for sale
  const { config: listConfig } = usePrepareContractWrite({
    address: CONTRACT_ADDRESSES.MARKETPLACE,
    abi: MarketplaceAbi,
    functionName: 'listCharacter',
  });

  const { write: listCharacter, isLoading: isListing } = useContractWrite(listConfig);

  // Buy character
  const { config: buyConfig } = usePrepareContractWrite({
    address: CONTRACT_ADDRESSES.MARKETPLACE,
    abi: MarketplaceAbi,
    functionName: 'buyCharacter',
  });

  const { write: buyCharacter, isLoading: isBuying } = useContractWrite(buyConfig);

  return {
    listedCharacters: listedCharacters || [],
    isLoadingListings,
    listCharacter,
    isListing,
    buyCharacter,
    isBuying,
  };
};

// Enhanced error handling hook
export const useContractError = () => {
  const handleError = (error: any) => {
    console.error('Contract error:', error);
    
    if (error?.reason) {
      toast.error(`Contract Error: ${error.reason}`);
    } else if (error?.message?.includes('user rejected')) {
      toast.error('Transaction rejected by user');
    } else if (error?.message?.includes('insufficient funds')) {
      toast.error('Insufficient funds for transaction');
    } else {
      toast.error('Transaction failed. Please try again.');
    }
  };

  return { handleError };
};

// Transaction monitoring hook
export const useTransactionMonitor = () => {
  const monitorTransaction = async (hash: string, description: string) => {
    try {
      toast.loading(`${description}...`, { id: hash });
      
      // In a real implementation, you'd wait for the transaction
      // const receipt = await waitForTransaction({ hash });
      
      setTimeout(() => {
        toast.success(`${description} completed!`, { id: hash });
      }, 3000);
      
    } catch (error) {
      toast.error(`${description} failed!`, { id: hash });
      throw error;
    }
  };

  return { monitorTransaction };
};