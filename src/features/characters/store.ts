import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Character, CharacterAction, CharacterState, CharacterFilters, CharacterSortOption, generateRandomCharacter, calculateDailyEarnings, filterCharacters, compareCharacters } from './types';
import { gameApi } from '../../services/api';
import { analytics } from '../../services/analytics';
import { errorMonitoring } from '../../services/errorMonitoring';

// Default state
const defaultFilters: CharacterFilters = {
  type: 'all',
  department: null,
  working: null,
  level: { min: 1, max: 100 },
  search: '',
};

const initialState: CharacterState = {
  characters: [],
  selectedCharacter: null,
  mintingPackages: [],
  isLoading: false,
  error: null,
  filters: defaultFilters,
  sortBy: 'mintedAt',
  viewMode: 'grid',
};

// Character Store
interface CharacterStore extends CharacterState {
  // Computed properties
  filteredCharacters: Character[];
  sortedCharacters: Character[];
  workingCharacters: Character[];
  availableCharacters: Character[];
  totalDailyEarnings: number;
  charactersByType: Record<Character['type'], Character[]>;
  charactersByDepartment: Record<string, Character[]>;

  // Actions
  setCharacters: (characters: Character[]) => void;
  addCharacter: (character: Character) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  removeCharacter: (id: string) => void;
  selectCharacter: (character: Character | null) => void;
  setFilters: (filters: Partial<CharacterFilters>) => void;
  setSortBy: (sortBy: CharacterSortOption) => void;
  setViewMode: (viewMode: 'grid' | 'list') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearFilters: () => void;

  // Async actions
  loadCharacters: (userId: string) => Promise<void>;
  mintCharacters: (packageId: string, quantity: number, userId: string) => Promise<void>;
  assignCharacterToJob: (characterId: string, departmentId: string, jobId: string) => Promise<void>;
  levelUpCharacter: (characterId: string) => Promise<void>;
  collectCharacterEarnings: (characterIds: string[]) => Promise<number>;
  updateCharacterHappiness: (characterId: string, happiness: number) => Promise<void>;

  // Utility actions
  refreshCharacter: (characterId: string) => void;
  getCharacterById: (id: string) => Character | undefined;
  getCharactersByType: (type: Character['type']) => Character[];
  getCharactersByDepartment: (department: string) => Character[];
  calculateTotalValue: () => number;
}

