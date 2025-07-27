import { renderHook, act } from '@testing-library/react';
import { useCharacterStore, useCharacters, useCharacterActions, useCharacterStats } from '../store';
import { Character, generateRandomCharacter } from '../types';

// Mock the dependencies
jest.mock('../../../services/api', () => ({
  gameApi: {
    getCharacters: jest.fn(),
    assignCharacterToJob: jest.fn(),
  },
}));

jest.mock('../../../services/analytics', () => ({
  analytics: {
    trackCharacterAction: jest.fn(),
    trackCharacterMint: jest.fn(),
    trackLuncTransaction: jest.fn(),
    trackEvent: jest.fn(),
  },
}));

jest.mock('../../../services/errorMonitoring', () => ({
  errorMonitoring: {
    trackApiError: jest.fn(),
    trackGameplayError: jest.fn(),
  },
}));

describe('Character Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCharacterStore.setState({
      characters: [],
      selectedCharacter: null,
      mintingPackages: [],
      isLoading: false,
      error: null,
      filters: {
        type: 'all',
        department: null,
        working: null,
        level: { min: 1, max: 100 },
        search: '',
      },
      sortBy: 'mintedAt',
      viewMode: 'grid',
    });
  });

  describe('Basic State Management', () => {
    test('should initialize with default state', () => {
      const { result } = renderHook(() => useCharacterStore());
      
      expect(result.current.characters).toEqual([]);
      expect(result.current.selectedCharacter).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.viewMode).toBe('grid');
    });

    test('should add characters correctly', () => {
      const { result } = renderHook(() => useCharacterStore());
      const mockCharacter: Character = {
        id: 'test-1',
        name: 'Test Character',
        type: 'common',
        job: 'Developer',
        level: 1,
        dailyEarnings: 50,
        happiness: 100,
        working: false,
        department: 'IT',
        mintedAt: new Date().toISOString(),
        ownerId: 'user-1',
        experience: 0,
        maxExperience: 100,
        skills: [],
        totalEarned: 0,
      };

      act(() => {
        result.current.addCharacter(mockCharacter);
      });

      expect(result.current.characters).toHaveLength(1);
      expect(result.current.characters[0]).toEqual(mockCharacter);
    });

    test('should update character correctly', () => {
      const { result } = renderHook(() => useCharacterStore());
      const mockCharacter: Character = {
        id: 'test-1',
        name: 'Test Character',
        type: 'common',
        job: 'Developer',
        level: 1,
        dailyEarnings: 50,
        happiness: 100,
        working: false,
        department: 'IT',
        mintedAt: new Date().toISOString(),
        ownerId: 'user-1',
        experience: 0,
        maxExperience: 100,
        skills: [],
        totalEarned: 0,
      };

      act(() => {
        result.current.setCharacters([mockCharacter]);
      });

      act(() => {
        result.current.updateCharacter('test-1', { level: 2, happiness: 90 });
      });

      expect(result.current.characters[0].level).toBe(2);
      expect(result.current.characters[0].happiness).toBe(90);
    });

    test('should remove character correctly', () => {
      const { result } = renderHook(() => useCharacterStore());
      const mockCharacter: Character = {
        id: 'test-1',
        name: 'Test Character',
        type: 'common',
        job: 'Developer',
        level: 1,
        dailyEarnings: 50,
        happiness: 100,
        working: false,
        department: 'IT',
        mintedAt: new Date().toISOString(),
        ownerId: 'user-1',
        experience: 0,
        maxExperience: 100,
        skills: [],
        totalEarned: 0,
      };

      act(() => {
        result.current.setCharacters([mockCharacter]);
      });

      act(() => {
        result.current.removeCharacter('test-1');
      });

      expect(result.current.characters).toHaveLength(0);
    });
  });

  describe('Computed Properties', () => {
    test('should calculate working characters correctly', () => {
      const { result } = renderHook(() => useCharacterStore());
      const workingCharacter: Character = {
        id: 'test-1',
        name: 'Working Character',
        type: 'common',
        job: 'Developer',
        level: 1,
        dailyEarnings: 50,
        happiness: 100,
        working: true,
        department: 'IT',
        mintedAt: new Date().toISOString(),
        ownerId: 'user-1',
        experience: 0,
        maxExperience: 100,
        skills: [],
        totalEarned: 0,
      };

      const idleCharacter: Character = {
        ...workingCharacter,
        id: 'test-2',
        name: 'Idle Character',
        working: false,
      };

      act(() => {
        result.current.setCharacters([workingCharacter, idleCharacter]);
      });

      expect(result.current.workingCharacters).toHaveLength(1);
      expect(result.current.workingCharacters[0].id).toBe('test-1');
      expect(result.current.availableCharacters).toHaveLength(1);
      expect(result.current.availableCharacters[0].id).toBe('test-2');
    });

    test('should calculate total daily earnings correctly', () => {
      const { result } = renderHook(() => useCharacterStore());
      const character1: Character = {
        id: 'test-1',
        name: 'Character 1',
        type: 'common',
        job: 'Developer',
        level: 1,
        dailyEarnings: 50,
        happiness: 100,
        working: true,
        department: 'IT',
        mintedAt: new Date().toISOString(),
        ownerId: 'user-1',
        experience: 0,
        maxExperience: 100,
        skills: [],
        totalEarned: 0,
      };

      const character2: Character = {
        ...character1,
        id: 'test-2',
        name: 'Character 2',
        dailyEarnings: 75,
        working: true,
      };

      const character3: Character = {
        ...character1,
        id: 'test-3',
        name: 'Character 3',
        dailyEarnings: 100,
        working: false, // Not working, shouldn't count
      };

      act(() => {
        result.current.setCharacters([character1, character2, character3]);
      });

      expect(result.current.totalDailyEarnings).toBe(125); // 50 + 75
    });

    test('should group characters by type correctly', () => {
      const { result } = renderHook(() => useCharacterStore());
      const commonChar: Character = {
        id: 'test-1',
        name: 'Common Character',
        type: 'common',
        job: 'Developer',
        level: 1,
        dailyEarnings: 50,
        happiness: 100,
        working: false,
        department: 'IT',
        mintedAt: new Date().toISOString(),
        ownerId: 'user-1',
        experience: 0,
        maxExperience: 100,
        skills: [],
        totalEarned: 0,
      };

      const rareChar: Character = {
        ...commonChar,
        id: 'test-2',
        name: 'Rare Character',
        type: 'rare',
      };

      act(() => {
        result.current.setCharacters([commonChar, rareChar]);
      });

      expect(result.current.charactersByType.common).toHaveLength(1);
      expect(result.current.charactersByType.rare).toHaveLength(1);
      expect(result.current.charactersByType.legendary).toBeUndefined();
    });
  });

  describe('Filtering and Sorting', () => {
    test('should filter characters by type', () => {
      const { result } = renderHook(() => useCharacterStore());
      const commonChar: Character = {
        id: 'test-1',
        name: 'Common Character',
        type: 'common',
        job: 'Developer',
        level: 1,
        dailyEarnings: 50,
        happiness: 100,
        working: false,
        department: 'IT',
        mintedAt: new Date().toISOString(),
        ownerId: 'user-1',
        experience: 0,
        maxExperience: 100,
        skills: [],
        totalEarned: 0,
      };

      const rareChar: Character = {
        ...commonChar,
        id: 'test-2',
        name: 'Rare Character',
        type: 'rare',
      };

      act(() => {
        result.current.setCharacters([commonChar, rareChar]);
      });

      act(() => {
        result.current.setFilters({ type: 'rare' });
      });

      expect(result.current.filteredCharacters).toHaveLength(1);
      expect(result.current.filteredCharacters[0].type).toBe('rare');
    });

    test('should filter characters by search term', () => {
      const { result } = renderHook(() => useCharacterStore());
      const character1: Character = {
        id: 'test-1',
        name: 'John Developer',
        type: 'common',
        job: 'Senior Developer',
        level: 1,
        dailyEarnings: 50,
        happiness: 100,
        working: false,
        department: 'IT',
        mintedAt: new Date().toISOString(),
        ownerId: 'user-1',
        experience: 0,
        maxExperience: 100,
        skills: [],
        totalEarned: 0,
      };

      const character2: Character = {
        ...character1,
        id: 'test-2',
        name: 'Jane Manager',
        job: 'Project Manager',
        department: 'Management',
      };

      act(() => {
        result.current.setCharacters([character1, character2]);
      });

      act(() => {
        result.current.setFilters({ search: 'developer' });
      });

      expect(result.current.filteredCharacters).toHaveLength(1);
      expect(result.current.filteredCharacters[0].name).toBe('John Developer');
    });

    test('should sort characters correctly', () => {
      const { result } = renderHook(() => useCharacterStore());
      const character1: Character = {
        id: 'test-1',
        name: 'Alpha',
        type: 'common',
        job: 'Developer',
        level: 2,
        dailyEarnings: 50,
        happiness: 100,
        working: false,
        department: 'IT',
        mintedAt: new Date().toISOString(),
        ownerId: 'user-1',
        experience: 0,
        maxExperience: 100,
        skills: [],
        totalEarned: 0,
      };

      const character2: Character = {
        ...character1,
        id: 'test-2',
        name: 'Beta',
        level: 1,
      };

      act(() => {
        result.current.setCharacters([character1, character2]);
      });

      act(() => {
        result.current.setSortBy('name');
      });

      expect(result.current.sortedCharacters[0].name).toBe('Alpha');
      expect(result.current.sortedCharacters[1].name).toBe('Beta');

      act(() => {
        result.current.setSortBy('level');
      });

      expect(result.current.sortedCharacters[0].level).toBe(2);
      expect(result.current.sortedCharacters[1].level).toBe(1);
    });
  });

  describe('Async Actions', () => {
    test('should handle character minting', async () => {
      const { result } = renderHook(() => useCharacterStore());

      await act(async () => {
        await result.current.mintCharacters('package-1', 2, 'user-1');
      });

      expect(result.current.characters).toHaveLength(2);
      expect(result.current.characters[0].ownerId).toBe('user-1');
      expect(result.current.characters[1].ownerId).toBe('user-1');
    });

    test('should handle character job assignment', async () => {
      const { result } = renderHook(() => useCharacterStore());
      const mockCharacter: Character = {
        id: 'test-1',
        name: 'Test Character',
        type: 'common',
        job: 'Developer',
        level: 1,
        dailyEarnings: 50,
        happiness: 100,
        working: false,
        department: 'IT',
        mintedAt: new Date().toISOString(),
        ownerId: 'user-1',
        experience: 0,
        maxExperience: 100,
        skills: [],
        totalEarned: 0,
      };

      act(() => {
        result.current.setCharacters([mockCharacter]);
      });

      await act(async () => {
        await result.current.assignCharacterToJob('test-1', 'management', 'job-1');
      });

      expect(result.current.characters[0].working).toBe(true);
      expect(result.current.characters[0].department).toBe('management');
    });

    test('should handle character level up', async () => {
      const { result } = renderHook(() => useCharacterStore());
      const mockCharacter: Character = {
        id: 'test-1',
        name: 'Test Character',
        type: 'common',
        job: 'Developer',
        level: 1,
        dailyEarnings: 50,
        happiness: 100,
        working: false,
        department: 'IT',
        mintedAt: new Date().toISOString(),
        ownerId: 'user-1',
        experience: 100,
        maxExperience: 100,
        skills: [],
        totalEarned: 0,
      };

      act(() => {
        result.current.setCharacters([mockCharacter]);
      });

      await act(async () => {
        await result.current.levelUpCharacter('test-1');
      });

      expect(result.current.characters[0].level).toBe(2);
      expect(result.current.characters[0].experience).toBe(0);
      expect(result.current.characters[0].maxExperience).toBe(400); // level^2 * 100
    });

    test('should collect character earnings', async () => {
      const { result } = renderHook(() => useCharacterStore());
      const mockCharacter: Character = {
        id: 'test-1',
        name: 'Test Character',
        type: 'common',
        job: 'Developer',
        level: 1,
        dailyEarnings: 50,
        happiness: 100,
        working: true,
        department: 'IT',
        mintedAt: new Date().toISOString(),
        ownerId: 'user-1',
        experience: 0,
        maxExperience: 100,
        skills: [],
        totalEarned: 0,
      };

      act(() => {
        result.current.setCharacters([mockCharacter]);
      });

      let totalEarned = 0;
      await act(async () => {
        totalEarned = await result.current.collectCharacterEarnings(['test-1']);
      });

      expect(totalEarned).toBe(50);
      expect(result.current.characters[0].totalEarned).toBe(50);
    });
  });

  describe('Utility Functions', () => {
    test('should get character by ID', () => {
      const { result } = renderHook(() => useCharacterStore());
      const mockCharacter: Character = {
        id: 'test-1',
        name: 'Test Character',
        type: 'common',
        job: 'Developer',
        level: 1,
        dailyEarnings: 50,
        happiness: 100,
        working: false,
        department: 'IT',
        mintedAt: new Date().toISOString(),
        ownerId: 'user-1',
        experience: 0,
        maxExperience: 100,
        skills: [],
        totalEarned: 0,
      };

      act(() => {
        result.current.setCharacters([mockCharacter]);
      });

      const foundCharacter = result.current.getCharacterById('test-1');
      expect(foundCharacter).toEqual(mockCharacter);

      const notFound = result.current.getCharacterById('non-existent');
      expect(notFound).toBeUndefined();
    });

    test('should calculate total value', () => {
      const { result } = renderHook(() => useCharacterStore());
      const commonChar: Character = {
        id: 'test-1',
        name: 'Common Character',
        type: 'common',
        job: 'Developer',
        level: 2,
        dailyEarnings: 50,
        happiness: 100,
        working: false,
        department: 'IT',
        mintedAt: new Date().toISOString(),
        ownerId: 'user-1',
        experience: 0,
        maxExperience: 100,
        skills: [],
        totalEarned: 0,
      };

      const rareChar: Character = {
        ...commonChar,
        id: 'test-2',
        name: 'Rare Character',
        type: 'rare',
        level: 3,
      };

      act(() => {
        result.current.setCharacters([commonChar, rareChar]);
      });

      const totalValue = result.current.calculateTotalValue();
      expect(totalValue).toBe(1700); // (100 * 2) + (500 * 3)
    });
  });
});

