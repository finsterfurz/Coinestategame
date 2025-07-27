// ===================================
// 🎯 GLOBAL TYPE DEFINITIONS
// ===================================

export interface Character {
  id: number | string;
  name: string;
  type: CharacterType;
  job: string;
  level: number;
  happiness: number;
  working: boolean;
  department: string;
  mintedAt: string;
  dailyEarnings?: number;
}

export type CharacterType = 'common' | 'rare' | 'legendary';

export interface FamilyData {
  characters: Character[];
  totalLunc: number;
  familySize: number;
  dailyEarnings: number;
}

export interface BuildingData {
  totalEmployees: number;
  availableJobs: number;
  buildingEfficiency: number;
  dailyLuncPool: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  autoCollectLunc: boolean;
  darkMode: boolean;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  networkId: number | null;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationData {
  count?: number;
  bonus?: number;
  character?: string;
  job?: string;
  amount?: number;
  level?: number;
  price?: number;
}

export type NotificationType = 
  | 'mint_success' 
  | 'job_assigned' 
  | 'lunc_earned' 
  | 'level_up' 
  | 'marketplace_buy' 
  | 'marketplace_sell';

export interface GameConstants {
  MINT_COSTS: Record<CharacterType, number>;
  RARITY_CHANCES: Record<CharacterType, number>;
  MAX_FAMILY_SIZE: number;
  BUILDING_FLOORS: number;
  DAILY_LUNC_COLLECTION_HOUR: number;
}

// ===================================
// 🎮 COMPONENT PROP INTERFACES
// ===================================

export interface AppProps {
  // Main App component props can be defined here if needed
}

export interface HomepageProps {
  familyData: FamilyData;
  buildingData: BuildingData;
  userConnected: boolean;
  walletAddress?: string;
}

export interface FamilyManagementProps {
  familyData: FamilyData;
  setFamilyData: (data: FamilyData) => void;
  userConnected: boolean;
  onJobAssign?: (character: string, job: string) => void;
}

export interface BuildingOverviewProps {
  buildingData: BuildingData;
  setBuildingData: (data: BuildingData) => void;
  familyCharacters: Character[];
}

export interface JobAssignmentProps {
  characters: Character[];
  setFamilyData: (data: FamilyData) => void;
  buildingData: BuildingData;
  onJobAssign?: (character: string, job: string) => void;
}

export interface MarketplaceProps {
  familyData: FamilyData;
  setFamilyData: (data: FamilyData) => void;
  userConnected: boolean;
  onTrade?: (type: 'buy' | 'sell', character: string, price: number) => void;
}

export interface CharacterMintingProps {
  onCharacterMinted: (characters: Character[]) => void;
  userWallet: string | null;
  luncBalance: number;
}

export interface WalletConnectionProps {
  onConnectionChange?: (connected: boolean, address: string | null) => void;
  isLoading?: boolean;
  error?: string | null;
}

export interface LuncWalletProps {
  balance: number;
  formatted?: string;
  showDetails?: boolean;
  onBalanceClick?: () => void;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// ===================================
// 🎲 HOOK INTERFACES
// ===================================

export interface UseLocalStorageReturn<T> {
  0: T;
  1: React.Dispatch<React.SetStateAction<T>>;
}

export interface UseWeb3ConnectionReturn {
  isConnected: boolean;
  account: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isLoading: boolean;
  error: string | null;
}

export interface UseGameNotificationsReturn {
  notifyCharacterMinted: (characters: Character[]) => void;
  notifyLuncEarned: (amount: number) => void;
  notifyJobAssigned: (character: string, job: string) => void;
  notifyMarketplaceTrade: (type: 'buy' | 'sell', character: string, price: number) => void;
  requestPermission: () => Promise<void>;
}

// ===================================
// 🎯 UTILITY TYPES
// ===================================

export type SetStateAction<T> = React.Dispatch<React.SetStateAction<T>>;

export type EventHandler<T = Element> = React.MouseEventHandler<T>;

export type KeyboardEventHandler<T = Element> = React.KeyboardEventHandler<T>;

export type ChangeEventHandler<T = Element> = React.ChangeEventHandler<T>;

export type FormEventHandler<T = Element> = React.FormEventHandler<T>;

// ===================================
// 🔧 ENVIRONMENT TYPES
// ===================================

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

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      REACT_APP_VERSION?: string;
      REACT_APP_BUILD_TIME?: string;
    }
  }
}

export {};