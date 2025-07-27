// Building feature types and interfaces
export interface Building {
  id: string;
  name: string;
  level: number;
  totalFloors: number;
  totalEmployees: number;
  maxCapacity: number;
  buildingEfficiency: number;
  dailyLuncPool: number;
  departments: Department[];
  upgrades: BuildingUpgrade[];
  ownerId: string;
  constructedAt: string;
  lastUpgraded?: string;
}

export interface Department {
  id: string;
  name: string;
  floor: number;
  level: number;
  capacity: number;
  currentEmployees: number;
  jobs: Job[];
  specialization: DepartmentSpecialization;
  bonuses: DepartmentBonus[];
  efficiency: number;
  isActive: boolean;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  department: string;
  floor: number;
  requirements: JobRequirements;
  rewards: JobRewards;
  isOccupied: boolean;
  assignedCharacter?: string;
  performance: number;
  createdAt: string;
  lastAssigned?: string;
}

export interface JobRequirements {
  minLevel: number;
  maxLevel?: number;
  preferredTypes: Character['type'][];
  requiredSkills: string[];
  minimumHappiness: number;
  departmentExperience?: number;
}

export interface JobRewards {
  baseLunc: number;
  experienceGain: number;
  happinessGain: number;
  skillBonuses: Record<string, number>;
  levelBonus: number;
  performanceMultiplier: number;
}

export interface DepartmentSpecialization {
  type: 'management' | 'technical' | 'creative' | 'support' | 'operations';
  bonuses: {
    productivityBonus: number;
    earningsMultiplier: number;
    experienceGain: number;
    capacityBonus: number;
  };
  requirements: {
    minBuildingLevel: number;
    prerequisites: string[];
  };
}

export interface DepartmentBonus {
  id: string;
  name: string;
  description: string;
  type: 'permanent' | 'temporary' | 'conditional';
  effect: {
    target: 'earnings' | 'experience' | 'happiness' | 'efficiency' | 'capacity';
    value: number;
    isPercentage: boolean;
  };
  conditions?: {
    characterCount?: number;
    averageLevel?: number;
    happiness?: number;
    timeOfDay?: string;
  };
  expiresAt?: string;
  isActive: boolean;
}

export interface BuildingUpgrade {
  id: string;
  name: string;
  description: string;
  type: 'floor' | 'department' | 'capacity' | 'efficiency' | 'automation';
  cost: {
    lunc: number;
    materials?: Record<string, number>;
    time: number; // in hours
  };
  requirements: {
    buildingLevel: number;
    prerequisites: string[];
    characterRequirements?: {
      count: number;
      types?: Character['type'][];
      departments?: string[];
    };
  };
  effects: {
    capacityIncrease?: number;
    efficiencyBoost?: number;
    newDepartments?: string[];
    automationLevel?: number;
    bonuses?: DepartmentBonus[];
  };
  isCompleted: boolean;
  startedAt?: string;
  completedAt?: string;
}

export interface BuildingStatistics {
  totalRevenue: number;
  averageProductivity: number;
  employeeHappiness: number;
  departmentEfficiency: Record<string, number>;
  dailyGrowth: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
  topPerformingDepartments: string[];
  underperformingDepartments: string[];
  uptime: number;
}

export interface FloorPlan {
  floor: number;
  departments: Department[];
  capacity: number;
  utilization: number;
  theme: 'office' | 'laboratory' | 'workshop' | 'executive' | 'lobby';
  amenities: FloorAmenity[];
  isUnlocked: boolean;
}

export interface FloorAmenity {
  id: string;
  name: string;
  type: 'cafeteria' | 'gym' | 'lounge' | 'meeting_room' | 'library' | 'game_room';
  effect: {
    happiness: number;
    productivity: number;
    capacity: number;
  };
  cost: number;
  maintenanceCost: number;
  isActive: boolean;
}

// Building actions
export type BuildingAction = 
  | { type: 'UPDATE_BUILDING'; payload: { id: string; updates: Partial<Building> } }
  | { type: 'ADD_DEPARTMENT'; payload: { buildingId: string; department: Department } }
  | { type: 'UPDATE_DEPARTMENT'; payload: { departmentId: string; updates: Partial<Department> } }
  | { type: 'REMOVE_DEPARTMENT'; payload: { departmentId: string } }
  | { type: 'ADD_JOB'; payload: { departmentId: string; job: Job } }
  | { type: 'UPDATE_JOB'; payload: { jobId: string; updates: Partial<Job> } }
  | { type: 'ASSIGN_CHARACTER_TO_JOB'; payload: { jobId: string; characterId: string } }
  | { type: 'REMOVE_CHARACTER_FROM_JOB'; payload: { jobId: string } }
  | { type: 'START_UPGRADE'; payload: { buildingId: string; upgradeId: string } }
  | { type: 'COMPLETE_UPGRADE'; payload: { buildingId: string; upgradeId: string } }
  | { type: 'ADD_AMENITY'; payload: { floor: number; amenity: FloorAmenity } }
  | { type: 'UPDATE_STATISTICS'; payload: { buildingId: string; stats: Partial<BuildingStatistics> } };

