// ===================================
// 🧪 GAME NOTIFICATIONS HOOK TESTS
// ===================================

import { renderHook, act } from '@testing-library/react';
import useGameNotifications from '../useGameNotifications';
import type { Character } from '@/types/game.types';

// Mock browser notifications
Object.defineProperty(window, 'Notification', {
  value: class MockNotification {
    static permission = 'granted';
    static requestPermission = jest.fn().mockResolvedValue('granted');
    constructor(title: string, options?: NotificationOptions) {
      // Mock constructor
    }
  },
  writable: true
});

const mockCharacter: Character = {
  id: 1,
  name: "Test Hero",
  type: "legendary",
  job: "CEO",
  level: 25,
  dailyEarnings: 200,
  happiness: 95,
  working: true,
  department: "Management",
  mintedAt: new Date().toISOString()
};

describe('useGameNotifications Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize with correct methods', () => {
    const { result } = renderHook(() => useGameNotifications());

    expect(result.current).toHaveProperty('notifyCharacterMinted');
    expect(result.current).toHaveProperty('notifyLuncEarned');
    expect(result.current).toHaveProperty('notifyJobAssigned');
    expect(result.current).toHaveProperty('notifyMarketplaceTrade');
    expect(result.current).toHaveProperty('requestPermission');
  });

  test('should request notification permission', async () => {
    const { result } = renderHook(() => useGameNotifications());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(window.Notification.requestPermission).toHaveBeenCalled();
  });

  test('should notify character minted', () => {
    const { result } = renderHook(() => useGameNotifications());
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    act(() => {
      result.current.notifyCharacterMinted([mockCharacter]);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('🎯 Character minted:')
    );

    consoleSpy.mockRestore();
  });

  test('should notify LUNC earned', () => {
    const { result } = renderHook(() => useGameNotifications());
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    act(() => {
      result.current.notifyLuncEarned(100);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('💰 LUNC earned:')
    );

    consoleSpy.mockRestore();
  });

  test('should notify job assigned', () => {
    const { result } = renderHook(() => useGameNotifications());
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    act(() => {
      result.current.notifyJobAssigned(mockCharacter, 'Senior Developer');
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('💼 Job assigned:')
    );

    consoleSpy.mockRestore();
  });

  test('should notify marketplace trade', () => {
    const { result } = renderHook(() => useGameNotifications());
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    act(() => {
      result.current.notifyMarketplaceTrade({
        type: 'buy',
        character: mockCharacter,
        price: 500,
        currency: 'LUNC'
      });
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('🛒 Marketplace trade:')
    );

    consoleSpy.mockRestore();
  });
});