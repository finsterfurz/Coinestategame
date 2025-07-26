// ===================================
// 🎮 ENHANCED GAME STORE WITH ZUSTAND
// ===================================

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { GameStore, GameState, Character, Job } from '@/types/game.types';
import { generateRandomCharacter } from '@/utils/gameHelpers';

// Initial state
const initialState: GameState = {
  familyData: {
    characters: [],
    totalLunc: 1250,
    familySize: 0,
    dailyEarnings: 0,
    familyLevel: 1,
    totalExperience: 0
  },
  buildingData: {
    totalEmployees: 847,
    availableJobs: 156,
    buildingEfficiency: 78,
    dailyLuncPool: 25000,
    floors: [
      {
        id: 1,
        name: "Lobby",
        department: "Reception",
        capacity: 5,
        currentEmployees: 3,
        efficiency: 85,
        dailyOutput: 150
      },
      {
        id: 2,
        name: "Management Floor",
        department: "Management",
        capacity: 10,
        currentEmployees: 8,
        efficiency: 92,
        dailyOutput: 500
      },
      {
        id: 3,
        name: "IT Department",
        department: "Technology",
        capacity: 15,
        currentEmployees: 12,
        efficiency: 88,
        dailyOutput: 750
      }
    ],
    upgrades: []
  },
  gameSettings: {
    soundEnabled: true,
    notificationsEnabled: true,
    autoCollectLunc: true,
    darkMode: false,
    language: 'de',
    graphics: 'high'
  },
  walletState: {
    isConnected: false
  },
  notifications: [],
  achievements: [],
  marketplaceListings: [],
  loading: {
    characters: false,
    building: false,
    marketplace: false,
    wallet: false
  },
  errors: {}
};

// ===================================
// 🎮 MAIN GAME STORE
// ===================================