// Building state
export interface BuildingState {
  buildings: Building[];
  selectedBuilding: Building | null;
  availableUpgrades: BuildingUpgrade[];
  floorPlans: FloorPlan[];
  statistics: BuildingStatistics | null;
  isLoading: boolean;
  error: string | null;
  view: 'overview' | 'floor' | 'department' | 'jobs';
  selectedFloor: number;
  selectedDepartment: string | null;
}

// Constants
export const BUILDING_TYPES = {
  headquarters: {
    name: 'Headquarters',
    maxFloors: 25,
    baseCapacity: 100,
    description: 'Main office building for your empire'
  },
  factory: {
    name: 'Factory',
    maxFloors: 15,
    baseCapacity: 200,
    description: 'Manufacturing facility for production'
  },
  laboratory: {
    name: 'Laboratory',
    maxFloors: 10,
    baseCapacity: 50,
    description: 'Research and development center'
  },
} as const;

export const DEPARTMENT_TYPES = {
  Management: {
    color: '#3b82f6',
    icon: '👔',
    specialization: 'management',
    baseCapacity: 10,
    description: 'Strategic leadership and decision making'
  },
  IT: {
    color: '#10b981',
    icon: '💻',
    specialization: 'technical',
    baseCapacity: 15,
    description: 'Technology development and maintenance'
  },
  HR: {
    color: '#f59e0b',
    icon: '👥',
    specialization: 'support',
    baseCapacity: 8,
    description: 'Human resources and employee management'
  },
  Finance: {
    color: '#8b5cf6',
    icon: '💰',
    specialization: 'operations',
    baseCapacity: 12,
    description: 'Financial planning and analysis'
  },
  Operations: {
    color: '#ef4444',
    icon: '⚙️',
    specialization: 'operations',
    baseCapacity: 20,
    description: 'Day-to-day business operations'
  },
  Security: {
    color: '#6b7280',
    icon: '🛡️',
    specialization: 'support',
    baseCapacity: 6,
    description: 'Building and data security'
  },
  Research: {
    color: '#06b6d4',
    icon: '🔬',
    specialization: 'technical',
    baseCapacity: 10,
    description: 'Research and innovation'
  },
  Marketing: {
    color: '#ec4899',
    icon: '📢',
    specialization: 'creative',
    baseCapacity: 12,
    description: 'Brand promotion and market analysis'
  },
  Sales: {
    color: '#84cc16',
    icon: '💼',
    specialization: 'operations',
    baseCapacity: 15,
    description: 'Revenue generation and client relations'
  },
  Administration: {
    color: '#a3a3a3',
    icon: '📋',
    specialization: 'support',
    baseCapacity: 8,
    description: 'Administrative support and coordination'
  },
} as const;

export const JOB_LEVELS = {
  entry: {
    name: 'Entry Level',
    levelRange: [1, 3],
    baseEarnings: 20,
    description: 'Starting positions for new employees'
  },
  junior: {
    name: 'Junior',
    levelRange: [3, 7],
    baseEarnings: 40,
    description: 'Developing professionals with basic experience'
  },
  senior: {
    name: 'Senior',
    levelRange: [7, 15],
    baseEarnings: 80,
    description: 'Experienced professionals with advanced skills'
  },
  lead: {
    name: 'Lead',
    levelRange: [15, 25],
    baseEarnings: 120,
    description: 'Leadership roles with team responsibility'
  },
  executive: {
    name: 'Executive',
    levelRange: [25, 50],
    baseEarnings: 200,
    description: 'Senior leadership and strategic positions'
  },
} as const;

// Utility functions
export const calculateBuildingEfficiency = (building: Building): number => {
  const departmentEfficiencies = building.departments.map(dept => dept.efficiency);
  const avgDepartmentEfficiency = departmentEfficiencies.reduce((sum, eff) => sum + eff, 0) / departmentEfficiencies.length;
  
  const capacityUtilization = building.totalEmployees / building.maxCapacity;
  const levelBonus = building.level * 0.05; // 5% per level
  
  return Math.min(100, avgDepartmentEfficiency * capacityUtilization + levelBonus);
};

export const calculateDepartmentCapacity = (department: Department): number => {
  const baseCapacity = DEPARTMENT_TYPES[department.name as keyof typeof DEPARTMENT_TYPES]?.baseCapacity || 10;
  const levelBonus = department.level * 2;
  const bonusCapacity = department.bonuses
    .filter(bonus => bonus.effect.target === 'capacity' && bonus.isActive)
    .reduce((sum, bonus) => sum + bonus.effect.value, 0);
  
  return baseCapacity + levelBonus + bonusCapacity;
};

export const calculateJobEarnings = (job: Job, character?: Character): number => {
  let earnings = job.rewards.baseLunc;
  
  if (character) {
    // Level bonus
    earnings += job.rewards.levelBonus * character.level;
    
    // Performance multiplier
    earnings *= job.rewards.performanceMultiplier;
    
    // Character type bonus
    if (job.requirements.preferredTypes.includes(character.type)) {
      earnings *= 1.2; // 20% bonus for preferred type
    }
    
    // Happiness factor
    const happinessFactor = character.happiness / 100;
    earnings *= happinessFactor;
  }
  
  return Math.floor(earnings);
};

export const generateAvailableJobs = (department: Department, count: number = 5): Job[] => {
  const jobTypes = [
    'Analyst', 'Specialist', 'Coordinator', 'Manager', 'Director',
    'Associate', 'Consultant', 'Administrator', 'Supervisor', 'Executive'
  ];
  
  return Array.from({ length: count }, (_, index) => ({
    id: `job_${department.id}_${index}`,
    title: `${jobTypes[index % jobTypes.length]} - ${department.name}`,
    description: `${jobTypes[index % jobTypes.length]} position in the ${department.name} department`,
    department: department.id,
    floor: department.floor,
    requirements: {
      minLevel: Math.floor(Math.random() * 10) + 1,
      preferredTypes: ['common', 'rare', 'legendary'].slice(0, Math.floor(Math.random() * 3) + 1) as Character['type'][],
      requiredSkills: [],
      minimumHappiness: 70,
    },
    rewards: {
      baseLunc: Math.floor(Math.random() * 100) + 50,
      experienceGain: 10,
      happinessGain: 5,
      skillBonuses: {},
      levelBonus: 5,
      performanceMultiplier: 1.0,
    },
    isOccupied: false,
    performance: 100,
    createdAt: new Date().toISOString(),
  }));
};

export const createDefaultBuilding = (ownerId: string): Building => {
  const departments: Department[] = [
    {
      id: 'dept_management',
      name: 'Management',
      floor: 25,
      level: 1,
      capacity: 10,
      currentEmployees: 0,
      jobs: [],
      specialization: {
        type: 'management',
        bonuses: {
          productivityBonus: 0.15,
          earningsMultiplier: 1.2,
          experienceGain: 0.1,
          capacityBonus: 0.05,
        },
        requirements: {
          minBuildingLevel: 1,
          prerequisites: [],
        },
      },
      bonuses: [],
      efficiency: 100,
      isActive: true,
    },
    {
      id: 'dept_it',
      name: 'IT',
      floor: 20,
      level: 1,
      capacity: 15,
      currentEmployees: 0,
      jobs: [],
      specialization: {
        type: 'technical',
        bonuses: {
          productivityBonus: 0.1,
          earningsMultiplier: 1.1,
          experienceGain: 0.15,
          capacityBonus: 0.0,
        },
        requirements: {
          minBuildingLevel: 1,
          prerequisites: [],
        },
      },
      bonuses: [],
      efficiency: 95,
      isActive: true,
    },
  ];

  // Generate jobs for each department
  departments.forEach(dept => {
    dept.jobs = generateAvailableJobs(dept, 5);
  });

  return {
    id: `building_${Date.now()}`,
    name: 'Virtual Building Empire HQ',
    level: 1,
    totalFloors: 25,
    totalEmployees: 0,
    maxCapacity: 100,
    buildingEfficiency: 100,
    dailyLuncPool: 25000,
    departments,
    upgrades: [],
    ownerId,
    constructedAt: new Date().toISOString(),
  };
};

export const validateJobAssignment = (job: Job, character: Character): { valid: boolean; reasons: string[] } => {
  const reasons: string[] = [];
  
  if (job.isOccupied) {
    reasons.push('Job is already occupied');
  }
  
  if (character.level < job.requirements.minLevel) {
    reasons.push(`Character level ${character.level} is below minimum required level ${job.requirements.minLevel}`);
  }
  
  if (job.requirements.maxLevel && character.level > job.requirements.maxLevel) {
    reasons.push(`Character level ${character.level} exceeds maximum level ${job.requirements.maxLevel}`);
  }
  
  if (character.happiness < job.requirements.minimumHappiness) {
    reasons.push(`Character happiness ${character.happiness} is below minimum required ${job.requirements.minimumHappiness}`);
  }
  
  if (character.working) {
    reasons.push('Character is already assigned to another job');
  }
  
  return {
    valid: reasons.length === 0,
    reasons,
  };
};

// Import Character type for type checking
interface Character {
  id: string;
  name: string;
  type: 'common' | 'rare' | 'legendary';
  level: number;
  happiness: number;
  working: boolean;
  department: string;
}
