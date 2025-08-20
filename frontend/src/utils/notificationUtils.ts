import { formatDistanceToNow, isToday, isYesterday, format, isWithinInterval, addDays } from 'date-fns';
import { 
  type Notification as AppNotification, 
  NotificationType, 
  NotificationPriority, 
  NotificationChannel,
  NotificationDisplay,
  NotificationGroup,
  NotificationStats 
} from '../types/notification-extended';

// Time formatting utilities
export const formatNotificationTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'MMM dd');
  }
};

export const getTimeAgo = (timestamp: string): string => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

// Notification grouping
export const groupNotificationsByDate = (notifications: AppNotification[]): NotificationGroup[] => {
  const groups: { [key: string]: NotificationDisplay[] } = {};
  
  notifications.forEach(notification => {
    const date = new Date(notification.createdAt);
    let groupKey: string;
    
    if (isToday(date)) {
      groupKey = 'Today';
    } else if (isYesterday(date)) {
      groupKey = 'Yesterday';
    } else if (isWithinInterval(date, { start: addDays(new Date(), -7), end: new Date() })) {
      groupKey = format(date, 'EEEE'); // Day name
    } else {
      groupKey = format(date, 'MMM dd, yyyy');
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    
    groups[groupKey].push({
      ...notification,
      timeAgo: getTimeAgo(notification.createdAt),
      hasActions: Boolean(notification.actions && notification.actions.length > 0),
    });
  });
  
  // Convert to array and sort by date (newest first)
  return Object.entries(groups)
    .map(([date, notifications]) => ({
      date,
      notifications: notifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      unreadCount: notifications.filter(n => !n.isRead).length,
    }))
    .sort((a, b) => {
      // Custom sort to put Today and Yesterday first
      if (a.date === 'Today') return -1;
      if (b.date === 'Today') return 1;
      if (a.date === 'Yesterday') return -1;
      if (b.date === 'Yesterday') return 1;
      
      // For other dates, sort by actual date
      const dateA = new Date(a.notifications[0]?.createdAt || 0);
      const dateB = new Date(b.notifications[0]?.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });
};

// Notification filtering
export const filterNotifications = (
  notifications: AppNotification[],
  filter: {
    search?: string;
    type?: NotificationType[];
    priority?: NotificationPriority[];
    isRead?: boolean;
    dateRange?: { start: string; end: string };
  }
): AppNotification[] => {
  return notifications.filter(notification => {
    // Search filter
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      const matchesSearch = 
        notification.title.toLowerCase().includes(searchTerm) ||
        notification.message.toLowerCase().includes(searchTerm);
      if (!matchesSearch) return false;
    }
    
    // Type filter
    if (filter.type && filter.type.length > 0) {
      if (!filter.type.includes(notification.type)) return false;
    }
    
    // Priority filter
    if (filter.priority && filter.priority.length > 0) {
      if (!filter.priority.includes(notification.priority)) return false;
    }
    
    // Read status filter
    if (filter.isRead !== undefined) {
      if (notification.isRead !== filter.isRead) return false;
    }
    
    // Date range filter
    if (filter.dateRange) {
      const notificationDate = new Date(notification.createdAt);
      const startDate = new Date(filter.dateRange.start);
      const endDate = new Date(filter.dateRange.end);
      
      if (notificationDate < startDate || notificationDate > endDate) {
        return false;
      }
    }
    
    return true;
  });
};

// Notification statistics
export const calculateNotificationStats = (notifications: AppNotification[]): NotificationStats => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek = addDays(today, -7);
  
  const stats: NotificationStats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    today: notifications.filter(n => new Date(n.createdAt) >= today).length,
    thisWeek: notifications.filter(n => new Date(n.createdAt) >= thisWeek).length,
    byType: {},
    byPriority: {},
  };
  
  // Count by type
  notifications.forEach(notification => {
    stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
    stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
  });
  
  return stats;
};

