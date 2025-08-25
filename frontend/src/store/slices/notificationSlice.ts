import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NotificationType = 
  | 'auction_bid'
  | 'auction_won'
  | 'auction_lost'
  | 'material_verified'
  | 'material_rejected'
  | 'payment_received'
  | 'payment_failed'
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'message_received'
  | 'dispute_opened'
  | 'dispute_resolved'
  | 'system_update'
  | 'maintenance'
  | 'security_alert'
  | 'profile_update'
  | 'verification_required';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationChannel = 'in_app' | 'push' | 'email' | 'sms' | 'whatsapp';

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  data?: any;
  style?: 'primary' | 'secondary' | 'danger' | 'success';
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
  actions?: NotificationAction[];
  data?: any;
  userId: string;
  roleSpecific?: string[];
  channels: NotificationChannel[];
  metadata?: {
    sourceId?: string;
    category?: string;
    tags?: string[];
  };
}

export interface NotificationPreferences {
  userId: string;
  channels: {
    [key in NotificationChannel]: {
      enabled: boolean;
      types: NotificationType[];
      quietHours?: {
        enabled: boolean;
        start: string; // HH:mm format
        end: string;   // HH:mm format
      };
    };
  };
  priority: {
    [key in NotificationPriority]: {
      enabled: boolean;
      channels: NotificationChannel[];
    };
  };
  batchSettings: {
    enabled: boolean;
    interval: number; // minutes
    maxCount: number;
  };
  doNotDisturb: {
    enabled: boolean;
    start?: string;
    end?: string;
  };
}

export interface NotificationFilter {
  type?: NotificationType[];
  priority?: NotificationPriority[];
  isRead?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  filter: NotificationFilter;
  isLoading: boolean;
  error: string | null;
  lastFetched: string | null;
  selectedNotifications: string[];
  isNotificationCenterOpen: boolean;
  pendingActions: string[]; // notification IDs with pending actions
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  preferences: null,
  filter: {},
  isLoading: false,
  error: null,
  lastFetched: null,
  selectedNotifications: [],
  isNotificationCenterOpen: false,
  pendingActions: [],
};

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Notification CRUD operations
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    
    addBatchNotifications: (state, action: PayloadAction<Notification[]>) => {
      const newNotifications = action.payload.filter(
        newNotif => !state.notifications.some(existing => existing.id === newNotif.id)
      );
      
      state.notifications.unshift(...newNotifications);
      const unreadCount = newNotifications.filter(n => !n.isRead).length;
      state.unreadCount += unreadCount;
    },
    
    updateNotification: (state, action: PayloadAction<{ id: string; updates: Partial<Notification> }>) => {
      const { id, updates } = action.payload;
      const index = state.notifications.findIndex(n => n.id === id);
      
      if (index !== -1) {
        const wasUnread = !state.notifications[index].isRead;
        state.notifications[index] = { ...state.notifications[index], ...updates };
        
        // Update unread count if read status changed
        if (wasUnread && updates.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else if (!wasUnread && updates.isRead === false) {
          state.unreadCount += 1;
        }
      }
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const wasUnread = !state.notifications[index].isRead;
        state.notifications.splice(index, 1);
        if (wasUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },
    
    // Bulk operations
    markAsRead: (state, action: PayloadAction<string[]>) => {
      const ids = action.payload;
      let markedCount = 0;
      
      state.notifications.forEach(notification => {
        if (ids.includes(notification.id) && !notification.isRead) {
          notification.isRead = true;
          markedCount++;
        }
      });
      
      state.unreadCount = Math.max(0, state.unreadCount - markedCount);
    },
    
    markAsUnread: (state, action: PayloadAction<string[]>) => {
      const ids = action.payload;
      let markedCount = 0;
      
      state.notifications.forEach(notification => {
        if (ids.includes(notification.id) && notification.isRead) {
          notification.isRead = false;
          markedCount++;
        }
      });
      
      state.unreadCount += markedCount;
    },
    
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
    },
    
    deleteSelected: (state) => {
      const selectedIds = new Set(state.selectedNotifications);
      const deletedUnreadCount = state.notifications
        .filter(n => selectedIds.has(n.id) && !n.isRead)
        .length;
      
      state.notifications = state.notifications.filter(n => !selectedIds.has(n.id));
      state.unreadCount = Math.max(0, state.unreadCount - deletedUnreadCount);
      state.selectedNotifications = [];
    },
    
    // Filter and search
    setFilter: (state, action: PayloadAction<NotificationFilter>) => {
      state.filter = action.payload;
    },
    
    clearFilter: (state) => {
      state.filter = {};
    },
    
    // Selection management
    selectNotification: (state, action: PayloadAction<string>) => {
      if (!state.selectedNotifications.includes(action.payload)) {
        state.selectedNotifications.push(action.payload);
      }
    },
    
    deselectNotification: (state, action: PayloadAction<string>) => {
      state.selectedNotifications = state.selectedNotifications.filter(
        id => id !== action.payload
      );
    },
    
    selectAllFiltered: (state) => {
      // This would need to be calculated based on current filter
      const allIds = state.notifications.map(n => n.id);
      state.selectedNotifications = allIds;
    },
    
    clearSelection: (state) => {
      state.selectedNotifications = [];
    },
    
    // Preferences management
    setPreferences: (state, action: PayloadAction<NotificationPreferences>) => {
      state.preferences = action.payload;
    },
    
    updatePreferences: (state, action: PayloadAction<Partial<NotificationPreferences>>) => {
      if (state.preferences) {
        state.preferences = { ...state.preferences, ...action.payload };
      }
    },
    
    // UI state
    setNotificationCenterOpen: (state, action: PayloadAction<boolean>) => {
      state.isNotificationCenterOpen = action.payload;
    },
    
    // Action tracking
    addPendingAction: (state, action: PayloadAction<string>) => {
      if (!state.pendingActions.includes(action.payload)) {
        state.pendingActions.push(action.payload);
      }
    },
    
    removePendingAction: (state, action: PayloadAction<string>) => {
      state.pendingActions = state.pendingActions.filter(id => id !== action.payload);
    },
    
    // Loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    setLastFetched: (state, action: PayloadAction<string>) => {
      state.lastFetched = action.payload;
    },
    
    // Reset state
    resetNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.selectedNotifications = [];
      state.filter = {};
      state.error = null;
    },
  },
});

export const {
  addNotification,
  addBatchNotifications,
  updateNotification,
  removeNotification,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteSelected,
  setFilter,
  clearFilter,
  selectNotification,
  deselectNotification,
  selectAllFiltered,
  clearSelection,
  setPreferences,
  updatePreferences,
  setNotificationCenterOpen,
  addPendingAction,
  removePendingAction,
  setLoading,
  setError,
  setLastFetched,
  resetNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
