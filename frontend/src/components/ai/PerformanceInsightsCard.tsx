import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { PerformanceInsight } from '@/types/ai';

interface PerformanceInsightsCardProps {
  insights: PerformanceInsight[];
}

const PerformanceInsightsCard: React.FC<PerformanceInsightsCardProps> = ({
  insights,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance Insights
        </h3>
        <div className="space-y-4">
          {insights.slice(0, 4).map((insight, index) => (
            <div key={insight.metric} className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {insight.metric}
                </span>
                <span className={`text-sm font-bold ${
                  insight.trend === 'improving' 
                    ? 'text-green-600' 
                    : insight.trend === 'declining'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}>
                  {insight.currentValue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>vs benchmark: {insight.benchmarkValue.toLocaleString()}</span>
                <span className={`font-medium ${
                  insight.changePercentage > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {insight.changePercentage > 0 ? '+' : ''}{insight.changePercentage.toFixed(1)}%
                </span>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full ${
                      insight.trend === 'improving' 
                        ? 'bg-green-500' 
                        : insight.trend === 'declining'
                        ? 'bg-red-500'
                        : 'bg-gray-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.abs(insight.changePercentage) * 2)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          {insights.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No performance insights available
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default PerformanceInsightsCard;
