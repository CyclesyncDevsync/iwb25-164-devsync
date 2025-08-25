import React from 'react';
import { motion } from 'framer-motion';
import {
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { MarketInsight } from '@/types/ai';
import { Card } from '@/components/ui/Card';

interface MarketInsightCardProps {
  insight: MarketInsight;
  index: number;
}

const MarketInsightCard: React.FC<MarketInsightCardProps> = ({
  insight,
  index,
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'price_trend': return ChartBarIcon;
      case 'demand_shift': return ArrowTrendingUpIcon;
      case 'competition': return ExclamationTriangleIcon;
      case 'opportunity': return LightBulbIcon;
      default: return InformationCircleIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'price_trend': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'demand_shift': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'competition': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'opportunity': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'negative': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'neutral': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getTimeframeColor = (timeframe: string) => {
    switch (timeframe) {
      case 'immediate': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'short_term': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium_term': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'long_term': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
  };

  const TypeIcon = getTypeIcon(insight.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-full ${getTypeColor(insight.type)}`}>
                <TypeIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {insight.type.replace('_', ' ')} Alert
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {insight.description}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(insight.impact)}`}>
                {insight.impact}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(insight.severity)}`}>
                {insight.severity} severity
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600 dark:text-gray-400">Timeframe:</span>
                <span className={`ml-auto px-2 py-1 text-xs font-medium rounded-full ${getTimeframeColor(insight.timeframe)}`}>
                  {insight.timeframe.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircleIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                <span className={`ml-auto px-2 py-1 text-xs font-medium rounded-full ${getConfidenceColor(insight.confidence.level)}`}>
                  {Math.round(insight.confidence.level * 100)}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600 dark:text-gray-400">Regions:</span>
                <span className="ml-auto text-xs font-medium text-gray-900 dark:text-white">
                  {insight.regions.length} areas
                </span>
              </div>
              <div className="flex items-center text-sm">
                <ChartBarIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600 dark:text-gray-400">Materials:</span>
                <span className="ml-auto text-xs font-medium text-gray-900 dark:text-white">
                  {insight.affectedMaterials.length} types
                </span>
              </div>
            </div>
          </div>

          {/* Affected Materials */}
          {insight.affectedMaterials.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Affected Materials
              </h5>
              <div className="flex flex-wrap gap-1">
                {insight.affectedMaterials.slice(0, 6).map((material, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    {material}
                  </span>
                ))}
                {insight.affectedMaterials.length > 6 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full dark:bg-gray-700 dark:text-gray-400">
                    +{insight.affectedMaterials.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Regions */}
          {insight.regions.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Affected Regions
              </h5>
              <div className="flex flex-wrap gap-1">
                {insight.regions.slice(0, 4).map((region, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full dark:bg-green-900/30 dark:text-green-300"
                  >
                    {region}
                  </span>
                ))}
                {insight.regions.length > 4 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full dark:bg-gray-700 dark:text-gray-400">
                    +{insight.regions.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {insight.recommendations.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-md p-3">
              <h5 className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-2 flex items-center">
                <LightBulbIcon className="h-4 w-4 mr-1" />
                Recommended Actions
              </h5>
              <ul className="space-y-1">
                {insight.recommendations.slice(0, 3).map((recommendation, idx) => (
                  <li key={idx} className="text-sm text-yellow-700 dark:text-yellow-300 flex items-start">
                    <span className="text-yellow-500 mr-2 mt-0.5">•</span>
                    {recommendation}
                  </li>
                ))}
                {insight.recommendations.length > 3 && (
                  <li className="text-sm text-yellow-600 dark:text-yellow-400 italic">
                    +{insight.recommendations.length - 3} more recommendations...
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Data Sources */}
          {insight.sources.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data Sources
              </h5>
              <div className="flex flex-wrap gap-1">
                {insight.sources.map((source, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded dark:bg-gray-700 dark:text-gray-300"
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Confidence Reasoning */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-3">
            <h5 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
              Analysis Confidence
            </h5>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {insight.confidence.reason}
            </p>
            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
              Based on {insight.confidence.dataPoints} data points
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default MarketInsightCard;
