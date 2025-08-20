import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  ChartBarIcon,
  CogIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import SmartMatchingInterface from './SmartMatchingInterface';
import AnalyticsDashboard from './AnalyticsDashboard';

interface AIFeaturesPageProps {
  userId: string;
  userRole: 'buyer' | 'supplier' | 'admin' | 'agent';
}

const AIFeaturesPage: React.FC<AIFeaturesPageProps> = ({
  userId,
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState<'matching' | 'analytics'>('matching');

  const getTabContent = () => {
    switch (activeTab) {
      case 'matching':
        return (
          <SmartMatchingInterface
            userRole={userRole as 'buyer' | 'supplier'}
            userId={userId}
          />
        );
      case 'analytics':
        return (
          <AnalyticsDashboard
            userId={userId}
            userRole={userRole}
          />
        );
      default:
        return null;
    }
  };

  const getRoleSpecificDescription = () => {
    switch (userRole) {
      case 'buyer':
        return 'Discover the best materials and suppliers with AI-powered recommendations tailored to your needs.';
      case 'supplier':
        return 'Find ideal buyers and optimize your pricing with intelligent market insights.';
      case 'admin':
        return 'Comprehensive AI analytics and system-wide insights for platform optimization.';
      case 'agent':
        return 'Smart tools to optimize field operations and improve verification efficiency.';
      default:
        return 'AI-powered features to enhance your circular economy experience.';
    }
  };

  const getAvailableFeatures = () => {
    const baseFeatures = [
      {
        title: 'Smart Matching',
        description: 'AI-powered recommendations',
        available: true,
      },
      {
        title: 'Predictive Analytics',
        description: 'Market trends and forecasting',
        available: true,
      },
      {
        title: 'Price Optimization',
        description: 'Dynamic pricing suggestions',
        available: userRole === 'supplier' || userRole === 'admin',
      },
      {
        title: 'Demand Forecasting',
        description: 'Future market demand analysis',
        available: true,
      },
      {
        title: 'Quality Assessment',
        description: 'AI-powered quality scoring',
        available: userRole === 'agent' || userRole === 'admin',
      },
      {
        title: 'Route Optimization',
        description: 'Optimal delivery routes',
        available: userRole === 'agent' || userRole === 'admin',
      },
    ];

    return baseFeatures.filter(feature => feature.available);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-4 mb-6">
              <SparklesIcon className="h-12 w-12" />
              <h1 className="text-4xl md:text-6xl font-bold">
                AI-Powered CircularSync
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              {getRoleSpecificDescription()}
            </p>
            <div className="mt-8 flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>AI Models Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Real-time Analytics</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Smart Recommendations</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Available AI Features for {userRole}s
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {getAvailableFeatures().map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-200">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <SparklesIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Navigation Tabs */}
        <Card className="p-1 mb-8">
          <div className="flex space-x-1">
            {[
              {
                key: 'matching',
                label: 'Smart Matching',
                icon: SparklesIcon,
                description: 'AI-powered recommendations',
              },
              {
                key: 'analytics',
                label: 'Analytics Dashboard',
                icon: ChartBarIcon,
                description: 'Predictive insights and trends',
              },
            ].map(({ key, label, icon: Icon, description }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex-1 flex flex-col items-center justify-center space-y-2 py-6 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === key
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-300 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="font-semibold">{label}</span>
                <span className="text-xs opacity-75">{description}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {getTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Information Footer */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start space-x-4">
            <InformationCircleIcon className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
                About CircularSync AI
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                Our AI system continuously learns from market data, user behavior, and transaction patterns 
                to provide you with the most accurate recommendations and insights. All AI features are 
                designed to enhance your decision-making while maintaining complete data privacy and security.
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                    Machine Learning Models
                  </h4>
                  <p className="text-blue-600 dark:text-blue-400">
                    Advanced algorithms trained on circular economy data
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                    Real-time Processing
                  </h4>
                  <p className="text-blue-600 dark:text-blue-400">
                    Instant analysis and recommendations as market conditions change
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                    Privacy-First Approach
                  </h4>
                  <p className="text-blue-600 dark:text-blue-400">
                    Your data remains secure while benefiting from collective insights
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIFeaturesPage;
