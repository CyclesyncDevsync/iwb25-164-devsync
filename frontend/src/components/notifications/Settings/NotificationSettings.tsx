import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Switch } from '@headlessui/react';
import {
  BellIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  MoonIcon,
  ClockIcon,
  Cog6ToothIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from '../../../store/api/notificationApi';
import {
  getNotificationTypeLabel,
  getChannelLabel,
  getChannelIcon,
} from '../../../utils/notificationUtils';
import type { 
  NotificationPreferences, 
  NotificationType, 
  NotificationChannel,
  NotificationPriority 
} from '../../../types/notification-extended';

interface NotificationSettingsProps {
  className?: string;
  onClose?: () => void;
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
  'security_alert',
  'profile_update',
  'verification_required',
];

const CHANNELS: NotificationChannel[] = ['in_app', 'push', 'email', 'sms', 'whatsapp'];
const PRIORITIES: NotificationPriority[] = ['urgent', 'high', 'medium', 'low'];

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  className = '',
  onClose,
}) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences | null>(null);

  const {
    data: preferences,
    isLoading,
    error,
  } = useGetNotificationPreferencesQuery();

  const [updatePreferences, { isLoading: isUpdating }] = useUpdateNotificationPreferencesMutation();

  // Initialize local preferences when data is loaded
  useEffect(() => {
    if (preferences && !localPreferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences, localPreferences]);

  const handleChannelToggle = (channel: NotificationChannel, enabled: boolean) => {
    if (!localPreferences) return;

    const updatedPreferences = {
      ...localPreferences,
      channels: {
        ...localPreferences.channels,
        [channel]: {
          ...localPreferences.channels[channel],
          enabled,
        },
      },
    };

    setLocalPreferences(updatedPreferences);
    setHasChanges(true);
  };

  const handleChannelTypeToggle = (
    channel: NotificationChannel, 
    type: NotificationType, 
    enabled: boolean
  ) => {
    if (!localPreferences) return;

    const currentTypes = localPreferences.channels[channel]?.types || [];
    const newTypes = enabled 
      ? [...currentTypes, type]
      : currentTypes.filter(t => t !== type);

    const updatedPreferences = {
      ...localPreferences,
      channels: {
        ...localPreferences.channels,
        [channel]: {
          ...localPreferences.channels[channel],
          types: newTypes,
        },
      },
    };

    setLocalPreferences(updatedPreferences);
    setHasChanges(true);
  };

  const handleQuietHoursToggle = (channel: NotificationChannel, enabled: boolean) => {
    if (!localPreferences) return;

    const updatedPreferences = {
      ...localPreferences,
      channels: {
        ...localPreferences.channels,
        [channel]: {
          ...localPreferences.channels[channel],
          quietHours: {
            ...localPreferences.channels[channel]?.quietHours,
            enabled,
          },
        },
      },
    };

    setLocalPreferences(updatedPreferences);
    setHasChanges(true);
  };

  const handleQuietHoursTimeChange = (
    channel: NotificationChannel, 
    field: 'start' | 'end', 
    value: string
  ) => {
    if (!localPreferences) return;

    const updatedPreferences = {
      ...localPreferences,
      channels: {
        ...localPreferences.channels,
        [channel]: {
          ...localPreferences.channels[channel],
          quietHours: {
            ...localPreferences.channels[channel]?.quietHours,
            [field]: value,
          },
        },
      },
    };

    setLocalPreferences(updatedPreferences);
    setHasChanges(true);
  };

  const handlePriorityToggle = (priority: NotificationPriority, enabled: boolean) => {
    if (!localPreferences) return;

    const updatedPreferences = {
      ...localPreferences,
      priority: {
        ...localPreferences.priority,
        [priority]: {
          ...localPreferences.priority[priority],
          enabled,
        },
      },
    };

    setLocalPreferences(updatedPreferences);
    setHasChanges(true);
  };

  const handlePriorityChannelToggle = (
    priority: NotificationPriority, 
    channel: NotificationChannel, 
    enabled: boolean
  ) => {
    if (!localPreferences) return;

    const currentChannels = localPreferences.priority[priority]?.channels || [];
    const newChannels = enabled 
      ? [...currentChannels, channel]
      : currentChannels.filter(c => c !== channel);

    const updatedPreferences = {
      ...localPreferences,
      priority: {
        ...localPreferences.priority,
        [priority]: {
          ...localPreferences.priority[priority],
          channels: newChannels,
        },
      },
    };

    setLocalPreferences(updatedPreferences);
    setHasChanges(true);
  };

  const handleBatchSettingsChange = (field: keyof NotificationPreferences['batchSettings'], value: any) => {
    if (!localPreferences) return;

    const updatedPreferences = {
      ...localPreferences,
      batchSettings: {
        ...localPreferences.batchSettings,
        [field]: value,
      },
    };

    setLocalPreferences(updatedPreferences);
    setHasChanges(true);
  };

  const handleDoNotDisturbChange = (field: keyof NotificationPreferences['doNotDisturb'], value: any) => {
    if (!localPreferences) return;

    const updatedPreferences = {
      ...localPreferences,
      doNotDisturb: {
        ...localPreferences.doNotDisturb,
        [field]: value,
      },
    };

    setLocalPreferences(updatedPreferences);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!localPreferences || !hasChanges) return;

    try {
      await updatePreferences(localPreferences).unwrap();
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    }
  };

  const handleReset = () => {
    if (preferences) {
      setLocalPreferences(preferences);
      setHasChanges(false);
    }
  };

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case 'in_app':
        return <BellIcon className="h-5 w-5" />;
      case 'push':
        return <DevicePhoneMobileIcon className="h-5 w-5" />;
      case 'email':
        return <EnvelopeIcon className="h-5 w-5" />;
      case 'sms':
        return <DevicePhoneMobileIcon className="h-5 w-5" />;
      case 'whatsapp':
        return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
      default:
        return <BellIcon className="h-5 w-5" />;
    }
  };

  if (isLoading || !localPreferences) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <div className="text-red-600">
          <p>Failed to load notification preferences</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage how and when you receive notifications
          </p>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Save/Reset Actions */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm text-blue-800">You have unsaved changes</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleReset}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-blue-400 flex items-center"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="h-3 w-3 mr-1" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Global Do Not Disturb */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <MoonIcon className="h-6 w-6 text-gray-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Do Not Disturb</h3>
              <p className="text-sm text-gray-600">Global quiet hours for all notifications</p>
            </div>
          </div>
          <Switch
            checked={localPreferences.doNotDisturb.enabled}
            onChange={(enabled) => handleDoNotDisturbChange('enabled', enabled)}
            className={`${
              localPreferences.doNotDisturb.enabled ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                localPreferences.doNotDisturb.enabled ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>

        {localPreferences.doNotDisturb.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <label className="text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                value={localPreferences.doNotDisturb.start || '22:00'}
                onChange={(e) => handleDoNotDisturbChange('start', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                value={localPreferences.doNotDisturb.end || '08:00'}
                onChange={(e) => handleDoNotDisturbChange('end', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Channel Settings */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Notification Channels</h2>
        
        {CHANNELS.map((channel) => {
          const channelPrefs = localPreferences.channels[channel];
          
          return (
            <div key={channel} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getChannelIcon(channel)}
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {getChannelLabel(channel)} Notifications
                    </h3>
                    <p className="text-sm text-gray-600">
                      Configure {getChannelLabel(channel).toLowerCase()} notification settings
                    </p>
                  </div>
                </div>
                <Switch
                  checked={channelPrefs?.enabled || false}
                  onChange={(enabled) => handleChannelToggle(channel, enabled)}
                  className={`${
                    channelPrefs?.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      channelPrefs?.enabled ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>

              {channelPrefs?.enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  {/* Quiet Hours for this channel */}
                  {channel !== 'in_app' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700">Quiet Hours</h4>
                        <Switch
                          checked={channelPrefs.quietHours?.enabled || false}
                          onChange={(enabled) => handleQuietHoursToggle(channel, enabled)}
                          className={`${
                            channelPrefs.quietHours?.enabled ? 'bg-blue-600' : 'bg-gray-200'
                          } relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                        >
                          <span
                            className={`${
                              channelPrefs.quietHours?.enabled ? 'translate-x-5' : 'translate-x-1'
                            } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                          />
                        </Switch>
                      </div>

                      {channelPrefs.quietHours?.enabled && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-600">Start</label>
                            <input
                              type="time"
                              value={channelPrefs.quietHours?.start || '22:00'}
                              onChange={(e) => handleQuietHoursTimeChange(channel, 'start', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">End</label>
                            <input
                              type="time"
                              value={channelPrefs.quietHours?.end || '08:00'}
                              onChange={(e) => handleQuietHoursTimeChange(channel, 'end', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notification Types */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Notification Types</h4>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {NOTIFICATION_TYPES.map((type) => {
                        const isEnabled = channelPrefs.types?.includes(type) || false;
                        
                        return (
                          <label key={type} className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={(e) => handleChannelTypeToggle(channel, type, e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-gray-600">
                              {getNotificationTypeLabel(type)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Priority Settings */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Priority Settings</h2>
        <p className="text-sm text-gray-600">
          Configure which channels to use for different priority levels
        </p>
        
        {PRIORITIES.map((priority) => {
          const priorityPrefs = localPreferences.priority[priority];
          
          return (
            <div key={priority} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 capitalize">
                    {priority} Priority
                  </h3>
                  <p className="text-sm text-gray-600">
                    {priority === 'urgent' ? 'Critical notifications that require immediate attention' :
                     priority === 'high' ? 'Important notifications that should be seen soon' :
                     priority === 'medium' ? 'Standard notifications' :
                     'Low priority notifications'}
                  </p>
                </div>
                <Switch
                  checked={priorityPrefs?.enabled || false}
                  onChange={(enabled) => handlePriorityToggle(priority, enabled)}
                  className={`${
                    priorityPrefs?.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      priorityPrefs?.enabled ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>

              {priorityPrefs?.enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-3 gap-4"
                >
                  {CHANNELS.map((channel) => {
                    const isChannelEnabled = priorityPrefs.channels?.includes(channel) || false;
                    
                    return (
                      <label key={channel} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isChannelEnabled}
                          onChange={(e) => handlePriorityChannelToggle(priority, channel, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          {getChannelLabel(channel)}
                        </span>
                      </label>
                    );
                  })}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Batch Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Batch Notifications</h3>
            <p className="text-sm text-gray-600">
              Group multiple notifications together to reduce interruptions
            </p>
          </div>
          <Switch
            checked={localPreferences.batchSettings.enabled}
            onChange={(enabled) => handleBatchSettingsChange('enabled', enabled)}
            className={`${
              localPreferences.batchSettings.enabled ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                localPreferences.batchSettings.enabled ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>

        {localPreferences.batchSettings.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <label className="text-sm font-medium text-gray-700">Batch Interval (minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={localPreferences.batchSettings.interval}
                onChange={(e) => handleBatchSettingsChange('interval', parseInt(e.target.value))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Max Notifications per Batch</label>
              <input
                type="number"
                min="2"
                max="20"
                value={localPreferences.batchSettings.maxCount}
                onChange={(e) => handleBatchSettingsChange('maxCount', parseInt(e.target.value))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;
