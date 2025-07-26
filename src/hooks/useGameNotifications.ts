import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  actions?: NotificationAction[];
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface UseGameNotificationsReturn {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  sendNotification: (options: NotificationOptions) => Promise<void>;
  sendGameNotification: (type: string, data: any) => void;
  subscribe: () => Promise<void>;
  unsubscribe: () => void;
}

export const useGameNotifications = (): UseGameNotificationsReturn => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }

    // Check for service worker support
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      toast.error('Notifications are not supported in this browser');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Notifications enabled!');
      } else if (permission === 'denied') {
        toast.error('Notifications denied. You can enable them in browser settings.');
      }
      
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }, [isSupported]);

  const sendNotification = useCallback(async (options: NotificationOptions): Promise<void> => {
    if (!isSupported || permission !== 'granted') {
      console.warn('Notifications not available or permission not granted');
      return;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192.png',
        badge: options.badge || '/icons/badge-72.png',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        actions: options.actions || [],
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds if not requiring interaction
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, [isSupported, permission]);

  const sendGameNotification = useCallback((type: string, data: any) => {
    const notifications: Record<string, (data: any) => NotificationOptions> = {
      earnings_ready: (data) => ({
        title: '💰 Earnings Ready!',
        body: `Collect ${data.amount.toFixed(2)} LUNC from your workers`,
        tag: 'earnings',
        requireInteraction: true,
        actions: [
          { action: 'collect', title: 'Collect Now' },
          { action: 'dismiss', title: 'Later' },
        ],
      }),
      quest_complete: (data) => ({
        title: '🎯 Quest Completed!',
        body: `"${data.questTitle}" completed! Claim your rewards.`,
        tag: 'quest',
        requireInteraction: true,
        actions: [
          { action: 'claim', title: 'Claim Rewards' },
        ],
      }),
      character_level_up: (data) => ({
        title: '⭐ Character Level Up!',
        body: `${data.characterName} reached level ${data.newLevel}!`,
        tag: 'levelup',
      }),
      achievement_unlocked: (data) => ({
        title: '🏆 Achievement Unlocked!',
        body: `"${data.achievementTitle}" - ${data.reward}`,
        tag: 'achievement',
        requireInteraction: true,
      }),
      building_upgrade_complete: (data) => ({
        title: '🏢 Building Upgraded!',
        body: `${data.upgradeName} installation complete!`,
        tag: 'upgrade',
      }),
      marketplace_sale: (data) => ({
        title: '💸 Character Sold!',
        body: `${data.characterName} sold for ${data.price} LUNC`,
        tag: 'sale',
      }),
      friend_request: (data) => ({
        title: '👥 Friend Request',
        body: `${data.username} wants to be your friend`,
        tag: 'friend',
        requireInteraction: true,
        actions: [
          { action: 'accept', title: 'Accept' },
          { action: 'decline', title: 'Decline' },
        ],
      }),
      daily_bonus: () => ({
        title: '🎁 Daily Bonus Available!',
        body: 'Log in to claim your daily rewards',
        tag: 'daily',
      }),
      energy_restored: (data) => ({
        title: '⚡ Energy Restored!',
        body: `${data.characterName} is ready to work again`,
        tag: 'energy',
      }),
      weather_change: (data) => ({
        title: `🌦️ Weather Changed!`,
        body: `${data.weather} weather is affecting your building`,
        tag: 'weather',
      }),
    };

    const notificationBuilder = notifications[type];
    if (notificationBuilder) {
      const options = notificationBuilder(data);
      sendNotification(options);
    }
  }, [sendNotification]);

  const subscribe = useCallback(async (): Promise<void> => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY || '',
      });

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      toast.success('Push notifications enabled!');
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast.error('Failed to enable push notifications');
    }
  }, []);

  const unsubscribe = useCallback(async (): Promise<void> => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify server
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }

      toast.success('Push notifications disabled');
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
    }
  }, []);

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    sendGameNotification,
    subscribe,
    unsubscribe,
  };
};
