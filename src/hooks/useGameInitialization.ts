// ===================================
// 🎮 GAME INITIALIZATION HOOK
// ===================================

import { useState, useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { generateRandomCharacter } from '@/utils/gameHelpers';
import type { Character } from '@/types/game.types';

interface UseGameInitializationReturn {
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for initializing game data and demo characters
 */
export const useGameInitialization = (): UseGameInitializationReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { familyData, addCharacter, updateSettings, addNotification } = useGameStore();
  
  useEffect(() => {
    const initializeGame = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Initialize demo characters if none exist
        if (familyData.characters.length === 0) {
          console.log('🎮 Initializing demo characters...');
          
          const demoCharacters: Character[] = [
            {
              id: Date.now() + 1,
              name: "Max Manager",
              type: "rare",
              job: "Building Manager",
              level: 12,
              dailyEarnings: 85,
              happiness: 92,
              working: true,
              department: "Management",
              mintedAt: new Date().toISOString(),
              experience: 450
            },
            {
              id: Date.now() + 2,
              name: "Anna Admin",
              type: "common",
              job: "Office Worker",
              level: 8,
              dailyEarnings: 35,
              happiness: 78,
              working: true,
              department: "Administration",
              mintedAt: new Date().toISOString(),
              experience: 280
            },
            {
              id: Date.now() + 3,
              name: "Tom Tech",
              type: "rare",
              job: "IT Support",
              level: 15,
              dailyEarnings: 65,
              happiness: 88,
              working: false,
              department: "IT",
              mintedAt: new Date().toISOString(),
              experience: 720
            },
            {
              id: Date.now() + 4,
              name: "Lisa Legend",
              type: "legendary",
              job: "Master Architect",
              level: 25,
              dailyEarnings: 150,
              happiness: 95,
              working: true,
              department: "Architecture",
              mintedAt: new Date().toISOString(),
              experience: 1250
            }
          ];
          
          // Add characters to store
          demoCharacters.forEach(character => {
            addCharacter(character);
          });
          
          // Welcome notification
          addNotification({
            type: 'success',
            title: '🎉 Willkommen im Virtual Building Empire!',
            message: 'Deine Demo-Familie wurde erstellt. Beginne jetzt dein Abenteuer!'
          });
        }
        
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission();
        }
        
        // Initialize game settings if needed
        const currentTime = new Date().getHours();
        const isDarkTime = currentTime < 7 || currentTime > 19;
        
        updateSettings({
          darkMode: isDarkTime,
          language: navigator.language.startsWith('de') ? 'de' : 'en'
        });
        
        // Simulate loading time for better UX
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('✅ Game initialization complete!');
        
      } catch (err) {
        console.error('❌ Game initialization error:', err);
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler beim Laden des Spiels');
        
        addNotification({
          type: 'error',
          title: '⚠️ Initialisierungsfehler',
          message: 'Beim Laden des Spiels ist ein Fehler aufgetreten.'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeGame();
  }, []); // Empty dependency array - only run once
  
  return {
    isLoading,
    error
  };
};

export default useGameInitialization;