// Priority utilities
export const getPriorityColor = (priority: NotificationPriority): string => {
  switch (priority) {
    case 'urgent':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'medium':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'low':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const getPriorityIcon = (priority: NotificationPriority): string => {
  switch (priority) {
    case 'urgent':
      return '🔴';
    case 'high':
      return '🟠';
    case 'medium':
      return '🔵';
    case 'low':
      return '⚪';
    default:
      return '⚪';
  }
};

// Type utilities
export const getNotificationTypeIcon = (type: NotificationType): string => {
  switch (type) {
    case 'auction_bid':
    case 'auction_won':
    case 'auction_lost':
      return '🔨';
    case 'material_verified':
    case 'material_rejected':
      return '📦';
    case 'payment_received':
    case 'payment_failed':
      return '💰';
    case 'order_confirmed':
    case 'order_shipped':
    case 'order_delivered':
      return '🚚';
    case 'message_received':
      return '💬';
    case 'dispute_opened':
    case 'dispute_resolved':
      return '⚖️';
    case 'system_update':
    case 'maintenance':
      return '🔧';
    case 'security_alert':
      return '🔒';
    case 'profile_update':
    case 'verification_required':
      return '👤';
    default:
      return '🔔';
  }
};

export const getNotificationTypeLabel = (type: NotificationType): string => {
  switch (type) {
    case 'auction_bid':
      return 'Auction Bid';
    case 'auction_won':
      return 'Auction Won';
    case 'auction_lost':
      return 'Auction Lost';
    case 'material_verified':
      return 'Material Verified';
    case 'material_rejected':
      return 'Material Rejected';
    case 'payment_received':
      return 'Payment Received';
    case 'payment_failed':
      return 'Payment Failed';
    case 'order_confirmed':
      return 'Order Confirmed';
    case 'order_shipped':
      return 'Order Shipped';
    case 'order_delivered':
      return 'Order Delivered';
    case 'message_received':
      return 'New Message';
    case 'dispute_opened':
      return 'Dispute Opened';
    case 'dispute_resolved':
      return 'Dispute Resolved';
    case 'system_update':
      return 'System Update';
    case 'maintenance':
      return 'Maintenance';
    case 'security_alert':
      return 'Security Alert';
    case 'profile_update':
      return 'Profile Update';
    case 'verification_required':
      return 'Verification Required';
    default:
      return 'Notification';
  }
};

// Channel utilities
export const getChannelIcon = (channel: NotificationChannel): string => {
  switch (channel) {
    case 'in_app':
      return '📱';
    case 'push':
      return '🔔';
    case 'email':
      return '📧';
    case 'sms':
      return '📱';
    case 'whatsapp':
      return '💬';
    default:
      return '🔔';
  }
};

export const getChannelLabel = (channel: NotificationChannel): string => {
  switch (channel) {
    case 'in_app':
      return 'In-App';
    case 'push':
      return 'Push';
    case 'email':
      return 'Email';
    case 'sms':
      return 'SMS';
    case 'whatsapp':
      return 'WhatsApp';
    default:
      return 'Unknown';
  }
};

// Validation utilities
export const isNotificationExpired = (notification: AppNotification): boolean => {
  if (!notification.expiresAt) return false;
  return new Date(notification.expiresAt) < new Date();
};

export const canPerformAction = (notification: AppNotification, actionId: string): boolean => {
  if (isNotificationExpired(notification)) return false;
  if (!notification.actions) return false;
  
  return notification.actions.some(action => action.id === actionId);
};

// Sound utilities
export const getNotificationSound = (priority: NotificationPriority, type: NotificationType): string => {
  if (priority === 'urgent') return 'urgent.mp3';
  if (priority === 'high') return 'high.mp3';
  if (type.includes('payment')) return 'payment.mp3';
  if (type.includes('auction')) return 'auction.mp3';
  return 'default.mp3';
};

// Browser notification utilities
export const canShowBrowserNotification = (): boolean => {
  // Use window.Notification at runtime to avoid TypeScript name collision with imported types
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return 'Notification' in window && window.Notification.permission === 'granted';
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  // Use window.Notification to avoid colliding with the AppNotification type
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!('Notification' in window)) {
    return 'denied';
  }
  
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return await window.Notification.requestPermission();
};

export const showBrowserNotification = (notification: AppNotification): void => {
  if (!canShowBrowserNotification()) return;
  
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const browserNotification = new window.Notification(notification.title, {
    body: notification.message,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: notification.id,
    requireInteraction: notification.priority === 'urgent',
    silent: notification.priority === 'low',
  });
  
  browserNotification.onclick = () => {
    window.focus();
    browserNotification.close();
    
    // Handle navigation based on notification data
    if (notification.data?.url) {
      window.location.href = notification.data.url;
    }
  };
  
  // Auto close after 5 seconds for non-urgent notifications
  if (notification.priority !== 'urgent') {
    setTimeout(() => {
      browserNotification.close();
    }, 5000);
  }
};
