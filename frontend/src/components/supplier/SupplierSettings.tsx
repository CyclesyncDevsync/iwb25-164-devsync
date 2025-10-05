'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  CogIcon,
  KeyIcon,
  ClockIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { 
  fetchSupplierSettings, 
  updateSupplierSettings, 
  updateNotificationSettings,
  updateSecuritySettings,
  updateBusinessSettings,
  updateApiSettings
} from '@/store/slices/supplierSlice';
import type { SupplierSettings, NotificationSettings, SecuritySettings, BusinessSettings, ApiSettings } from '@/types/supplier';

interface TabProps {
  id: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ label, icon: Icon, isActive, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02, x: 4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 w-full text-left ${
      isActive
        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg border border-emerald-300'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:from-gray-700 dark:hover:to-gray-600'
    }`}
  >
    <Icon className="w-5 h-5 mr-3" />
    {label}
  </motion.button>
);

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between">
    <div className="flex-1">
      <h4 className="text-sm font-medium text-gray-900">{label}</h4>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-emerald-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

export const SupplierSettingsComponent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { settings, loading } = useSelector((state: RootState) => state.supplier);
  
  const [activeTab, setActiveTab] = useState('notifications');
  const [showApiKey, setShowApiKey] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [localSettings, setLocalSettings] = useState<SupplierSettings | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Initialize settings
  useEffect(() => {
    dispatch(fetchSupplierSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'business', label: 'Business Info', icon: BuildingOfficeIcon },
    { id: 'api', label: 'API Settings', icon: CogIcon }
  ];

  const handleSave = async () => {
    if (!localSettings) return;
    
    setSaveStatus('saving');
    setUnsavedChanges(false);
    
    try {
      await dispatch(updateSupplierSettings(localSettings)).unwrap();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const updateLocalSettings = (updates: Partial<SupplierSettings>) => {
    if (localSettings) {
      setLocalSettings({ ...localSettings, ...updates });
      setUnsavedChanges(true);
    }
  };

  const renderNotificationSettings = () => {
    if (!localSettings) return null;

    const updateNotifications = (updates: Partial<NotificationSettings>) => {
      updateLocalSettings({
        notifications: { ...localSettings.notifications, ...updates }
      });
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <EnvelopeIcon className="w-5 h-5 mr-2" />
            Email Notifications
          </h3>
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <Switch
              checked={localSettings.notifications.email.orderUpdates}
              onChange={(checked) => updateNotifications({
                email: { ...localSettings.notifications.email, orderUpdates: checked }
              })}
              label="Order Updates"
              description="Get notified when order status changes"
            />
            <Switch
              checked={localSettings.notifications.email.paymentConfirmations}
              onChange={(checked) => updateNotifications({
                email: { ...localSettings.notifications.email, paymentConfirmations: checked }
              })}
              label="Payment Confirmations"
              description="Receive payment confirmation emails"
            />
            <Switch
              checked={localSettings.notifications.email.systemNotifications}
              onChange={(checked) => updateNotifications({
                email: { ...localSettings.notifications.email, systemNotifications: checked }
              })}
              label="System Notifications"
              description="Important system updates and maintenance alerts"
            />
            <Switch
              checked={localSettings.notifications.email.marketingEmails}
              onChange={(checked) => updateNotifications({
                email: { ...localSettings.notifications.email, marketingEmails: checked }
              })}
              label="Marketing Emails"
              description="Product updates and promotional content"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <DevicePhoneMobileIcon className="w-5 h-5 mr-2" />
            SMS Notifications
          </h3>
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <Switch
              checked={localSettings.notifications.sms.urgentAlerts}
              onChange={(checked) => updateNotifications({
                sms: { ...localSettings.notifications.sms, urgentAlerts: checked }
              })}
              label="Urgent Alerts"
              description="Critical notifications via SMS"
            />
            <Switch
              checked={localSettings.notifications.sms.orderStatusUpdates}
              onChange={(checked) => updateNotifications({
                sms: { ...localSettings.notifications.sms, orderStatusUpdates: checked }
              })}
              label="Order Status Updates"
              description="SMS updates for order changes"
            />
            <Switch
              checked={localSettings.notifications.sms.paymentReminders}
              onChange={(checked) => updateNotifications({
                sms: { ...localSettings.notifications.sms, paymentReminders: checked }
              })}
              label="Payment Reminders"
              description="SMS reminders for pending payments"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BellIcon className="w-5 h-5 mr-2" />
            Push Notifications
          </h3>
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <Switch
              checked={localSettings.notifications.push.realTimeNotifications}
              onChange={(checked) => updateNotifications({
                push: { ...localSettings.notifications.push, realTimeNotifications: checked }
              })}
              label="Real-time Notifications"
              description="Instant push notifications"
            />
            <Switch
              checked={localSettings.notifications.push.dailySummary}
              onChange={(checked) => updateNotifications({
                push: { ...localSettings.notifications.push, dailySummary: checked }
              })}
              label="Daily Summary"
              description="Daily activity summary"
            />
            <Switch
              checked={localSettings.notifications.push.weeklyReports}
              onChange={(checked) => updateNotifications({
                push: { ...localSettings.notifications.push, weeklyReports: checked }
              })}
              label="Weekly Reports"
              description="Weekly performance reports"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderSecuritySettings = () => {
    if (!localSettings) return null;

    const updateSecurity = (updates: Partial<SecuritySettings>) => {
      updateLocalSettings({
        security: { ...localSettings.security, ...updates }
      });
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <KeyIcon className="w-5 h-5 mr-2" />
            Authentication
          </h3>
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <Switch
              checked={localSettings.security.twoFactorAuth}
              onChange={(checked) => updateSecurity({ twoFactorAuth: checked })}
              label="Two-Factor Authentication"
              description="Add an extra layer of security to your account"
            />
            <Switch
              checked={localSettings.security.loginAlerts}
              onChange={(checked) => updateSecurity({ loginAlerts: checked })}
              label="Login Alerts"
              description="Get notified of login attempts"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2" />
            Session Management
          </h3>
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <select
                value={localSettings.security.sessionTimeout}
                onChange={(e) => updateSecurity({ sessionTimeout: parseInt(e.target.value) })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={240}>4 hours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Expiry (days)
              </label>
              <select
                value={localSettings.security.passwordExpiry}
                onChange={(e) => updateSecurity({ passwordExpiry: parseInt(e.target.value) })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
                <option value={180}>6 months</option>
                <option value={365}>1 year</option>
                <option value={0}>Never</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <GlobeAltIcon className="w-5 h-5 mr-2" />
            IP Access Control
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              Restrict access to your account from specific IP addresses (optional)
            </p>
            <textarea
              rows={3}
              value={localSettings.security.allowedIpAddresses.join('\n')}
              onChange={(e) => updateSecurity({ 
                allowedIpAddresses: e.target.value.split('\n').filter(ip => ip.trim()) 
              })}
              placeholder="Enter IP addresses, one per line..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderBusinessSettings = () => {
    if (!localSettings) return null;

    const updateBusiness = (updates: Partial<BusinessSettings>) => {
      updateLocalSettings({
        business: { ...localSettings.business, ...updates }
      });
    };

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BuildingOfficeIcon className="w-5 h-5 mr-2" />
            Company Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={localSettings.business.companyName}
                onChange={(e) => updateBusiness({ companyName: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type
              </label>
              <select
                value={localSettings.business.businessType}
                onChange={(e) => updateBusiness({ businessType: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="recycling">Recycling Company</option>
                <option value="waste_management">Waste Management</option>
                <option value="scrap_dealer">Scrap Dealer</option>
                <option value="manufacturer">Manufacturer</option>
                <option value="individual">Individual Supplier</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax ID
              </label>
              <input
                type="text"
                value={localSettings.business.taxId}
                onChange={(e) => updateBusiness({ taxId: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Order Value ($)
              </label>
              <input
                type="number"
                value={localSettings.business.minimumOrderValue}
                onChange={(e) => updateBusiness({ minimumOrderValue: parseFloat(e.target.value) })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2" />
            Operating Hours
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-3">
              {days.map((day) => (
                <div key={day} className="flex items-center space-x-4">
                  <div className="w-24">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {day}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={!localSettings.business.operatingHours[day].isClosed}
                      onChange={(e) => updateBusiness({
                        operatingHours: {
                          ...localSettings.business.operatingHours,
                          [day]: {
                            ...localSettings.business.operatingHours[day],
                            isClosed: !e.target.checked
                          }
                        }
                      })}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-600">Open</span>
                  </div>
                  {!localSettings.business.operatingHours[day].isClosed && (
                    <>
                      <input
                        type="time"
                        value={localSettings.business.operatingHours[day].open}
                        onChange={(e) => updateBusiness({
                          operatingHours: {
                            ...localSettings.business.operatingHours,
                            [day]: {
                              ...localSettings.business.operatingHours[day],
                              open: e.target.value
                            }
                          }
                        })}
                        className="text-sm rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-600">to</span>
                      <input
                        type="time"
                        value={localSettings.business.operatingHours[day].close}
                        onChange={(e) => updateBusiness({
                          operatingHours: {
                            ...localSettings.business.operatingHours,
                            [day]: {
                              ...localSettings.business.operatingHours[day],
                              close: e.target.value
                            }
                          }
                        })}
                        className="text-sm rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Preferences</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <Switch
              checked={localSettings.business.autoAcceptOrders}
              onChange={(checked) => updateBusiness({ autoAcceptOrders: checked })}
              label="Auto-accept Orders"
              description="Automatically accept orders that meet your criteria"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderApiSettings = () => {
    if (!localSettings) return null;

    const updateApi = (updates: Partial<ApiSettings>) => {
      updateLocalSettings({
        api: { ...localSettings.api, ...updates }
      });
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <CogIcon className="w-5 h-5 mr-2" />
            API Configuration
          </h3>
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={localSettings.api.apiKey}
                    onChange={(e) => updateApi({ apiKey: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showApiKey ? (
                      <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newKey = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                    updateApi({ apiKey: newKey });
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700"
                >
                  Generate
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                value={localSettings.api.webhookUrl}
                onChange={(e) => updateApi({ webhookUrl: e.target.value })}
                placeholder="https://your-domain.com/webhooks"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate Limit (requests per minute)
              </label>
              <select
                value={localSettings.api.rateLimit}
                onChange={(e) => updateApi({ rateLimit: parseInt(e.target.value) })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value={60}>60 RPM</option>
                <option value={120}>120 RPM</option>
                <option value={300}>300 RPM</option>
                <option value={600}>600 RPM</option>
                <option value={1000}>1000 RPM</option>
              </select>
            </div>

            <Switch
              checked={localSettings.api.enableLogging}
              onChange={(checked) => updateApi({ enableLogging: checked })}
              label="Enable API Logging"
              description="Log API requests for debugging and monitoring"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Allowed Origins</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              Specify allowed origins for CORS (Cross-Origin Resource Sharing)
            </p>
            <textarea
              rows={3}
              value={localSettings.api.allowedOrigins.join('\n')}
              onChange={(e) => updateApi({ 
                allowedOrigins: e.target.value.split('\n').filter(origin => origin.trim()) 
              })}
              placeholder="https://your-domain.com&#10;https://app.your-domain.com"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
        </div>
      </div>
    );
  };

  if (loading.settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-2xl p-6 shadow-lg"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your account preferences and configurations</p>
        </div>
        
        {/* Save Button */}
        <div className="flex items-center space-x-4">
          {unsavedChanges && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-sm text-amber-600 flex items-center bg-amber-50 px-3 py-1 rounded-full"
            >
              <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
              Unsaved changes
            </motion.span>
          )}
          
          {saveStatus !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center text-sm bg-white px-3 py-1 rounded-full shadow-sm"
            >
              {saveStatus === 'saving' && (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                  <span className="text-gray-600">Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-green-600">Saved successfully</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-600 mr-2" />
                  <span className="text-red-600">Save failed</span>
                </>
              )}
            </motion.div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={!unsavedChanges || saveStatus === 'saving'}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg ${
              unsavedChanges && saveStatus !== 'saving'
                ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>
      </motion.div>

      {/* Settings Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <Tab
                  key={tab.id}
                  id={tab.id}
                  label={tab.label}
                  icon={tab.icon}
                  isActive={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                />
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'notifications' && renderNotificationSettings()}
                {activeTab === 'security' && renderSecuritySettings()}
                {activeTab === 'business' && renderBusinessSettings()}
                {activeTab === 'api' && renderApiSettings()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
