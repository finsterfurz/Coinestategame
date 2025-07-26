// Core game types
export interface Character {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Legendary';
  level: number;
  experience: number;
  earnings: number;
  happiness: number;
  productivity: number;
  department?: Department;
  jobPosition?: JobPosition;
  skills: CharacterSkills;
  traits: CharacterTrait[];
  createdAt: Date;
  lastWorked?: Date;
  isWorking: boolean;
  image: string;
  background: string;
}

export interface CharacterSkills {
  productivity: number;
  charisma: number;
  intelligence: number;
  luck: number;
  management: number;
  creativity: number;
}

export interface CharacterTrait {
  id: string;
  name: string;
  description: string;
  effect: TraitEffect;
  rarity: 'Common' | 'Rare' | 'Legendary';
}

export interface TraitEffect {
  type: 'productivity' | 'happiness' | 'earnings' | 'experience';
  value: number;
  isPercentage: boolean;
}

// Building and job types
export interface Department {
  id: string;
  name: string;
  floor: number;
  maxCharacters: number;
  currentCharacters: Character[];
  baseEarnings: number;
  efficiencyBonus: number;
  description: string;
  requirements: DepartmentRequirement[];
  upgrades: DepartmentUpgrade[];
}

export interface DepartmentRequirement {
  type: 'level' | 'skill' | 'rarity';
  value: number | string;
  skill?: keyof CharacterSkills;
}

export interface DepartmentUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  costType: 'lunc' | 'eth';
  effect: UpgradeEffect;
  unlocked: boolean;
  purchased: boolean;
}

export interface UpgradeEffect {
  type: 'earnings' | 'capacity' | 'efficiency' | 'happiness';
  value: number;
  isPercentage: boolean;
}

export interface JobPosition {
  id: string;
  title: string;
  department: string;
  salary: number;
  requirements: JobRequirement[];
  experience: number;
  description: string;
}

export interface JobRequirement {
  type: 'level' | 'skill' | 'trait';
  value: number | string;
  skill?: keyof CharacterSkills;
}

// Game state and economy
export interface GameState {
  user: User;
  characters: Character[];
  building: Building;
  economy: Economy;
  quests: Quest[];
  achievements: Achievement[];
  social: SocialData;
  settings: GameSettings;
  lastUpdate: Date;
}

export interface User {
  id: string;
  walletAddress: string;
  username: string;
  level: number;
  experience: number;
  joinDate: Date;
  statistics: UserStatistics;
  preferences: UserPreferences;
}

export interface UserStatistics {
  totalCharacters: number;
  totalEarnings: number;
  totalPlayTime: number;
  achievementsUnlocked: number;
  questsCompleted: number;
  buildingEfficiency: number;
  averageCharacterLevel: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  autoCollect: boolean;
  sound: boolean;
  language: string;
}

export interface Building {
  id: string;
  name: string;
  level: number;
  totalFloors: number;
  departments: Department[];
  upgrades: BuildingUpgrade[];
  decorations: Decoration[];
  efficiency: number;
  happiness: number;
}

export interface BuildingUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  costType: 'lunc' | 'eth';
  effect: UpgradeEffect;
  category: 'infrastructure' | 'efficiency' | 'capacity' | 'aesthetics';
  unlocked: boolean;
  purchased: boolean;
}

export interface Decoration {
  id: string;
  name: string;
  description: string;
  effect: DecorationEffect;
  rarity: 'Common' | 'Rare' | 'Legendary';
  cost: number;
  image: string;
}

export interface DecorationEffect {
  type: 'happiness' | 'productivity' | 'efficiency';
  value: number;
  scope: 'global' | 'department' | 'floor';
}

export interface Economy {
  luncBalance: number;
  ethBalance: number;
  dailyEarnings: number;
  totalEarnings: number;
  marketData: MarketData;
  transactions: Transaction[];
}

export interface MarketData {
  luncPrice: number;
  ethPrice: number;
  characterFloorPrice: number;
  averageCharacterPrice: number;
  totalVolume24h: number;
  priceHistory: PricePoint[];
}

export interface PricePoint {
  timestamp: Date;
  price: number;
  volume: number;
}

export interface Transaction {
  id: string;
  type: 'mint' | 'buy' | 'sell' | 'earnings' | 'upgrade';
  amount: number;
  currency: 'lunc' | 'eth';
  timestamp: Date;
  description: string;
  txHash?: string;
}

// Quest and achievement system
export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  category: 'collection' | 'building' | 'social' | 'earning';
  requirements: QuestRequirement[];
  rewards: QuestReward[];
  progress: QuestProgress;
  deadline?: Date;
  isCompleted: boolean;
  isActive: boolean;
}

export interface QuestRequirement {
  id: string;
  description: string;
  type: 'count' | 'threshold' | 'duration';
  target: number;
  current: number;
  category: string;
}

export interface QuestReward {
  type: 'lunc' | 'experience' | 'character' | 'decoration' | 'title';
  amount: number;
  description: string;
}

export interface QuestProgress {
  started: Date;
  lastUpdate: Date;
  completion: number; // 0-100
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'collector' | 'builder' | 'socialite' | 'entrepreneur';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  requirements: AchievementRequirement[];
  rewards: QuestReward[];
  isUnlocked: boolean;
  unlockedDate?: Date;
  progress: number; // 0-100
  isSecret: boolean;
}

export interface AchievementRequirement {
  type: 'total' | 'streak' | 'single';
  description: string;
  target: number;
  current: number;
}

// Social and multiplayer features
export interface SocialData {
  friends: Friend[];
  leaderboards: Leaderboard[];
  guilds: Guild[];
  messages: Message[];
  notifications: Notification[];
}

