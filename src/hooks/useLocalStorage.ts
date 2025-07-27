import { useState, useEffect, Dispatch, SetStateAction } from 'react';

// ===================================
// 💾 ENHANCED LOCAL STORAGE HOOK (TypeScript)
// ===================================

type SetValue<T> = Dispatch<SetStateAction<T>>;

/**
 * Enhanced useLocalStorage hook with TypeScript support
 * @param key - The localStorage key (will be prefixed with 'vbe_')
 * @param initialValue - The initial value if no stored value exists
 * @returns A tuple containing the stored value and a setter function
 */
function useLocalStorage<T>(
  key: string, 
  initialValue: T
): [T, SetValue<T>] {
  
  // Get stored value or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      // Server-side rendering support
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(`vbe_${key}`);
      if (item === null) {
        return initialValue;
      }
      
      // Parse stored json or return initialValue if parsing fails
      const parsedItem = JSON.parse(item);
      return parsedItem as T;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue: SetValue<T> = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage (only in browser environment)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(`vbe_${key}`, JSON.stringify(valueToStore));
        
        // Dispatch a custom event to notify other components
        window.dispatchEvent(new CustomEvent('localStorageChange', {
          detail: { key: `vbe_${key}`, value: valueToStore }
        }));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Listen for changes to the localStorage key (from other tabs/windows)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent): void => {
      if (e.key === `vbe_${key}` && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue) as T;
          setStoredValue(newValue);
        } catch (error) {
          console.warn(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    // Also listen for custom events (same-tab changes)
    const handleCustomStorageChange = (e: CustomEvent): void => {
      if (e.detail?.key === `vbe_${key}`) {
        setStoredValue(e.detail.value as T);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleCustomStorageChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange as EventListener);
    };
  }, [key]);

  // Cleanup function to remove the item from localStorage
  const removeValue = (): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(`vbe_${key}`);
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;

// Export additional utility functions
export const clearAllGameData = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const keys = Object.keys(window.localStorage);
    const gameKeys = keys.filter(key => key.startsWith('vbe_'));
    
    gameKeys.forEach(key => {
      window.localStorage.removeItem(key);
    });
    
    console.log(`Cleared ${gameKeys.length} game data entries from localStorage`);
  } catch (error) {
    console.warn('Error clearing game data:', error);
  }
};

export const getStorageSize = (): number => {
  if (typeof window === 'undefined') return 0;
  
  try {
    const keys = Object.keys(window.localStorage);
    const gameKeys = keys.filter(key => key.startsWith('vbe_'));
    
    return gameKeys.reduce((size, key) => {
      const value = window.localStorage.getItem(key);
      return size + (value ? value.length : 0);
    }, 0);
  } catch (error) {
    console.warn('Error calculating storage size:', error);
    return 0;
  }
};