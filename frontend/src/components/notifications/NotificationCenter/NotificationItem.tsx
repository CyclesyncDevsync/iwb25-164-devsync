import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  EllipsisVerticalIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { useExecuteNotificationActionMutation } from '../../../store/api/notificationApi';
import {
  getNotificationTypeIcon,
  getPriorityColor,
  formatNotificationTime,
  isNotificationExpired,
} from '../../../utils/notificationUtils';
import type { NotificationDisplay } from '../../../types/notification-extended';

interface NotificationItemProps {
  notification: NotificationDisplay;
  isSelected: boolean;
  isSelectMode: boolean;
  onSelect: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  isSelected,
  isSelectMode,
  onSelect,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  className = '',
}) => {
  const [executeAction] = useExecuteNotificationActionMutation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [pendingActions, setPendingActions] = useState<string[]>([]);

  const isExpired = isNotificationExpired(notification);

  const handleActionClick = async (actionId: string, actionData?: any) => {
    setPendingActions(prev => [...prev, actionId]);
    
    try {
      await executeAction({
        notificationId: notification.id,
        actionId,
        data: actionData,
      }).unwrap();
      
      // Mark as read after successful action
      if (!notification.isRead) {
        onMarkAsRead(notification.id);
      }
    } catch (error) {
      console.error('Failed to execute notification action:', error);
    } finally {
      setPendingActions(prev => prev.filter(id => id !== actionId));
    }
  };

  const handleNotificationClick = () => {
    if (isSelectMode) {
      onSelect(notification.id);
    } else {
      if (!notification.isRead) {
        onMarkAsRead(notification.id);
      }
      
      // Handle navigation if notification has data.url
      if (notification.data?.url) {
        window.location.href = notification.data.url;
      } else {
        setIsExpanded(!isExpanded);
      }
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        relative group hover:bg-gray-50 transition-colors cursor-pointer
        ${!notification.isRead ? 'bg-blue-50' : 'bg-white'}
        ${isSelected ? 'bg-blue-100' : ''}
        ${isExpired ? 'opacity-60' : ''}
        ${className}
      `}
      onClick={handleNotificationClick}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Selection Checkbox */}
          {isSelectMode && (
            <div className="flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(notification.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Notification Icon */}
          <div className="flex-shrink-0 mt-1">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm
              ${getPriorityColor(notification.priority)}
            `}>
              {getNotificationTypeIcon(notification.type)}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className={`
                    text-sm font-medium truncate
                    ${notification.isRead ? 'text-gray-900' : 'text-gray-900 font-semibold'}
                  `}>
                    {notification.title}
                  </h4>
                  
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                  )}
                  
                  {isExpired && (
                    <ClockIcon className="h-4 w-4 text-red-400 flex-shrink-0" title="Expired" />
                  )}
                </div>

                <p className={`
                  mt-1 text-sm line-clamp-2
                  ${notification.isRead ? 'text-gray-600' : 'text-gray-700'}
                `}>
                  {notification.message}
                </p>

                {/* Metadata */}
                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                  <span>{formatNotificationTime(notification.createdAt)}</span>
                  <span>{notification.timeAgo}</span>
                  {notification.metadata?.category && (
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {notification.metadata.category}
                    </span>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 pt-3 border-t border-gray-200"
                  >
                    {/* Additional details if available */}
                    {notification.data && (
                      <div className="space-y-2">
                        {Object.entries(notification.data).map(([key, value]) => {
                          if (key === 'url' || typeof value !== 'string') return null;
                          return (
                            <div key={key} className="text-xs">
                              <span className="font-medium text-gray-700 capitalize">
                                {key.replace(/_/g, ' ')}:
                              </span>
                              <span className="ml-2 text-gray-600">{value}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Actions and Menu */}
              <div className="flex items-center space-x-2 ml-2">
                <span className="text-xs text-gray-500">
                  {formatNotificationTime(notification.createdAt)}
                </span>
                
                {!isSelectMode && (
                  <Menu as="div" className="relative">
                    <Menu.Button
                      className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <EllipsisVerticalIcon className="h-4 w-4" />
                    </Menu.Button>
                    
                    <Transition
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (notification.isRead) {
                                    onMarkAsUnread(notification.id);
                                  } else {
                                    onMarkAsRead(notification.id);
                                  }
                                }}
                                className={`${
                                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                } flex items-center px-4 py-2 text-sm w-full text-left`}
                              >
                                {notification.isRead ? (
                                  <>
                                    <EyeSlashIcon className="h-4 w-4 mr-2" />
                                    Mark as unread
                                  </>
                                ) : (
                                  <>
                                    <EyeIcon className="h-4 w-4 mr-2" />
                                    Mark as read
                                  </>
                                )}
                              </button>
                            )}
                          </Menu.Item>
                          
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(notification.id);
                                }}
                                className={`${
                                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                } flex items-center px-4 py-2 text-sm w-full text-left`}
                              >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Delete
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {notification.actions && notification.actions.length > 0 && !isExpired && (
              <div className="mt-3 flex flex-wrap gap-2">
                {notification.actions.map((action) => {
                  const isPending = pendingActions.includes(action.id);
                  
                  return (
                    <button
                      key={action.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionClick(action.id, action.data);
                      }}
                      disabled={isPending}
                      className={`
                        inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors
                        ${action.style === 'primary' 
                          ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400' 
                          : action.style === 'danger'
                          ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400'
                          : action.style === 'success'
                          ? 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:bg-gray-100'
                        }
                        ${isPending ? 'cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-1"></div>
                          Processing...
                        </>
                      ) : (
                        action.label
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationItem;
