import React from 'react';
import { motion } from 'framer-motion';
import { LightBulbIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AIInsight } from '@/types/ai';

interface AIInsightsPanelProps {
  insights: AIInsight[];
  onRefresh: () => void;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  insights,
  onRefresh,
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trend': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'opportunity': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'risk': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'optimization': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          AI Insights ({insights.length})
        </h3>
        <Button onClick={onRefresh} size="sm">
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <LightBulbIcon className="h-5 w-5 text-yellow-500" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {insight.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(insight.type)}`}>
                        {insight.type}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(insight.priority)}`}>
                        {insight.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {insight.description}
              </p>

              {insight.suggestedActions && insight.suggestedActions.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-md p-3 mb-4">
                  <h5 className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-2">
                    Suggested Actions:
                  </h5>
                  <ul className="space-y-1">
                    {insight.suggestedActions.map((action, idx) => (
                      <li key={idx} className="text-sm text-yellow-700 dark:text-yellow-300 flex items-start">
                        <span className="text-yellow-500 mr-2">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>
                  Confidence: {Math.round(insight.confidence.level * 100)}%
                </span>
                <span>
                  Generated: {new Date(insight.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}

        {insights.length === 0 && (
          <Card className="text-center py-12">
            <LightBulbIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No AI Insights Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              AI is analyzing your data to generate personalized insights.
            </p>
            <Button onClick={onRefresh}>
              Check for Insights
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AIInsightsPanel;
