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
      gutter={16}
      containerStyle={{
        top: 80,
        right: 24,
        zIndex: 99999,
      }}
      toastOptions={{
        duration: 5000,
        style: {
          background: darkMode 
            ? 'linear-gradient(135deg, #1f2937 0%, #374151 100%)' 
            : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
          color: darkMode ? '#F9FAFB' : '#111827',
          border: darkMode 
            ? '1px solid rgba(75, 85, 99, 0.5)' 
            : '1px solid rgba(229, 231, 235, 0.8)',
          borderRadius: '16px',
          padding: '20px 24px',
          fontSize: '15px',
          fontWeight: '600',
          maxWidth: '450px',
          minWidth: '350px',
          backdropFilter: 'blur(12px)',
          boxShadow: darkMode 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
            : '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 8px 16px -8px rgba(0, 0, 0, 0.1)',
        },
        success: {
          style: {
            background: darkMode
              ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)'
              : 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            border: darkMode ? '1px solid #10b981' : '1px solid #6ee7b7',
            color: darkMode ? '#d1fae5' : '#065f46',
          },
          iconTheme: {
            primary: darkMode ? '#10b981' : '#059669',
            secondary: darkMode ? '#065f46' : '#ecfdf5',
          },
        },
        error: {
          style: {
            background: darkMode
              ? 'linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)'
              : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            border: darkMode ? '1px solid #ef4444' : '1px solid #fca5a5',
            color: darkMode ? '#fee2e2' : '#991b1b',
          },
          iconTheme: {
            primary: darkMode ? '#ef4444' : '#dc2626',
            secondary: darkMode ? '#991b1b' : '#fef2f2',
          },
        },
        loading: {
          style: {
            background: darkMode
              ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)'
              : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: darkMode ? '1px solid #3b82f6' : '1px solid #93c5fd',
            color: darkMode ? '#dbeafe' : '#1e3a8a',
          },
        },
      }}
    >
      {(t) => (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8, rotateZ: 5 }}
          animate={{ opacity: 1, x: 0, scale: 1, rotateZ: 0 }}
          exit={{ opacity: 0, x: 100, scale: 0.8, rotateZ: -5 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className="relative overflow-hidden group"
        >
          {/* Background decorative element */}
          <div className={`absolute inset-0 opacity-10 ${
            t.type === 'success' 
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' 
              : t.type === 'error'
              ? 'bg-gradient-to-br from-red-400 to-red-600'
              : 'bg-gradient-to-br from-blue-400 to-blue-600'
          }`} />
          
          {/* Content container */}
          <div className="relative flex items-start space-x-4">
            {/* Icon with animated background */}
            {t.icon && (
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 15,
                  delay: 0.1 
                }}
                className={`flex-shrink-0 p-2.5 rounded-xl ${
                  t.type === 'success'
                    ? 'bg-emerald-500/20 ring-2 ring-emerald-500/30'
                    : t.type === 'error'
                    ? 'bg-red-500/20 ring-2 ring-red-500/30'
                    : 'bg-blue-500/20 ring-2 ring-blue-500/30'
                }`}
              >
                {typeof t.icon === 'string' ? (
                  <span className="text-3xl drop-shadow-2xl filter brightness-110">
                    {t.icon}
                  </span>
                ) : (
                  <div className="w-6 h-6">
                    {t.icon}
                  </div>
                )}
              </motion.div>
            )}
            
            {/* Message content */}
            <div className="flex-1 min-w-0 py-0.5">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="font-bold text-base leading-snug tracking-wide"
              >
                {resolveValue(t.message, t)}
              </motion.div>
              
              {/* Optional subtitle/timestamp */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs opacity-70 mt-1"
              >
                {t.type === 'success' && 'Action completed successfully'}
                {t.type === 'error' && 'Please try again'}
                {t.type === 'loading' && 'Processing...'}
              </motion.div>
            </div>
            
            {/* Close button with enhanced hover effect */}
            {t.type !== 'loading' && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
                onClick={() => toast.dismiss(t.id)}
                className="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-all duration-300 p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 hover:rotate-90 hover:scale-110"
              >
                <XMarkIcon className="w-5 h-5 stroke-2" />
              </motion.button>
            )}
          </div>
          
          {/* Animated progress bar with gradient */}
          {t.type !== 'loading' && (
            <motion.div
              className={`absolute bottom-0 left-0 h-1.5 rounded-b-2xl ${
                t.type === 'success' 
                  ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600' 
                  : t.type === 'error'
                  ? 'bg-gradient-to-r from-red-400 via-red-500 to-red-600'
                  : 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600'
              }`}
              style={{
                boxShadow: t.type === 'success'
                  ? '0 0 20px rgba(16, 185, 129, 0.6), 0 0 40px rgba(16, 185, 129, 0.3)'
                  : t.type === 'error'
                  ? '0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.3)'
                  : '0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.3)',
              }}
              initial={{ width: '100%', opacity: 1 }}
              animate={{ width: '0%', opacity: 0.7 }}
              transition={{ duration: t.duration ? t.duration / 1000 : 5, ease: 'linear' }}
            />
          )}
          
          {/* Pulsing glow effect on hover */}
          <motion.div
            className={`absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl ${
              t.type === 'success'
                ? 'bg-emerald-500'
                : t.type === 'error'
                ? 'bg-red-500'
                : 'bg-blue-500'
            }`}
          />
          
          {/* Shimmer effect overlay - enhanced */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none -skew-x-12"
            initial={{ x: '-200%' }}
            animate={{ x: '300%' }}
            transition={{
              duration: 2,
              ease: 'easeInOut',
              delay: 0.3,
            }}
          />
          
          {/* Subtle particle effect */}
          {t.type === 'success' && (
            <>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-emerald-400 rounded-full"
                  initial={{ 
                    x: '50%', 
                    y: '50%', 
                    scale: 0,
                    opacity: 1 
                  }}
                  animate={{ 
                    x: `${50 + (Math.random() - 0.5) * 100}%`,
                    y: `${50 + (Math.random() - 0.5) * 100}%`,
                    scale: [0, 1, 0],
                    opacity: [1, 0.5, 0]
                  }}
                  transition={{
                    duration: 1 + Math.random(),
                    delay: Math.random() * 0.5,
                    ease: 'easeOut'
                  }}
                />
              ))}
            </>
          )}
        </motion.div>
      )}
    </Toaster>
  );
}

// Notification types for different scenarios
export const notificationTypes = {
  // Authentication
  loginSuccess: () => enhancedToast.success('Successfully logged in.'),
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
