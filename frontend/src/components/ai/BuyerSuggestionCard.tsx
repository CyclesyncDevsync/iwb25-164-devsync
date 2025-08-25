import React from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  StarIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { BuyerSuggestion } from '@/types/ai';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface BuyerSuggestionCardProps {
  buyer: BuyerSuggestion;
  index: number;
}

const BuyerSuggestionCard: React.FC<BuyerSuggestionCardProps> = ({
  buyer,
  index,
}) => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <StarIconSolid
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? 'text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
    return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getActivityStatus = (lastActive: Date) => {
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - new Date(lastActive).getTime()) / 36e5;
    
    if (diffHours < 24) return { status: 'online', color: 'bg-green-400' };
    if (diffHours < 72) return { status: 'recent', color: 'bg-yellow-400' };
    return { status: 'offline', color: 'bg-gray-400' };
  };

  const activityStatus = getActivityStatus(buyer.lastActive);

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
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${activityStatus.color} border-2 border-white rounded-full`} />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {buyer.buyerName}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {buyer.industry}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMatchScoreColor(buyer.matchScore)}`}>
                {buyer.matchScore}% match
              </span>
              <div className="flex items-center">
                <SparklesIcon className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  AI Suggested
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-2" />
                <div className="flex-1">
                  <span className="text-gray-600 dark:text-gray-400 block">Avg Order</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(buyer.averageOrderValue)}
                  </span>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <ChartBarIcon className="h-4 w-4 text-gray-400 mr-2" />
                <div className="flex-1">
                  <span className="text-gray-600 dark:text-gray-400 block">Volume/Month</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {buyer.historicalVolume} tons
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                <div className="flex-1">
                  <span className="text-gray-600 dark:text-gray-400 block">Location</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {buyer.location}
                  </span>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                <div className="flex-1">
                  <span className="text-gray-600 dark:text-gray-400 block">Response</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {buyer.responseTime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reliability Score */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Reliability Score
              </span>
              {renderStars(buyer.reliability)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(buyer.reliability / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Preferred Materials */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preferred Materials
            </h5>
            <div className="flex flex-wrap gap-1">
              {buyer.preferredMaterials.slice(0, 4).map((material, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full dark:bg-blue-900/30 dark:text-blue-300"
                >
                  {material}
                </span>
              ))}
              {buyer.preferredMaterials.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full dark:bg-gray-700 dark:text-gray-400">
                  +{buyer.preferredMaterials.length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Payment Terms */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-900 dark:text-green-200">
                Payment Terms
              </span>
              <span className="text-sm font-bold text-green-700 dark:text-green-300">
                {buyer.paymentTerms}
              </span>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-md p-3">
            <h5 className="text-sm font-medium text-purple-900 dark:text-purple-200 mb-2">
              Why this buyer is a good match:
            </h5>
            <ul className="space-y-1">
              {buyer.reasons.slice(0, 3).map((reason, idx) => (
                <li key={idx} className="text-sm text-purple-700 dark:text-purple-300 flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Activity Status */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Last active: {new Date(buyer.lastActive).toLocaleDateString()}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              activityStatus.status === 'online' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : activityStatus.status === 'recent'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {activityStatus.status}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 pb-4">
          <div className="flex space-x-2">
            <Button className="flex-1" size="sm">
              Contact Buyer
            </Button>
            <Button variant="outline" size="sm">
              View Profile
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default BuyerSuggestionCard;
