// ===================================
// 🔔 NOTIFICATION CENTER
// ===================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import type { Notification } from '@/types/game.types';
import { useGameStore } from '@/stores/gameStore';

interface NotificationCenterProps {
  notifications: Notification[];
}

// ===================================
// 🔔 NOTIFICATION CENTER COMPONENT
// ===================================

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { markNotificationRead, clearNotifications } = useGameStore();
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'error':
        return XCircle;
      case 'warning':
        return AlertTriangle;
      case 'info':
      default:
        return Info;
    }
  };
  
  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-500 bg-green-50 text-green-800';
      case 'error':
        return 'border-red-500 bg-red-50 text-red-800';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      case 'info':
      default:
        return 'border-blue-500 bg-blue-50 text-blue-800';
    }
  };
  
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'now';
  };
  
  return (
    <>
      {/* Notification Bell */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-colors duration-200"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
      
      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panel */}
            <motion.div
              className="fixed top-4 right-4 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl z-50 max-h-[80vh] overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Benachrichtigungen
                </h3>
                <div className="flex items-center space-x-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Alle löschen
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Keine Benachrichtigungen</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {notifications.map((notification) => {
                      const IconComponent = getNotificationIcon(notification.type);
                      
                      return (
                        <motion.div
                          key={notification.id}
                          className={clsx(
                            'p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4',
                            getNotificationColor(notification.type),
                            !notification.read && 'bg-blue-50'
                          )}
                          onClick={() => markNotificationRead(notification.id)}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <div className="flex items-start space-x-3">
                            <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {notification.title}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  {formatTime(notification.timestamp)}
                                </span>
                              </div>
                              
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              
                              {/* Actions */}
                              {notification.actions && notification.actions.length > 0 && (
                                <div className="flex space-x-2 mt-3">
                                  {notification.actions.map((action, index) => (
                                    <button
                                      key={index}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        action.action();
                                      }}
                                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition-colors"
                                    >
                                      {action.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationCenter;