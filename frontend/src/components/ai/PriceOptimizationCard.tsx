import React from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  LightBulbIcon,
  ScaleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { PriceOptimization } from '@/types/ai';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface PriceOptimizationCardProps {
  optimization: PriceOptimization;
  index: number;
}

const PriceOptimizationCard: React.FC<PriceOptimizationCardProps> = ({
  optimization,
  index,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriceChange = () => {
    const change = optimization.recommendedPrice - optimization.currentPrice;
    const percentage = (change / optimization.currentPrice) * 100;
    return { change, percentage };
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'premium': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'competitive': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'economy': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
  };

  const priceChange = getPriceChange();
  const isIncrease = priceChange.change > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {optimization.materialType}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <LightBulbIcon className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Price Optimization
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStrategyColor(optimization.pricingStrategy)}`}>
                {optimization.pricingStrategy} strategy
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConfidenceColor(optimization.confidence.level)}`}>
                {Math.round(optimization.confidence.level * 100)}% confidence
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Price Comparison */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Price</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(optimization.currentPrice)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">per ton</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Recommended</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(optimization.recommendedPrice)}
                </div>
                <div className="flex items-center justify-center space-x-1">
                  {isIncrease ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-xs font-medium ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                    {isIncrease ? '+' : ''}{priceChange.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Optimal Price Range
              </span>
              <ScaleIcon className="h-4 w-4 text-gray-400" />
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                <div
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full relative"
                  style={{
                    width: `${((optimization.priceRange.optimal - optimization.priceRange.min) / (optimization.priceRange.max - optimization.priceRange.min)) * 100}%`,
                    marginLeft: `${((optimization.currentPrice - optimization.priceRange.min) / (optimization.priceRange.max - optimization.priceRange.min)) * 100}%`,
                  }}
                >
                  <div className="absolute top-0 left-0 w-1 h-3 bg-white rounded-full transform -translate-x-1/2" />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>{formatCurrency(optimization.priceRange.min)}</span>
                <span>{formatCurrency(optimization.priceRange.optimal)}</span>
                <span>{formatCurrency(optimization.priceRange.max)}</span>
              </div>
            </div>
          </div>

          {/* Market Comparison */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Market Position
            </h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Below Market</span>
                <span className="text-xs font-medium">{optimization.marketComparison.belowMarket}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">At Market</span>
                <span className="text-xs font-medium">{optimization.marketComparison.atMarket}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Above Market</span>
                <span className="text-xs font-medium">{optimization.marketComparison.aboveMarket}%</span>
              </div>
            </div>
          </div>

          {/* Competitor Prices */}
          {optimization.competitorPrices.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Competitor Analysis
              </h5>
              <div className="space-y-2">
                {optimization.competitorPrices.slice(0, 3).map((competitor, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600 dark:text-gray-400">{competitor.competitor}</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-1 rounded-full ${
                              i < competitor.quality ? 'bg-yellow-400' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="font-medium">{formatCurrency(competitor.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expected Outcome */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-3">
            <h5 className="text-sm font-medium text-green-900 dark:text-green-200 mb-3">
              Expected Outcome
            </h5>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-green-700 dark:text-green-300">
                  {Math.round(optimization.expectedOutcome.salesProbability * 100)}%
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  Sales Probability
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-700 dark:text-green-300">
                  {Math.round(optimization.expectedOutcome.profitMargin * 100)}%
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  Profit Margin
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-700 dark:text-green-300">
                  {optimization.expectedOutcome.timeToSell}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  Time to Sell
                </div>
              </div>
            </div>
          </div>

          {/* Demand Elasticity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Demand Elasticity</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {optimization.demandElasticity.toFixed(2)}
              </span>
              {optimization.demandElasticity < 1 ? (
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
              ) : (
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 pb-4">
          <div className="flex space-x-2">
            <Button className="flex-1" size="sm">
              Apply Pricing
            </Button>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default PriceOptimizationCard;
