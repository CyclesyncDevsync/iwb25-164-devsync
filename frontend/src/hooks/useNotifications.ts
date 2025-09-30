import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import {
  addNotification as addNotificationAction,
  addBatchNotifications,
  updateNotification,
  removeNotification,
  markAsRead,
  setNotificationCenterOpen,
  addPendingAction,
  removePendingAction,
} from '../store/slices/notificationSlice';
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useUpdateNotificationStatusMutation,
  useBulkUpdateNotificationsMutation,
  useExecuteNotificationActionMutation,
} from '../store/api/notificationApi';
import {
  showBrowserNotification,
  canShowBrowserNotification,
  requestNotificationPermission,
  getNotificationSound,
} from '../utils/notificationUtils';
import type { 
  Notification, 
  NotificationType, 
  NotificationPriority,
} from '../types/notification-extended';
import type { ToastNotification } from '../components/notifications/Toast/ToastNotification';

// Hook for managing notifications
export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const { 
    notifications, 
    unreadCount, 
    isNotificationCenterOpen,
    preferences 
  } = useAppSelector((state: any) => state.notifications);

  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useGetNotificationsQuery({ page: 1, limit: 50 });

  const { data: unreadData } = useGetUnreadCountQuery();

  const [updateNotificationStatus] = useUpdateNotificationStatusMutation();
  const [bulkUpdateNotifications] = useBulkUpdateNotificationsMutation();
  const [executeAction] = useExecuteNotificationActionMutation();

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      await updateNotificationStatus({ id: notificationId, isRead: true }).unwrap();
      dispatch(markAsRead([notificationId]));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [updateNotificationStatus, dispatch]);

  // Mark multiple notifications as read
  const markNotificationsAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      await bulkUpdateNotifications({
        notificationIds,
        action: 'mark_read',
      }).unwrap();
      dispatch(markAsRead(notificationIds));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  }, [bulkUpdateNotifications, dispatch]);

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(async () => {
    const allNotificationIds = notificationsData?.notifications.map(n => n.id) || [];
    if (allNotificationIds.length > 0) {
      await markNotificationsAsRead(allNotificationIds);
    }
  }, [markNotificationsAsRead, notificationsData]);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      const allNotificationIds = notificationsData?.notifications.map(n => n.id) || [];
      if (allNotificationIds.length > 0) {
        await bulkUpdateNotifications({
          notificationIds: allNotificationIds,
          action: 'delete',
        }).unwrap();
        // Refetch to update the local state
        refetch();
      }
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  }, [bulkUpdateNotifications, notificationsData, refetch]);

  // Execute notification action
  const executeNotificationAction = useCallback(async (
    notificationId: string, 
    actionId: string, 
    data?: any
  ) => {
    dispatch(addPendingAction(notificationId));
    
    try {
      const result = await executeAction({
        notificationId,
        actionId,
        data,
      }).unwrap();
      
      // Mark as read after successful action
      await markNotificationAsRead(notificationId);
      
      return result;
    } catch (error) {
      console.error('Failed to execute notification action:', error);
      throw error;
    } finally {
      dispatch(removePendingAction(notificationId));
    }
  }, [executeAction, markNotificationAsRead, dispatch]);

  // Toggle notification center
  const toggleNotificationCenter = useCallback(() => {
    dispatch(setNotificationCenterOpen(!isNotificationCenterOpen));
  }, [dispatch, isNotificationCenterOpen]);

  return {
    notifications: notificationsData?.notifications || [],
    unreadCount: unreadData?.count || 0,
    isLoading,
    error,
    isNotificationCenterOpen,
    preferences,
    refetch,
    // Individual functions
    markNotificationAsRead,
    markNotificationsAsRead,
    executeNotificationAction,
    toggleNotificationCenter,
    // Aliases for NotificationDropdown component compatibility
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    clearAll: clearAllNotifications,
    // Add a function to add notifications
    addNotification: (notification: any) => dispatch(addNotificationAction(notification)),
  };
};