export const useGameStore = create<GameStore>()()
  (devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          ...initialState,

          // ===================================
          // 👨‍👩‍👧‍👦 FAMILY ACTIONS
          // ===================================
          
          addCharacter: (character: Character) => {
            set((state) => {
              state.familyData.characters.push(character);
              state.familyData.familySize = state.familyData.characters.length;
              state.familyData.dailyEarnings = state.familyData.characters
                .reduce((sum, char) => sum + char.dailyEarnings, 0);
              
              // Add family bonus
              const familyBonus = character.dailyEarnings * 0.1;
              state.familyData.totalLunc += familyBonus;
            });
          },

          updateCharacter: (id: number, updates: Partial<Character>) => {
            set((state) => {
              const characterIndex = state.familyData.characters.findIndex(c => c.id === id);
              if (characterIndex !== -1) {
                Object.assign(state.familyData.characters[characterIndex], updates);
                
                // Recalculate daily earnings
                state.familyData.dailyEarnings = state.familyData.characters
                  .reduce((sum, char) => sum + char.dailyEarnings, 0);
              }
            });
          },

          removeCharacter: (id: number) => {
            set((state) => {
              state.familyData.characters = state.familyData.characters.filter(c => c.id !== id);
              state.familyData.familySize = state.familyData.characters.length;
              state.familyData.dailyEarnings = state.familyData.characters
                .reduce((sum, char) => sum + char.dailyEarnings, 0);
            });
          },

          // ===================================
          // 🏢 BUILDING ACTIONS
          // ===================================
          
          updateBuilding: (updates) => {
            set((state) => {
              Object.assign(state.buildingData, updates);
            });
          },

          assignJob: (characterId: number, jobId: string) => {
            set((state) => {
              const character = state.familyData.characters.find(c => c.id === characterId);
              if (character) {
                character.working = true;
                character.job = jobId;
                
                // Update building efficiency
                const efficiency = Math.min(95, state.buildingData.buildingEfficiency + 1);
                state.buildingData.buildingEfficiency = efficiency;
              }
            });
          },

          unassignJob: (characterId: number) => {
            set((state) => {
              const character = state.familyData.characters.find(c => c.id === characterId);
              if (character) {
                character.working = false;
                character.job = "Unemployed";
                
                // Update building efficiency
                const efficiency = Math.max(60, state.buildingData.buildingEfficiency - 1);
                state.buildingData.buildingEfficiency = efficiency;
              }
            });
          },

          // ===================================
          // ⚙️ SETTINGS ACTIONS
          // ===================================
          
          updateSettings: (updates) => {
            set((state) => {
              Object.assign(state.gameSettings, updates);
            });
          },

          // ===================================
          // 🔗 WALLET ACTIONS
          // ===================================
          
          connectWallet: async () => {
            set((state) => {
              state.loading.wallet = true;
              state.errors.wallet = undefined;
            });
            
            try {
              // Wallet connection logic will be implemented with Wagmi
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              set((state) => {
                state.walletState.isConnected = true;
                state.walletState.address = '0x1234...5678';
                state.loading.wallet = false;
              });
            } catch (error) {
              set((state) => {
                state.errors.wallet = 'Failed to connect wallet';
                state.loading.wallet = false;
              });
            }
          },

          disconnectWallet: () => {
            set((state) => {
              state.walletState = { isConnected: false };
            });
          },

          updateWalletState: (walletUpdates) => {
            set((state) => {
              Object.assign(state.walletState, walletUpdates);
            });
          },

          // ===================================
          // 🔔 NOTIFICATION ACTIONS
          // ===================================
          
          addNotification: (notification) => {
            set((state) => {
              const newNotification = {
                ...notification,
                id: `notification-${Date.now()}-${Math.random()}`,
                timestamp: Date.now(),
                read: false
              };
              state.notifications.unshift(newNotification);
              
              // Keep only last 50 notifications
              if (state.notifications.length > 50) {
                state.notifications = state.notifications.slice(0, 50);
              }
            });
          },

          markNotificationRead: (id: string) => {
            set((state) => {
              const notification = state.notifications.find(n => n.id === id);
              if (notification) {
                notification.read = true;
              }
            });
          },

          clearNotifications: () => {
            set((state) => {
              state.notifications = [];
            });
          },

          // ===================================
          // ⏳ LOADING ACTIONS
          // ===================================
          
          setLoading: (key, value) => {
            set((state) => {
              state.loading[key] = value;
            });
          },

          // ===================================
          // ❌ ERROR ACTIONS
          // ===================================
          
          setError: (key, error) => {
            set((state) => {
              state.errors[key] = error;
            });
          },

          clearErrors: () => {
            set((state) => {
              state.errors = {};
            });
          }
        }))
      ),
      {
        name: 'virtual-building-empire-store',
        partialize: (state) => ({
          familyData: state.familyData,
          buildingData: state.buildingData,
          gameSettings: state.gameSettings,
          achievements: state.achievements
        })
      }
    ),
    {
      name: 'Virtual Building Empire Store'
    }
  ));

// ===================================
// 🎯 SELECTOR HOOKS
// ===================================

// Family selectors
export const useFamily = () => useGameStore(state => state.familyData);
export const useCharacters = () => useGameStore(state => state.familyData.characters);
export const useLuncBalance = () => useGameStore(state => state.familyData.totalLunc);
export const useWorkingCharacters = () => 
  useGameStore(state => state.familyData.characters.filter(c => c.working));

// Building selectors
export const useBuilding = () => useGameStore(state => state.buildingData);
export const useBuildingEfficiency = () => useGameStore(state => state.buildingData.buildingEfficiency);

// Wallet selectors
export const useWallet = () => useGameStore(state => state.walletState);
export const useIsWalletConnected = () => useGameStore(state => state.walletState.isConnected);

// Settings selectors
export const useGameSettings = () => useGameStore(state => state.gameSettings);

// UI selectors
export const useNotifications = () => useGameStore(state => state.notifications);
export const useUnreadNotifications = () => 
  useGameStore(state => state.notifications.filter(n => !n.read));
export const useLoading = () => useGameStore(state => state.loading);
export const useErrors = () => useGameStore(state => state.errors);

