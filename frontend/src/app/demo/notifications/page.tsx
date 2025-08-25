'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BellIcon,
  PlayIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  NotificationCenter,
  ToastContainer,
  NotificationSettings,
  useNotificationSystem,
} from '../../../components/notifications';
import type { NotificationType, NotificationPriority } from '../../../types/notification-extended';

const NotificationDemoPage = () => {
  const [showSettings, setShowSettings] = useState(false);
  const notificationSystem = useNotificationSystem();
  const { toasts, addToast, removeToast, showSuccess, showError, showWarning, showInfo } = notificationSystem.toasts;

  // Demo notification types and priorities
  const demoNotifications = [
    {
      type: 'auction_bid' as NotificationType,
      priority: 'high' as NotificationPriority,
      title: 'New Bid Received',
      message: 'Someone placed a bid of $150 on your plastic waste auction',
      actions: [
        { label: 'View Auction', action: () => console.log('View auction'), style: 'primary' as const },
        { label: 'Dismiss', action: () => console.log('Dismiss'), style: 'secondary' as const },
      ],
    },
    {
      type: 'material_verified' as NotificationType,
      priority: 'medium' as NotificationPriority,
      title: 'Material Verified',
      message: 'Your submitted metal scraps have been verified and approved for auction',
    },
    {
      type: 'payment_received' as NotificationType,
      priority: 'high' as NotificationPriority,
      title: 'Payment Received',
      message: 'You received $250 for your recent plastic waste sale',
    },
    {
      type: 'security_alert' as NotificationType,
      priority: 'urgent' as NotificationPriority,
      title: 'Security Alert',
      message: 'Unusual login detected from a new device',
      persistent: true,
      actions: [
        { label: 'Secure Account', action: () => console.log('Secure account'), style: 'danger' as const },
        { label: 'Not Me', action: () => console.log('Not me'), style: 'secondary' as const },
      ],
    },
    {
      type: 'system_update' as NotificationType,
      priority: 'low' as NotificationPriority,
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight from 2 AM to 4 AM',
    },
  ];

  const handleDemoNotification = (demo: typeof demoNotifications[0]) => {
    addToast({
      title: demo.title,
      message: demo.message,
      type: demo.priority === 'urgent' ? 'error' : 
            demo.priority === 'high' ? 'warning' :
            demo.type.includes('payment') || demo.type.includes('verified') ? 'success' : 'info',
      priority: demo.priority,
      actions: demo.actions,
      persistent: demo.persistent,
    });
  };

  const handleQuickToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: { title: 'Success!', message: 'Operation completed successfully' },
      error: { title: 'Error!', message: 'Something went wrong' },
      warning: { title: 'Warning!', message: 'Please check your input' },
      info: { title: 'Info', message: 'Here is some information' },
    };

    switch (type) {
      case 'success':
        showSuccess(messages.success.title, messages.success.message);
        break;
      case 'error':
        showError(messages.error.title, messages.error.message);
        break;
      case 'warning':
        showWarning(messages.warning.title, messages.warning.message);
        break;
      case 'info':
        showInfo(messages.info.title, messages.info.message);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <BellIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Notification System Demo
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                Settings
              </button>
              
              {/* Notification Center */}
              <NotificationCenter />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Demo Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Toast Notifications Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Toast Notifications
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Test different types of toast notifications with various priorities and actions.
              </p>
              
              {/* Quick Toast Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <button
                  onClick={() => handleQuickToast('success')}
                  className="inline-flex items-center justify-center px-4 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Success
                </button>
                
                <button
                  onClick={() => handleQuickToast('error')}
                  className="inline-flex items-center justify-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                >
                  <XCircleIcon className="h-4 w-4 mr-2" />
                  Error
                </button>
                
                <button
                  onClick={() => handleQuickToast('warning')}
                  className="inline-flex items-center justify-center px-4 py-2 border border-yellow-300 rounded-md text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                >
                  <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                  Warning
                </button>
                
                <button
                  onClick={() => handleQuickToast('info')}
                  className="inline-flex items-center justify-center px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                >
                  <InformationCircleIcon className="h-4 w-4 mr-2" />
                  Info
                </button>
              </div>

              {/* Demo Notifications */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Business Logic Notifications
                </h3>
                {demoNotifications.map((demo, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {demo.title}
                          </h4>
                          <span className={`
                            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                            ${demo.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              demo.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              demo.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'}
                          `}>
                            {demo.priority}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {demo.type.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{demo.message}</p>
                        {demo.actions && (
                          <div className="mt-2 flex space-x-2">
                            {demo.actions.map((action, actionIndex) => (
                              <span
                                key={actionIndex}
                                className={`
                                  inline-flex items-center px-2 py-1 rounded text-xs font-medium
                                  ${action.style === 'primary' ? 'bg-blue-100 text-blue-800' :
                                    action.style === 'danger' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'}
                                `}
                              >
                                {action.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDemoNotification(demo)}
                        className="ml-4 inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <PlayIcon className="h-3 w-3 mr-1" />
                        Test
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Real-time Features */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Real-time Features
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">WebSocket Connection</h3>
                    <p className="text-xs text-gray-600">Real-time notification delivery</p>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-xs text-green-600">Connected</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Browser Notifications</h3>
                    <p className="text-xs text-gray-600">Push notifications when tab is inactive</p>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-yellow-400 rounded-full mr-2"></div>
                    <span className="text-xs text-yellow-600">Permission Required</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Sound Notifications</h3>
                    <p className="text-xs text-gray-600">Audio alerts for important notifications</p>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-blue-400 rounded-full mr-2"></div>
                    <span className="text-xs text-blue-600">Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Overview */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Features Implemented
              </h2>
              <div className="space-y-3">
                {[
                  'Multi-channel notifications (In-app, Push, Email, SMS, WhatsApp)',
                  'Role-specific notification types',
                  'Priority-based delivery',
                  'Quiet hours configuration',
                  'Batch notification management',
                  'Real-time WebSocket delivery',
                  'Browser notification integration',
                  'Sound notifications',
                  'Notification center with filtering',
                  'Advanced search and sorting',
                  'Bulk actions (mark read, delete)',
                  'Notification analytics',
                  'Action buttons in notifications',
                  'Expiration handling',
                  'Offline support',
                ].map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Usage Statistics
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Notifications</span>
                  <span className="text-sm font-medium text-gray-900">1,234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Unread</span>
                  <span className="text-sm font-medium text-red-600">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Today</span>
                  <span className="text-sm font-medium text-blue-600">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Week</span>
                  <span className="text-sm font-medium text-green-600">45</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <NotificationSettings onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer
        notifications={toasts}
        onDismiss={removeToast}
        position="top-right"
        maxNotifications={5}
      />
    </div>
  );
};

export default NotificationDemoPage;
