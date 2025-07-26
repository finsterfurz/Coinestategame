// ===================================
// 🎮 GAME TYPES DEFINITIONS
// ===================================

export interface Character {
  id: number;
  name: string;
  type: CharacterRarity;
  job: string;
  level: number;
  dailyEarnings: number;
  happiness: number;
  working: boolean;
  department: string;
  mintedAt: string;
  experience?: number;
  skills?: CharacterSkill[];
  equipment?: Equipment[];
}

export type CharacterRarity = 'common' | 'rare' | 'legendary';

export interface CharacterSkill {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  description: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'tool' | 'accessory' | 'uniform';
  rarity: CharacterRarity;
  bonusStats: {
    earnings?: number;
    happiness?: number;
    efficiency?: number;
  };
}

export interface FamilyData {
  characters: Character[];
  totalLunc: number;
  familySize: number;
  dailyEarnings: number;
  familyLevel?: number;
  totalExperience?: number;
}

export interface BuildingData {
  totalEmployees: number;
  availableJobs: number;
  buildingEfficiency: number;
  dailyLuncPool: number;
  floors: BuildingFloor[];
  upgrades?: BuildingUpgrade[];
}

export interface BuildingFloor {
  id: number;
  name: string;
  department: string;
  capacity: number;
  currentEmployees: number;
  efficiency: number;
  dailyOutput: number;
  requirements?: {
    level?: number;
    skills?: string[];
  };
}

export interface BuildingUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  effects: {
    efficiency?: number;
    capacity?: number;
    earnings?: number;
  };
  purchased: boolean;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  floorId: number;
  requirements: {
    level: number;
    rarity?: CharacterRarity;
    skills?: string[];
  };
  rewards: {
    basePay: number;
    bonuses: {
      experience: number;
      happiness: number;
    };
  };
  occupied: boolean;
  assignedCharacterId?: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  autoCollectLunc: boolean;
  darkMode: boolean;
  language: 'en' | 'de' | 'es' | 'fr';
  graphics: 'low' | 'medium' | 'high';
}

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
}

// ===================================
// 🔗 WEB3 TYPES
// ===================================

export interface WalletState {
  isConnected: boolean;
  address?: string;
  chainId?: number;
  balance?: string;
  ensName?: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
  external_url?: string;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'boost_number' | 'boost_percentage' | 'number' | 'date';
}

export interface SmartContractConfig {
  characterNFT: string;
  luncToken: string;
  marketplace: string;
  buildingManager: string;
  gameRewards: string;
}

// ===================================
// 🛒 MARKETPLACE TYPES
// ===================================

export interface MarketplaceListing {
  id: string;
  tokenId: number;
  seller: string;
  price: string;
  currency: 'ETH' | 'LUNC';
  character: Character;
  createdAt: number;
  expiresAt?: number;
  status: 'active' | 'sold' | 'expired' | 'cancelled';
}

export interface MarketplaceFilter {
  rarity?: CharacterRarity[];
  priceRange?: {
    min: number;
    max: number;
  };
  level?: {
    min: number;
    max: number;
  };
  department?: string[];
  sortBy: 'price' | 'level' | 'earnings' | 'listed';
  sortOrder: 'asc' | 'desc';
}

// ===================================
// 🎯 API RESPONSE TYPES
// ===================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ===================================
// 🎮 GAME EVENTS
// ===================================

export interface GameEvent {
  id: string;
  type: GameEventType;
  data: Record<string, any>;
  timestamp: number;
}

export type GameEventType =
  | 'character_minted'
  | 'character_assigned'
  | 'lunc_earned'
  | 'level_up'
  | 'building_upgraded'
  | 'marketplace_trade'
  | 'achievement_unlocked';

// ===================================
// 🏆 ACHIEVEMENT TYPES
// ===================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'collection' | 'earnings' | 'building' | 'trading';
  requirements: AchievementRequirement[];
  rewards: {
    lunc?: number;
    experience?: number;
    items?: string[];
  };
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
}

export interface AchievementRequirement {
  type: 'collect_characters' | 'earn_lunc' | 'assign_jobs' | 'trade_volume';
  target: number;
  current: number;
}

// ===================================
// 🎨 UI COMPONENT TYPES
// ===================================

export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ModalProps extends ComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export interface ButtonProps extends ComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export interface CardProps extends ComponentProps {
  title?: string;
  subtitle?: string;
  image?: string;
  actions?: React.ReactNode;
}

// ===================================
// 🔧 UTILITY TYPES
// ===================================

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ===================================
// 🎮 GAME STATE TYPES
// ===================================

export interface GameState {
  familyData: FamilyData;
  buildingData: BuildingData;
  gameSettings: GameSettings;
  walletState: WalletState;
  notifications: Notification[];
  achievements: Achievement[];
  marketplaceListings: MarketplaceListing[];
  loading: {
    characters: boolean;
    building: boolean;
    marketplace: boolean;
    wallet: boolean;
  };
  errors: {
    general?: string;
    wallet?: string;
    contracts?: string;
  };
}

export interface GameActions {
  // Family Actions
  addCharacter: (character: Character) => void;
  updateCharacter: (id: number, updates: Partial<Character>) => void;
  removeCharacter: (id: number) => void;
  
  // Building Actions
  updateBuilding: (updates: Partial<BuildingData>) => void;
  assignJob: (characterId: number, jobId: string) => void;
  unassignJob: (characterId: number) => void;
  
  // Settings Actions
  updateSettings: (updates: Partial<GameSettings>) => void;
  
  // Wallet Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  updateWalletState: (state: Partial<WalletState>) => void;
  
  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Loading Actions
  setLoading: (key: keyof GameState['loading'], value: boolean) => void;
  
  // Error Actions
  setError: (key: keyof GameState['errors'], error: string | undefined) => void;
  clearErrors: () => void;
}

export type GameStore = GameState & GameActions;