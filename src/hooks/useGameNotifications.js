import { useState, useEffect, useCallback } from 'react';

// ===================================
// 🔔 GAME NOTIFICATIONS HOOK
// ===================================

const useGameNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isSupported, setIsSupported] = useState(false);

  // Check if browser supports notifications
  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission === 'denied') {
      return false;
    }
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, [isSupported]);

  // Add notification to queue
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep max 20
    
    return id;
  }, []);

  // Show browser notification
  const showNotification = useCallback(async (title, options = {}) => {
    const hasPermission = await requestPermission();
    
    if (!hasPermission) {
      console.log('Notification permission denied');
      return null;
    }
    
    const notification = new Notification(title, {
      icon: '/logo192.png',
      badge: '/logo192.png',
      ...options
    });
    
    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
    
    return notification;
  }, [requestPermission]);

  // Game-specific notification helpers
  const notifyCharacterMinted = useCallback((characters) => {
    const count = characters.length;
    const type = characters[0]?.type || 'character';
    
    addNotification({
      type: 'mint_success',
      title: 'Charaktere geminted!',
      message: `${count} neue ${type} Charaktere erfolgreich geminted!`,
      icon: '🎯',
      priority: 'high'
    });
    
    showNotification('Virtual Building Empire', {
      body: `${count} neue Charaktere geminted!`,
      tag: 'character-mint'
    });
  }, [addNotification, showNotification]);

  const notifyLuncEarned = useCallback((amount) => {
    addNotification({
      type: 'lunc_earned',
      title: 'LUNC verdient!',
      message: `${amount} LUNC durch deine Charaktere verdient!`,
      icon: '💰',
      priority: 'medium'
    });
    
    if (amount > 100) {
      showNotification('LUNC Verdient!', {
        body: `${amount} LUNC durch deine arbeitenden Charaktere verdient!`,
        tag: 'lunc-earned'
      });
    }
  }, [addNotification, showNotification]);

  const notifyJobAssigned = useCallback((character, job) => {
    addNotification({
      type: 'job_assigned',
      title: 'Job zugewiesen!',
      message: `${character.name} arbeitet jetzt als ${job}`,
      icon: '💼',
      priority: 'low'
    });
  }, [addNotification]);

  const notifyMarketplaceTrade = useCallback((type, character, price) => {
    const isReqwer = type === 'buy';
    
    addNotification({
      type: `marketplace_${type}`,
      title: isReqwer ? 'Charakter gekauft!' : 'Charakter verkauft!',
      message: `${character.name} für ${price} LUNC ${isReqwer ? 'gekauft' : 'verkauft'}!`,
      icon: isReqwer ? '🛒' : '💎',
      priority: 'medium'
    });
    
    showNotification('Marketplace Trade', {
      body: `${character.name} für ${price} LUNC ${isReqwer ? 'gekauft' : 'verkauft'}!`,
      tag: 'marketplace-trade'
    });
  }, [addNotification, showNotification]);

  // Mark notification as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isSupported,
    addNotification,
    showNotification,
    requestPermission,
    markAsRead,
    clearNotifications,
    // Game-specific helpers
    notifyCharacterMinted,
    notifyLuncEarned,
    notifyJobAssigned,
    notifyMarketplaceTrade
  };
};

export default useGameNotifications;