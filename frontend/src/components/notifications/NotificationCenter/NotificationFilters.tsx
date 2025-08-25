import React from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  getNotificationTypeLabel,
  getPriorityColor,
} from '../../../utils/notificationUtils';
import type { 
  NotificationFilter, 
  NotificationType, 
  NotificationPriority 
} from '../../../types/notification-extended';

interface NotificationFiltersProps {
  filter: NotificationFilter;
  onFilterChange: (filter: NotificationFilter) => void;
  className?: string;
}

const NOTIFICATION_TYPES: NotificationType[] = [
  'auction_bid',
  'auction_won',
  'auction_lost',
  'material_verified',
  'material_rejected',
  'payment_received',
  'payment_failed',
  'order_confirmed',
  'order_shipped',
  'order_delivered',
  'message_received',
  'dispute_opened',
  'dispute_resolved',
  'system_update',
  'maintenance',
  'security_alert',
  'profile_update',
  'verification_required',
];

const PRIORITY_LEVELS: NotificationPriority[] = ['urgent', 'high', 'medium', 'low'];

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  filter,
  onFilterChange,
  className = '',
}) => {
  const handleTypeToggle = (type: NotificationType) => {
    const currentTypes = filter.type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    onFilterChange({
      ...filter,
      type: newTypes.length > 0 ? newTypes : undefined,
    });
  };

  const handlePriorityToggle = (priority: NotificationPriority) => {
    const currentPriorities = filter.priority || [];
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter(p => p !== priority)
      : [...currentPriorities, priority];
    
    onFilterChange({
      ...filter,
      priority: newPriorities.length > 0 ? newPriorities : undefined,
    });
  };

  const handleReadStatusChange = (isRead: boolean | undefined) => {
    onFilterChange({
      ...filter,
      isRead,
    });
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const dateRange = filter.dateRange || { start: '', end: '' };
    const newDateRange = { ...dateRange, [field]: value };
    
    onFilterChange({
      ...filter,
      dateRange: newDateRange.start || newDateRange.end ? newDateRange : undefined,
    });
  };

  const clearAllFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = !!(
    filter.type?.length ||
    filter.priority?.length ||
    filter.isRead !== undefined ||
    filter.dateRange
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Clear All Filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Active Filters</span>
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Read Status Filter */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Read Status
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="readStatus"
              checked={filter.isRead === undefined}
              onChange={() => handleReadStatusChange(undefined)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-600">All</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="readStatus"
              checked={filter.isRead === false}
              onChange={() => handleReadStatusChange(false)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-600">Unread only</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="readStatus"
              checked={filter.isRead === true}
              onChange={() => handleReadStatusChange(true)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-600">Read only</span>
          </label>
        </div>
      </div>

      {/* Priority Filter */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Priority Level
        </label>
        <div className="space-y-2">
          {PRIORITY_LEVELS.map((priority) => (
            <label key={priority} className="flex items-center">
              <input
                type="checkbox"
                checked={filter.priority?.includes(priority) || false}
                onChange={() => handlePriorityToggle(priority)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 flex items-center">
                <span className={`
                  w-3 h-3 rounded-full mr-2 border
                  ${getPriorityColor(priority).replace('text-', 'bg-').replace('bg-', 'bg-').split(' ')[1]}
                `} />
                <span className="text-sm text-gray-600 capitalize">{priority}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Type Filter */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Notification Type
        </label>
        <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 rounded-md p-2">
          {NOTIFICATION_TYPES.map((type) => (
            <label key={type} className="flex items-center">
              <input
                type="checkbox"
                checked={filter.type?.includes(type) || false}
                onChange={() => handleTypeToggle(type)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">
                {getNotificationTypeLabel(type)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Date Range Filter */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Date Range
        </label>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-500">From</label>
            <input
              type="date"
              value={filter.dateRange?.start || ''}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">To</label>
            <input
              type="date"
              value={filter.dateRange?.end || ''}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Active Filters
          </label>
          <div className="flex flex-wrap gap-2">
            {/* Type tags */}
            {filter.type?.map((type) => (
              <motion.span
                key={`type-${type}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {getNotificationTypeLabel(type)}
                <button
                  onClick={() => handleTypeToggle(type)}
                  className="ml-1 hover:text-blue-600"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </motion.span>
            ))}

            {/* Priority tags */}
            {filter.priority?.map((priority) => (
              <motion.span
                key={`priority-${priority}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
              >
                {priority}
                <button
                  onClick={() => handlePriorityToggle(priority)}
                  className="ml-1 hover:text-orange-600"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </motion.span>
            ))}

            {/* Read status tag */}
            {filter.isRead !== undefined && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                {filter.isRead ? 'Read' : 'Unread'}
                <button
                  onClick={() => handleReadStatusChange(undefined)}
                  className="ml-1 hover:text-green-600"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </motion.span>
            )}

            {/* Date range tag */}
            {filter.dateRange && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
              >
                {filter.dateRange.start} - {filter.dateRange.end}
                <button
                  onClick={() => onFilterChange({ ...filter, dateRange: undefined })}
                  className="ml-1 hover:text-purple-600"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </motion.span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationFilters;