describe('Character Hooks', () => {
  test('useCharacters hook should return correct data', () => {
    const mockCharacter: Character = {
      id: 'test-1',
      name: 'Test Character',
      type: 'common',
      job: 'Developer',
      level: 1,
      dailyEarnings: 50,
      happiness: 100,
      working: false,
      department: 'IT',
      mintedAt: new Date().toISOString(),
      ownerId: 'user-1',
      experience: 0,
      maxExperience: 100,
      skills: [],
      totalEarned: 0,
    };

    useCharacterStore.setState({ characters: [mockCharacter] });

    const { result } = renderHook(() => useCharacters());

    expect(result.current.characters).toHaveLength(1);
    expect(result.current.characters[0]).toEqual(mockCharacter);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('useCharacterStats hook should return correct statistics', () => {
    const workingChar: Character = {
      id: 'test-1',
      name: 'Working Character',
      type: 'common',
      job: 'Developer',
      level: 1,
      dailyEarnings: 50,
      happiness: 100,
      working: true,
      department: 'IT',
      mintedAt: new Date().toISOString(),
      ownerId: 'user-1',
      experience: 0,
      maxExperience: 100,
      skills: [],
      totalEarned: 0,
    };

    const idleChar: Character = {
      ...workingChar,
      id: 'test-2',
      name: 'Idle Character',
      working: false,
      dailyEarnings: 75,
    };

    useCharacterStore.setState({ characters: [workingChar, idleChar] });

    const { result } = renderHook(() => useCharacterStats());

    expect(result.current.totalDailyEarnings).toBe(50);
    expect(result.current.workingCount).toBe(1);
    expect(result.current.availableCount).toBe(1);
    expect(result.current.totalCharacters).toBe(2);
    expect(result.current.charactersByType.common).toHaveLength(2);
  });
});
