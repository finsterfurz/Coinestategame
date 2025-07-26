// ===================================
// 💾 AUTO-SAVE HOOK
// ===================================

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { debounce } from '@/utils/gameHelpers';

/**
 * Hook for auto-saving game progress
 */
export const useAutoSave = () => {
  const gameState = useGameStore();
  const previousStateRef = useRef(gameState);
  
  // Debounced save function
  const debouncedSave = useRef(
    debounce(() => {
      try {
        // Game state is automatically persisted by Zustand persist middleware
        console.log('💾 Game progress auto-saved');
        
        // Optional: Send to server for cloud save
        // await saveToServer(gameState);
        
      } catch (error) {
        console.error('❌ Auto-save failed:', error);
      }
    }, 2000) // Save every 2 seconds after changes
  ).current;
  
  useEffect(() => {
    // Check if relevant game data has changed
    const hasChanged = (
      gameState.familyData !== previousStateRef.current.familyData ||
      gameState.buildingData !== previousStateRef.current.buildingData ||
      gameState.gameSettings !== previousStateRef.current.gameSettings
    );
    
    if (hasChanged) {
      debouncedSave();
      previousStateRef.current = gameState;
    }
  }, [gameState, debouncedSave]);
  
  // Manual save function
  const saveNow = () => {
    debouncedSave.flush?.(); // Execute immediately if debounced
  };
  
  return { saveNow };
};

export default useAutoSave;