export interface Friend {
  userId: string;
  username: string;
  level: number;
  buildingName: string;
  isOnline: boolean;
  lastSeen: Date;
  friendshipDate: Date;
}

export interface Leaderboard {
  id: string;
  name: string;
  category: 'earnings' | 'characters' | 'level' | 'efficiency';
  timeframe: 'daily' | 'weekly' | 'monthly' | 'alltime';
  entries: LeaderboardEntry[];
  lastUpdate: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  value: number;
  change: number; // rank change from previous period
}

export interface Guild {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  level: number;
  requirements: GuildRequirement[];
  benefits: GuildBenefit[];
  joinedDate?: Date;
  role?: 'member' | 'officer' | 'leader';
}

export interface GuildRequirement {
  type: 'level' | 'characters' | 'earnings';
  value: number;
}

export interface GuildBenefit {
  type: 'earnings_bonus' | 'experience_bonus' | 'discount';
  value: number;
  description: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: 'private' | 'guild' | 'system';
}

export interface Notification {
  id: string;
  type: 'quest_complete' | 'achievement' | 'friend_request' | 'earnings' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  icon?: string;
}

// Marketplace and trading
export interface MarketplaceListing {
  id: string;
  characterId: string;
  character: Character;
  sellerId: string;
  sellerName: string;
  price: number;
  currency: 'lunc' | 'eth';
  listedDate: Date;
  expiryDate: Date;
  status: 'active' | 'sold' | 'cancelled' | 'expired';
  views: number;
  watchers: string[];
}

export interface MarketplaceFilter {
  rarity?: ('Common' | 'Rare' | 'Legendary')[];
  priceMin?: number;
  priceMax?: number;
  levelMin?: number;
  levelMax?: number;
  departments?: string[];
  sortBy: 'price' | 'level' | 'rarity' | 'date';
  sortOrder: 'asc' | 'desc';
}

export interface TradeHistory {
  id: string;
  characterId: string;
  buyerId: string;
  sellerId: string;
  price: number;
  currency: 'lunc' | 'eth';
  timestamp: Date;
  txHash: string;
}

// Events and analytics
export interface GameEvent {
  id: string;
  type: string;
  data: Record<string, any>;
  timestamp: Date;
  userId: string;
}

export interface AnalyticsData {
  earningsHistory: EarningsPoint[];
  characterDistribution: DistributionPoint[];
  performanceMetrics: PerformanceMetric[];
  playTimeStats: PlayTimeStats;
  goalProgress: GoalProgress[];
}

export interface EarningsPoint {
  date: Date;
  amount: number;
  source: 'jobs' | 'quests' | 'bonuses' | 'trading';
}

export interface DistributionPoint {
  category: string;
  value: number;
  percentage: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface PlayTimeStats {
  totalMinutes: number;
  averageSession: number;
  longestSession: number;
  activeDays: number;
  streak: number;
}

export interface GoalProgress {
  id: string;
  name: string;
  current: number;
  target: number;
  deadline?: Date;
}

// API and service types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Web3Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
}

// Game settings and configuration
export interface GameSettings {
  version: string;
  maintenance: boolean;
  features: FeatureFlags;
  economy: EconomySettings;
  limits: GameLimits;
}

export interface FeatureFlags {
  marketplace: boolean;
  social: boolean;
  quests: boolean;
  analytics: boolean;
  multichain: boolean;
  aiFeatures: boolean;
}

export interface EconomySettings {
  baseEarningsRate: number;
  rarityMultipliers: Record<string, number>;
  maxDailyEarnings: number;
  marketplaceFee: number;
  characterMintPrice: Record<string, number>;
}

export interface GameLimits {
  maxCharacters: number;
  maxFriends: number;
  maxDailyQuests: number;
  maxBuildingUpgrades: number;
}

// Weather and environmental effects
export interface WeatherData {
  current: WeatherCondition;
  forecast: WeatherCondition[];
  effects: WeatherEffect[];
}

export interface WeatherCondition {
  type: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  temperature: number;
  humidity: number;
  timestamp: Date;
  duration: number; // in hours
}

export interface WeatherEffect {
  type: 'mood' | 'productivity' | 'creativity' | 'focus';
  value: number;
  isPercentage: boolean;
  description: string;
}

// AI and machine learning types
export interface AIRecommendation {
  id: string;
  type: 'job_assignment' | 'character_purchase' | 'building_upgrade' | 'quest_focus';
  title: string;
  description: string;
  confidence: number; // 0-100
  expectedBenefit: number;
  reasoning: string[];
  actionData: Record<string, any>;
}

export interface PredictionData {
  type: 'earnings' | 'efficiency' | 'market_price';
  timeframe: 'day' | 'week' | 'month';
  current: number;
  predicted: number;
  confidence: number;
  factors: PredictionFactor[];
}

export interface PredictionFactor {
  name: string;
  impact: number; // -100 to 100
  description: string;
}

// Component props types
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface CharacterCardProps extends ComponentProps {
  character: Character;
  onClick?: (character: Character) => void;
  isSelected?: boolean;
  showDetails?: boolean;
  actions?: CharacterAction[];
}

export interface CharacterAction {
  label: string;
  icon?: string;
  onClick: (character: Character) => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

// Hook return types
export interface UseGameStateReturn {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState>) => void;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseWeb3Return {
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchChain: (chainId: number) => Promise<void>;
  sendTransaction: (tx: any) => Promise<Web3Transaction>;
}

export interface UseAnalyticsReturn {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  trackEvent: (event: GameEvent) => void;
}
