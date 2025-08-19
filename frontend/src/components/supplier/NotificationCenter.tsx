'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BellIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../hooks/useAuth';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  category: 'material' | 'payment' | 'system' | 'team' | 'auction';
}

export default function NotificationCenter() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'material' | 'payment' | 'system' | 'team' | 'auction'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const dispatch = useAppDispatch();
  const { profile, loading } = useAppSelector(state => state.supplier);

  // Mock notifications data - replace with actual API calls
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Material Approved',
      message: 'Your aluminum sheets material listing has been approved and is now live.',
      timestamp: new Date('2024-08-18T10:30:00'),
      read: false,
      actionUrl: '/supplier/materials/1',
      actionLabel: 'View Material',
      category: 'material'
    },
    {
      id: '2',
      type: 'info',
      title: 'Payment Received',
      message: 'Payment of LKR 15,000 for aluminum sheets has been processed.',
      timestamp: new Date('2024-08-17T14:15:00'),
      read: false,
      actionUrl: '/supplier/earnings',
      actionLabel: 'View Earnings',
      category: 'payment'
    },
    {
      id: '3',
      type: 'warning',
      title: 'Storage Capacity Alert',
      message: 'Main Collection Center is at 85% capacity. Consider scheduling pickup.',
      timestamp: new Date('2024-08-16T09:45:00'),
      read: true,
      actionUrl: '/supplier/locations',
      actionLabel: 'View Locations',
      category: 'system'
    },
    {
      id: '4',
      type: 'info',
      title: 'New Team Member Added',
      message: 'John Silva has been added to your team as a Collection Agent.',
      timestamp: new Date('2024-08-15T16:20:00'),
      read: true,
      category: 'team'
    },
    {
      id: '5',
      type: 'success',
      title: 'Auction Won',
      message: 'Congratulations! You won the bid for plastic bottles auction.',
      timestamp: new Date('2024-08-14T11:00:00'),
      read: true,
      actionUrl: '/supplier/auctions',
      actionLabel: 'View Auction',
      category: 'auction'
    },
    {
      id: '6',
      type: 'error',
      title: 'Material Rejected',
      message: 'Your cardboard material listing was rejected. Reason: Quality specifications unclear.',
      timestamp: new Date('2024-08-13T13:30:00'),
      read: true,
      actionUrl: '/supplier/materials/new',
      actionLabel: 'Resubmit',
      category: 'material'
    }
  ]);

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !notification.read) ||
                         notification.category === filter;
    
    return matchesSearch && matchesFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckIcon className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XMarkIcon className="h-5 w-5 text-red-600" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-600" />;
    }
  };

  const getNotificationBorderColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'error':
        return 'border-l-red-500';
      default:
        return 'border-l-blue-500';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <BellIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Stay updated with your account activity
            </p>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              Mark all as read
            </button>
          )}
          <button
            onClick={clearAllNotifications}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Clear All
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="material">Materials</option>
            <option value="payment">Payments</option>
            <option value="system">System</option>
            <option value="team">Team</option>
            <option value="auction">Auctions</option>
          </select>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filteredNotifications.length} of {notifications.length} notifications
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow border-l-4 ${getNotificationBorderColor(notification.type)} ${
              !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
            }`}
          >
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`text-sm font-medium ${
                        !notification.read 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {notification.title}
                        {!notification.read && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                            New
                          </span>
                        )}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {notification.message}
                      </p>
                      <div className="mt-2 flex items-center space-x-4">
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {notification.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Mark as read"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        title="Delete notification"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {notification.actionUrl && notification.actionLabel && (
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          markAsRead(notification.id);
                          // Navigate to action URL
                          window.location.href = notification.actionUrl!;
                        }}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                      >
                        {notification.actionLabel}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No notifications found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'You\'re all caught up! New notifications will appear here.'}
          </p>
        </div>
      )}

      {/* Load More Button (if needed for pagination) */}
      {filteredNotifications.length > 0 && filteredNotifications.length < notifications.length && (
        <div className="text-center">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
            Load More Notifications
          </button>
        </div>
      )}
    </div>
  );
}
