// ===================================
// 🎮 GAME TYPE DEFINITIONS
// ===================================

export interface Character {
  id: number;
  name: string;
  type: 'common' | 'rare' | 'legendary';
  job: string;
  level: number;
  dailyEarnings: number;
  happiness: number;
  working: boolean;
  department: string;
  mintedAt: string;
  experience?: number;
  skills?: string[];
  avatar?: string;
}

export interface FamilyData {
  characters: Character[];
  totalLunc: number;
  familySize: number;
  dailyEarnings: number;
  familyBonus?: number;
  totalExperience?: number;
}

export interface BuildingData {
  totalEmployees: number;
  availableJobs: number;
  buildingEfficiency: number;
  dailyLuncPool: number;
  floors?: Floor[];
  departments?: Department[];
}

export interface Floor {
  id: number;
  name: string;
  level: number;
  capacity: number;
  occupied: number;
  department: string;
  dailyLuncReward: number;
}

export interface Department {
  id: string;
  name: string;
  floors: number[];
  totalPositions: number;
  occupiedPositions: number;
  averageSalary: number;
  description: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  autoCollectLunc: boolean;
  darkMode: boolean;
  language?: string;
  animations?: boolean;
}

export interface Web3ConnectionState {
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationData {
  id: string;
  type: 'character_minted' | 'lunc_earned' | 'job_assigned' | 'marketplace_trade';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

export interface MarketplaceItem {
  id: string;
  character: Character;
  price: number;
  seller: string;
  timestamp: Date;
  status: 'active' | 'sold' | 'cancelled';
}

export interface JobPosition {
  id: string;
  title: string;
  department: string;
  floor: number;
  dailyLunc: number;
  requirements: {
    minLevel: number;
    requiredType?: Character['type'];
    skills?: string[];
  };
  occupied: boolean;
  occupiedBy?: string; // character ID
}

export interface GameStats {
  totalCharacters: number;
  dailyLuncPool: number;
  buildingFloors: number;
  activePlayers: number;
  totalLuncEarned: number;
  topFamily: {
    size: number;
    dailyEarnings: number;
  };
}

// ===================================
// 🎯 COMPONENT PROP INTERFACES
// ===================================

export interface HomepageProps {
  familyData: FamilyData;
  buildingData: BuildingData;
  userConnected: boolean;
  walletAddress?: string | null;
}

export interface FamilyManagementProps {
  familyData: FamilyData;
  setFamilyData: (data: Partial<FamilyData>) => void;
  userConnected: boolean;
  onJobAssign: (character: Character, job: JobPosition) => void;
}

export interface BuildingOverviewProps {
  buildingData: BuildingData;
  setBuildingData: (data: Partial<BuildingData>) => void;
  familyCharacters: Character[];
}

export interface JobAssignmentProps {
  characters: Character[];
  setFamilyData: (data: Partial<FamilyData>) => void;
  buildingData: BuildingData;
  onJobAssign: (character: Character, job: JobPosition) => void;
}

export interface MarketplaceProps {
  familyData: FamilyData;
  setFamilyData: (data: Partial<FamilyData>) => void;
  userConnected: boolean;
  onTrade: (item: MarketplaceItem, type: 'buy' | 'sell') => void;
}

export interface CharacterMintingProps {
  onCharacterMinted: (characters: Character[]) => void;
  userWallet: string | null;
  luncBalance: number;
}

export interface WalletConnectionProps {
  onConnectionChange: (connected: boolean, address?: string) => void;
  isLoading: boolean;
  error: string | null;
}

export interface LuncWalletProps {
  balance: number;
  formatted: string;
  transactions?: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'earn' | 'spend' | 'trade';
  amount: number;
  description: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

// ===================================
// 🔗 API RESPONSE INTERFACES
// ===================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Web3Error {
  code: number;
  message: string;
  stack?: string;
}

export interface ContractInteraction {
  contractAddress: string;
  method: string;
  parameters: any[];
  gasEstimate?: number;
  gasPrice?: string;
}

// ===================================
// 🎮 GAME EVENT TYPES
// ===================================

export type GameEvent = 
  | { type: 'CHARACTER_MINTED'; payload: { characters: Character[]; cost: number } }
  | { type: 'LUNC_EARNED'; payload: { amount: number; source: string } }
  | { type: 'JOB_ASSIGNED'; payload: { character: Character; job: JobPosition } }
  | { type: 'MARKETPLACE_TRADE'; payload: { item: MarketplaceItem; type: 'buy' | 'sell' } }
  | { type: 'FAMILY_BONUS_UNLOCKED'; payload: { bonusType: string; amount: number } }
  | { type: 'LEVEL_UP'; payload: { character: Character; newLevel: number } };

// ===================================
// 🛡️ ERROR TYPES
// ===================================

export interface GameError {
  code: string;
  message: string;
  context?: Record<string, any>;
  recoverable: boolean;
}

export interface Web3ConnectionError extends GameError {
  chainId?: number;
  expectedChainId?: number;
  walletType?: string;
}

export interface ContractError extends GameError {
  contractAddress?: string;
  method?: string;
  gasUsed?: number;
  transactionHash?: string;
}

// ===================================
// 🎯 UTILITY TYPES
// ===================================

export type CharacterType = Character['type'];
export type DepartmentName = Department['name'];
export type GameEventType = GameEvent['type'];
export type NotificationType = NotificationData['type'];

// Make some properties optional for updates
export type PartialCharacter = Partial<Character> & Pick<Character, 'id'>;
export type PartialFamilyData = Partial<FamilyData>;
export type PartialBuildingData = Partial<BuildingData>;

// Utility type for component state
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  status: LoadingState;
  error: string | null;
}