// Hook for toast notifications
export const useToastNotifications = () => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastNotification = { ...toast, id };
    
    setToasts((prev) => [newToast, ...prev]);
    
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods for different toast types
  const showSuccess = useCallback((title: string, message?: string, options?: Partial<ToastNotification>) => {
    return addToast({
      title,
      message: message || '',
      type: 'success',
      priority: 'medium',
      ...options,
    });
  }, [addToast]);

  const showError = useCallback((title: string, message?: string, options?: Partial<ToastNotification>) => {
    return addToast({
      title,
      message: message || '',
      type: 'error',
      priority: 'high',
      persistent: true,
      ...options,
    });
  }, [addToast]);

  const showWarning = useCallback((title: string, message?: string, options?: Partial<ToastNotification>) => {
    return addToast({
      title,
      message: message || '',
      type: 'warning',
      priority: 'medium',
      ...options,
    });
  }, [addToast]);

  const showInfo = useCallback((title: string, message?: string, options?: Partial<ToastNotification>) => {
    return addToast({
      title,
      message: message || '',
      type: 'info',
      priority: 'low',
      ...options,
    });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

// Hook for browser/push notifications
export const useBrowserNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(window.Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    return result;
  }, []);

  const showNotification = useCallback((notification: Notification) => {
    if (canShowBrowserNotification()) {
      showBrowserNotification(notification);
    }
  }, []);

  return {
    isSupported,
    permission,
    canShow: permission === 'granted',
    requestPermission,
    showNotification,
  };
};

// Hook for real-time notifications via WebSocket
export const useRealtimeNotifications = () => {
  const dispatch = useAppDispatch();
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const { showNotification } = useBrowserNotifications();
  const { showInfo, showError } = useToastNotifications();

  const connect = useCallback(() => {
    const token = localStorage.getItem('auth_token'); // Adjust based on your auth implementation
    if (!token) return;

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'}/notifications?token=${token}`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('Notification WebSocket connected');
      reconnectAttempts.current = 0;
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'NEW_NOTIFICATION':
            const notification: Notification = data.notification;
            dispatch(addNotificationAction(notification));
            
            // Show browser notification if enabled
            showNotification(notification);
            
            // Show toast for urgent notifications
            if (notification.priority === 'urgent') {
              showError(notification.title, notification.message);
            }
            break;
            
          case 'NOTIFICATION_UPDATE':
            dispatch(updateNotification({
              id: data.notificationId,
              updates: data.updates,
            }));
            break;
            
          case 'NOTIFICATION_BATCH':
            dispatch(addBatchNotifications(data.notifications));
            showInfo('New Notifications', `You have ${data.notifications.length} new notifications`);
            break;
            
          case 'NOTIFICATION_DELETED':
            dispatch(removeNotification(data.notificationId));
            break;
            
          default:
            console.log('Unknown notification event:', data);
        }
      } catch (error) {
        console.error('Failed to parse notification message:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('Notification WebSocket disconnected');
      
      // Attempt to reconnect
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        setTimeout(() => {
          connect();
        }, Math.pow(2, reconnectAttempts.current) * 1000); // Exponential backoff
      }
    };

    ws.current.onerror = (error) => {
      console.error('Notification WebSocket error:', error);
    };
  }, [dispatch, showNotification, showInfo, showError]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return {
    connect,
    disconnect,
    isConnected: ws.current?.readyState === WebSocket.OPEN,
  };
};

// Hook for notification sound management
export const useNotificationSounds = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback((priority: NotificationPriority, type: NotificationType) => {
    if (!soundEnabled) return;
    
    const soundFile = getNotificationSound(priority, type);
    
    if (audioRef.current) {
      audioRef.current.src = `/sounds/${soundFile}`;
      audioRef.current.volume = volume;
      audioRef.current.play().catch(console.error);
    }
  }, [soundEnabled, volume]);

  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    soundEnabled,
    setSoundEnabled,
    volume,
    setVolume,
    playSound,
  };
};

// Combined hook for all notification functionality
export const useNotificationSystem = () => {
  const notifications = useNotifications();
  const toasts = useToastNotifications();
  const browserNotifications = useBrowserNotifications();
  const realtimeNotifications = useRealtimeNotifications();
  const sounds = useNotificationSounds();

  return {
    ...notifications,
    toasts,
    browserNotifications,
    realtimeNotifications,
    sounds,
  };
};
