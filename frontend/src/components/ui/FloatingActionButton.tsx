'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import { RootState } from '../../types/store';
import Link from 'next/link';

interface FABAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href?: string;
  onClick?: () => void;
  color: string;
}

interface FloatingActionButtonProps {
  actions?: FABAction[];
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
}

const defaultActions: FABAction[] = [
  {
    id: 'chat',
    label: 'Open Chat',
    icon: ChatBubbleLeftRightIcon,
    href: '/chat',
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: BellIcon,
    href: '/notifications',
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    id: 'help',
    label: 'Help & Support',
    icon: QuestionMarkCircleIcon,
    href: '/help',
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Cog6ToothIcon,
    href: '/profile',
    color: 'bg-gray-500 hover:bg-gray-600'
  }
];

export function FloatingActionButton({ 
  actions = defaultActions, 
  position = 'bottom-right',
  size = 'md'
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { darkMode } = useSelector((state: RootState) => state.theme);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  };

  const actionPositions = position.includes('bottom') 
    ? { y: -80, direction: 'up' }
    : { y: 80, direction: 'down' };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 flex flex-col items-center space-y-3`}>
      {/* Action Buttons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`flex flex-col items-center space-y-3 ${
              actionPositions.direction === 'up' ? 'flex-col-reverse' : 'flex-col'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ 
                  opacity: 0, 
                  scale: 0.3,
                  y: actionPositions.direction === 'up' ? 20 : -20
                }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  y: 0
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.3,
                  y: actionPositions.direction === 'up' ? 20 : -20
                }}
                transition={{ 
                  duration: 0.2, 
                  delay: index * 0.1 
                }}
                className="relative group"
              >
                {action.href ? (
                  <Link href={action.href}>
                    <motion.button
                      className={`
                        ${sizeClasses[size]} ${action.color}
                        rounded-full shadow-lg text-white
                        flex items-center justify-center
                        transition-all duration-200
                        hover:shadow-xl active:scale-95
                      `}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <action.icon className={iconSizes[size]} />
                    </motion.button>
                  </Link>
                ) : (
                  <motion.button
                    onClick={action.onClick}
                    className={`
                      ${sizeClasses[size]} ${action.color}
                      rounded-full shadow-lg text-white
                      flex items-center justify-center
                      transition-all duration-200
                      hover:shadow-xl active:scale-95
                    `}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <action.icon className={iconSizes[size]} />
                  </motion.button>
                )}
                
                {/* Tooltip */}
                <div className={`
                  absolute ${position.includes('right') ? 'right-full mr-3' : 'left-full ml-3'}
                  top-1/2 transform -translate-y-1/2
                  opacity-0 group-hover:opacity-100
                  transition-all duration-200 pointer-events-none
                  bg-black dark:bg-white text-white dark:text-black
                  px-2 py-1 rounded text-xs font-medium
                  whitespace-nowrap shadow-lg
                  z-60
                `}>
                  {action.label}
                  <div className={`
                    absolute top-1/2 transform -translate-y-1/2
                    ${position.includes('right') 
                      ? 'left-full border-l-black dark:border-l-white'
                      : 'right-full border-r-black dark:border-r-white'
                    }
                    border-4 border-transparent
                  `} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${sizeClasses[size]} 
          bg-primary hover:bg-primary/90 dark:bg-primary-light dark:hover:bg-primary-light/90
          rounded-full shadow-lg text-white
          flex items-center justify-center
          transition-all duration-200
          hover:shadow-xl active:scale-95
          relative overflow-hidden
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ 
          rotate: isOpen ? 45 : 0,
          backgroundColor: isOpen 
            ? (darkMode ? '#EF4444' : '#DC2626')
            : (darkMode ? '#47A16B' : '#00684A')
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <XMarkIcon className={iconSizes[size]} />
          ) : (
            <PlusIcon className={iconSizes[size]} />
          )}
        </motion.div>
        
        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: isOpen ? 1.5 : 0, 
            opacity: isOpen ? 0.3 : 0 
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>
    </div>
  );
}

// Role-specific FAB configurations
export function AdminFAB() {
  const adminActions: FABAction[] = [
    {
      id: 'users',
      label: 'Manage Users',
      icon: UserGroupIcon,
      href: '/admin/users',
      color: 'bg-admin hover:bg-admin/90'
    },
    {
      id: 'reports',
      label: 'View Reports',
      icon: DocumentTextIcon,
      href: '/admin/reports',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    ...defaultActions
  ];

  return <FloatingActionButton actions={adminActions} />;
}

export function SupplierFAB() {
  const supplierActions: FABAction[] = [
    {
      id: 'add-material',
      label: 'Add Material',
      icon: PlusIcon,
      href: '/supplier/materials/add',
      color: 'bg-supplier hover:bg-supplier/90'
    },
    ...defaultActions
  ];

  return <FloatingActionButton actions={supplierActions} />;
}

export function BuyerFAB() {
  const buyerActions: FABAction[] = [
    {
      id: 'search',
      label: 'Search Materials',
      icon: DocumentTextIcon,
      href: '/buyer/search',
      color: 'bg-buyer hover:bg-buyer/90'
    },
    ...defaultActions
  ];

  return <FloatingActionButton actions={buyerActions} />;
}
