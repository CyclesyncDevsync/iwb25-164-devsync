import React from 'react';
import { motion } from 'framer-motion';
import { LightBulbIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OptimizationSuggestion } from '@/types/ai';

interface OptimizationSuggestionsCardProps {
  suggestions: OptimizationSuggestion[];
}

const OptimizationSuggestionsCard: React.FC<OptimizationSuggestionsCardProps> = ({
  suggestions,
}) => {
  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    if (priority >= 6) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
    if (priority >= 4) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-500" />
          Optimization Suggestions
        </h3>
        <div className="space-y-4">
          {suggestions.slice(0, 3).map((suggestion, index) => (
            <div key={suggestion.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {suggestion.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {suggestion.description}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(suggestion.priority)}`}>
                  Priority {suggestion.priority}/10
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <span className="text-xs text-gray-500">Expected Benefit</span>
                  <div className="flex items-center space-x-1">
                    <CurrencyDollarIcon className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      {suggestion.expectedBenefit.financial.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Complexity</span>
                  <div className={`text-sm font-medium ${getComplexityColor(suggestion.implementationComplexity)}`}>
                    {suggestion.implementationComplexity}
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Timeframe: {suggestion.expectedBenefit.timeframe} • 
                Confidence: {Math.round(suggestion.confidence.level * 100)}%
              </div>

              <div className="mt-3 flex space-x-2">
                <Button size="sm" variant="outline" className="text-xs">
                  View Details
                </Button>
                <Button size="sm" className="text-xs">
                  Implement
                </Button>
              </div>
            </div>
          ))}
          {suggestions.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No optimization suggestions available
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default OptimizationSuggestionsCard;