export const useCharacterStore = create<CharacterStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Computed properties
    get filteredCharacters() {
      const { characters, filters } = get();
      return filterCharacters(characters, filters);
    },

    get sortedCharacters() {
      const { filteredCharacters, sortBy } = get();
      return [...filteredCharacters].sort((a, b) => compareCharacters(a, b, sortBy));
    },

    get workingCharacters() {
      const { characters } = get();
      return characters.filter(c => c.working);
    },

    get availableCharacters() {
      const { characters } = get();
      return characters.filter(c => !c.working);
    },

    get totalDailyEarnings() {
      const { workingCharacters } = get();
      return workingCharacters.reduce((sum, character) => sum + character.dailyEarnings, 0);
    },

    get charactersByType() {
      const { characters } = get();
      return characters.reduce((acc, character) => {
        if (!acc[character.type]) acc[character.type] = [];
        acc[character.type].push(character);
        return acc;
      }, {} as Record<Character['type'], Character[]>);
    },

    get charactersByDepartment() {
      const { characters } = get();
      return characters.reduce((acc, character) => {
        if (!acc[character.department]) acc[character.department] = [];
        acc[character.department].push(character);
        return acc;
      }, {} as Record<string, Character[]>);
    },

    // Basic actions
    setCharacters: (characters) => set({ characters }),
    
    addCharacter: (character) => {
      set((state) => ({
        characters: [...state.characters, character]
      }));
      analytics.trackCharacterAction({
        action: 'level_up',
        characterId: character.id,
        characterType: character.type,
      });
    },

    updateCharacter: (id, updates) => {
      set((state) => ({
        characters: state.characters.map(char => 
          char.id === id ? { ...char, ...updates } : char
        )
      }));
      
      const character = get().getCharacterById(id);
      if (character) {
        analytics.trackCharacterAction({
          action: 'level_up',
          characterId: id,
          characterType: character.type,
          additionalData: updates,
        });
      }
    },

    removeCharacter: (id) => {
      set((state) => ({
        characters: state.characters.filter(char => char.id !== id),
        selectedCharacter: state.selectedCharacter?.id === id ? null : state.selectedCharacter
      }));
    },

    selectCharacter: (character) => set({ selectedCharacter: character }),

    setFilters: (newFilters) => {
      set((state) => ({
        filters: { ...state.filters, ...newFilters }
      }));
    },

    setSortBy: (sortBy) => set({ sortBy }),
    setViewMode: (viewMode) => set({ viewMode }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    clearFilters: () => set({ filters: defaultFilters }),

    // Async actions
    loadCharacters: async (userId: string) => {
      try {
        set({ isLoading: true, error: null });
        
        const response = await gameApi.getCharacters(userId);
        set({ characters: response.data });
        
        analytics.trackEvent('characters_loaded', {
          userId,
          count: response.data.length,
        });
      } catch (error: any) {
        const errorMessage = 'Failed to load characters';
        set({ error: errorMessage });
        errorMonitoring.trackApiError(error, '/characters', 'GET');
      } finally {
        set({ isLoading: false });
      }
    },

    mintCharacters: async (packageId: string, quantity: number, userId: string) => {
      try {
        set({ isLoading: true, error: null });
        
        // For demo purposes, generate random characters
        const newCharacters: Character[] = [];
        for (let i = 0; i < quantity; i++) {
          const randomType = Math.random() < 0.05 ? 'legendary' : 
                            Math.random() < 0.3 ? 'rare' : 'common';
          const character = {
            id: `char_${Date.now()}_${i}`,
            ...generateRandomCharacter(randomType, userId)
          };
          newCharacters.push(character);
        }

        set((state) => ({
          characters: [...state.characters, ...newCharacters]
        }));

        // Track minting
        analytics.trackCharacterMint({
          characterType: 'mixed',
          quantity,
          cost: quantity * 100, // Example cost
          currency: 'LUNC',
          success: true,
        });

        newCharacters.forEach(character => {
          analytics.trackCharacterAction({
            action: 'level_up',
            characterId: character.id,
            characterType: character.type,
          });
        });

      } catch (error: any) {
        const errorMessage = 'Failed to mint characters';
        set({ error: errorMessage });
        errorMonitoring.trackGameplayError(error, 'mint_characters');
        
        analytics.trackCharacterMint({
          characterType: 'mixed',
          quantity,
          cost: quantity * 100,
          currency: 'LUNC',
          success: false,
        });
      } finally {
        set({ isLoading: false });
      }
    },

    assignCharacterToJob: async (characterId: string, departmentId: string, jobId: string) => {
      try {
        set({ isLoading: true, error: null });
        
        // Update character locally first for immediate feedback
        set((state) => ({
          characters: state.characters.map(char => 
            char.id === characterId 
              ? { ...char, working: true, department: departmentId }
              : char
          )
        }));

        // Make API call
        await gameApi.assignCharacterToJob({
          characterId,
          departmentId,
          jobId,
        });

        const character = get().getCharacterById(characterId);
        if (character) {
          analytics.trackCharacterAction({
            action: 'assign_job',
            characterId,
            characterType: character.type,
            additionalData: { departmentId, jobId },
          });
        }

      } catch (error: any) {
        // Revert the optimistic update
        set((state) => ({
          characters: state.characters.map(char => 
            char.id === characterId 
              ? { ...char, working: false }
              : char
          )
        }));
        
        const errorMessage = 'Failed to assign character to job';
        set({ error: errorMessage });
        errorMonitoring.trackGameplayError(error, 'assign_job', characterId);
      } finally {
        set({ isLoading: false });
      }
    },

    levelUpCharacter: async (characterId: string) => {
      try {
        const character = get().getCharacterById(characterId);
        if (!character) throw new Error('Character not found');

        const newLevel = character.level + 1;
        const newEarnings = calculateDailyEarnings({ ...character, level: newLevel });

        set((state) => ({
          characters: state.characters.map(char => 
            char.id === characterId 
              ? { 
                  ...char, 
                  level: newLevel, 
                  dailyEarnings: newEarnings,
                  experience: 0,
                  maxExperience: Math.pow(newLevel, 2) * 100
                }
              : char
          )
        }));

        analytics.trackCharacterAction({
          action: 'level_up',
          characterId,
          characterType: character.type,
          additionalData: { newLevel, newEarnings },
        });

      } catch (error: any) {
        const errorMessage = 'Failed to level up character';
        set({ error: errorMessage });
        errorMonitoring.trackGameplayError(error, 'level_up', characterId);
      }
    },

    collectCharacterEarnings: async (characterIds: string[]) => {
      try {
        const { characters } = get();
        const workingCharacters = characters.filter(c => 
          characterIds.includes(c.id) && c.working
        );
        
        const totalEarned = workingCharacters.reduce((sum, char) => 
          sum + char.dailyEarnings, 0
        );

        // Update characters with new total earned
        set((state) => ({
          characters: state.characters.map(char => 
            characterIds.includes(char.id)
              ? { ...char, totalEarned: char.totalEarned + char.dailyEarnings }
              : char
          )
        }));

        analytics.trackLuncTransaction({
          type: 'earned',
          amount: totalEarned,
          source: 'character_work',
          characterIds,
        });

        return totalEarned;
      } catch (error: any) {
        const errorMessage = 'Failed to collect earnings';
        set({ error: errorMessage });
        errorMonitoring.trackGameplayError(error, 'collect_earnings');
        return 0;
      }
    },

    updateCharacterHappiness: async (characterId: string, happiness: number) => {
      try {
        const character = get().getCharacterById(characterId);
        if (!character) throw new Error('Character not found');

        const newEarnings = calculateDailyEarnings({ ...character, happiness });

        set((state) => ({
          characters: state.characters.map(char => 
            char.id === characterId 
              ? { ...char, happiness, dailyEarnings: newEarnings }
              : char
          )
        }));

      } catch (error: any) {
        const errorMessage = 'Failed to update character happiness';
        set({ error: errorMessage });
        errorMonitoring.trackGameplayError(error, 'update_happiness', characterId);
      }
    },

    // Utility actions
    refreshCharacter: (characterId: string) => {
      const character = get().getCharacterById(characterId);
      if (character) {
        const newEarnings = calculateDailyEarnings(character);
        get().updateCharacter(characterId, { dailyEarnings: newEarnings });
      }
    },

    getCharacterById: (id: string) => {
      return get().characters.find(char => char.id === id);
    },

    getCharactersByType: (type: Character['type']) => {
      return get().characters.filter(char => char.type === type);
    },

    getCharactersByDepartment: (department: string) => {
      return get().characters.filter(char => char.department === department);
    },

    calculateTotalValue: () => {
      const { characters } = get();
      return characters.reduce((sum, character) => {
        // Simple value calculation based on level and type
        const baseValue = character.type === 'legendary' ? 1000 : 
                         character.type === 'rare' ? 500 : 100;
        return sum + (baseValue * character.level);
      }, 0);
    },
  }))
);

