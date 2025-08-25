'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  SpeakerWaveIcon,
  MegaphoneIcon,
  ShieldCheckIcon,
  MapPinIcon,
  TruckIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface QuickActionsProps {
  userRole: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ userRole }) => {
  const { t } = useTranslation();

  const getRoleSpecificActions = () => {
    switch (userRole) {
      case 'admin':
        return [
          {
            id: 'announcements',
            label: t('chat.rooms.announcements') || 'Announcements',
            icon: MegaphoneIcon,
            color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
            description: 'Send system-wide announcements',
          },
          {
            id: 'support',
            label: t('chat.rooms.support') || 'Support',
            icon: ShieldCheckIcon,
            color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
            description: 'Customer support channel',
          },
        ];
      
      case 'agent':
        return [
          {
            id: 'agents',
            label: t('chat.rooms.agents') || 'Field Agents',
            icon: TruckIcon,
            color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
            description: 'Agent coordination hub',
          },
          {
            id: 'location',
            label: 'Share Location',
            icon: MapPinIcon,
            color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
            description: 'Share current location',
          },
        ];
      
      case 'supplier':
        return [
          {
            id: 'suppliers',
            label: t('chat.rooms.suppliers') || 'Suppliers',
            icon: TruckIcon,
            color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20',
            description: 'Supplier community hub',
          },
          {
            id: 'support',
            label: t('chat.rooms.support') || 'Support',
            icon: ShieldCheckIcon,
            color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
            description: 'Get help with your account',
          },
        ];
      
      case 'buyer':
        return [
          {
            id: 'buyers',
            label: t('chat.rooms.buyers') || 'Buyers',
            icon: ShoppingBagIcon,
            color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20',
            description: 'Buyer community forum',
          },
          {
            id: 'support',
            label: t('chat.rooms.support') || 'Support',
            icon: ShieldCheckIcon,
            color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
            description: 'Customer support',
          },
        ];
      
      default:
        return [
          {
            id: 'general',
            label: t('chat.rooms.general') || 'General',
            icon: SpeakerWaveIcon,
            color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20',
            description: 'General discussion',
          },
        ];
    }
  };

  const actions = getRoleSpecificActions();

  const handleActionClick = (actionId: string) => {
    // Handle quick action clicks
    console.log('Quick action clicked:', actionId);
    // This would typically join a room or start a conversation
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {t('chat.quickActions') || 'Quick Actions'}
      </h3>
      
      <div className="grid grid-cols-1 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          
          return (
            <motion.button
              key={action.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleActionClick(action.id)}
              className="flex items-center space-x-3 p-2 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <div className={`p-1.5 rounded-lg ${action.color} transition-colors group-hover:scale-110`}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {action.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {action.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
