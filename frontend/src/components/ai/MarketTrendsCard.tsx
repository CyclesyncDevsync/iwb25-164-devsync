import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { MarketTrend } from '@/types/ai';

interface MarketTrendsCardProps {
  trends: MarketTrend[];
  className?: string;
}

const MarketTrendsCard: React.FC<MarketTrendsCardProps> = ({
  trends,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={className}
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Market Trends
        </h3>
        <div className="space-y-4">
          {trends.slice(0, 3).map((trend, index) => (
            <div key={trend.id} className="border-l-4 border-blue-500 pl-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {trend.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {trend.description}
                  </p>
                  <div className="text-xs text-gray-500 mt-2">
                    Timeframe: {trend.timeframe} • Probability: {trend.probability}%
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    trend.impact > 0 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : trend.impact < 0
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {trend.impact > 0 ? '+' : ''}{trend.impact}%
                  </span>
                </div>
              </div>
            </div>
          ))}
          {trends.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No market trends available
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default MarketTrendsCard;
