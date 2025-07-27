// ===================================
// 🎮 GAME UTILITY FUNCTIONS (TypeScript)
// ===================================

// Type definitions for the game
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
// 🧮 CHARACTER CALCULATIONS
// ===================================

/**
 * Calculate character earning potential based on level and rarity
 */
export const calculateEarnings = (character: Character): number => {
  const baseEarnings: Record<CharacterType, number> = {
    common: 25,
    rare: 50,
    legendary: 100
  };
  
  const levelMultiplier = 1 + (character.level * 0.1);
  const happinessMultiplier = character.happiness / 100;
  
  return Math.floor(
    baseEarnings[character.type] * levelMultiplier * happinessMultiplier
  );
};

/**
 * Generate random character attributes for minting
 */
export const generateRandomCharacter = (type: CharacterType): Omit<Character, 'dailyEarnings'> => {
  const names: Record<CharacterType, string[]> = {
    common: ['Alex Worker', 'Sam Builder', 'Pat Helper', 'Jamie Assistant'],
    rare: ['Max Manager', 'Anna Admin', 'Tom Tech', 'Lisa Lead'],
    legendary: ['Captain CEO', 'Master Architect', 'Supreme Director', 'Elite Executive']
  };
  
  const jobs: Record<CharacterType, string[]> = {
    common: ['Office Worker', 'Maintenance', 'Security Guard', 'Cleaner'],
    rare: ['Manager', 'IT Support', 'HR Specialist', 'Accountant'],
    legendary: ['CEO', 'Architect', 'Director', 'Chief Executive']
  };
  
  const departments = ['Management', 'IT', 'HR', 'Finance', 'Operations', 'Security', 'Administration'];
  
  const maxLevel = type === 'legendary' ? 30 : type === 'rare' ? 20 : 10;
  
  return {
    id: Date.now() + Math.random(),
    name: names[type][Math.floor(Math.random() * names[type].length)],
    type,
    job: jobs[type][Math.floor(Math.random() * jobs[type].length)],
    level: Math.floor(Math.random() * maxLevel) + 1,
    happiness: Math.floor(Math.random() * 30) + 70, // 70-100%
    working: false,
    department: departments[Math.floor(Math.random() * departments.length)],
    mintedAt: new Date().toISOString()
  };
};

// ===================================
// 💰 CURRENCY & FORMATTING
// ===================================

/**
 * Format LUNC balance with proper separators
 */
export const formatLuncBalance = (balance: number): string => {
  if (typeof balance !== 'number' || isNaN(balance)) {
    return '0';
  }
  return new Intl.NumberFormat('de-DE').format(Math.floor(balance));
};

/**
 * Format currency with LUNC symbol
 */
export const formatLuncCurrency = (amount: number): string => {
  return `${formatLuncBalance(amount)} LUNC`;
};

/**
 * Parse LUNC string back to number
 */
