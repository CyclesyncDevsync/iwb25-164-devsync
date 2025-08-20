import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Grid, 
  List,
  MapPin,
  DollarSign,
  Clock,
  Tag,
  X,
  RefreshCw
} from 'lucide-react';
import { RootState, AppDispatch } from '@/store';
import { 
  fetchAuctions, 
  setFilters, 
  clearFilters,
  setSelectedAuction 
} from '@/store/slices/auctionSlice';
import { AuctionFilters, AuctionType, AuctionStatus } from '@/types/auction';
import AuctionCard from './AuctionCard';
import { MATERIAL_CATEGORIES } from '@/constants/index';
import { formatCurrency } from '@/utils/formatters';

interface AuctionListProps {
  initialFilters?: AuctionFilters;
  showHeader?: boolean;
  showFilters?: boolean;
  viewMode?: 'grid' | 'list';
  itemsPerPage?: number;
  className?: string;
}

const AuctionList: React.FC<AuctionListProps> = ({
  initialFilters = {},
  showHeader = true,
  showFilters = true,
  viewMode: initialViewMode = 'grid',
  itemsPerPage = 20,
  className = '',
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    auctions, 
    currentPage, 
    hasMore, 
    totalItems, 
    filters, 
    loading, 
    error 
  } = useSelector((state: RootState) => state.auctions);

  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [sortBy, setSortBy] = useState(filters.sortBy || 'ending_soon');
  const [tempFilters, setTempFilters] = useState<AuctionFilters>(filters);

  // Load auctions on component mount and filter changes
  useEffect(() => {
    dispatch(fetchAuctions({ 
      page: 1, 
      limit: itemsPerPage, 
      filters: { ...initialFilters, ...filters } 
    }));
  }, [dispatch, filters, initialFilters, itemsPerPage]);

  // Handle search input
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // Handle search submit
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = { ...filters, searchQuery: searchQuery.trim() };
    dispatch(setFilters(newFilters));
  }, [dispatch, filters, searchQuery]);

  // Handle sort change
  const handleSortChange = useCallback((newSortBy: string) => {
    setSortBy(newSortBy as typeof sortBy);
    const newFilters = { ...filters, sortBy: newSortBy as AuctionFilters['sortBy'] };
    dispatch(setFilters(newFilters));
  }, [dispatch, filters]);

  // Handle filter changes in temp state
  const handleTempFilterChange = useCallback((key: keyof AuctionFilters, value: any) => {
    setTempFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Apply filters
  const handleApplyFilters = useCallback(() => {
    dispatch(setFilters(tempFilters));
    setShowFiltersPanel(false);
  }, [dispatch, tempFilters]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    dispatch(clearFilters());
    setTempFilters({});
    setSearchQuery('');
    setShowFiltersPanel(false);
  }, [dispatch]);

  // Load more auctions
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading.auctions) {
      dispatch(fetchAuctions({ 
        page: currentPage + 1, 
        limit: itemsPerPage, 
        filters 
      }));
    }
  }, [dispatch, hasMore, loading.auctions, currentPage, itemsPerPage, filters]);

  // Refresh auctions
  const handleRefresh = useCallback(() => {
    dispatch(fetchAuctions({ 
      page: 1, 
      limit: itemsPerPage, 
      filters 
    }));
  }, [dispatch, itemsPerPage, filters]);

  const auctionTypes: { value: AuctionType; label: string }[] = [
    { value: 'standard', label: 'Standard Auction' },
    { value: 'dutch', label: 'Dutch Auction' },
    { value: 'reserve', label: 'Reserve Auction' },
    { value: 'buy_it_now', label: 'Buy It Now' },
    { value: 'bulk', label: 'Bulk Auction' },
  ];

  const auctionStatuses: { value: AuctionStatus; label: string }[] = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'active', label: 'Active' },
    { value: 'ended', label: 'Ended' },
  ];

  const sortOptions = [
    { value: 'ending_soon', label: 'Ending Soon' },
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'most_bids', label: 'Most Bids' },
  ];

  const activeFiltersCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof AuctionFilters];
    return value && (Array.isArray(value) ? value.length > 0 : true);
  }).length;

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Auctions</h2>
              <p className="text-gray-600">
                {totalItems} {totalItems === 1 ? 'auction' : 'auctions'} found
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Refresh button */}
              <button
                onClick={handleRefresh}
                disabled={loading.auctions}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <RefreshCw className={`w-5 h-5 ${loading.auctions ? 'animate-spin' : ''}`} />
              </button>

              {/* View mode toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Search and filters bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search auctions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Filters button */}
              {showFilters && (
                <button
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  className={`
                    relative flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors duration-200
                    ${showFiltersPanel || activeFiltersCount > 0
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-blue-300'
                    }
                  `}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      <AnimatePresence>
        {showFiltersPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Auction Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auction Type
                </label>
                <div className="space-y-2">
                  {auctionTypes.map(type => (
                    <label key={type.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={tempFilters.type?.includes(type.value) || false}
                        onChange={(e) => {
                          const currentTypes = tempFilters.type || [];
                          if (e.target.checked) {
                            handleTempFilterChange('type', [...currentTypes, type.value]);
                          } else {
                            handleTempFilterChange('type', currentTypes.filter(t => t !== type.value));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {MATERIAL_CATEGORIES.map((category: string) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={tempFilters.category?.includes(category) || false}
                        onChange={(e) => {
                          const currentCategories = tempFilters.category || [];
                          if (e.target.checked) {
                            handleTempFilterChange('category', [...currentCategories, category]);
                          } else {
                            handleTempFilterChange('category', currentCategories.filter(c => c !== category));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min price"
                    value={tempFilters.priceRange?.min || ''}
                    onChange={(e) => handleTempFilterChange('priceRange', {
                      ...tempFilters.priceRange,
                      min: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max price"
                    value={tempFilters.priceRange?.max || ''}
                    onChange={(e) => handleTempFilterChange('priceRange', {
                      ...tempFilters.priceRange,
                      max: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  {auctionStatuses.map(status => (
                    <label key={status.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={tempFilters.status?.includes(status.value) || false}
                        onChange={(e) => {
                          const currentStatuses = tempFilters.status || [];
                          if (e.target.checked) {
                            handleTempFilterChange('status', [...currentStatuses, status.value]);
                          } else {
                            handleTempFilterChange('status', currentStatuses.filter(s => s !== status.value));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear all filters
              </button>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowFiltersPanel(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filters display */}
      {activeFiltersCount > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.searchQuery && (
            <div className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              <Search className="w-3 h-3" />
              <span>"{filters.searchQuery}"</span>
              <button
                onClick={() => {
                  setSearchQuery('');
                  dispatch(setFilters({ ...filters, searchQuery: undefined }));
                }}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          {/* Add other active filter chips here */}
        </div>
      )}

      {/* Error state */}
      {error.auctions && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error.auctions}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Auction grid/list */}
      <div className={`
        ${viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
          : 'space-y-4'
        }
      `}>
        <AnimatePresence>
          {auctions.map((auction) => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              size={viewMode === 'list' ? 'small' : 'medium'}
              realTime={true}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Loading state */}
      {loading.auctions && auctions.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading auctions...</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading.auctions && auctions.length === 0 && !error.auctions && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No auctions found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or filters to find more auctions.
          </p>
          <button
            onClick={handleClearFilters}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Load more button */}
      {hasMore && auctions.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loading.auctions}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading.auctions ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              'Load More Auctions'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default AuctionList;
