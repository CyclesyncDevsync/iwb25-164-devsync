import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';

interface KeyMetric {
  name: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  period: string;
}

interface KeyMetricsGridProps {
  metrics: KeyMetric[];
}

const KeyMetricsGrid: React.FC<KeyMetricsGridProps> = ({ metrics }) => {
  const formatValue = (value: number | string, unit: string) => {
    if (typeof value === 'string') return value;
    
    if (unit === '%') return `${value.toFixed(1)}%`;
    if (unit === '$') return `$${value.toLocaleString()}`;
    if (unit === 'tons') return `${value.toLocaleString()} tons`;
    return `${value.toLocaleString()} ${unit}`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return ArrowTrendingUpIcon;
      case 'down': return ArrowTrendingDownIcon;
      case 'stable': return MinusIcon;
      default: return MinusIcon;
    }
  };

  const getTrendColor = (trend: string, change: number) => {
    if (trend === 'stable') return 'text-gray-500';
    if (change > 0) {
      return trend === 'up' ? 'text-green-500' : 'text-red-500';
    } else {
      return trend === 'up' ? 'text-red-500' : 'text-green-500';
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    if (change < 0) return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
    return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const TrendIcon = getTrendIcon(metric.trend);
        const trendColor = getTrendColor(metric.trend, metric.change);
        const changeColor = getChangeColor(metric.change);

        return (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {metric.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {formatValue(metric.value, metric.unit)}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <TrendIcon className={`h-5 w-5 ${trendColor}`} />
                  <span className={`px-2 py-1 text-xs font-medium rounded-full mt-1 ${changeColor}`}>
                    {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  vs {metric.period}
                </p>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default KeyMetricsGrid;
