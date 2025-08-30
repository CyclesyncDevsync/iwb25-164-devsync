import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Notification, NotificationPreferences, NotificationFilter } from '../slices/notificationSlice';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const NOTIFICATION_API_URL = '/backend/notifications';

interface NotificationResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
}

interface NotificationQueryParams {
  page?: number;
  limit?: number;
  filter?: NotificationFilter;
}

interface BulkActionRequest {
  notificationIds: string[];
  action: 'mark_read' | 'mark_unread' | 'delete';
}

interface NotificationActionRequest {
  notificationId: string;
  actionId: string;
  data?: any;
}

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: NOTIFICATION_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Notification', 'NotificationPreferences', 'UnreadCount'],
  endpoints: (builder) => ({
    // Fetch notifications with pagination and filtering
    getNotifications: builder.query<NotificationResponse, NotificationQueryParams>({
      query: ({ page = 1, limit = 20, filter = {} }) => {
        // Get userId from localStorage or state
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user?.asgardeoId || user?.asgardeo_id || user?.id;
        
        return {
          url: '',
          params: {
            userId,
            includeRead: true,
            limit,
            ...filter,
          },
        };
      },
      transformResponse: (response: any[]) => {
        // Transform backend notification format to frontend format
        const notifications = (response || []).map(notification => {
          // Convert Ballerina time:Civil to JavaScript Date string
          const parseDate = (dateObj: any) => {
            if (!dateObj) return undefined;
            if (typeof dateObj === 'string') return dateObj;
            // Handle Ballerina time:Civil format {year: 2025, month: 8, day: 30, hour: 17, minute: 30, second: 48}
            if (typeof dateObj === 'object' && dateObj.year) {
              return new Date(
                dateObj.year,
                dateObj.month - 1, // JavaScript months are 0-indexed
                dateObj.day,
                dateObj.hour || 0,
                dateObj.minute || 0,
                dateObj.second || 0
              ).toISOString();
            }
            return new Date().toISOString(); // Fallback to current date
          };

          return {
            id: notification.notificationId,
            type: notification.notificationType === 'AGENT_ASSIGNED_TO_SUPPLIER' ? 'verification_required' : notification.notificationType.toLowerCase(),
            title: notification.title,
            message: notification.message,
            priority: 'medium' as const,
            isRead: notification.readStatus,
            createdAt: parseDate(notification.createdAt),
            expiresAt: parseDate(notification.expiresAt),
            data: notification.data,
            userId: notification.userId,
            channels: ['in_app'] as const,
          };
        });
        
        return {
          notifications,
          total: notifications.length,
          unreadCount: notifications.filter(n => !n.isRead).length,
          hasMore: false
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.notifications.map(({ id }) => ({ type: 'Notification' as const, id })),
              { type: 'Notification', id: 'LIST' },
              { type: 'UnreadCount', id: 'COUNT' },
            ]
          : [{ type: 'Notification', id: 'LIST' }],
      serializeQueryArgs: ({ queryArgs }) => {
        // Create a stable cache key based on filter
        const { page, ...otherArgs } = queryArgs;
        return otherArgs;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }
        return {
          ...newItems,
          notifications: [...currentCache.notifications, ...newItems.notifications],
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page === 1 || currentArg?.filter !== previousArg?.filter;
      },
    }),

    // Get unread count
    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user?.asgardeoId || user?.asgardeo_id || user?.id;
        return {
          url: '/count',
          params: { userId }
        };
      },
      providesTags: [{ type: 'UnreadCount', id: 'COUNT' }],
    }),

    // Mark single notification as read/unread
    updateNotificationStatus: builder.mutation<
      Notification,
      { id: string; isRead: boolean }
    >({
      query: ({ id, isRead }) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user?.asgardeoId || user?.asgardeo_id || user?.id;
        
        // Backend only supports marking as read, not unread
        if (isRead) {
          return {
            url: `/${id}/read`,
            method: 'PUT',
            params: { userId }
          };
        } else {
          // For mark as unread, we'll need to handle this differently
          throw new Error('Mark as unread not supported by backend');
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Notification', id },
        { type: 'UnreadCount', id: 'COUNT' },
      ],
    }),

    // Bulk actions on notifications
    bulkUpdateNotifications: builder.mutation<
      { success: boolean; affectedCount: number },
      BulkActionRequest
    >({
      query: (body) => ({
        url: '/bulk',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'UnreadCount', id: 'COUNT' },
      ],
    }),

    // Delete notification
    deleteNotification: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Notification', id },
        { type: 'Notification', id: 'LIST' },
        { type: 'UnreadCount', id: 'COUNT' },
      ],
    }),

    // Execute notification action
    executeNotificationAction: builder.mutation<
      { success: boolean; result?: any },
      NotificationActionRequest
    >({
      query: ({ notificationId, actionId, data }) => ({
        url: `/${notificationId}/actions/${actionId}`,
        method: 'POST',
        body: data || {},
      }),
      invalidatesTags: (result, error, { notificationId }) => [
        { type: 'Notification', id: notificationId },
        { type: 'Notification', id: 'LIST' },
      ],
    }),

    // Get notification preferences
    getNotificationPreferences: builder.query<NotificationPreferences, void>({
      query: () => '/preferences',
      providesTags: [{ type: 'NotificationPreferences', id: 'CURRENT' }],
    }),

    // Update notification preferences
    updateNotificationPreferences: builder.mutation<
      NotificationPreferences,
      Partial<NotificationPreferences>
    >({
      query: (preferences) => ({
        url: '/preferences',
        method: 'PUT',
        body: preferences,
      }),
      invalidatesTags: [{ type: 'NotificationPreferences', id: 'CURRENT' }],
    }),

    // Test notification (for admin/testing purposes)
    sendTestNotification: builder.mutation<
      { success: boolean },
      {
        userId: string;
        type: string;
        title: string;
        message: string;
        channels: string[];
      }
    >({
      query: (testData) => ({
        url: '/test',
        method: 'POST',
        body: testData,
      }),
    }),

    // Get notification analytics (for admin)
    getNotificationAnalytics: builder.query<
      {
        totalSent: number;
        deliveryRate: { [channel: string]: number };
        engagementRate: number;
        mostActiveTypes: Array<{ type: string; count: number }>;
        userPreferences: { [preference: string]: number };
      },
      { dateRange?: { start: string; end: string } }
    >({
      query: ({ dateRange }) => ({
        url: '/analytics',
        params: dateRange,
      }),
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useUpdateNotificationStatusMutation,
  useBulkUpdateNotificationsMutation,
  useDeleteNotificationMutation,
  useExecuteNotificationActionMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useSendTestNotificationMutation,
  useGetNotificationAnalyticsQuery,
} = notificationApi;
