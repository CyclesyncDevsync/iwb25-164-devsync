import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/solid';
import type { NotificationPriority } from '../../../types/notification-extended';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  priority: NotificationPriority;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary' | 'danger';
  }>;
  persistent?: boolean;
  sound?: boolean;
}

interface ToastProps {
  notification: ToastNotification;
  onDismiss: (id: string) => void;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const Toast: React.FC<ToastProps> = ({ notification, onDismiss, position }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  const duration = notification.duration || (notification.priority === 'urgent' ? 10000 : 5000);

  useEffect(() => {
    if (notification.persistent) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(notification.id), 300);
    }, duration);

    // Progress bar animation
    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - (100 / (duration / 100))));
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [notification.id, duration, notification.persistent, onDismiss]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-400" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />;
      case 'info':
        return <InformationCircleIcon className="h-6 w-6 text-blue-400" />;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-400" />;
    }
  };

  const getColorClasses = () => {
    const base = "shadow-lg ring-1 ring-black ring-opacity-5";
    
    switch (notification.type) {
      case 'success':
        return `${base} bg-green-50 border-green-200`;
      case 'error':
        return `${base} bg-red-50 border-red-200`;
      case 'warning':
        return `${base} bg-yellow-50 border-yellow-200`;
      case 'info':
        return `${base} bg-blue-50 border-blue-200`;
      default:
        return `${base} bg-white border-gray-200`;
    }
  };

  const getPriorityBorder = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'border-l-4 border-l-red-500';
      case 'high':
        return 'border-l-4 border-l-orange-500';
      case 'medium':
        return 'border-l-4 border-l-blue-500';
      case 'low':
        return 'border-l-4 border-l-gray-400';
      default:
        return '';
    }
  };

  const getAnimationVariants = () => {
    const isTop = position.includes('top');
    const isRight = position.includes('right');
    const isLeft = position.includes('left');
    const isCenter = position.includes('center');

    let x = 0;
    let y = 0;

    if (isRight) x = 400;
    if (isLeft) x = -400;
    if (isTop) y = -100;
    if (!isTop) y = 100;
    if (isCenter) x = 0;

    return {
      initial: { opacity: 0, x, y, scale: 0.8 },
      animate: { opacity: 1, x: 0, y: 0, scale: 1 },
      exit: { opacity: 0, x, scale: 0.8 }
    };
  };

  return (
    <motion.div
      {...getAnimationVariants()}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`
        relative max-w-sm w-full rounded-lg p-4 mb-3
        ${getColorClasses()}
        ${getPriorityBorder()}
      `}
    >
      {/* Progress bar for non-persistent notifications */}
      {!notification.persistent && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
          <motion.div
            className={`h-full ${
              notification.type === 'success' ? 'bg-green-400' :
              notification.type === 'error' ? 'bg-red-400' :
              notification.type === 'warning' ? 'bg-yellow-400' :
              'bg-blue-400'
            }`}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      )}

      <div className="flex">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            {notification.title}
          </h3>
          {notification.message && (
            <p className="mt-1 text-sm text-gray-500">
              {notification.message}
            </p>
          )}
          
          {/* Action buttons */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-3 flex space-x-2">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`
                    text-xs font-medium px-3 py-1 rounded-md transition-colors
                    ${action.style === 'primary' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : action.style === 'danger'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onDismiss(notification.id), 300);
            }}
            className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Toast container component
interface ToastContainerProps {
  notifications: ToastNotification[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxNotifications?: number;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  notifications,
  onDismiss,
  position = 'top-right',
  maxNotifications = 5
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  const visibleNotifications = notifications.slice(0, maxNotifications);

  return (
    <div className={`fixed z-50 pointer-events-none ${getPositionClasses()}`}>
      <div className="flex flex-col pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {visibleNotifications.map((notification) => (
            <Toast
              key={notification.id}
              notification={notification}
              onDismiss={onDismiss}
              position={position}
            />
          ))}
        </AnimatePresence>
        
        {/* Show overflow indicator */}
        {notifications.length > maxNotifications && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center text-sm text-gray-500 mt-2 bg-white rounded-lg shadow-lg p-2"
          >
            +{notifications.length - maxNotifications} more notifications
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Toast;
