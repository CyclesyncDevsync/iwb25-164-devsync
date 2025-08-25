'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PaintBrushIcon,
  SparklesIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { ThemeSettings } from '../../../components/demo/ThemeSettings';
import { FloatingActionButton } from '../../../components/ui/FloatingActionButton';
import { Button } from '../../../components/ui/Button';
import { Loading, CardSkeleton, ListSkeleton } from '../../../components/ui/Loading';
import { enhancedToast, notificationTypes } from '../../../components/ui/EnhancedToast';

const demoSections = [
  {
    id: 'theme',
    title: 'Theme System',
    description: 'Advanced dark mode and role-based theming',
    icon: PaintBrushIcon,
    component: ThemeSettings
  },
  {
    id: 'components',
    title: 'Enhanced Components',
    description: 'Improved UI components with animations',
    icon: SparklesIcon,
    component: () => <ComponentsDemo />
  },
  {
    id: 'notifications',
    title: 'Notification System',
    description: 'Rich notifications with actions',
    icon: LightBulbIcon,
    component: () => <NotificationsDemo />
  },
  {
    id: 'loading',
    title: 'Loading States',
    description: 'Improved loading and skeleton components',
    icon: RocketLaunchIcon,
    component: () => <LoadingDemo />
  }
];

function ComponentsDemo() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Button Showcase */}
        <div className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Enhanced Buttons
          </h3>
          <div className="space-y-3">
            <Button variant="gradient" size="lg" className="w-full">
              Gradient Button
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="admin" size="sm">Admin</Button>
              <Button variant="agent" size="sm">Agent</Button>
              <Button variant="supplier" size="sm">Supplier</Button>
              <Button variant="buyer" size="sm">Buyer</Button>
            </div>
          </div>
        </div>

        {/* Card Effects */}
        <div className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 card-hover">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Interactive Cards
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Hover over this card to see the enhanced animation effects.
          </p>
          <div className="glass-effect p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Glass morphism effect applied
            </p>
          </div>
        </div>

        {/* Animations */}
        <div className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            CSS Animations
          </h3>
          <div className="space-y-4">
            <div className="animate-float w-12 h-12 bg-primary rounded-full mx-auto"></div>
            <div className="animate-pulse-slow w-full h-2 bg-gradient-to-r from-primary to-supplier rounded"></div>
            <div className="loading-shimmer w-full h-8 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsDemo() {
  const triggerNotifications = () => {
    enhancedToast.success('Success notification!');
    setTimeout(() => enhancedToast.error('Error notification!'), 500);
    setTimeout(() => enhancedToast.warning('Warning notification!'), 1000);
    setTimeout(() => enhancedToast.info('Info notification!'), 1500);
    setTimeout(() => {
      enhancedToast.action(
        'Would you like to see more demos?',
        'Yes, show me!',
        () => enhancedToast.success('Action completed!')
      );
    }, 2000);
  };

  const triggerRoleNotifications = () => {
    enhancedToast.admin('Admin notification');
    setTimeout(() => enhancedToast.agent('Agent notification'), 300);
    setTimeout(() => enhancedToast.supplier('Supplier notification'), 600);
    setTimeout(() => enhancedToast.buyer('Buyer notification'), 900);
  };

  const triggerContextualNotifications = () => {
    notificationTypes.materialAdded();
    setTimeout(() => notificationTypes.bidPlaced(150), 500);
    setTimeout(() => notificationTypes.verificationApproved(), 1000);
    setTimeout(() => notificationTypes.orderPlaced(), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button onClick={triggerNotifications} variant="gradient">
          Basic Notifications
        </Button>
        <Button onClick={triggerRoleNotifications} variant="outline">
          Role-Based Notifications
        </Button>
        <Button onClick={triggerContextualNotifications} variant="secondary">
          Contextual Notifications
        </Button>
      </div>
      
      <div className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Notification Features
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>✅ Enhanced styling with animations</li>
          <li>✅ Role-based color coding</li>
          <li>✅ Action buttons in notifications</li>
          <li>✅ Progress bars for timed toasts</li>
          <li>✅ Dark mode support</li>
          <li>✅ Custom positioning and duration</li>
        </ul>
      </div>
    </div>
  );
}

function LoadingDemo() {
  const [showLoading, setShowLoading] = useState(false);
  const [showSkeletons, setShowSkeletons] = useState(false);

  const triggerLoading = () => {
    setShowLoading(true);
    setTimeout(() => setShowLoading(false), 3000);
  };

  const triggerSkeletons = () => {
    setShowSkeletons(true);
    setTimeout(() => setShowSkeletons(false), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button onClick={triggerLoading} variant="outline">
          Show Loading States
        </Button>
        <Button onClick={triggerSkeletons} variant="outline">
          Show Skeleton Loaders
        </Button>
      </div>

      {showLoading && (
        <div className="space-y-4">
          <Loading text="Loading with enhanced animation..." />
          <Loading text="Spinner with role colors..." variant="admin" />
        </div>
      )}

      {showSkeletons && (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Card Skeletons
            </h4>
            <CardSkeleton count={2} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              List Skeletons
            </h4>
            <ListSkeleton count={3} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function EnhancementsDemo() {
  const [activeSection, setActiveSection] = useState('theme');

  const ActiveComponent = demoSections.find(section => section.id === activeSection)?.component;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
                  <SparklesIcon className="w-8 h-8 text-primary dark:text-primary-light" />
                </div>
                <h1 className="text-4xl font-bold heading-gradient">
                  CircularSync Enhancements
                </h1>
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Comprehensive UI/UX improvements with dark mode, enhanced components, and improved functionality
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {demoSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeSection === section.id
                    ? 'border-primary text-primary dark:text-primary-light'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <section.icon className="w-5 h-5" />
                <span className="whitespace-nowrap">{section.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {ActiveComponent && <ActiveComponent />}
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Enhancement Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            What's New & Improved
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Comprehensive enhancements across the entire platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: PaintBrushIcon,
              title: 'Advanced Dark Mode',
              description: 'Comprehensive dark theme with smooth transitions and role-based color schemes'
            },
            {
              icon: SparklesIcon,
              title: 'Enhanced Animations',
              description: 'Smooth micro-interactions and enhanced visual feedback throughout the app'
            },
            {
              icon: ShieldCheckIcon,
              title: 'Improved Authentication',
              description: 'Re-enabled authentication with better error handling and user feedback'
            },
            {
              icon: DevicePhoneMobileIcon,
              title: 'Mobile Optimized',
              description: 'Better responsive design and touch interactions for mobile devices'
            },
            {
              icon: LightBulbIcon,
              title: 'Smart Notifications',
              description: 'Rich notification system with actions, progress bars, and contextual styling'
            },
            {
              icon: RocketLaunchIcon,
              title: 'Performance Improvements',
              description: 'Optimized loading states, better caching, and improved component rendering'
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 card-hover"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                  <feature.icon className="w-6 h-6 text-primary dark:text-primary-light" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