// ===================================
// 🎮 COMPLEX SELECTORS
// ===================================

// Family statistics
export const useFamilyStats = () => 
  useGameStore(state => {
    const { characters } = state.familyData;
    return {
      totalCharacters: characters.length,
      workingCharacters: characters.filter(c => c.working).length,
      unemployedCharacters: characters.filter(c => !c.working).length,
      averageLevel: characters.length > 0 
        ? Math.round(characters.reduce((sum, c) => sum + c.level, 0) / characters.length)
        : 0,
      averageHappiness: characters.length > 0
        ? Math.round(characters.reduce((sum, c) => sum + c.happiness, 0) / characters.length)
        : 0,
      rarityDistribution: {
        common: characters.filter(c => c.type === 'common').length,
        rare: characters.filter(c => c.type === 'rare').length,
        legendary: characters.filter(c => c.type === 'legendary').length
      }
    };
  });

// Building statistics
export const useBuildingStats = () =>
  useGameStore(state => {
    const { floors } = state.buildingData;
    return {
      totalFloors: floors.length,
      totalCapacity: floors.reduce((sum, floor) => sum + floor.capacity, 0),
      totalEmployees: floors.reduce((sum, floor) => sum + floor.currentEmployees, 0),
      averageEfficiency: floors.length > 0
        ? Math.round(floors.reduce((sum, floor) => sum + floor.efficiency, 0) / floors.length)
        : 0,
      totalDailyOutput: floors.reduce((sum, floor) => sum + floor.dailyOutput, 0)
    };
  });

// Performance selector for expensive calculations
export const useGamePerformance = () =>
  useGameStore(state => {
    const { familyData, buildingData } = state;
    
    // Calculate performance metrics
    const efficiencyScore = Math.round(
      (buildingData.buildingEfficiency + 
       (familyData.characters.filter(c => c.working).length / familyData.characters.length * 100 || 0)) / 2
    );
    
    const earningsMultiplier = 1 + (familyData.familySize * 0.05); // 5% bonus per family member
    const projectedDailyEarnings = Math.round(familyData.dailyEarnings * earningsMultiplier);
    
    return {
      efficiencyScore,
      earningsMultiplier,
      projectedDailyEarnings,
      performanceRating: efficiencyScore >= 90 ? 'Excellent' : 
                        efficiencyScore >= 70 ? 'Good' : 
                        efficiencyScore >= 50 ? 'Average' : 'Poor'
    };
  });

// ===================================
// 🎮 STORE SUBSCRIPTIONS
// ===================================

// Auto-save important game events
useGameStore.subscribe(
  (state) => state.familyData.characters,
  (characters, previousCharacters) => {
    if (characters.length > previousCharacters.length) {
      console.log('🎉 New character added to family!');
      
      // Auto-notification for new characters
      const newCharacters = characters.slice(previousCharacters.length);
      newCharacters.forEach(character => {
        useGameStore.getState().addNotification({
          type: 'success',
          title: 'New Character!',
          message: `${character.name} has joined your family!`
        });
      });
    }
  }
);

// Auto-collect LUNC for working characters
let luncCollectionInterval: NodeJS.Timeout;

useGameStore.subscribe(
  (state) => state.gameSettings.autoCollectLunc,
  (autoCollect) => {
    if (autoCollect) {
      luncCollectionInterval = setInterval(() => {
        const state = useGameStore.getState();
        const workingCharacters = state.familyData.characters.filter(c => c.working);
        
        if (workingCharacters.length > 0) {
          const earnings = Math.floor(workingCharacters.reduce((sum, char) => sum + char.dailyEarnings, 0) * 0.01);
          
          if (earnings > 0) {
            useGameStore.setState(state => {
              state.familyData.totalLunc += earnings;
            });
          }
        }
      }, 60000); // Every minute
    } else {
      if (luncCollectionInterval) {
        clearInterval(luncCollectionInterval);
      }
    }
  }
);

export default useGameStore;