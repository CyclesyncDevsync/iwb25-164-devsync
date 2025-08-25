import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  LightBulbIcon,
  CogIcon,
  DocumentChartBarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BellIcon,
  ClockIcon,
  SparklesIcon,
  EyeIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { RootState } from '@/store';
import {
  fetchAnalyticsDashboard,
  fetchAIInsights,
  updatePreferences,
  clearAnalyticsError,
} from '@/store/slices/aiSlice';
import { AnalyticsDashboardData, AIInsight } from '@/types/ai';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PredictiveAnalyticsCard from './PredictiveAnalyticsCard';
import MarketTrendsCard from './MarketTrendsCard';
import PerformanceInsightsCard from './PerformanceInsightsCard';
import OptimizationSuggestionsCard from './OptimizationSuggestionsCard';
import DemandForecastCard from './DemandForecastCard';
import KeyMetricsGrid from './KeyMetricsGrid';
import AIInsightsPanel from './AIInsightsPanel';
import CustomReportsManager from './CustomReportsManager';

interface AnalyticsDashboardProps {
  userId: string;
  userRole: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  userId,
  userRole,
}) => {
  const dispatch = useDispatch();
  const {
    analytics: { isLoading, dashboardData, error, lastRefresh },
    insights: { active: activeInsights, unread },
    preferences,
  } = useSelector((state: RootState) => state.ai);

  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'reports'>('overview');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Load dashboard data on mount
    if (!dashboardData || !lastRefresh) {
      handleRefresh();
    }
    
    // Load AI insights
    dispatch(fetchAIInsights({ userId }) as any);
  }, [dispatch, userId]);

  useEffect(() => {
    // Auto-refresh based on preferences
    if (preferences.autoRefresh && dashboardData) {
      const interval = setInterval(() => {
        handleRefresh();
      }, preferences.refreshInterval);

      return () => clearInterval(interval);
    }
  }, [preferences.autoRefresh, preferences.refreshInterval, dashboardData]);

  const handleRefresh = () => {
    dispatch(fetchAnalyticsDashboard({ userId, role: userRole }) as any);
  };

  const handleUpdatePreferences = (newPreferences: Partial<typeof preferences>) => {
    dispatch(updatePreferences(newPreferences));
  };

  const getTabContent = () => {
    if (!dashboardData) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Key Metrics */}
            <KeyMetricsGrid metrics={dashboardData.keyMetrics} />

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Predictive Analytics */}
              <PredictiveAnalyticsCard 
                analytics={dashboardData.predictiveAnalytics}
                userRole={userRole}
              />

              {/* Demand Forecast */}
              <DemandForecastCard 
                forecast={dashboardData.demandForecast}
                userRole={userRole}
              />

              {/* Market Trends */}
              <MarketTrendsCard 
                trends={dashboardData.marketTrends}
                className="lg:col-span-2"
              />

              {/* Performance Insights */}
              <PerformanceInsightsCard 
                insights={dashboardData.performanceInsights}
              />

              {/* Optimization Suggestions */}
              <OptimizationSuggestionsCard 
                suggestions={dashboardData.optimizationSuggestions}
              />
            </div>
          </div>
        );

      case 'insights':
        return (
          <AIInsightsPanel 
            insights={[...activeInsights, ...dashboardData.alerts]}
            onRefresh={() => dispatch(fetchAIInsights({ userId }) as any)}
          />
        );

      case 'reports':
        return (
          <CustomReportsManager 
            userId={userId}
            dashboardData={dashboardData}
          />
        );

      default:
        return null;
    }
  };

  const getTimeAgo = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <ChartBarIcon className="h-8 w-8 text-blue-500" />
            <span>AI Analytics Dashboard</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Powered by artificial intelligence • {userRole} insights
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          {/* Insights Notification */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('insights')}
              className="flex items-center space-x-2"
            >
              <BellIcon className="h-4 w-4" />
              <span>Insights</span>
              {unread > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Button>
          </div>

          {/* Settings */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-2"
          >
            <CogIcon className="h-4 w-4" />
            <span>Settings</span>
          </Button>

          {/* Refresh */}
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <ArrowTrendingUpIcon className="h-4 w-4" />
            )}
            <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Dashboard Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Auto Refresh
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.autoRefresh}
                      onChange={(e) => handleUpdatePreferences({ autoRefresh: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      Enable auto refresh
                    </span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Refresh Interval
                  </label>
                  <select
                    value={preferences.refreshInterval}
                    onChange={(e) => handleUpdatePreferences({ refreshInterval: Number(e.target.value) })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
                  >
                    <option value={60000}>1 minute</option>
                    <option value={300000}>5 minutes</option>
                    <option value={600000}>10 minutes</option>
                    <option value={1800000}>30 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notifications
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.notifications}
                      onChange={(e) => handleUpdatePreferences({ notifications: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      Push notifications
                    </span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confidence Threshold
                  </label>
                  <select
                    value={preferences.confidenceThreshold}
                    onChange={(e) => handleUpdatePreferences({ confidenceThreshold: Number(e.target.value) })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
                  >
                    <option value={0.5}>50% - Show all insights</option>
                    <option value={0.7}>70% - Medium confidence</option>
                    <option value={0.8}>80% - High confidence</option>
                    <option value={0.9}>90% - Very high confidence</option>
                  </select>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                AI Models Active
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Last updated: {getTimeAgo(lastRefresh)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {activeInsights.length} active insights
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {preferences.autoRefresh && (
              <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                Auto-refresh ON
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-md p-4 dark:bg-red-900/20 dark:border-red-800"
        >
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            <p className="text-red-700 dark:text-red-400">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(clearAnalyticsError())}
              className="ml-auto"
            >
              Dismiss
            </Button>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <Card className="p-1">
        <div className="flex space-x-1">
          {[
            { key: 'overview', label: 'Overview', icon: ChartBarIcon },
            { key: 'insights', label: 'AI Insights', icon: LightBulbIcon, badge: unread },
            { key: 'reports', label: 'Reports', icon: DocumentChartBarIcon },
          ].map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`relative flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === key
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {badge && badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Tab Content */}
      {isLoading && !dashboardData ? (
        <Card className="flex items-center justify-center py-16">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-gray-500 dark:text-gray-400 mt-4">
              Loading AI analytics...
            </p>
          </div>
        </Card>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {getTabContent()}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Empty State */}
      {!dashboardData && !isLoading && !error && (
        <Card className="text-center py-16">
          <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Analytics Data Available
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Click refresh to load your personalized AI insights.
          </p>
          <Button onClick={handleRefresh} className="flex items-center space-x-2">
            <ArrowTrendingUpIcon className="h-4 w-4" />
            <span>Load Analytics</span>
          </Button>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
