// ===================================
// 🎮 ENHANCED GAME HELPERS
// ===================================

import type { Character, CharacterRarity } from '@/types/game.types';

// ===================================
// 🎲 CHARACTER GENERATION
// ===================================

/**
 * Generate a random character with specified rarity
 */
export const generateRandomCharacter = (rarity: CharacterRarity): Character => {
  const id = Date.now() + Math.floor(Math.random() * 1000);
  const name = generateRandomName();
  const level = getInitialLevel(rarity);
  const dailyEarnings = calculateDailyEarnings(rarity, level);
  const happiness = 85 + Math.floor(Math.random() * 16); // 85-100
  
  return {
    id,
    name,
    type: rarity,
    job: "Unemployed",
    level,
    dailyEarnings,
    happiness,
    working: false,
    department: "Unassigned",
    mintedAt: new Date().toISOString(),
    experience: 0
  };
};

/**
 * Generate random character name
 */
export const generateRandomName = (): string => {
  const firstNames = [
    'Alex', 'Blake', 'Casey', 'Drew', 'Emery', 'Finley', 'Gray', 'Hunter',
    'Indigo', 'Jules', 'Kai', 'Lane', 'Morgan', 'Nova', 'Ocean', 'Phoenix',
    'Quinn', 'River', 'Sage', 'Taylor', 'Uma', 'Vale', 'West', 'Xander',
    'Yuki', 'Zen', 'Aria', 'Luna', 'Mira', 'Zara', 'Leo', 'Max', 'Sam'
  ];
  
  const titles = [
    'Hero', 'Champion', 'Legend', 'Master', 'Expert', 'Pro', 'Star',
    'Elite', 'Prime', 'Supreme', 'Ultra', 'Mega', 'Super', 'Ace'
  ];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const title = titles[Math.floor(Math.random() * titles.length)];
  
  return `${firstName} ${title}`;
};

/**
 * Get initial level based on rarity
 */
export const getInitialLevel = (rarity: CharacterRarity): number => {
  switch (rarity) {
    case 'legendary':
      return 15 + Math.floor(Math.random() * 16); // 15-30
    case 'rare':
      return 8 + Math.floor(Math.random() * 11); // 8-18
    case 'common':
    default:
      return 1 + Math.floor(Math.random() * 10); // 1-10
  }
};

// ===================================
// 💰 FINANCIAL CALCULATIONS
// ===================================

/**
 * Calculate daily earnings based on rarity and level
 */
export const calculateDailyEarnings = (rarity: CharacterRarity, level: number): number => {
  let baseEarnings: number;
  
  switch (rarity) {
    case 'legendary':
      baseEarnings = 120 + (level * 8);
      break;
    case 'rare':
      baseEarnings = 50 + (level * 5);
      break;
    case 'common':
    default:
      baseEarnings = 15 + (level * 3);
      break;
  }
  
  return Math.floor(baseEarnings);
};

/**
 * Calculate total daily earnings for working characters
 */
export const calculateTotalDailyEarnings = (characters: Character[]): number => {
  return characters
    .filter(char => char.working)
    .reduce((total, char) => total + char.dailyEarnings, 0);
};

/**
 * Calculate family bonus based on family size
 */
export const calculateFamilyBonus = (familySize: number, baseAmount: number): number => {
  const bonusPercentage = Math.min(familySize * 0.05, 1.0); // 5% per member, max 100%
  return Math.floor(baseAmount * (1 + bonusPercentage));
};

/**
 * Format LUNC balance for display
 */
export const formatLuncBalance = (balance: number): string => {
  if (balance < 1000) {
    return balance.toString();
  }
  
  if (balance < 1000000) {
    const kBalance = balance / 1000;
    return kBalance % 1 === 0 ? `${kBalance}K` : `${kBalance.toFixed(1)}K`;
  }
  
  const mBalance = balance / 1000000;
  return mBalance % 1 === 0 ? `${mBalance}M` : `${mBalance.toFixed(1)}M`;
};

/**
 * Format numbers with thousand separators
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('de-DE').format(num);
};

// ===================================
// 🎯 VALIDATION FUNCTIONS
// ===================================

/**
 * Validate character name
 */
export const validateCharacterName = (name: string): boolean => {
  if (!name || name.trim().length < 2 || name.trim().length > 30) {
    return false;
  }
  
  // Allow letters, numbers, spaces, hyphens, and underscores
  const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
  return validPattern.test(name.trim());
};

/**
 * Validate ethereum address
 */
export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// ===================================
// 🔧 UTILITY FUNCTIONS
// ===================================

/**
 * Debounce function to limit function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T & { flush?: () => void } => {
  let timeoutId: NodeJS.Timeout;
  let lastArgs: Parameters<T>;
  
  const debouncedFunction = ((...args: Parameters<T>) => {
    lastArgs = args;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T & { flush?: () => void };
  
  debouncedFunction.flush = () => {
    clearTimeout(timeoutId);
    if (lastArgs) {
      func(...lastArgs);
    }
  };
  
  return debouncedFunction;
};

/**
 * Throttle function to limit function calls
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
};

/**
 * Generate random ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Sleep function for async delays
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Clamp number between min and max
 */
export const clamp = (num: number, min: number, max: number): number => {
  return Math.min(Math.max(num, min), max);
};

/**
 * Calculate percentage
 */
export const percentage = (value: number, total: number): number => {
  return total === 0 ? 0 : Math.round((value / total) * 100);
};

/**
 * Format time duration
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

/**
 * Get rarity color
 */
export const getRarityColor = (rarity: CharacterRarity): string => {
  switch (rarity) {
    case 'legendary':
      return 'text-yellow-400';
    case 'rare':
      return 'text-purple-400';
    case 'common':
    default:
      return 'text-gray-400';
  }
};

/**
 * Get rarity background color
 */
export const getRarityBgColor = (rarity: CharacterRarity): string => {
  switch (rarity) {
    case 'legendary':
      return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    case 'rare':
      return 'bg-gradient-to-r from-purple-400 to-pink-500';
    case 'common':
    default:
      return 'bg-gradient-to-r from-gray-400 to-gray-600';
  }
};

// ===================================
// 🎮 GAME CALCULATIONS
// ===================================

/**
 * Calculate experience required for next level
 */
export const getExperienceForNextLevel = (currentLevel: number): number => {
  return (currentLevel * 100) + (currentLevel * currentLevel * 10);
};

/**
 * Calculate building efficiency
 */
export const calculateBuildingEfficiency = (
  workingCharacters: number,
  totalCapacity: number
): number => {
  if (totalCapacity === 0) return 0;
  const baseEfficiency = (workingCharacters / totalCapacity) * 100;
  return Math.min(Math.round(baseEfficiency), 100);
};

/**
 * Calculate happiness effect on earnings
 */
export const calculateHappinessBonus = (happiness: number): number => {
  // Happiness ranges from 0-100, bonus ranges from 0.8x to 1.2x
  return 0.8 + (happiness / 100) * 0.4;
};

export default {
  generateRandomCharacter,
  formatLuncBalance,
  debounce,
  calculateDailyEarnings,
  calculateFamilyBonus,
  validateCharacterName
};