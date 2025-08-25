import React from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { calculateNotificationStats } from '../../../utils/notificationUtils';
import type { Notification } from '../../../types/notification-extended';

interface NotificationStatsProps {
  notifications: Notification[];
  className?: string;
  showDetailed?: boolean;
}

export const NotificationStats: React.FC<NotificationStatsProps> = ({
  notifications,
  className = '',
  showDetailed = true,
}) => {
  const stats = calculateNotificationStats(notifications);

  const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
    description?: string;
  }> = ({ icon, label, value, color, description }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`
        p-3 rounded-lg border-l-4 ${color}
        bg-gradient-to-r from-white to-gray-50
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0">{icon}</div>
          <div>
            <p className="text-sm font-medium text-gray-900">{label}</p>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </motion.div>
  );

  const getMostActiveType = (): [string, number] | null => {
    const entries = Object.entries(stats.byType);
    if (entries.length === 0) return null;
    
    return entries.reduce((max, current) => 
      (current[1] as number) > (max[1] as number) ? current : max
    ) as [string, number];
  };

  const getMostActivePriority = (): [string, number] | null => {
    const entries = Object.entries(stats.byPriority);
    if (entries.length === 0) return null;
    
    return entries.reduce((max, current) => 
      (current[1] as number) > (max[1] as number) ? current : max
    ) as [string, number];
  };

  const mostActiveType = getMostActiveType();
  const mostActivePriority = getMostActivePriority();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<ChartBarIcon className="h-5 w-5 text-blue-600" />}
          label="Total"
          value={stats.total}
          color="border-l-blue-500"
        />
        
        <StatCard
          icon={<ExclamationCircleIcon className="h-5 w-5 text-red-600" />}
          label="Unread"
          value={stats.unread}
          color="border-l-red-500"
        />
        
        <StatCard
          icon={<ClockIcon className="h-5 w-5 text-green-600" />}
          label="Today"
          value={stats.today}
          color="border-l-green-500"
        />
        
        <StatCard
          icon={<CheckCircleIcon className="h-5 w-5 text-purple-600" />}
          label="This Week"
          value={stats.thisWeek}
          color="border-l-purple-500"
        />
      </div>

      {/* Detailed Stats */}
      {showDetailed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-3"
        >
          {/* Most Active Type */}
          {mostActiveType && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-blue-900">
                    Most Active Type
                  </h4>
                  <p className="text-xs text-blue-700">
                    {mostActiveType[0].replace(/_/g, ' ').toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-900">
                    {mostActiveType[1]}
                  </p>
                  <p className="text-xs text-blue-600">
                    {Math.round((mostActiveType[1] / stats.total) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Most Active Priority */}
          {mostActivePriority && (
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-orange-900">
                    Most Active Priority
                  </h4>
                  <p className="text-xs text-orange-700 capitalize">
                    {mostActivePriority[0]} Priority
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-900">
                    {mostActivePriority[1]}
                  </p>
                  <p className="text-xs text-orange-600">
                    {Math.round((mostActivePriority[1] / stats.total) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Type Breakdown */}
          {Object.keys(stats.byType).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                By Type
              </h4>
              <div className="space-y-1">
                {Object.entries(stats.byType)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 5)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between py-1">
                      <span className="text-xs text-gray-600 capitalize">
                        {type.replace(/_/g, ' ')}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${((count as number) / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-900 w-6 text-right">
                          {count as number}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Priority Breakdown */}
          {Object.keys(stats.byPriority).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                By Priority
              </h4>
              <div className="space-y-1">
                {Object.entries(stats.byPriority)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .map(([priority, count]) => {
                    const color = priority === 'urgent' ? 'bg-red-500' :
                                  priority === 'high' ? 'bg-orange-500' :
                                  priority === 'medium' ? 'bg-blue-500' :
                                  'bg-gray-400';
                    
                    return (
                      <div key={priority} className="flex items-center justify-between py-1">
                        <span className="text-xs text-gray-600 capitalize">
                          {priority}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`${color} h-1.5 rounded-full`}
                              style={{ width: `${((count as number) / stats.total) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-900 w-6 text-right">
                            {count as number}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Read/Unread Ratio */}
          {stats.total > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Read Status
              </h4>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${((stats.total - stats.unread) / stats.total) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-900">
                  {Math.round(((stats.total - stats.unread) / stats.total) * 100)}% read
                </span>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Empty State */}
      {stats.total === 0 && (
        <div className="text-center py-6">
          <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No notification data available</p>
        </div>
      )}
    </div>
  );
};

export default NotificationStats;