export const parseLuncBalance = (balanceString: string): number => {
  const cleaned = balanceString.replace(/[^\d,.-]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// ===================================
// 🏢 BUILDING CALCULATIONS
// ===================================

/**
 * Calculate building efficiency based on employees
 */
export const calculateBuildingEfficiency = (characters: Character[]): number => {
  if (characters.length === 0) return 0;
  
  const workingCharacters = characters.filter(c => c.working);
  if (workingCharacters.length === 0) return 0;
  
  const averageHappiness = workingCharacters.reduce((sum, c) => sum + c.happiness, 0) / workingCharacters.length;
  const workRatio = workingCharacters.length / characters.length;
  
  return Math.floor(averageHappiness * workRatio);
};

/**
 * Calculate total daily LUNC earnings from all characters
 */
export const calculateTotalDailyEarnings = (characters: Character[]): number => {
  return characters
    .filter(char => char.working)
    .reduce((total, char) => total + calculateEarnings(char), 0);
};

/**
 * Get building statistics
 */
export const getBuildingStats = (characters: Character[]) => {
  const workingCharacters = characters.filter(c => c.working);
  const averageLevel = characters.length > 0 
    ? characters.reduce((sum, c) => sum + c.level, 0) / characters.length 
    : 0;
  const averageHappiness = characters.length > 0
    ? characters.reduce((sum, c) => sum + c.happiness, 0) / characters.length
    : 0;

  return {
    totalEmployees: characters.length,
    workingEmployees: workingCharacters.length,
    efficiency: calculateBuildingEfficiency(characters),
    dailyEarnings: calculateTotalDailyEarnings(characters),
    averageLevel: Math.round(averageLevel * 100) / 100,
    averageHappiness: Math.round(averageHappiness * 100) / 100,
    employmentRate: characters.length > 0 ? (workingCharacters.length / characters.length) * 100 : 0
  };
};

// ===================================
// 🔐 VALIDATION FUNCTIONS
// ===================================

/**
 * Validate wallet address format (Ethereum)
 */
export const isValidWalletAddress = (address: string): boolean => {
  if (typeof address !== 'string') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Validate character type
 */
export const isValidCharacterType = (type: string): type is CharacterType => {
  return ['common', 'rare', 'legendary'].includes(type);
};

/**
 * Validate character data
 */
export const isValidCharacter = (character: any): character is Character => {
  return (
    typeof character === 'object' &&
    character !== null &&
    typeof character.name === 'string' &&
    isValidCharacterType(character.type) &&
    typeof character.level === 'number' &&
    character.level > 0 &&
    typeof character.happiness === 'number' &&
    character.happiness >= 0 &&
    character.happiness <= 100
  );
};

// ===================================
// 📨 NOTIFICATION SYSTEM
// ===================================

/**
 * Generate notification messages for game events
 */
export const generateNotification = (type: NotificationType, data: NotificationData): string => {
  const notifications: Record<NotificationType, string> = {
    mint_success: `🎉 ${data.count || 1} neue Charaktere geminted! +${data.bonus || 0} LUNC Bonus!`,
    job_assigned: `💼 ${data.character || 'Charakter'} wurde zu ${data.job || 'einem Job'} zugewiesen!`,
    lunc_earned: `💰 ${data.amount || 0} LUNC verdient!`,
    level_up: `⭐ ${data.character || 'Charakter'} ist auf Level ${data.level || 1} aufgestiegen!`,
    marketplace_buy: `🛒 ${data.character || 'Charakter'} für ${data.price || 0} LUNC gekauft!`,
    marketplace_sell: `💎 ${data.character || 'Charakter'} für ${data.price || 0} LUNC verkauft!`
  };
  
  return notifications[type] || 'Spiel-Event aufgetreten!';
};

// ===================================
// 💾 STORAGE UTILITIES
// ===================================

/**
 * Safe local storage save with error handling
 */
export const saveGameData = <T>(key: string, data: T): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem(`vbe_${key}`, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn('Failed to save game data:', error);
    return false;
  }
};

/**
 * Safe local storage load with error handling
 */
export const loadGameData = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const saved = localStorage.getItem(`vbe_${key}`);
    return saved ? JSON.parse(saved) as T : defaultValue;
  } catch (error) {
    console.warn('Failed to load game data:', error);
    return defaultValue;
  }
};

// ===================================
// 🎯 PERFORMANCE UTILITIES
// ===================================

/**
 * Enhanced debounce function with TypeScript support
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | number | undefined;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for rate limiting
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ===================================
// 🎲 RANDOM & PROBABILITY
// ===================================

/**
 * Generate random character type based on rarity chances
 */
export const getRandomCharacterType = (): CharacterType => {
  const rand = Math.random();
  
  if (rand < GAME_CONSTANTS.RARITY_CHANCES.legendary) {
    return 'legendary';
  } else if (rand < GAME_CONSTANTS.RARITY_CHANCES.legendary + GAME_CONSTANTS.RARITY_CHANCES.rare) {
    return 'rare';
  } else {
    return 'common';
  }
};

/**
 * Generate multiple random characters
 */
export const generateMultipleCharacters = (count: number): Character[] => {
  return Array.from({ length: count }, () => {
    const type = getRandomCharacterType();
    const baseChar = generateRandomCharacter(type);
    return {
      ...baseChar,
      dailyEarnings: calculateEarnings(baseChar)
    };
  });
};

// ===================================
// 📊 GAME CONSTANTS
// ===================================

export const GAME_CONSTANTS: GameConstants = {
  MINT_COSTS: {
    common: 100,
    rare: 300,
    legendary: 1000
  },
  RARITY_CHANCES: {
    common: 0.7,
    rare: 0.25,
    legendary: 0.05
  },
  MAX_FAMILY_SIZE: 50,
  BUILDING_FLOORS: 25,
  DAILY_LUNC_COLLECTION_HOUR: 12 // 12:00 PM
};

// ===================================
// 🕒 TIME UTILITIES
// ===================================

/**
 * Format time remaining until next collection
 */
export const getTimeUntilNextCollection = (): string => {
  const now = new Date();
  const nextCollection = new Date();
  nextCollection.setHours(GAME_CONSTANTS.DAILY_LUNC_COLLECTION_HOUR, 0, 0, 0);
  
  if (now > nextCollection) {
    nextCollection.setDate(nextCollection.getDate() + 1);
  }
  
  const diff = nextCollection.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
};

/**
 * Check if daily collection is available
 */
export const isDailyCollectionAvailable = (lastCollectionTime?: string): boolean => {
  if (!lastCollectionTime) return true;
  
  const lastCollection = new Date(lastCollectionTime);
  const now = new Date();
  
  // Check if it's past today's collection time and we haven't collected today
  const todayCollection = new Date();
  todayCollection.setHours(GAME_CONSTANTS.DAILY_LUNC_COLLECTION_HOUR, 0, 0, 0);
  
  return now >= todayCollection && lastCollection < todayCollection;
};