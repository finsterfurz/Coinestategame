// Character feature types and interfaces
export interface Character {
  id: string;
  name: string;
  type: 'common' | 'rare' | 'legendary';
  job: string;
  level: number;
  dailyEarnings: number;
  happiness: number;
  working: boolean;
  department: string;
  mintedAt: string;
  ownerId: string;
  experience: number;
  maxExperience: number;
  skills: CharacterSkill[];
  equipment?: CharacterEquipment;
  lastWorked?: string;
  totalEarned: number;
}

export interface CharacterSkill {
  id: string;
  name: string;
  level: number;
  experience: number;
  category: 'management' | 'technical' | 'creative' | 'social';
  bonus: number;
}

export interface CharacterEquipment {
  weapon?: Equipment;
  armor?: Equipment;
  accessory?: Equipment;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  rarity: 'common' | 'rare' | 'legendary';
  stats: Record<string, number>;
  description: string;
}

export interface MintingPackage {
  id: string;
  name: string;
  description: string;
  cost: number;
  currency: 'LUNC' | 'ETH';
  guarantees: {
    common: number;
    rare: number;
    legendary: number;
  };
  bonuses: string[];
  maxPurchases?: number;
  dailyLimit?: number;
}

export interface MintingResult {
  characters: Character[];
  totalCost: number;
  transaction: {
    hash: string;
    timestamp: string;
    gasUsed?: number;
  };
  bonuses: string[];
}

// Character actions
export type CharacterAction = 
  | { type: 'MINT_CHARACTER'; payload: MintingResult }
  | { type: 'UPDATE_CHARACTER'; payload: { id: string; updates: Partial<Character> } }
  | { type: 'LEVEL_UP_CHARACTER'; payload: { id: string } }
  | { type: 'ASSIGN_JOB'; payload: { characterId: string; jobId: string; departmentId: string } }
  | { type: 'REMOVE_FROM_JOB'; payload: { characterId: string } }
  | { type: 'UPDATE_HAPPINESS'; payload: { characterId: string; happiness: number } }
  | { type: 'ADD_EXPERIENCE'; payload: { characterId: string; experience: number } }
  | { type: 'EQUIP_ITEM'; payload: { characterId: string; item: Equipment; slot: string } }
  | { type: 'COLLECT_EARNINGS'; payload: { characterIds: string[]; totalEarned: number } };

// Character state
export interface CharacterState {
  characters: Character[];
  selectedCharacter: Character | null;
  mintingPackages: MintingPackage[];
  isLoading: boolean;
  error: string | null;
  filters: CharacterFilters;
  sortBy: CharacterSortOption;
  viewMode: 'grid' | 'list';
}

export interface CharacterFilters {
  type: 'all' | 'common' | 'rare' | 'legendary';
  department: string | null;
  working: boolean | null;
  level: {
    min: number;
    max: number;
  };
  search: string;
}

export type CharacterSortOption = 
  | 'name'
  | 'level'
  | 'dailyEarnings'
  | 'happiness'
  | 'type'
  | 'mintedAt';

// Character utilities
export const CHARACTER_TYPES = {
  common: {
    name: 'Common',
    color: '#6b7280',
    probability: 0.7,
    baseEarnings: { min: 15, max: 50 },
    description: 'Basic workers with standard capabilities'
  },
  rare: {
    name: 'Rare',
    color: '#8b5cf6',
    probability: 0.25,
    baseEarnings: { min: 50, max: 100 },
    description: 'Skilled professionals with enhanced abilities'
  },
  legendary: {
    name: 'Legendary',
    color: '#f59e0b',
    probability: 0.05,
    baseEarnings: { min: 120, max: 250 },
    description: 'Elite executives with extraordinary skills'
  }
} as const;

export const CHARACTER_DEPARTMENTS = [
  'Management',
  'IT',
  'HR',
  'Finance',
  'Operations',
  'Security',
  'Administration',
  'Research',
  'Marketing',
  'Sales'
] as const;

export const CHARACTER_JOBS = {
  Management: ['CEO', 'Manager', 'Team Lead', 'Director', 'Supervisor'],
  IT: ['Developer', 'System Admin', 'DevOps Engineer', 'Security Analyst', 'Data Scientist'],
  HR: ['HR Manager', 'Recruiter', 'Training Specialist', 'Benefits Coordinator'],
  Finance: ['Accountant', 'Financial Analyst', 'Auditor', 'Budget Manager'],
  Operations: ['Operations Manager', 'Quality Controller', 'Process Optimizer'],
  Security: ['Security Guard', 'Safety Officer', 'Compliance Manager'],
  Administration: ['Office Manager', 'Assistant', 'Coordinator', 'Clerk'],
  Research: ['Researcher', 'Analyst', 'Innovation Manager', 'Product Developer'],
  Marketing: ['Marketing Manager', 'Content Creator', 'SEO Specialist', 'Brand Manager'],
  Sales: ['Sales Manager', 'Account Executive', 'Sales Representative', 'Business Developer']
} as const;

// Character calculation utilities
export const calculateCharacterLevel = (experience: number): number => {
  // Experience required: level^2 * 100
  return Math.floor(Math.sqrt(experience / 100)) + 1;
};

export const calculateMaxExperience = (level: number): number => {
  return Math.pow(level, 2) * 100;
};

export const calculateDailyEarnings = (character: Character): number => {
  const baseEarnings = CHARACTER_TYPES[character.type].baseEarnings;
  const levelBonus = character.level * 2;
  const happinessMultiplier = character.happiness / 100;
  const skillBonus = character.skills.reduce((sum, skill) => sum + skill.bonus, 0);
  
  const earnings = (baseEarnings.min + levelBonus + skillBonus) * happinessMultiplier;
  return Math.floor(Math.max(earnings, baseEarnings.min));
};

