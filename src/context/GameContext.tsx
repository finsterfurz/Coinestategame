import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, Character, Quest, Achievement, User, Building, Economy } from '../types';
import { gameReducer, initialGameState } from './gameReducer';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useWeb3Connection } from '../hooks/useWeb3Connection';
import toast from 'react-hot-toast';

interface GameContextType {
  gameState: GameState;
  dispatch: React.Dispatch<any>;
  // Character actions
  addCharacter: (character: Character) => void;
  removeCharacter: (characterId: string) => void;
  updateCharacter: (characterId: string, updates: Partial<Character>) => void;
  assignCharacterJob: (characterId: string, departmentId: string, position: string) => void;
  // Economy actions
  addLunc: (amount: number, source: string) => void;
  spendLunc: (amount: number, description: string) => boolean;
  collectEarnings: () => void;
  // Quest actions
  updateQuestProgress: (questId: string, progress: number) => void;
  completeQuest: (questId: string) => void;
  // Building actions
  upgradeBuilding: (upgradeId: string) => void;
  updateDepartment: (departmentId: string, updates: any) => void;
  // Social actions
  addFriend: (friendId: string) => void;
  removeFriend: (friendId: string) => void;
  // Settings
  updateSettings: (settings: any) => void;
  // Utility
  saveGame: () => void;
  loadGame: () => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [savedGame, setSavedGame] = useLocalStorage('virtualBuildingEmpire', null);
  const { account, isConnected } = useWeb3Connection();

  // Load game data on mount
  useEffect(() => {
    if (savedGame) {
      dispatch({ type: 'LOAD_GAME', payload: savedGame });
    }
  }, [savedGame]);

