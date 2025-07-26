// ===================================
// 🧪 GAME HELPERS UTILITY TESTS
// ===================================

import {
  generateRandomCharacter,
  formatLuncBalance,
  debounce,
  calculateDailyEarnings,
  calculateFamilyBonus,
  validateCharacterName
} from '../gameHelpers';
import type { CharacterRarity } from '@/types/game.types';

describe('Game Helpers Utilities', () => {
  describe('generateRandomCharacter', () => {
    test('should generate character with common rarity', () => {
      const character = generateRandomCharacter('common');
      
      expect(character).toHaveProperty('id');
      expect(character).toHaveProperty('name');
      expect(character.type).toBe('common');
      expect(character.dailyEarnings).toBeGreaterThanOrEqual(15);
      expect(character.dailyEarnings).toBeLessThanOrEqual(50);
      expect(character.level).toBeGreaterThanOrEqual(1);
      expect(character.level).toBeLessThanOrEqual(10);
    });

    test('should generate character with rare rarity', () => {
      const character = generateRandomCharacter('rare');
      
      expect(character.type).toBe('rare');
      expect(character.dailyEarnings).toBeGreaterThanOrEqual(50);
      expect(character.dailyEarnings).toBeLessThanOrEqual(100);
      expect(character.level).toBeGreaterThanOrEqual(8);
      expect(character.level).toBeLessThanOrEqual(18);
    });

    test('should generate character with legendary rarity', () => {
      const character = generateRandomCharacter('legendary');
      
      expect(character.type).toBe('legendary');
      expect(character.dailyEarnings).toBeGreaterThanOrEqual(120);
      expect(character.dailyEarnings).toBeLessThanOrEqual(250);
      expect(character.level).toBeGreaterThanOrEqual(15);
      expect(character.level).toBeLessThanOrEqual(30);
    });

    test('should generate unique IDs', () => {
      const char1 = generateRandomCharacter('common');
      const char2 = generateRandomCharacter('common');
      
      expect(char1.id).not.toBe(char2.id);
    });
  });

  describe('formatLuncBalance', () => {
    test('should format small numbers correctly', () => {
      expect(formatLuncBalance(123)).toBe('123');
      expect(formatLuncBalance(1234)).toBe('1,234');
    });

    test('should format large numbers with K suffix', () => {
      expect(formatLuncBalance(12500)).toBe('12.5K');
      expect(formatLuncBalance(125000)).toBe('125K');
    });

    test('should format millions with M suffix', () => {
      expect(formatLuncBalance(1250000)).toBe('1.25M');
      expect(formatLuncBalance(12500000)).toBe('12.5M');
    });

    test('should handle zero and negative numbers', () => {
      expect(formatLuncBalance(0)).toBe('0');
      expect(formatLuncBalance(-123)).toBe('-123');
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    test('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1000);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('should cancel previous calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      jest.advanceTimersByTime(1000);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });

  describe('calculateDailyEarnings', () => {
    test('should calculate total daily earnings for working characters', () => {
      const characters = [
        { id: 1, dailyEarnings: 50, working: true } as any,
        { id: 2, dailyEarnings: 75, working: true } as any,
        { id: 3, dailyEarnings: 100, working: false } as any
      ];

      const total = calculateDailyEarnings(characters);
      expect(total).toBe(125); // Only working characters
    });

    test('should return 0 for empty array', () => {
      expect(calculateDailyEarnings([])).toBe(0);
    });
  });

  describe('calculateFamilyBonus', () => {
    test('should calculate correct family bonus', () => {
      expect(calculateFamilyBonus(5, 100)).toBe(125); // 5 * 5% = 25% bonus
      expect(calculateFamilyBonus(10, 100)).toBe(150); // 10 * 5% = 50% bonus
      expect(calculateFamilyBonus(0, 100)).toBe(100); // No bonus
    });

    test('should cap bonus at maximum', () => {
      expect(calculateFamilyBonus(100, 100)).toBe(200); // Capped at 100% bonus
    });
  });

  describe('validateCharacterName', () => {
    test('should validate correct names', () => {
      expect(validateCharacterName('John Doe')).toBe(true);
      expect(validateCharacterName('Hero123')).toBe(true);
      expect(validateCharacterName('Super-Man')).toBe(true);
    });

    test('should reject invalid names', () => {
      expect(validateCharacterName('')).toBe(false);
      expect(validateCharacterName('a')).toBe(false); // Too short
      expect(validateCharacterName('a'.repeat(31))).toBe(false); // Too long
      expect(validateCharacterName('Test@Name')).toBe(false); // Invalid character
    });
  });
});