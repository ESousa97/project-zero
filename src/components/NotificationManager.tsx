import { useState, useCallback } from 'react';
import type { Notification } from '../types/app';

// Re-export para compatibilidade
export type { Notification } from '../types/app';

export interface NotificationManager {
  notifications: Notification[];
  showNotifications: boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  toggleShow: () => void;
  unreadCount: number;
}

export const useNotificationManager = (): NotificationManager => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Mantém apenas 10 notificações
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setShowNotifications(false);
  }, []);

  const toggleShow = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    showNotifications,
    addNotification,
    markAsRead,
    clearAll,
    toggleShow,
    unreadCount,
  };
};
