import { GameState, Character, Quest, Achievement } from '../types';

// Initial game state
export const initialGameState: GameState = {
  user: {
    id: '',
    walletAddress: '',
    username: 'Player',
    level: 1,
    experience: 0,
    joinDate: new Date(),
    statistics: {
      totalCharacters: 0,
      totalEarnings: 0,
      totalPlayTime: 0,
      achievementsUnlocked: 0,
      questsCompleted: 0,
      buildingEfficiency: 100,
      averageCharacterLevel: 1,
    },
    preferences: {
      theme: 'dark',
      notifications: true,
      autoCollect: false,
      sound: true,
      language: 'en',
    },
  },
  characters: [],
  building: {
    id: 'main-building',
    name: 'Virtual Empire HQ',
    level: 1,
    totalFloors: 25,
    departments: [
      {
        id: 'management',
        name: 'Management',
        floor: 25,
        maxCharacters: 3,
        currentCharacters: [],
        baseEarnings: 100,
        efficiencyBonus: 1.2,
        description: 'Strategic decision making and company leadership',
        requirements: [{ type: 'level', value: 10 }],
        upgrades: [],
      },
      {
        id: 'it',
        name: 'IT Department',
        floor: 20,
        maxCharacters: 5,
        currentCharacters: [],
        baseEarnings: 80,
        efficiencyBonus: 1.1,
        description: 'Technology infrastructure and digital solutions',
        requirements: [{ type: 'skill', value: 50, skill: 'intelligence' }],
        upgrades: [],
      },
      {
        id: 'hr',
        name: 'Human Resources',
        floor: 15,
        maxCharacters: 4,
        currentCharacters: [],
        baseEarnings: 70,
        efficiencyBonus: 1.15,
        description: 'Employee relations and talent management',
        requirements: [{ type: 'skill', value: 40, skill: 'charisma' }],
        upgrades: [],
      },
      {
        id: 'finance',
        name: 'Finance',
        floor: 18,
        maxCharacters: 4,
        currentCharacters: [],
        baseEarnings: 90,
        efficiencyBonus: 1.25,
        description: 'Financial planning and resource management',
        requirements: [{ type: 'skill', value: 45, skill: 'intelligence' }],
        upgrades: [],
      },
      {
        id: 'operations',
        name: 'Operations',
        floor: 10,
        maxCharacters: 6,
        currentCharacters: [],
        baseEarnings: 60,
        efficiencyBonus: 1.0,
        description: 'Daily business operations and logistics',
        requirements: [{ type: 'level', value: 1 }],
        upgrades: [],
      },
      {
        id: 'security',
        name: 'Security',
        floor: 5,
        maxCharacters: 3,
        currentCharacters: [],
        baseEarnings: 75,
        efficiencyBonus: 1.1,
        description: 'Building security and risk management',
        requirements: [{ type: 'skill', value: 35, skill: 'productivity' }],
        upgrades: [],
      },
      {
        id: 'administration',
        name: 'Administration',
        floor: 8,
        maxCharacters: 5,
        currentCharacters: [],
        baseEarnings: 55,
        efficiencyBonus: 1.05,
        description: 'Administrative support and coordination',
        requirements: [{ type: 'level', value: 1 }],
        upgrades: [],
      },
    ],
    upgrades: [
      {
        id: 'elevator',
        name: 'High-Speed Elevator',
        description: 'Faster character movement between floors',
        cost: 1000,
        costType: 'lunc',
        effect: { type: 'efficiency', value: 10, isPercentage: true },
        category: 'infrastructure',
        unlocked: true,
        purchased: false,
      },
      {
        id: 'aircon',
        name: 'Climate Control',
        description: 'Improved working conditions boost happiness',
        cost: 500,
        costType: 'lunc',
        effect: { type: 'happiness', value: 15, isPercentage: true },
        category: 'efficiency',
        unlocked: true,
        purchased: false,
      },
      {
        id: 'cafeteria',
        name: 'Employee Cafeteria',
        description: 'Increases productivity and employee satisfaction',
        cost: 2000,
        costType: 'lunc',
        effect: { type: 'earnings', value: 20, isPercentage: true },
        category: 'efficiency',
        unlocked: true,
        purchased: false,
      },
    ],
    decorations: [],
    efficiency: 100,
    happiness: 75,
  },
  economy: {
    luncBalance: 100,
    ethBalance: 0,
    dailyEarnings: 0,
    totalEarnings: 0,
    marketData: {
      luncPrice: 0.0001,
      ethPrice: 2000,
      characterFloorPrice: 0.05,
      averageCharacterPrice: 0.15,
      totalVolume24h: 10000,
      priceHistory: [],
    },
    transactions: [],
  },
  quests: [
    {
      id: 'first-character',
      title: 'Welcome to the Empire',
      description: 'Mint your first character to get started',
      type: 'special',
      category: 'collection',
      requirements: [
        {
          id: 'mint-req',
          description: 'Mint 1 character',
          type: 'count',
          target: 1,
          current: 0,
          category: 'minting',
        },
      ],
      rewards: [
        { type: 'lunc', amount: 50, description: '50 LUNC bonus' },
        { type: 'experience', amount: 100, description: '100 XP' },
      ],
      progress: {
        started: new Date(),
        lastUpdate: new Date(),
        completion: 0,
      },
      isCompleted: false,
      isActive: true,
    },
    {
      id: 'daily-collection',
      title: 'Daily Earnings',
      description: 'Collect your daily earnings from working characters',
      type: 'daily',
      category: 'earning',
      requirements: [
        {
          id: 'collect-req',
          description: 'Collect earnings 1 time',
          type: 'count',
          target: 1,
          current: 0,
          category: 'collection',
        },
      ],
      rewards: [
        { type: 'lunc', amount: 25, description: '25 LUNC bonus' },
      ],
      progress: {
        started: new Date(),
        lastUpdate: new Date(),
        completion: 0,
      },
      isCompleted: false,
      isActive: true,
    },
  ],
  achievements: [
    {
      id: 'collector-novice',
      title: 'Character Collector',
      description: 'Collect your first 5 characters',
      category: 'collector',
      tier: 'bronze',
      requirements: [
        {
          type: 'total',
          description: 'Own 5 characters',
          target: 5,
          current: 0,
        },
      ],
      rewards: [
        { type: 'lunc', amount: 100, description: '100 LUNC reward' },
      ],
      isUnlocked: false,
      progress: 0,
      isSecret: false,
    },
  ],
  social: {
    friends: [],
    leaderboards: [],
    guilds: [],
    messages: [],
    notifications: [],
  },
  settings: {
    version: '2.1.0',
    maintenance: false,
    features: {
      marketplace: true,
      social: true,
      quests: true,
      analytics: true,
      multichain: false,
      aiFeatures: false,
    },
    economy: {
      baseEarningsRate: 1.0,
      rarityMultipliers: {
        Common: 1.0,
        Rare: 1.5,
        Legendary: 2.5,
      },
      maxDailyEarnings: 1000,
      marketplaceFee: 2.5,
      characterMintPrice: {
        Common: 0.05,
        Rare: 0.15,
        Legendary: 0.5,
      },
    },
    limits: {
      maxCharacters: 50,
      maxFriends: 100,
      maxDailyQuests: 5,
      maxBuildingUpgrades: 20,
    },
  },
  lastUpdate: new Date(),
};

