export interface NotificationSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  whatsappNotifications: boolean;
  inAppNotifications: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  notificationTypes: {
    [key: string]: {
      enabled: boolean;
      channels: string[];
    };
  };
}

export interface NotificationTemplate {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: string[];
  roleSpecific?: string[];
}

export interface NotificationBatch {
  id: string;
  notifications: string[];
  scheduledAt: string;
  status: 'pending' | 'sent' | 'failed';
  batchSize: number;
}

export interface NotificationAnalytics {
  id: string;
  notificationId: string;
  userId: string;
  event: 'sent' | 'delivered' | 'opened' | 'clicked' | 'dismissed';
  timestamp: string;
  channel: string;
  metadata?: any;
}

export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent: string;
  isActive: boolean;
  createdAt: string;
  lastUsed: string;
}

export interface NotificationQueue {
  id: string;
  notificationId: string;
  userId: string;
  channel: string;
  priority: number;
  scheduledAt: string;
  status: 'queued' | 'processing' | 'sent' | 'failed' | 'cancelled';
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
}

// Import the slice types as type-only to avoid circular/runtime issues
import type {
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  NotificationAction,
  Notification,
  NotificationPreferences,
  NotificationFilter,
} from '../store/slices/notificationSlice';

// Re-export from slice for convenience
export type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  NotificationAction,
  NotificationPreferences,
  NotificationFilter,
} from '../store/slices/notificationSlice';

// Utility types for notification components
export interface NotificationDisplay {
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
  timeAgo: string;
  canRetry?: boolean;
  hasActions: boolean;
}
