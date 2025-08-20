import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Notification, NotificationPreferences, NotificationFilter } from '../slices/notificationSlice';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

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
    baseUrl: `${API_BASE_URL}/notifications`,
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
      query: ({ page = 1, limit = 20, filter = {} }) => ({
        url: '',
        params: {
          page,
          limit,
          ...filter,
        },
      }),
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
      query: () => '/unread-count',
      providesTags: [{ type: 'UnreadCount', id: 'COUNT' }],
    }),

    // Mark single notification as read/unread
    updateNotificationStatus: builder.mutation<
      Notification,
      { id: string; isRead: boolean }
    >({
      query: ({ id, isRead }) => ({
        url: `/${id}/status`,
        method: 'PATCH',
        body: { isRead },
      }),
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
