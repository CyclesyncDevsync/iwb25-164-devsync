'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cog6ToothIcon,
  BellIcon,
  MapPinIcon,
  CameraIcon,
  MoonIcon,
  SunIcon,
  TrashIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import AgentLayout from '@/components/layout/AgentLayout';
import { getOfflineStorage } from '@/components/agent/OfflineStorage';

const AgentSettingsPage = () => {
  const [settings, setSettings] = useState({
    notifications: {
      newAssignments: true,
      deadlineReminders: true,
      syncStatus: true,
      soundEnabled: false
    },
    location: {
      highAccuracy: true,
      backgroundTracking: false,
      shareLocation: true
    },
    camera: {
      autoCompress: true,
      imageQuality: 'high',
      gpsTagging: true
    },
    sync: {
      autoSync: true,
      wifiOnly: false,
      syncInterval: 5 // minutes
    },
    display: {
      darkMode: false,
      language: 'en'
    }
  });

  const [storageInfo, setStorageInfo] = useState({
    verifications: 0,
    photos: 0,
    total: '0 MB'
  });

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleClearOfflineData = async () => {
    if (confirm('Are you sure you want to clear all offline data? This cannot be undone.')) {
      const offlineStorage = getOfflineStorage();
      await offlineStorage.clearAllData();
      setStorageInfo({ verifications: 0, photos: 0, total: '0 MB' });
    }
  };

  const handleSyncNow = async () => {
    try {
      const offlineStorage = getOfflineStorage();
      const result = await offlineStorage.syncToServer();
      alert(`Sync completed: ${result.success} successful, ${result.failed} failed`);
      
      // Refresh storage info
      const info = await offlineStorage.getStorageSize();
      setStorageInfo(info);
    } catch (error) {
      alert('Sync failed. Please try again later.');
    }
  };

  return (
    <AgentLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">

        <div className="p-4 space-y-6">
          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <BellIcon className="w-5 h-5 text-agent-DEFAULT mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Notifications
                </h3>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {[
                { key: 'newAssignments', label: 'New Assignments', description: 'Get notified when new tasks are assigned' },
                { key: 'deadlineReminders', label: 'Deadline Reminders', description: 'Receive alerts before task deadlines' },
                { key: 'syncStatus', label: 'Sync Status', description: 'Notifications about data synchronization' },
                { key: 'soundEnabled', label: 'Sound Alerts', description: 'Enable sound for notifications' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.description}
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                      onChange={(e) => updateSetting('notifications', item.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Location Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <MapPinIcon className="w-5 h-5 text-agent-DEFAULT mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Location & GPS
                </h3>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {[
                { key: 'highAccuracy', label: 'High Accuracy GPS', description: 'Use GPS for precise location tracking' },
                { key: 'backgroundTracking', label: 'Background Tracking', description: 'Track location when app is in background' },
                { key: 'shareLocation', label: 'Share Location', description: 'Allow admin to see your current location' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.description}
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.location[item.key as keyof typeof settings.location]}
                      onChange={(e) => updateSetting('location', item.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Camera Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <CameraIcon className="w-5 h-5 text-agent-DEFAULT mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Camera & Photos
                </h3>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Auto Compress Images
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Automatically compress photos to save storage
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.camera.autoCompress}
                    onChange={(e) => updateSetting('camera', 'autoCompress', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Image Quality
                </label>
                <select
                  value={settings.camera.imageQuality}
                  onChange={(e) => updateSetting('camera', 'imageQuality', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-agent-DEFAULT focus:border-agent-DEFAULT"
                >
                  <option value="low">Low (Faster upload)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (Best quality)</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    GPS Tagging
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Add location data to photos
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.camera.gpsTagging}
                    onChange={(e) => updateSetting('camera', 'gpsTagging', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Offline Storage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <CloudArrowUpIcon className="w-5 h-5 text-agent-DEFAULT mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Offline Storage & Sync
                </h3>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {storageInfo.verifications}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Verifications</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {storageInfo.photos}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Photos</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {storageInfo.total}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total Size</div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSyncNow}
                  className="flex-1 bg-agent-DEFAULT text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-agent-DEFAULT/90"
                >
                  Sync Now
                </button>
                <button
                  onClick={handleClearOfflineData}
                  className="flex items-center justify-center py-2 px-4 border border-red-300 text-red-700 dark:text-red-400 rounded-md text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <TrashIcon className="w-4 h-4 mr-1" />
                  Clear
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Auto Sync
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Automatically sync when online
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.sync.autoSync}
                    onChange={(e) => updateSetting('sync', 'autoSync', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Display Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                {settings.display.darkMode ? (
                  <MoonIcon className="w-5 h-5 text-agent-DEFAULT mr-2" />
                ) : (
                  <SunIcon className="w-5 h-5 text-agent-DEFAULT mr-2" />
                )}
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Display & Language
                </h3>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Dark Mode
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Use dark theme for better battery life
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.display.darkMode}
                    onChange={(e) => updateSetting('display', 'darkMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Language
                </label>
                <select
                  value={settings.display.language}
                  onChange={(e) => updateSetting('display', 'language', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-agent-DEFAULT focus:border-agent-DEFAULT"
                >
                  <option value="en">English</option>
                  <option value="si">සිංහල (Sinhala)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AgentLayout>
  );
};

export default AgentSettingsPage;
