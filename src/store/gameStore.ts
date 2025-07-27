import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

// Types for our game state
export interface Character {
  id: string;
  name: string;
  type: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  level: number;
  job: string | null;
  department: string | null;
  dailyEarnings: number;
  happiness: number;
  working: boolean;
  image: string;
  experience: number;
  skills: {
    productivity: number;
    leadership: number;
    creativity: number;
    technical: number;
  };
  mintedAt: Date;
  lastWorked: Date | null;
}

export interface BuildingData {
  totalEmployees: number;
  availableJobs: number;
  buildingEfficiency: number;
  dailyLuncPool: number;
  departments: {
    production: { capacity: number; occupied: number };
    management: { capacity: number; occupied: number };
    research: { capacity: number; occupied: number };
    marketing: { capacity: number; occupied: number };
  };
}

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  notificationsEnabled: boolean;
  autoCollectEnabled: boolean;
  language: 'de' | 'en';
  theme: 'light' | 'dark' | 'auto';
}

// Main game store interface
interface GameStore {
  // Character management
  characters: Character[];
  selectedCharacter: Character | null;
  
  // Economy
  luncBalance: number;
  totalEarnings: number;
  dailyEarnings: number;
  
  // Building management
  buildingData: BuildingData;
  
  // UI state
  currentView: string;
  isLoading: boolean;
  notifications: NotificationData[];
  settings: GameSettings;
  
  // Web3 state
  walletConnected: boolean;
  walletAddress: string | null;
  networkId: number | null;
  
  // Actions - Character management
  addCharacter: (character: Character) => void;
  removeCharacter: (characterId: string) => void;
  updateCharacter: (characterId: string, updates: Partial<Character>) => void;
  selectCharacter: (character: Character | null) => void;
  assignJob: (characterId: string, job: string, department: string) => void;
  levelUpCharacter: (characterId: string) => void;
  
  // Actions - Economy
  updateLuncBalance: (amount: number) => void;
  addEarnings: (amount: number) => void;
  collectDailyEarnings: () => void;
  spendLunc: (amount: number) => boolean;
  
  // Actions - Building management
  updateBuildingData: (data: Partial<BuildingData>) => void;
  hireEmployee: (department: string) => boolean;
  fireEmployee: (department: string) => boolean;
  
  // Actions - UI management
  setCurrentView: (view: string) => void;
  setLoading: (loading: boolean) => void;
  addNotification: (notification: Omit<NotificationData, 'id' | 'timestamp'>) => void;
  markNotificationRead: (notificationId: string) => void;
  clearNotifications: () => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  
  // Actions - Web3 management
  connectWallet: (address: string, networkId: number) => void;
  disconnectWallet: () => void;
  
  // Computed values
  getWorkingCharacters: () => Character[];
  getCharactersByDepartment: (department: string) => Character[];
  getTotalDailyEarnings: () => number;
  getCharacterCount: () => number;
  getUnreadNotifications: () => NotificationData[];
}

// Default values
const defaultBuildingData: BuildingData = {
  totalEmployees: 0,
  availableJobs: 20,
  buildingEfficiency: 100,
  dailyLuncPool: 10000,
  departments: {
    production: { capacity: 10, occupied: 0 },
    management: { capacity: 5, occupied: 0 },
    research: { capacity: 3, occupied: 0 },
    marketing: { capacity: 2, occupied: 0 }
  }
};

const defaultSettings: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  notificationsEnabled: true,
  autoCollectEnabled: false,
  language: 'de',
  theme: 'auto'
};

