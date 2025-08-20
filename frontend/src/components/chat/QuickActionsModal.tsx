'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store';
import { 
  XMarkIcon, 
  BoltIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
  MapPinIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  category: 'urgent' | 'scheduling' | 'general' | 'support';
  roles: Array<'admin' | 'agent' | 'supplier' | 'buyer'>;
}

const quickActions: QuickAction[] = [
  {
    id: 'urgent-issue',
    title: 'Report Urgent Issue',
    description: 'Report critical problems that need immediate attention',
    icon: ExclamationTriangleIcon,
    color: 'from-red-500 to-orange-500',
    category: 'urgent',
    roles: ['agent', 'supplier', 'buyer']
  },
  {
    id: 'schedule-meeting',
    title: 'Schedule Meeting',
    description: 'Set up a meeting with team members',
    icon: CalendarIcon,
    color: 'from-blue-500 to-indigo-500',
    category: 'scheduling',
    roles: ['admin', 'agent', 'supplier', 'buyer']
  },
  {
    id: 'share-location',
    title: 'Share Location',
    description: 'Share your current location with the team',
    icon: MapPinIcon,
    color: 'from-green-500 to-emerald-500',
    category: 'general',
    roles: ['agent', 'supplier']
  },
  {
    id: 'quick-call',
    title: 'Start Quick Call',
    description: 'Initiate an immediate voice or video call',
    icon: PhoneIcon,
    color: 'from-purple-500 to-pink-500',
    category: 'general',
    roles: ['admin', 'agent', 'supplier', 'buyer']
  },
  {
    id: 'status-update',
    title: 'Send Status Update',
    description: 'Broadcast your current status to relevant team members',
    icon: InformationCircleIcon,
    color: 'from-cyan-500 to-blue-500',
    category: 'general',
    roles: ['agent', 'supplier']
  },
  {
    id: 'completion-report',
    title: 'Mark Task Complete',
    description: 'Report completion of assigned tasks',
    icon: CheckCircleIcon,
    color: 'from-green-500 to-teal-500',
    category: 'general',
    roles: ['agent', 'supplier']
  },
  {
    id: 'request-support',
    title: 'Request Support',
    description: 'Get help from support team',
    icon: DocumentTextIcon,
    color: 'from-indigo-500 to-purple-500',
    category: 'support',
    roles: ['agent', 'supplier', 'buyer']
  },
  {
    id: 'time-log',
    title: 'Log Working Hours',
    description: 'Record time spent on activities',
    icon: ClockIcon,
    color: 'from-orange-500 to-red-500',
    category: 'general',
    roles: ['agent', 'supplier']
  }
];

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Actions', icon: BoltIcon },
    { id: 'urgent', label: 'Urgent', icon: ExclamationTriangleIcon },
    { id: 'scheduling', label: 'Scheduling', icon: CalendarIcon },
    { id: 'general', label: 'General', icon: InformationCircleIcon },
    { id: 'support', label: 'Support', icon: DocumentTextIcon }
  ];

  const filteredActions = quickActions.filter(action => {
    const categoryMatch = selectedCategory === 'all' || action.category === selectedCategory;
    const roleMatch = user?.role && action.roles.includes(user.role as any);
    return categoryMatch && roleMatch;
  });

  const handleActionClick = (action: QuickAction) => {
    console.log('Executing quick action:', action.id);
    
    // Here you would implement the actual action logic
    switch (action.id) {
      case 'urgent-issue':
        // Open urgent issue form
        break;
      case 'schedule-meeting':
        // Open meeting scheduler
        break;
      case 'share-location':
        // Share current location
        break;
      case 'quick-call':
        // Start call interface
        break;
      default:
        console.log('Action not implemented yet:', action.id);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <BoltIcon className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Actions
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="flex flex-col h-full max-h-[60vh]">
            {/* Category Tabs */}
            <div className="flex space-x-1 p-4 bg-gray-50 dark:bg-gray-700/50 overflow-x-auto">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.id;
                return (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Actions Grid */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleActionClick(action)}
                      className="p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 transition-all group shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                            {action.description}
                          </p>
                          <div className="flex items-center mt-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              action.category === 'urgent' 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                : action.category === 'scheduling'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                : action.category === 'support'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                              {action.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {filteredActions.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <BoltIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No actions available
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    No quick actions are available for your current role in this category.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
