import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { DemandForecast } from '@/types/ai';

interface DemandForecastCardProps {
  forecast: DemandForecast;
  userRole: string;
}

const DemandForecastCard: React.FC<DemandForecastCardProps> = ({
  forecast,
  userRole,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Demand Forecast
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Demand</span>
              <span className="text-lg font-bold text-blue-600">
                {forecast.overview.totalDemand.toLocaleString()} tons
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Growth Rate: {forecast.overview.growthRate.toFixed(1)}%
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Opportunity Score</span>
              <span className="text-lg font-bold text-green-600">
                {forecast.overview.marketOpportunityScore}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${forecast.overview.marketOpportunityScore}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Volatility Index</span>
              <span className="text-lg font-bold text-yellow-600">
                {Math.round(forecast.overview.volatilityIndex * 100)}%
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {forecast.predictions.length} predictions available
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default DemandForecastCard;
