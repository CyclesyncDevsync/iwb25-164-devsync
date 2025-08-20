import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellIcon,
  XMarkIcon,
  FunnelIcon,
  CheckIcon,
  TrashIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useAppSelector, useAppDispatch } from '../../../hooks/redux';
import {
  setNotificationCenterOpen,
  markAsRead,
  markAsUnread,
  deleteSelected,
  selectNotification,
  deselectNotification,
  clearSelection,
  setFilter,
  markAllAsRead,
} from '../../../store/slices/notificationSlice';
import {
  useGetNotificationsQuery,
  useUpdateNotificationStatusMutation,
  useBulkUpdateNotificationsMutation,
} from '../../../store/api/notificationApi';
import NotificationItem from './NotificationItem';
import NotificationFilters from './NotificationFilters';
import NotificationStats from './NotificationStats';
import { groupNotificationsByDate, filterNotifications } from '../../../utils/notificationUtils';
import type { NotificationFilter } from '../../../types/notification-extended';

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const {
    isNotificationCenterOpen,
    filter,
    selectedNotifications,
    unreadCount,
  } = useAppSelector((state) => state.notifications);

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectMode, setIsSelectMode] = useState(false);

  // API calls
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useGetNotificationsQuery({
    page: 1,
    limit: 50,
    filter: { ...filter, search: searchQuery },
  });

  const [updateNotificationStatus] = useUpdateNotificationStatusMutation();
  const [bulkUpdateNotifications] = useBulkUpdateNotificationsMutation();

  const notifications = notificationsData?.notifications || [];

  // Filter and group notifications
  const filteredNotifications = useMemo(() => {
    return filterNotifications(notifications, {
      ...filter,
      search: searchQuery,
    });
  }, [notifications, filter, searchQuery]);

  const groupedNotifications = useMemo(() => {
    return groupNotificationsByDate(filteredNotifications);
  }, [filteredNotifications]);

  const handleToggleNotificationCenter = () => {
    dispatch(setNotificationCenterOpen(!isNotificationCenterOpen));
  };

  const handleMarkAsRead = async (notificationIds: string[]) => {
    try {
      await bulkUpdateNotifications({
        notificationIds,
        action: 'mark_read',
      }).unwrap();
      dispatch(markAsRead(notificationIds));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const handleMarkAsUnread = async (notificationIds: string[]) => {
    try {
      await bulkUpdateNotifications({
        notificationIds,
        action: 'mark_unread',
      }).unwrap();
      dispatch(markAsUnread(notificationIds));
    } catch (error) {
      console.error('Failed to mark notifications as unread:', error);
    }
  };

  const handleDeleteNotifications = async (notificationIds: string[]) => {
    try {
      await bulkUpdateNotifications({
        notificationIds,
        action: 'delete',
      }).unwrap();
      dispatch(deleteSelected());
    } catch (error) {
      console.error('Failed to delete notifications:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length > 0) {
      await handleMarkAsRead(unreadIds);
      dispatch(markAllAsRead());
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      dispatch(clearSelection());
    } else {
      filteredNotifications.forEach(notification => {
        dispatch(selectNotification(notification.id));
      });
    }
  };

  const handleFilterChange = (newFilter: NotificationFilter) => {
    dispatch(setFilter(newFilter));
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <button
        onClick={handleToggleNotificationCenter}
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <span className="sr-only">View notifications</span>
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Center Panel */}
      <AnimatePresence>
        {isNotificationCenterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-25 z-40"
              onClick={handleToggleNotificationCenter}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Notifications
                  </h2>
                  {unreadCount > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <button
                  onClick={handleToggleNotificationCenter}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Controls */}
              <div className="p-4 border-b border-gray-200 space-y-3">
                {/* Search */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FunnelIcon className="h-4 w-4 mr-1" />
                      Filters
                      <ChevronDownIcon 
                        className={`h-4 w-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} 
                      />
                    </button>
                    
                    <button
                      onClick={() => setIsSelectMode(!isSelectMode)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {isSelectMode ? 'Cancel' : 'Select'}
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Mark all read
                      </button>
                    )}
                    
                    <button
                      onClick={() => {/* Open settings */}}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Bulk Actions (shown when in select mode) */}
                {isSelectMode && selectedNotifications.length > 0 && (
                  <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-md">
                    <span className="text-sm text-blue-700">
                      {selectedNotifications.length} selected
                    </span>
                    <div className="flex space-x-1 ml-auto">
                      <button
                        onClick={handleSelectAll}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        {selectedNotifications.length === filteredNotifications.length ? 'Deselect All' : 'Select All'}
                      </button>
                      <button
                        onClick={() => handleMarkAsRead(selectedNotifications)}
                        className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        <CheckIcon className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteNotifications(selectedNotifications)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Filters Panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-b border-gray-200 overflow-hidden"
                  >
                    <NotificationFilters
                      filter={filter}
                      onFilterChange={handleFilterChange}
                      className="p-4"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stats */}
              <NotificationStats
                notifications={notifications}
                className="p-4 border-b border-gray-200"
              />

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : error ? (
                  <div className="p-4 text-center text-red-600">
                    <p>Failed to load notifications</p>
                    <button
                      onClick={() => refetch()}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Try again
                    </button>
                  </div>
                ) : groupedNotifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <BellIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No notifications found</p>
                    {(filter.type?.length || filter.priority?.length || searchQuery) && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          dispatch(setFilter({}));
                        }}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {groupedNotifications.map((group) => (
                      <div key={group.date}>
                        {/* Date Header */}
                        <div className="sticky top-0 bg-gray-50 px-4 py-2 z-10">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900">
                              {group.date}
                            </h3>
                            {group.unreadCount > 0 && (
                              <span className="text-xs text-blue-600">
                                {group.unreadCount} unread
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Notifications in Group */}
                        <div>
                          {group.notifications.map((notification) => (
                            <NotificationItem
                              key={notification.id}
                              notification={notification}
                              isSelected={selectedNotifications.includes(notification.id)}
                              isSelectMode={isSelectMode}
                              onSelect={(id: string) => {
                                if (selectedNotifications.includes(id)) {
                                  dispatch(deselectNotification(id));
                                } else {
                                  dispatch(selectNotification(id));
                                }
                              }}
                              onMarkAsRead={(id: string) => handleMarkAsRead([id])}
                              onMarkAsUnread={(id: string) => handleMarkAsUnread([id])}
                              onDelete={(id: string) => handleDeleteNotifications([id])}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