// Game reducer
export function gameReducer(state: GameState, action: any): GameState {
  switch (action.type) {
    case 'LOAD_GAME':
      return {
        ...action.payload,
        lastUpdate: new Date(),
      };

    case 'RESET_GAME':
      return {
        ...initialGameState,
        user: {
          ...initialGameState.user,
          walletAddress: state.user.walletAddress,
        },
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
        lastUpdate: new Date(),
      };

    case 'ADD_CHARACTER':
      const newCharacter = action.payload;
      return {
        ...state,
        characters: [...state.characters, newCharacter],
        user: {
          ...state.user,
          statistics: {
            ...state.user.statistics,
            totalCharacters: state.user.statistics.totalCharacters + 1,
          },
        },
        lastUpdate: new Date(),
      };

    case 'REMOVE_CHARACTER':
      return {
        ...state,
        characters: state.characters.filter(c => c.id !== action.payload),
        lastUpdate: new Date(),
      };

    case 'UPDATE_CHARACTER':
      return {
        ...state,
        characters: state.characters.map(character =>
          character.id === action.payload.characterId
            ? { ...character, ...action.payload.updates }
            : character
        ),
        lastUpdate: new Date(),
      };

    case 'ASSIGN_JOB':
      const { characterId, departmentId, position } = action.payload;
      
      // Remove character from current department if any
      const updatedDepartments = state.building.departments.map(dept => ({
        ...dept,
        currentCharacters: dept.currentCharacters.filter(c => c.id !== characterId),
      }));

      // Add character to new department
      const targetDepartment = updatedDepartments.find(d => d.id === departmentId);
      if (targetDepartment) {
        const character = state.characters.find(c => c.id === characterId);
        if (character) {
          targetDepartment.currentCharacters.push(character);
        }
      }

      return {
        ...state,
        characters: state.characters.map(character =>
          character.id === characterId
            ? {
                ...character,
                department: state.building.departments.find(d => d.id === departmentId),
                jobPosition: { id: position, title: position, department: departmentId, salary: 0, requirements: [], experience: 0, description: '' },
                isWorking: true,
              }
            : character
        ),
        building: {
          ...state.building,
          departments: updatedDepartments,
        },
        lastUpdate: new Date(),
      };

    case 'ADD_LUNC':
      const { amount, source } = action.payload;
      return {
        ...state,
        economy: {
          ...state.economy,
          luncBalance: state.economy.luncBalance + amount,
          totalEarnings: state.economy.totalEarnings + amount,
          transactions: [
            ...state.economy.transactions,
            {
              id: Date.now().toString(),
              type: 'earnings',
              amount,
              currency: 'lunc',
              timestamp: new Date(),
              description: source,
            },
          ],
        },
        user: {
          ...state.user,
          statistics: {
            ...state.user.statistics,
            totalEarnings: state.user.statistics.totalEarnings + amount,
          },
        },
        lastUpdate: new Date(),
      };

    case 'SPEND_LUNC':
      const { amount: spendAmount, description } = action.payload;
      return {
        ...state,
        economy: {
          ...state.economy,
          luncBalance: state.economy.luncBalance - spendAmount,
          transactions: [
            ...state.economy.transactions,
            {
              id: Date.now().toString(),
              type: 'buy',
              amount: -spendAmount,
              currency: 'lunc',
              timestamp: new Date(),
              description,
            },
          ],
        },
        lastUpdate: new Date(),
      };

    case 'UPDATE_ECONOMY':
      return {
        ...state,
        economy: {
          ...state.economy,
          ...action.payload,
        },
        lastUpdate: new Date(),
      };

    case 'ADD_EXPERIENCE':
      const expGain = action.payload;
      const currentLevel = state.user.level;
      const currentExp = state.user.experience;
      const newExp = currentExp + expGain;
      const expNeeded = currentLevel * 100; // Simple level formula
      
      let newLevel = currentLevel;
      let remainingExp = newExp;
      
      while (remainingExp >= (newLevel * 100)) {
        remainingExp -= (newLevel * 100);
        newLevel++;
      }

      return {
        ...state,
        user: {
          ...state.user,
          level: newLevel,
          experience: remainingExp,
        },
        lastUpdate: new Date(),
      };

    case 'UPDATE_QUEST_PROGRESS':
      return {
        ...state,
        quests: state.quests.map(quest =>
          quest.id === action.payload.questId
            ? {
                ...quest,
                progress: {
                  ...quest.progress,
                  completion: action.payload.progress,
                  lastUpdate: new Date(),
                },
                requirements: quest.requirements.map(req => ({
                  ...req,
                  current: Math.min(req.target, Math.floor((action.payload.progress / 100) * req.target)),
                })),
              }
            : quest
        ),
        lastUpdate: new Date(),
      };

    case 'COMPLETE_QUEST':
      return {
        ...state,
        quests: state.quests.map(quest =>
          quest.id === action.payload
            ? { ...quest, isCompleted: true, isActive: false }
            : quest
        ),
        user: {
          ...state.user,
          statistics: {
            ...state.user.statistics,
            questsCompleted: state.user.statistics.questsCompleted + 1,
          },
        },
        lastUpdate: new Date(),
      };

    case 'PURCHASE_BUILDING_UPGRADE':
      return {
        ...state,
        building: {
          ...state.building,
          upgrades: state.building.upgrades.map(upgrade =>
            upgrade.id === action.payload
              ? { ...upgrade, purchased: true }
              : upgrade
          ),
          efficiency: state.building.efficiency + 
            (state.building.upgrades.find(u => u.id === action.payload)?.effect.value || 0),
        },
        lastUpdate: new Date(),
      };

    case 'UPDATE_DEPARTMENT':
      return {
        ...state,
        building: {
          ...state.building,
          departments: state.building.departments.map(dept =>
            dept.id === action.payload.departmentId
              ? { ...dept, ...action.payload.updates }
              : dept
          ),
        },
        lastUpdate: new Date(),
      };

    case 'ADD_FRIEND':
      return {
        ...state,
        social: {
          ...state.social,
          friends: [
            ...state.social.friends,
            {
              userId: action.payload,
              username: `Friend_${action.payload}`,
              level: 1,
              buildingName: 'Unknown Building',
              isOnline: false,
              lastSeen: new Date(),
              friendshipDate: new Date(),
            },
          ],
        },
        lastUpdate: new Date(),
      };

    case 'REMOVE_FRIEND':
      return {
        ...state,
        social: {
          ...state.social,
          friends: state.social.friends.filter(f => f.userId !== action.payload),
        },
        lastUpdate: new Date(),
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
        lastUpdate: new Date(),
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        social: {
          ...state.social,
          notifications: [
            {
              id: Date.now().toString(),
              ...action.payload,
              timestamp: new Date(),
              isRead: false,
            },
            ...state.social.notifications,
          ].slice(0, 50), // Keep only last 50 notifications
        },
        lastUpdate: new Date(),
      };

    default:
      return state;
  }
}