// Create the store with persistence
export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        characters: [],
        selectedCharacter: null,
        luncBalance: 1000, // Starting balance
        totalEarnings: 0,
        dailyEarnings: 0,
        buildingData: defaultBuildingData,
        currentView: 'home',
        isLoading: false,
        notifications: [],
        settings: defaultSettings,
        walletConnected: false,
        walletAddress: null,
        networkId: null,

        // Character management actions
        addCharacter: (character) =>
          set((state) => ({
            characters: [...state.characters, character],
          })),

        removeCharacter: (characterId) =>
          set((state) => ({
            characters: state.characters.filter((c) => c.id !== characterId),
            selectedCharacter: 
              state.selectedCharacter?.id === characterId 
                ? null 
                : state.selectedCharacter,
          })),

        updateCharacter: (characterId, updates) =>
          set((state) => ({
            characters: state.characters.map((character) =>
              character.id === characterId 
                ? { ...character, ...updates }
                : character
            ),
          })),

        selectCharacter: (character) =>
          set({ selectedCharacter: character }),

        assignJob: (characterId, job, department) => {
          const state = get();
          const character = state.characters.find((c) => c.id === characterId);
          const dept = state.buildingData.departments[department as keyof typeof state.buildingData.departments];
          
          if (character && dept && dept.occupied < dept.capacity) {
            set((state) => ({
              characters: state.characters.map((c) =>
                c.id === characterId
                  ? { 
                      ...c, 
                      job, 
                      department, 
                      working: true,
                      lastWorked: new Date()
                    }
                  : c
              ),
              buildingData: {
                ...state.buildingData,
                departments: {
                  ...state.buildingData.departments,
                  [department]: {
                    ...dept,
                    occupied: dept.occupied + 1
                  }
                }
              }
            }));
          }
        },

        levelUpCharacter: (characterId) => {
          const state = get();
          const character = state.characters.find((c) => c.id === characterId);
          
          if (character && character.experience >= character.level * 100) {
            set((state) => ({
              characters: state.characters.map((c) =>
                c.id === characterId
                  ? {
                      ...c,
                      level: c.level + 1,
                      experience: c.experience - (c.level * 100),
                      dailyEarnings: Math.floor(c.dailyEarnings * 1.1),
                      skills: {
                        productivity: Math.min(100, c.skills.productivity + 2),
                        leadership: Math.min(100, c.skills.leadership + 1),
                        creativity: Math.min(100, c.skills.creativity + 1),
                        technical: Math.min(100, c.skills.technical + 1),
                      }
                    }
                  : c
              ),
            }));
            
            get().addNotification({
              type: 'success',
              title: 'Level Up!',
              message: `${character.name} ist auf Level ${character.level + 1} aufgestiegen!`,
              read: false
            });
          }
        },

        // Economy actions
        updateLuncBalance: (amount) =>
          set((state) => ({
            luncBalance: Math.max(0, state.luncBalance + amount),
          })),

        addEarnings: (amount) =>
          set((state) => ({
            totalEarnings: state.totalEarnings + amount,
            luncBalance: state.luncBalance + amount,
          })),

        collectDailyEarnings: () => {
          const state = get();
          const dailyEarnings = state.getTotalDailyEarnings();
          
          if (dailyEarnings > 0) {
            set((state) => ({
              luncBalance: state.luncBalance + dailyEarnings,
              totalEarnings: state.totalEarnings + dailyEarnings,
            }));
            
            get().addNotification({
              type: 'success',
              title: 'Einnahmen gesammelt!',
              message: `Du hast ${dailyEarnings} LUNC gesammelt!`,
              read: false
            });
          }
        },

        spendLunc: (amount) => {
          const state = get();
          if (state.luncBalance >= amount) {
            set((state) => ({
              luncBalance: state.luncBalance - amount,
            }));
            return true;
          }
          
          get().addNotification({
            type: 'error',
            title: 'Nicht genügend LUNC',
            message: `Du benötigst ${amount} LUNC, hast aber nur ${state.luncBalance}.`,
            read: false
          });
          return false;
        },

        // Building management actions
        updateBuildingData: (data) =>
          set((state) => ({
            buildingData: { ...state.buildingData, ...data },
          })),

        hireEmployee: (department) => {
          const state = get();
          const dept = state.buildingData.departments[department as keyof typeof state.buildingData.departments];
          
          if (dept && dept.occupied < dept.capacity) {
            set((state) => ({
              buildingData: {
                ...state.buildingData,
                departments: {
                  ...state.buildingData.departments,
                  [department]: {
                    ...dept,
                    occupied: dept.occupied + 1
                  }
                }
              }
            }));
            return true;
          }
          return false;
        },

        fireEmployee: (department) => {
          const state = get();
          const dept = state.buildingData.departments[department as keyof typeof state.buildingData.departments];
          
          if (dept && dept.occupied > 0) {
            set((state) => ({
              buildingData: {
                ...state.buildingData,
                departments: {
                  ...state.buildingData.departments,
                  [department]: {
                    ...dept,
                    occupied: dept.occupied - 1
                  }
                }
              }
            }));
            return true;
          }
          return false;
        },

        // UI management actions
        setCurrentView: (view) => set({ currentView: view }),
        setLoading: (loading) => set({ isLoading: loading }),

        addNotification: (notification) =>
          set((state) => ({
            notifications: [
              {
                ...notification,
                id: Date.now().toString(),
                timestamp: new Date(),
              },
              ...state.notifications,
            ].slice(0, 50), // Keep only last 50 notifications
          })),

        markNotificationRead: (notificationId) =>
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === notificationId ? { ...n, read: true } : n
            ),
          })),

        clearNotifications: () => set({ notifications: [] }),

        updateSettings: (newSettings) =>
          set((state) => ({
            settings: { ...state.settings, ...newSettings },
          })),

        // Web3 management actions
        connectWallet: (address, networkId) =>
          set({
            walletConnected: true,
            walletAddress: address,
            networkId,
          }),

        disconnectWallet: () =>
          set({
            walletConnected: false,
            walletAddress: null,
            networkId: null,
          }),

        // Computed values
        getWorkingCharacters: () => {
          const state = get();
          return state.characters.filter((character) => character.working);
        },

        getCharactersByDepartment: (department) => {
          const state = get();
          return state.characters.filter((character) => character.department === department);
        },

        getTotalDailyEarnings: () => {
          const state = get();
          return state.characters
            .filter((character) => character.working)
            .reduce((total, character) => total + character.dailyEarnings, 0);
        },

        getCharacterCount: () => {
          const state = get();
          return state.characters.length;
        },

        getUnreadNotifications: () => {
          const state = get();
          return state.notifications.filter((notification) => !notification.read);
        },
      }),
      {
        name: 'virtual-building-empire-game-store',
        partialize: (state) => ({
          characters: state.characters,
          luncBalance: state.luncBalance,
          totalEarnings: state.totalEarnings,
          buildingData: state.buildingData,
          settings: state.settings,
          // Don't persist temporary UI state
        }),
      }
    ),
    {
      name: 'VirtualBuildingEmpire',
    }
  )
);

// Utility hooks for specific parts of the store
export const useCharacters = () => useGameStore((state) => state.characters);
export const useSelectedCharacter = () => useGameStore((state) => state.selectedCharacter);
export const useLuncBalance = () => useGameStore((state) => state.luncBalance);
export const useBuildingData = () => useGameStore((state) => state.buildingData);
export const useNotifications = () => useGameStore((state) => state.notifications);
export const useSettings = () => useGameStore((state) => state.settings);
export const useWallet = () => useGameStore((state) => ({
  connected: state.walletConnected,
  address: state.walletAddress,
  networkId: state.networkId,
}));