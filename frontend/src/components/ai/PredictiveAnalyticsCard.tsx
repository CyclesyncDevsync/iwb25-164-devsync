import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { PredictiveAnalytics } from '@/types/ai';

interface PredictiveAnalyticsCardProps {
  analytics: PredictiveAnalytics;
  userRole: string;
}

const PredictiveAnalyticsCard: React.FC<PredictiveAnalyticsCardProps> = ({
  analytics,
  userRole,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Predictive Analytics
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Predicted Revenue</span>
              <span className="text-lg font-bold text-green-600">
                ${analytics.revenue.predicted.toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Confidence: {Math.round(analytics.revenue.confidence.level * 100)}%
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Market Share</span>
              <span className="text-lg font-bold text-blue-600">
                {analytics.marketShare.predicted.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Current: {analytics.marketShare.current.toFixed(1)}%
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Customer Retention</span>
              <span className="text-lg font-bold text-purple-600">
                {Math.round(analytics.customerBehavior.retentionRate * 100)}%
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Acquisition Rate: {Math.round(analytics.customerBehavior.acquisitionRate * 100)}%
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default PredictiveAnalyticsCard;
