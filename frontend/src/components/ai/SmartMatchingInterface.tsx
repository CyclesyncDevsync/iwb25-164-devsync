import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  StarIcon,
  TruckIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  UserGroupIcon,
  ChartBarIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { RootState } from '@/store';
import {
  fetchSmartRecommendations,
  updateSmartMatchingFilters,
  clearSmartMatchingResults,
} from '@/store/slices/aiSlice';
import { SmartMatchingFilters } from '@/types/ai';
import FiltersComponent from './SmartMatchingFilters';
import MaterialRecommendationCard from './MaterialRecommendationCard';
import BuyerSuggestionCard from './BuyerSuggestionCard';
import PriceOptimizationCard from './PriceOptimizationCard';
import MarketInsightCard from './MarketInsightCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface SmartMatchingInterfaceProps {
  userRole: 'buyer' | 'supplier';
  userId: string;
}

const SmartMatchingInterface: React.FC<SmartMatchingInterfaceProps> = ({
  userRole,
  userId,
}) => {
  const dispatch = useDispatch();
  const {
    smartMatching: { isLoading, results, filters, history, error },
    preferences,
  } = useSelector((state: RootState) => state.ai);

  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'insights' | 'history'>('recommendations');

  useEffect(() => {
    // Auto-search on component mount with default filters
    if (!results && !isLoading) {
      handleSearch();
    }
  }, []);

  useEffect(() => {
    // Auto-refresh based on preferences
    if (preferences.autoRefresh && results) {
      const interval = setInterval(() => {
        handleSearch();
      }, preferences.refreshInterval);

      return () => clearInterval(interval);
    }
  }, [preferences.autoRefresh, preferences.refreshInterval, results]);

  const handleSearch = () => {
    dispatch(fetchSmartRecommendations(filters) as any);
  };

  const handleFilterChange = (newFilters: Partial<SmartMatchingFilters>) => {
    dispatch(updateSmartMatchingFilters(newFilters));
  };

  const handleClearResults = () => {
    dispatch(clearSmartMatchingResults());
  };

  const getTabContent = () => {
    if (!results) return null;

    switch (activeTab) {
      case 'recommendations':
        return (
          <div className="space-y-6">
            {/* Material Recommendations */}
            {userRole === 'buyer' && results.materialRecommendations.length > 0 && (
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <SparklesIcon className="h-5 w-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recommended Materials
                  </h3>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-300">
                    {results.materialRecommendations.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.materialRecommendations.map((material, index) => (
                    <MaterialRecommendationCard
                      key={material.materialId}
                      material={material}
                      index={index}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Buyer Suggestions */}
            {userRole === 'supplier' && results.buyerSuggestions.length > 0 && (
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <UserGroupIcon className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Suggested Buyers
                  </h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                    {results.buyerSuggestions.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.buyerSuggestions.map((buyer, index) => (
                    <BuyerSuggestionCard
                      key={buyer.buyerId}
                      buyer={buyer}
                      index={index}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Price Optimizations */}
            {results.priceOptimizations.length > 0 && (
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Price Optimization
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.priceOptimizations.map((optimization, index) => (
                    <PriceOptimizationCard
                      key={`${optimization.materialType}-${index}`}
                      optimization={optimization}
                      index={index}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        );

      case 'insights':
        return (
          <div className="space-y-6">
            {results.marketInsights.length > 0 ? (
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <LightBulbIcon className="h-5 w-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Market Insights
                  </h3>
                </div>
                <div className="space-y-4">
                  {results.marketInsights.map((insight, index) => (
                    <MarketInsightCard
                      key={`${insight.type}-${index}`}
                      insight={insight}
                      index={index}
                    />
                  ))}
                </div>
              </section>
            ) : (
              <Card className="text-center py-8">
                <LightBulbIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No market insights available at the moment.
                </p>
              </Card>
            )}
          </div>
        );

      case 'history':
        return (
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((search, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(search.generatedAt).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {search.totalMatches} matches
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Materials:</span>
                      <span className="ml-1 font-medium">{search.materialRecommendations.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Buyers:</span>
                      <span className="ml-1 font-medium">{search.buyerSuggestions.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Insights:</span>
                      <span className="ml-1 font-medium">{search.marketInsights.length}</span>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="text-center py-8">
                <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No search history available.
                </p>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <SparklesIcon className="h-6 w-6 text-purple-500" />
            <span>Smart Matching</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI-powered recommendations tailored for {userRole}s
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
            <span>Filters</span>
          </Button>
          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <MagnifyingGlassIcon className="h-4 w-4" />
            )}
            <span>{isLoading ? 'Searching...' : 'Search'}</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <FiltersComponent
              filters={filters}
              onChange={handleFilterChange}
              userRole={userRole}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
              onClick={handleClearResults}
              className="ml-auto"
            >
              Dismiss
            </Button>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {(results || isLoading) && (
        <Card className="p-6">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 dark:bg-gray-800">
            {[
              { key: 'recommendations', label: 'Recommendations', icon: SparklesIcon },
              { key: 'insights', label: 'Insights', icon: LightBulbIcon },
              { key: 'history', label: 'History', icon: ClockIcon },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === key
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-gray-500 dark:text-gray-400 mt-4">
                  Finding the best matches for you...
                </p>
              </div>
            </div>
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

          {/* Results Footer */}
          {results && !isLoading && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <span>Search ID: {results.searchId.slice(-8)}</span>
                  <span>Generated: {new Date(results.generatedAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Auto-refresh:</span>
                  <span className={preferences.autoRefresh ? 'text-green-500' : 'text-gray-400'}>
                    {preferences.autoRefresh ? 'On' : 'Off'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Empty State */}
      {!results && !isLoading && !error && (
        <Card className="text-center py-12">
          <SparklesIcon className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Ready to find smart matches?
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Click the search button to get AI-powered recommendations tailored for you.
          </p>
          <Button onClick={handleSearch} className="flex items-center space-x-2">
            <MagnifyingGlassIcon className="h-4 w-4" />
            <span>Start Smart Search</span>
          </Button>
        </Card>
      )}
    </div>
  );
};

export default SmartMatchingInterface;