  // Auto-save game state
  useEffect(() => {
    const saveTimer = setInterval(() => {
      if (gameState.user.walletAddress) {
        setSavedGame(gameState);
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveTimer);
  }, [gameState, setSavedGame]);

  // Update user wallet when Web3 connects
  useEffect(() => {
    if (isConnected && account && account !== gameState.user.walletAddress) {
      dispatch({
        type: 'UPDATE_USER',
        payload: { walletAddress: account }
      });
    }
  }, [isConnected, account, gameState.user.walletAddress]);

  // Character management
  const addCharacter = (character: Character) => {
    dispatch({ type: 'ADD_CHARACTER', payload: character });
    toast.success(`${character.name} joined your empire!`);
  };

  const removeCharacter = (characterId: string) => {
    const character = gameState.characters.find(c => c.id === characterId);
    dispatch({ type: 'REMOVE_CHARACTER', payload: characterId });
    if (character) {
      toast.success(`${character.name} left your empire`);
    }
  };

  const updateCharacter = (characterId: string, updates: Partial<Character>) => {
    dispatch({
      type: 'UPDATE_CHARACTER',
      payload: { characterId, updates }
    });
  };

  const assignCharacterJob = (characterId: string, departmentId: string, position: string) => {
    const character = gameState.characters.find(c => c.id === characterId);
    const department = gameState.building.departments.find(d => d.id === departmentId);
    
    if (!character || !department) return;

    // Check if department has space
    if (department.currentCharacters.length >= department.maxCharacters) {
      toast.error(`${department.name} is at full capacity!`);
      return;
    }

    // Check requirements
    const jobRequirements = department.requirements || [];
    const meetsRequirements = jobRequirements.every(req => {
      switch (req.type) {
        case 'level':
          return character.level >= req.value;
        case 'skill':
          return character.skills[req.skill as keyof typeof character.skills] >= req.value;
        case 'rarity':
          return character.rarity === req.value;
        default:
          return true;
      }
    });

    if (!meetsRequirements) {
      toast.error(`${character.name} doesn't meet the requirements for this position`);
      return;
    }

    dispatch({
      type: 'ASSIGN_JOB',
      payload: { characterId, departmentId, position }
    });

    toast.success(`${character.name} assigned to ${department.name} as ${position}`);
  };

  // Economy management
  const addLunc = (amount: number, source: string) => {
    dispatch({
      type: 'ADD_LUNC',
      payload: { amount, source }
    });
    
    if (amount > 0) {
      toast.success(`+${amount.toFixed(2)} LUNC earned from ${source}!`);
    }
  };

  const spendLunc = (amount: number, description: string): boolean => {
    if (gameState.economy.luncBalance < amount) {
      toast.error('Insufficient LUNC balance!');
      return false;
    }

    dispatch({
      type: 'SPEND_LUNC',
      payload: { amount, description }
    });

    toast.success(`Spent ${amount.toFixed(2)} LUNC on ${description}`);
    return true;
  };

  const collectEarnings = () => {
    const workingCharacters = gameState.characters.filter(c => c.isWorking);
    let totalEarnings = 0;

    workingCharacters.forEach(character => {
      const department = gameState.building.departments.find(d => 
        d.currentCharacters.some(c => c.id === character.id)
      );
      
      if (department) {
        const baseEarning = character.earnings;
        const departmentBonus = department.efficiencyBonus || 1;
        const happinessBonus = character.happiness / 100;
        const buildingBonus = gameState.building.efficiency / 100;
        
        const totalEarning = baseEarning * departmentBonus * happinessBonus * buildingBonus;
        totalEarnings += totalEarning;
      }
    });

    if (totalEarnings > 0) {
      addLunc(totalEarnings, 'Daily Work');
      
      // Update last collection time
      dispatch({
        type: 'UPDATE_ECONOMY',
        payload: { lastCollection: new Date() }
      });
    } else {
      toast.error('No earnings to collect. Assign characters to jobs!');
    }
  };

  // Quest management
  const updateQuestProgress = (questId: string, progress: number) => {
    dispatch({
      type: 'UPDATE_QUEST_PROGRESS',
      payload: { questId, progress }
    });
  };

  const completeQuest = (questId: string) => {
    const quest = gameState.quests.find(q => q.id === questId);
    if (!quest) return;

    // Award rewards
    quest.rewards.forEach(reward => {
      switch (reward.type) {
        case 'lunc':
          addLunc(reward.amount, `Quest: ${quest.title}`);
          break;
        case 'experience':
          dispatch({
            type: 'ADD_EXPERIENCE',
            payload: reward.amount
          });
          break;
        default:
          break;
      }
    });

    dispatch({
      type: 'COMPLETE_QUEST',
      payload: questId
    });

    toast.success(`Quest completed: ${quest.title}!`);
  };

  // Building management
  const upgradeBuilding = (upgradeId: string) => {
    const upgrade = gameState.building.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    if (!spendLunc(upgrade.cost, `Building Upgrade: ${upgrade.name}`)) {
      return;
    }

    dispatch({
      type: 'PURCHASE_BUILDING_UPGRADE',
      payload: upgradeId
    });

    toast.success(`Building upgraded: ${upgrade.name}!`);
  };

  const updateDepartment = (departmentId: string, updates: any) => {
    dispatch({
      type: 'UPDATE_DEPARTMENT',
      payload: { departmentId, updates }
    });
  };

  // Social features
  const addFriend = (friendId: string) => {
    dispatch({
      type: 'ADD_FRIEND',
      payload: friendId
    });
    toast.success('Friend added successfully!');
  };

  const removeFriend = (friendId: string) => {
    dispatch({
      type: 'REMOVE_FRIEND',
      payload: friendId
    });
    toast.success('Friend removed');
  };

  // Settings
  const updateSettings = (settings: any) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: settings
    });
  };

  // Utility functions
  const saveGame = () => {
    setSavedGame(gameState);
    toast.success('Game saved successfully!');
  };

  const loadGame = () => {
    if (savedGame) {
      dispatch({ type: 'LOAD_GAME', payload: savedGame });
      toast.success('Game loaded successfully!');
    }
  };

  const resetGame = () => {
    if (window.confirm('Are you sure you want to reset your game? This cannot be undone!')) {
      dispatch({ type: 'RESET_GAME' });
      setSavedGame(null);
      toast.success('Game reset successfully!');
    }
  };

  const contextValue: GameContextType = {
    gameState,
    dispatch,
    addCharacter,
    removeCharacter,
    updateCharacter,
    assignCharacterJob,
    addLunc,
    spendLunc,
    collectEarnings,
    updateQuestProgress,
    completeQuest,
    upgradeBuilding,
    updateDepartment,
    addFriend,
    removeFriend,
    updateSettings,
    saveGame,
    loadGame,
    resetGame,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

export default GameContext;
