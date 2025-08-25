'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  href: string;
}

interface QuickActionCardProps {
  action: QuickAction;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ action }) => {
  const { title, description, icon: Icon, color, href } = action;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full"
    >
      <Link href={href} className="block">
        <div className="bg-white dark:bg-dark-surface rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`${color} p-2 rounded-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {description}
                </p>
              </div>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default QuickActionCard;