// Selectors for easy access to computed values
export const characterSelectors = {
  characters: (state: CharacterStore) => state.sortedCharacters,
  workingCharacters: (state: CharacterStore) => state.workingCharacters,
  availableCharacters: (state: CharacterStore) => state.availableCharacters,
  totalDailyEarnings: (state: CharacterStore) => state.totalDailyEarnings,
  charactersByType: (state: CharacterStore) => state.charactersByType,
  isLoading: (state: CharacterStore) => state.isLoading,
  error: (state: CharacterStore) => state.error,
  selectedCharacter: (state: CharacterStore) => state.selectedCharacter,
  filters: (state: CharacterStore) => state.filters,
  viewMode: (state: CharacterStore) => state.viewMode,
};

// React hooks for specific use cases
export const useCharacters = () => {
  const characters = useCharacterStore(characterSelectors.characters);
  const isLoading = useCharacterStore(characterSelectors.isLoading);
  const error = useCharacterStore(characterSelectors.error);
  
  return { characters, isLoading, error };
};

export const useCharacterActions = () => {
  const store = useCharacterStore();
  
  return {
    loadCharacters: store.loadCharacters,
    mintCharacters: store.mintCharacters,
    assignCharacterToJob: store.assignCharacterToJob,
    levelUpCharacter: store.levelUpCharacter,
    collectCharacterEarnings: store.collectCharacterEarnings,
    updateCharacterHappiness: store.updateCharacterHappiness,
    updateCharacter: store.updateCharacter,
    selectCharacter: store.selectCharacter,
    setFilters: store.setFilters,
    setSortBy: store.setSortBy,
    setViewMode: store.setViewMode,
    clearFilters: store.clearFilters,
  };
};

export const useCharacterStats = () => {
  const totalDailyEarnings = useCharacterStore(characterSelectors.totalDailyEarnings);
  const charactersByType = useCharacterStore(characterSelectors.charactersByType);
  const workingCharacters = useCharacterStore(characterSelectors.workingCharacters);
  const availableCharacters = useCharacterStore(characterSelectors.availableCharacters);
  
  return {
    totalDailyEarnings,
    charactersByType,
    workingCount: workingCharacters.length,
    availableCount: availableCharacters.length,
    totalCharacters: workingCharacters.length + availableCharacters.length,
  };
};

// Subscribe to character changes for analytics
useCharacterStore.subscribe(
  (state) => state.characters.length,
  (characterCount, prevCharacterCount) => {
    if (characterCount > prevCharacterCount) {
      analytics.trackEvent('character_count_increased', {
        newCount: characterCount,
        previousCount: prevCharacterCount,
        difference: characterCount - prevCharacterCount,
      });
    }
  }
);

// Subscribe to earnings changes
useCharacterStore.subscribe(
  (state) => state.totalDailyEarnings,
  (earnings, prevEarnings) => {
    if (earnings !== prevEarnings) {
      analytics.trackEvent('daily_earnings_changed', {
        newEarnings: earnings,
        previousEarnings: prevEarnings,
        change: earnings - prevEarnings,
      });
    }
  }
);
