import React from 'react';
import { motion } from 'framer-motion';
import {
  StarIcon,
  MapPinIcon,
  ScaleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  TruckIcon,
  UserIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { MaterialRecommendation } from '@/types/ai';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface MaterialRecommendationCardProps {
  material: MaterialRecommendation;
  index: number;
}

const MaterialRecommendationCard: React.FC<MaterialRecommendationCardProps> = ({
  material,
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
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

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
                {material.materialType}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <UserIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {material.supplierName}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMatchScoreColor(material.matchScore)}`}>
                {material.matchScore}% match
              </span>
              <div className="flex items-center">
                <SparklesIcon className="h-4 w-4 text-purple-500 mr-1" />
                <span className="text-xs text-purple-600 dark:text-purple-400">
                  AI Recommended
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        {material.images && material.images.length > 0 && (
          <div className="relative">
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-800">
              <img
                src={material.images[0]}
                alt={material.materialType}
                className="w-full h-32 object-cover"
                loading="lazy"
              />
              {material.images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  +{material.images.length - 1} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <ScaleIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600 dark:text-gray-400">Quality:</span>
                <div className="ml-auto">
                  {renderStars(material.quality)}
                </div>
              </div>
              <div className="flex items-center text-sm">
                <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600 dark:text-gray-400">Price:</span>
                <span className="ml-auto font-medium text-gray-900 dark:text-white">
                  ${material.price}/ton
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <TruckIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                <span className="ml-auto font-medium text-gray-900 dark:text-white">
                  {material.quantity} tons
                </span>
              </div>
              <div className="flex items-center text-sm">
                <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600 dark:text-gray-400">Location:</span>
                <span className="ml-auto font-medium text-gray-900 dark:text-white">
                  {material.location}
                </span>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(material.urgency)}`}>
              {material.urgency} urgency
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCompetitionColor(material.competitionLevel)}`}>
              {material.competitionLevel} competition
            </span>
          </div>

          {/* AI Insights */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-3">
            <h5 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
              Why this matches you:
            </h5>
            <ul className="space-y-1">
              {material.reasons.slice(0, 3).map((reason, idx) => (
                <li key={idx} className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Demand Forecast */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-900 dark:text-green-200">
                Estimated Demand
              </span>
              <span className="text-sm font-bold text-green-700 dark:text-green-300">
                {material.estimatedDemand} tons/week
              </span>
            </div>
          </div>

          {/* Availability Window */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <ClockIcon className="h-4 w-4 mr-2" />
            <span>Available until {new Date(material.availabilityWindow.end).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 pb-4">
          <div className="flex space-x-2">
            <Button className="flex-1" size="sm">
              Contact Supplier
            </Button>
            <Button variant="outline" size="sm">
              Save
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default MaterialRecommendationCard;
