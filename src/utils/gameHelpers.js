// ===================================
// 🎮 GAME UTILITY FUNCTIONS
// ===================================

/**
 * Calculate character earning potential based on level and rarity
 */
export const calculateEarnings = (character) => {
  const baseEarnings = {
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
export const generateRandomCharacter = (type) => {
  const names = {
    common: ['Alex Worker', 'Sam Builder', 'Pat Helper', 'Jamie Assistant'],
    rare: ['Max Manager', 'Anna Admin', 'Tom Tech', 'Lisa Lead'],
    legendary: ['Captain CEO', 'Master Architect', 'Supreme Director', 'Elite Executive']
  };
  
  const jobs = {
    common: ['Office Worker', 'Maintenance', 'Security Guard', 'Cleaner'],
    rare: ['Manager', 'IT Support', 'HR Specialist', 'Accountant'],
    legendary: ['CEO', 'Architect', 'Director', 'Chief Executive']
  };
  
  const departments = ['Management', 'IT', 'HR', 'Finance', 'Operations', 'Security', 'Administration'];
  
  return {
    id: Date.now() + Math.random(),
    name: names[type][Math.floor(Math.random() * names[type].length)],
    type,
    job: jobs[type][Math.floor(Math.random() * jobs[type].length)],
    level: Math.floor(Math.random() * (type === 'legendary' ? 30 : type === 'rare' ? 20 : 10)) + 1,
    happiness: Math.floor(Math.random() * 30) + 70, // 70-100%
    working: false,
    department: departments[Math.floor(Math.random() * departments.length)],
    mintedAt: new Date().toISOString()
  };
};

/**
 * Format LUNC balance with proper separators
 */
export const formatLuncBalance = (balance) => {
  return new Intl.NumberFormat('de-DE').format(balance);
};

/**
 * Calculate building efficiency based on employees
 */
export const calculateBuildingEfficiency = (characters) => {
  if (characters.length === 0) return 0;
  
  const workingCharacters = characters.filter(c => c.working);
  const averageHappiness = workingCharacters.reduce((sum, c) => sum + c.happiness, 0) / workingCharacters.length || 0;
  const workRatio = workingCharacters.length / characters.length;
  
  return Math.floor(averageHappiness * workRatio);
};

/**
 * Validate wallet address format
 */
export const isValidWalletAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Generate notification messages for game events
 */
export const generateNotification = (type, data) => {
  const notifications = {
    mint_success: `🎉 ${data.count} neue Charaktere geminted! +${data.bonus} LUNC Bonus!`,
    job_assigned: `💼 ${data.character} wurde zu ${data.job} zugewiesen!`,
    lunc_earned: `💰 ${data.amount} LUNC verdient!`,
    level_up: `⭐ ${data.character} ist auf Level ${data.level} aufgestiegen!`,
    marketplace_buy: `🛒 ${data.character} für ${data.price} LUNC gekauft!`,
    marketplace_sell: `💎 ${data.character} für ${data.price} LUNC verkauft!`
  };
  
  return notifications[type] || 'Spiel-Event aufgetreten!';
};

/**
 * Local storage helpers for game data persistence
 */
export const saveGameData = (key, data) => {
  try {
    localStorage.setItem(`vbe_${key}`, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save game data:', error);
  }
};

export const loadGameData = (key, defaultValue = null) => {
  try {
    const saved = localStorage.getItem(`vbe_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.warn('Failed to load game data:', error);
    return defaultValue;
  }
};

/**
 * Performance optimization: Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Game constants
 */
export const GAME_CONSTANTS = {
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