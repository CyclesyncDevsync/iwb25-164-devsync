'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { 
  PaintBrushIcon,
  SwatchIcon,
  ComputerDesktopIcon,
  SunIcon,
  MoonIcon,
  EyeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { RootState } from '../../types/store';
import { toggleDarkMode, setActiveRole } from '../../store/slices/themeSlice';
import { DarkModeToggle } from '../ui/DarkModeToggle';
import { Button } from '../ui/Button';
import { enhancedToast, notificationTypes } from '../ui/EnhancedToast';

const roleColors = {
  admin: { 
    name: 'Admin', 
    color: '#00684A', 
    darkColor: '#47A16B',
    description: 'System administration and control'
  },
  agent: { 
    name: 'Field Agent', 
    color: '#0066CC', 
    darkColor: '#60A5FA',
    description: 'Material verification and quality assurance'
  },
  supplier: { 
    name: 'Supplier', 
    color: '#10B981', 
    darkColor: '#34D399',
    description: 'Material supply and inventory management'
  },
  buyer: { 
    name: 'Buyer', 
    color: '#8B5CF6', 
    darkColor: '#A78BFA',
    description: 'Material procurement and purchasing'
  },
  guest: { 
    name: 'Guest', 
    color: '#6B7280', 
    darkColor: '#9CA3AF',
    description: 'Limited access visitor'
  }
};

export function ThemeSettings() {
  const dispatch = useDispatch();
  const { darkMode, activeRole, colorScheme } = useSelector((state: RootState) => state.theme);
  const [previewRole, setPreviewRole] = useState<string | null>(null);

  const handleRoleChange = (role: string) => {
    dispatch(setActiveRole(role as any));
    enhancedToast.success(`Theme switched to ${roleColors[role as keyof typeof roleColors].name} mode`);
  };

  const testNotifications = () => {
    setTimeout(() => notificationTypes.loginSuccess(), 500);
    setTimeout(() => notificationTypes.materialAdded(), 1000);
    setTimeout(() => notificationTypes.bidPlaced(250), 1500);
    setTimeout(() => notificationTypes.verificationApproved(), 2000);
    setTimeout(() => enhancedToast.info('All notification styles demonstrated!'), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
            <PaintBrushIcon className="w-8 h-8 text-primary dark:text-primary-light" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Theme Settings
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Customize your CircularSync experience with advanced theming options, role-based color schemes, and accessibility features.
        </p>
      </div>

      {/* Dark Mode Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            {darkMode ? (
              <MoonIcon className="w-6 h-6 text-blue-600" />
            ) : (
              <SunIcon className="w-6 h-6 text-yellow-600" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Appearance Mode
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose between light and dark themes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Light Mode */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => !darkMode || dispatch(toggleDarkMode())}
            className={`p-4 rounded-lg border-2 transition-all ${
              !darkMode 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded border shadow-sm flex items-center justify-center">
                <SunIcon className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900 dark:text-white">Light</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Default bright theme</p>
              </div>
            </div>
          </motion.button>

          {/* Dark Mode */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => darkMode || dispatch(toggleDarkMode())}
            className={`p-4 rounded-lg border-2 transition-all ${
              darkMode 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded border shadow-sm flex items-center justify-center">
                <MoonIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900 dark:text-white">Dark</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Easy on the eyes</p>
              </div>
            </div>
          </motion.button>

          {/* Advanced Toggle */}
          <div className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center space-y-3">
            <DarkModeToggle size="lg" showLabel />
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              Advanced toggle with animations
            </p>
          </div>
        </div>
      </motion.div>

      {/* Role-Based Colors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <SwatchIcon className="w-6 h-6 text-primary dark:text-primary-light" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Role-Based Color Schemes
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Colors adapt based on your role in the platform
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(roleColors).map(([role, config]) => (
            <motion.div
              key={role}
              whileHover={{ scale: 1.02 }}
              onHoverStart={() => setPreviewRole(role)}
              onHoverEnd={() => setPreviewRole(null)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                activeRole === role
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => handleRoleChange(role)}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div 
                  className="w-8 h-8 rounded-full"
                  style={{ 
                    backgroundColor: darkMode ? config.darkColor : config.color 
                  }}
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {config.name}
                  </p>
                  {activeRole === role && (
                    <p className="text-xs text-primary dark:text-primary-light">
                      Currently Active
                    </p>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {config.description}
              </p>
              
              {/* Color Preview */}
              <div className="mt-3 flex space-x-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: config.color }}
                  title="Light mode color"
                />
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: config.darkColor }}
                  title="Dark mode color"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Button Variants Demo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <EyeIcon className="w-6 h-6 text-primary dark:text-primary-light" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Component Preview
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              See how components look with current theme
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Button variants */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Button Variants
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Default</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="gradient">Gradient</Button>
              <Button variant="admin">Admin</Button>
              <Button variant="agent">Agent</Button>
              <Button variant="supplier">Supplier</Button>
              <Button variant="buyer">Buyer</Button>
            </div>
          </div>

          {/* Notification Test */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Notification System
            </h3>
            <Button onClick={testNotifications} variant="outline">
              Test All Notifications
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Theme Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-primary/5 to-supplier/5 dark:from-primary/10 dark:to-supplier/10 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <Cog6ToothIcon className="w-5 h-5 text-primary dark:text-primary-light" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Current Theme Configuration
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white dark:bg-dark-surface rounded-lg p-3">
              <p className="text-gray-600 dark:text-gray-400">Mode</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {darkMode ? 'Dark' : 'Light'}
              </p>
            </div>
            <div className="bg-white dark:bg-dark-surface rounded-lg p-3">
              <p className="text-gray-600 dark:text-gray-400">Role</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {roleColors[activeRole as keyof typeof roleColors]?.name || 'Guest'}
              </p>
            </div>
            <div className="bg-white dark:bg-dark-surface rounded-lg p-3">
              <p className="text-gray-600 dark:text-gray-400">Primary</p>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: colorScheme.primary }}
                />
                <p className="font-mono text-xs text-gray-900 dark:text-white">
                  {colorScheme.primary}
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-dark-surface rounded-lg p-3">
              <p className="text-gray-600 dark:text-gray-400">Accent</p>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: colorScheme.accent }}
                />
                <p className="font-mono text-xs text-gray-900 dark:text-white">
                  {colorScheme.accent}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
