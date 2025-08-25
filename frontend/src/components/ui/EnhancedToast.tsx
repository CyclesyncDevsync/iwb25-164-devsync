'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast, { Toaster, resolveValue } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { RootState } from '../../types/store';

// Enhanced toast types
export const enhancedToast = {
  success: (message: string, options?: any) => {
    return toast.success(message, {
      duration: 4000,
      style: {
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        border: '1px solid #10B981',
        borderRadius: '12px',
        padding: '16px',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '400px',
        boxShadow: '0 10px 40px rgba(16, 185, 129, 0.1)',
      },
      iconTheme: {
        primary: '#10B981',
        secondary: '#FFFFFF',
      },
      ...options
    });
  },

  error: (message: string, options?: any) => {
    return toast.error(message, {
      duration: 6000,
      style: {
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        border: '1px solid #EF4444',
        borderRadius: '12px',
        padding: '16px',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '400px',
        boxShadow: '0 10px 40px rgba(239, 68, 68, 0.1)',
      },
      iconTheme: {
        primary: '#EF4444',
        secondary: '#FFFFFF',
      },
      ...options
    });
  },

  warning: (message: string, options?: any) => {
    return toast(message, {
      duration: 5000,
      icon: '⚠️',
      style: {
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        border: '1px solid #F59E0B',
        borderRadius: '12px',
        padding: '16px',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '400px',
        boxShadow: '0 10px 40px rgba(245, 158, 11, 0.1)',
      },
      ...options
    });
  },

  info: (message: string, options?: any) => {
    return toast(message, {
      duration: 4000,
      icon: 'ℹ️',
      style: {
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        border: '1px solid #3B82F6',
        borderRadius: '12px',
        padding: '16px',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '400px',
        boxShadow: '0 10px 40px rgba(59, 130, 246, 0.1)',
      },
      ...options
    });
  },

  loading: (message: string, options?: any) => {
    return toast.loading(message, {
      style: {
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '16px',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '400px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      },
      ...options
    });
  },

  // Custom role-based toasts
  admin: (message: string) => enhancedToast.success(message, {
    style: { borderColor: '#00684A' },
    iconTheme: { primary: '#00684A', secondary: '#FFFFFF' }
  }),

  agent: (message: string) => enhancedToast.info(message, {
    style: { borderColor: '#0066CC' },
    icon: '🔍'
  }),

  supplier: (message: string) => enhancedToast.success(message, {
    style: { borderColor: '#10B981' },
    icon: '📦'
  }),

  buyer: (message: string) => enhancedToast.info(message, {
    style: { borderColor: '#8B5CF6' },
    icon: '🛒'
  }),

  // Action toasts with buttons
  action: (message: string, actionLabel: string, onAction: () => void) => {
    return toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.5 }}
        className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-md"
      >
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {message}
            </p>
            <div className="mt-3 flex space-x-2">
              <button
                onClick={() => {
                  onAction();
                  toast.dismiss(t.id);
                }}
                className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
              >
                {actionLabel}
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    ), { duration: 8000 });
  }
};

// Custom toast container with enhanced styling
export function EnhancedToaster() {
  const { darkMode } = useSelector((state: RootState) => state.theme);

  return (
    <Toaster
      position="top-right"
      gutter={12}
      containerStyle={{
        top: 80,
        right: 20,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: darkMode ? '#374151' : '#FFFFFF',
          color: darkMode ? '#F9FAFB' : '#111827',
          border: `1px solid ${darkMode ? '#4B5563' : '#E5E7EB'}`,
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500',
          maxWidth: '400px',
          boxShadow: darkMode 
            ? '0 20px 40px rgba(0, 0, 0, 0.3)' 
            : '0 20px 40px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      {(t) => (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.5 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          className="relative"
        >
          <div className="flex items-center space-x-3">
            {t.icon && (
              <div className="flex-shrink-0">
                {typeof t.icon === 'string' ? (
                  <span className="text-lg">{t.icon}</span>
                ) : (
                  t.icon
                )}
              </div>
            )}
            <div className="flex-1">
              {resolveValue(t.message, t)}
            </div>
            {t.type !== 'loading' && (
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Progress bar for timed toasts */}
          {t.type !== 'loading' && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-primary dark:bg-primary-light rounded-b-xl"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: t.duration ? t.duration / 1000 : 4, ease: 'linear' }}
            />
          )}
        </motion.div>
      )}
    </Toaster>
  );
}

// Notification types for different scenarios
export const notificationTypes = {
  // Authentication
  loginSuccess: () => enhancedToast.success('Welcome back! Successfully logged in.'),
  loginError: () => enhancedToast.error('Login failed. Please check your credentials.'),
  logoutSuccess: () => enhancedToast.success('Successfully logged out.'),
  
  // Material management
  materialAdded: () => enhancedToast.supplier('Material successfully added to inventory.'),
  materialUpdated: () => enhancedToast.success('Material information updated.'),
  materialDeleted: () => enhancedToast.warning('Material removed from inventory.'),
  
  // Auction activities
  bidPlaced: (amount: number) => enhancedToast.buyer(`Bid of $${amount} placed successfully.`),
  bidOutbid: () => enhancedToast.warning('You have been outbid on this auction.'),
  auctionWon: () => enhancedToast.success('Congratulations! You won the auction.'),
  auctionLost: () => enhancedToast.info('Auction ended. Better luck next time.'),
  
  // Verification
  verificationSubmitted: () => enhancedToast.agent('Verification report submitted successfully.'),
  verificationApproved: () => enhancedToast.success('Material verification approved.'),
  verificationRejected: () => enhancedToast.error('Material verification rejected.'),
  
  // Orders and transactions
  orderPlaced: () => enhancedToast.success('Order placed successfully.'),
  orderShipped: () => enhancedToast.info('Your order has been shipped.'),
  orderDelivered: () => enhancedToast.success('Order delivered successfully.'),
  paymentSuccess: () => enhancedToast.success('Payment processed successfully.'),
  paymentFailed: () => enhancedToast.error('Payment failed. Please try again.'),
  
  // System notifications
  systemMaintenance: () => enhancedToast.warning('System maintenance scheduled for tonight.'),
  newFeature: (feature: string) => enhancedToast.info(`New feature available: ${feature}`),
  
  // Error handling
  networkError: () => enhancedToast.error('Network error. Please check your connection.'),
  serverError: () => enhancedToast.error('Server error. Please try again later.'),
  
  // Custom action notifications
  requiresAction: (message: string, actionLabel: string, onAction: () => void) => {
    return enhancedToast.action(message, actionLabel, onAction);
  }
};