export const calculateCharacterValue = (character: Character): number => {
  const baseValue = CHARACTER_TYPES[character.type].baseEarnings.max;
  const levelMultiplier = 1 + (character.level - 1) * 0.1;
  const happinessMultiplier = character.happiness / 100;
  const skillBonus = character.skills.reduce((sum, skill) => sum + skill.level * 10, 0);
  
  return Math.floor(baseValue * levelMultiplier * happinessMultiplier + skillBonus);
};

export const generateRandomCharacter = (
  type: Character['type'],
  ownerId: string
): Omit<Character, 'id'> => {
  const typeConfig = CHARACTER_TYPES[type];
  const departments = [...CHARACTER_DEPARTMENTS];
  const department = departments[Math.floor(Math.random() * departments.length)];
  const jobs = CHARACTER_JOBS[department as keyof typeof CHARACTER_JOBS];
  const job = jobs[Math.floor(Math.random() * jobs.length)];
  
  const level = Math.floor(Math.random() * 5) + 1;
  const experience = Math.floor(Math.random() * calculateMaxExperience(level));
  const happiness = Math.floor(Math.random() * 21) + 80; // 80-100
  
  // Generate random skills
  const skillCategories: CharacterSkill['category'][] = ['management', 'technical', 'creative', 'social'];
  const skills: CharacterSkill[] = skillCategories.map((category, index) => ({
    id: `skill_${index}`,
    name: `${category.charAt(0).toUpperCase() + category.slice(1)} Skill`,
    level: Math.floor(Math.random() * level) + 1,
    experience: Math.floor(Math.random() * 100),
    category,
    bonus: Math.floor(Math.random() * 10) + 1
  }));

  const character = {
    name: generateRandomName(),
    type,
    job,
    level,
    dailyEarnings: 0, // Will be calculated
    happiness,
    working: false,
    department,
    mintedAt: new Date().toISOString(),
    ownerId,
    experience,
    maxExperience: calculateMaxExperience(level),
    skills,
    totalEarned: 0,
  };

  // Calculate daily earnings based on other properties
  return {
    ...character,
    dailyEarnings: calculateDailyEarnings(character as Character),
  };
};

const generateRandomName = (): string => {
  const firstNames = [
    'Alex', 'Blake', 'Casey', 'Drew', 'Emery', 'Finley', 'Gray', 'Harper',
    'Indigo', 'Jordan', 'Kai', 'Logan', 'Morgan', 'Nova', 'Parker', 'Quinn',
    'River', 'Sage', 'Taylor', 'Avery', 'Brooklyn', 'Cameron', 'Dakota',
    'Eden', 'Frankie', 'Harley', 'Jaime', 'Kerry', 'Lane', 'Marley'
  ];
  
  const lastNames = [
    'Builder', 'Creator', 'Designer', 'Engineer', 'Expert', 'Guardian',
    'Helper', 'Innovator', 'Leader', 'Maker', 'Navigator', 'Operator',
    'Pioneer', 'Researcher', 'Specialist', 'Strategist', 'Technician',
    'Visionary', 'Worker', 'Achiever', 'Challenger', 'Developer',
    'Enabler', 'Facilitator', 'Generator', 'Handler', 'Implementer'
  ];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${lastName}`;
};

// Character validation
export const validateCharacter = (character: Partial<Character>): string[] => {
  const errors: string[] = [];
  
  if (!character.name || character.name.trim().length === 0) {
    errors.push('Character name is required');
  }
  
  if (!character.type || !Object.keys(CHARACTER_TYPES).includes(character.type)) {
    errors.push('Valid character type is required');
  }
  
  if (!character.job || character.job.trim().length === 0) {
    errors.push('Character job is required');
  }
  
  if (typeof character.level !== 'number' || character.level < 1 || character.level > 100) {
    errors.push('Character level must be between 1 and 100');
  }
  
  if (typeof character.happiness !== 'number' || character.happiness < 0 || character.happiness > 100) {
    errors.push('Character happiness must be between 0 and 100');
  }
  
  if (!character.department || !CHARACTER_DEPARTMENTS.includes(character.department as any)) {
    errors.push('Valid department is required');
  }
  
  return errors;
};

// Character comparison utilities
export const compareCharacters = (a: Character, b: Character, sortBy: CharacterSortOption): number => {
  switch (sortBy) {
    case 'name':
      return a.name.localeCompare(b.name);
    case 'level':
      return b.level - a.level;
    case 'dailyEarnings':
      return b.dailyEarnings - a.dailyEarnings;
    case 'happiness':
      return b.happiness - a.happiness;
    case 'type':
      const typeOrder = { legendary: 3, rare: 2, common: 1 };
      return typeOrder[b.type] - typeOrder[a.type];
    case 'mintedAt':
      return new Date(b.mintedAt).getTime() - new Date(a.mintedAt).getTime();
    default:
      return 0;
  }
};

export const filterCharacters = (characters: Character[], filters: CharacterFilters): Character[] => {
  return characters.filter(character => {
    // Type filter
    if (filters.type !== 'all' && character.type !== filters.type) {
      return false;
    }
    
    // Department filter
    if (filters.department && character.department !== filters.department) {
      return false;
    }
    
    // Working status filter
    if (filters.working !== null && character.working !== filters.working) {
      return false;
    }
    
    // Level range filter
    if (character.level < filters.level.min || character.level > filters.level.max) {
      return false;
    }
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableText = `${character.name} ${character.job} ${character.department}`.toLowerCase();
      if (!searchableText.includes(searchTerm)) {
        return false;
      }
    }
    
    return true;
  });
};
