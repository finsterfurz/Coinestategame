// ===================================
// 🔔 GAME NOTIFICATIONS HOOK
// ===================================

import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useGameStore } from '@/stores/gameStore';
import type { Character } from '@/types/game.types';

interface UseGameNotificationsReturn {
  notifyCharacterMinted: (characters: Character[]) => void;
  notifyLuncEarned: (amount: number) => void;
  notifyJobAssigned: (character: Character, jobTitle: string) => void;
  notifyMarketplaceTrade: (trade: TradeInfo) => void;
  notifyLevelUp: (character: Character, newLevel: number) => void;
  notifyAchievement: (achievement: string) => void;
  requestPermission: () => Promise<NotificationPermission>;
}

interface TradeInfo {
  type: 'buy' | 'sell';
  character: Character;
  price: number;
  currency: 'ETH' | 'LUNC';
}

/**
 * Hook for managing game notifications
 */
export const useGameNotifications = (): UseGameNotificationsReturn => {
  const { gameSettings, addNotification } = useGameStore();
  
  // Request notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }
    
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission;
    }
    
    return Notification.permission;
  }, []);
  
  // Show browser notification
  const showBrowserNotification = useCallback(
    (title: string, options: NotificationOptions = {}) => {
      if (!gameSettings.notificationsEnabled) return;
      
      if (Notification.permission === 'granted') {
        new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options
        });
      }
    },
    [gameSettings.notificationsEnabled]
  );
  
  // Character minted notification
  const notifyCharacterMinted = useCallback(
    (characters: Character[]) => {
      const count = characters.length;
      const isPlural = count > 1;
      
      // Toast notification
      toast.success(
        `🎯 ${count} ${isPlural ? 'Charaktere' : 'Charakter'} erfolgreich gemintet!`,
        {
          duration: 4000,
          icon: '🎉'
        }
      );
      
      // In-app notification
      addNotification({
        type: 'success',
        title: '🎯 Charaktere gemintet!',
        message: `${count} neue ${isPlural ? 'Charaktere' : 'Charakter'} ${isPlural ? 'wurden' : 'wurde'} erfolgreich gemintet.`
      });
      
      // Browser notification
      showBrowserNotification(
        'Virtual Building Empire',
        {
          body: `${count} neue ${isPlural ? 'Charaktere' : 'Charakter'} gemintet!`,
          tag: 'character-mint'
        }
      );
      
      console.log('🎯 Character minted:', characters);
    },
    [addNotification, showBrowserNotification]
  );
  
  // LUNC earned notification
  const notifyLuncEarned = useCallback(
    (amount: number) => {
      // Only show for significant amounts
      if (amount < 50) return;
      
      // Toast notification
      toast.success(`💰 ${amount} LUNC verdient!`, {
        duration: 3000,
        icon: '💎'
      });
      
      // In-app notification for large amounts
      if (amount >= 100) {
        addNotification({
          type: 'success',
          title: '💰 LUNC Belohnung!',
          message: `Du hast ${amount} LUNC verdient!`
        });
        
        // Browser notification for very large amounts
        if (amount >= 500) {
          showBrowserNotification(
            'Große LUNC Belohnung!',
            {
              body: `Du hast ${amount} LUNC verdient!`,
              tag: 'lunc-reward'
            }
          );
        }
      }
      
      console.log('💰 LUNC earned:', amount);
    },
    [addNotification, showBrowserNotification]
  );
  
  // Job assigned notification
  const notifyJobAssigned = useCallback(
    (character: Character, jobTitle: string) => {
      // Toast notification
      toast.success(`💼 ${character.name} arbeitet jetzt als ${jobTitle}!`, {
        duration: 3000,
        icon: '👔'
      });
      
      // In-app notification
      addNotification({
        type: 'info',
        title: '💼 Job zugewiesen!',
        message: `${character.name} arbeitet jetzt als ${jobTitle}.`
      });
      
      console.log('💼 Job assigned:', character.name, 'as', jobTitle);
    },
    [addNotification]
  );
  
  // Marketplace trade notification
  const notifyMarketplaceTrade = useCallback(
    (trade: TradeInfo) => {
      const action = trade.type === 'buy' ? 'gekauft' : 'verkauft';
      const icon = trade.type === 'buy' ? '🛒' : '💵';
      
      // Toast notification
      toast.success(
        `${icon} ${trade.character.name} für ${trade.price} ${trade.currency} ${action}!`,
        {
          duration: 4000
        }
      );
      
      // In-app notification
      addNotification({
        type: 'success',
        title: `${icon} Marktplatz Transaktion!`,
        message: `${trade.character.name} wurde für ${trade.price} ${trade.currency} ${action}.`
      });
      
      // Browser notification for large trades
      if (trade.price >= 1000) {
        showBrowserNotification(
          'Große Marktplatz Transaktion!',
          {
            body: `${trade.character.name} für ${trade.price} ${trade.currency} ${action}!`,
            tag: 'marketplace-trade'
          }
        );
      }
      
      console.log('🛒 Marketplace trade:', trade);
    },
    [addNotification, showBrowserNotification]
  );
  
  // Level up notification
  const notifyLevelUp = useCallback(
    (character: Character, newLevel: number) => {
      // Toast notification
      toast.success(`⭐ ${character.name} ist jetzt Level ${newLevel}!`, {
        duration: 4000,
        icon: '🎉'
      });
      
      // In-app notification
      addNotification({
        type: 'success',
        title: '⭐ Level Up!',
        message: `${character.name} hat Level ${newLevel} erreicht!`
      });
      
      // Browser notification for significant levels
      if (newLevel % 10 === 0) {
        showBrowserNotification(
          'Level Meilenstein erreicht!',
          {
            body: `${character.name} hat Level ${newLevel} erreicht!`,
            tag: 'level-up'
          }
        );
      }
      
      console.log('⭐ Level up:', character.name, 'to level', newLevel);
    },
    [addNotification, showBrowserNotification]
  );
  
  // Achievement notification
  const notifyAchievement = useCallback(
    (achievement: string) => {
      // Toast notification
      toast.success(`🏆 Achievement freigeschaltet: ${achievement}!`, {
        duration: 5000,
        icon: '🎊'
      });
      
      // In-app notification
      addNotification({
        type: 'success',
        title: '🏆 Achievement freigeschaltet!',
        message: achievement
      });
      
      // Browser notification
      showBrowserNotification(
        'Achievement freigeschaltet!',
        {
          body: achievement,
          tag: 'achievement'
        }
      );
      
      console.log('🏆 Achievement unlocked:', achievement);
    },
    [addNotification, showBrowserNotification]
  );
  
  return {
    notifyCharacterMinted,
    notifyLuncEarned,
    notifyJobAssigned,
    notifyMarketplaceTrade,
    notifyLevelUp,
    notifyAchievement,
    requestPermission
  };
};

export default useGameNotifications;