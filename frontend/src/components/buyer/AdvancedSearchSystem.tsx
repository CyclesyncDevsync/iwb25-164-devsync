'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  MapPinIcon,
  StarIcon,
  AdjustmentsHorizontalIcon,
  BookmarkIcon,
  ClockIcon,
  SparklesIcon,
  ChevronDownIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
// lightweight debounce implementation to avoid adding lodash/@types during quick iteration
function debounce<T extends (...args: any[]) => void>(fn: T, wait = 300) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

interface AdvancedSearchFilters {
  query: string;
  category: string[];
  location: string[];
  minPrice: number;
  maxPrice: number;
  minQuality: number;
  maxQuality: number;
  maxDistance: number;
  verifiedOnly: boolean;
  auctionsOnly: boolean;
  availableOnly: boolean;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  supplierRating: number;
  dateRange: {
    from: string;
    to: string;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  tags: string[];
  specifications: Record<string, string>;
  priceHistory: 'increasing' | 'decreasing' | 'stable' | '';
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'material' | 'supplier' | 'category' | 'location';
  count?: number;
}

interface AdvancedSearchProps {
  onSearch: (filters: AdvancedSearchFilters) => void;
  onSaveSearch: (name: string, filters: AdvancedSearchFilters) => void;
  savedSearches: Array<{ id: string; name: string; filters: AdvancedSearchFilters; }>;
  loading?: boolean;
}

const AdvancedSearchSystem: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onSaveSearch,
  savedSearches,
  loading = false
}) => {
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    query: '',
    category: [],
    location: [],
    minPrice: 0,
    maxPrice: 100000,
    minQuality: 1,
    maxQuality: 10,
    maxDistance: 100,
    verifiedOnly: false,
    auctionsOnly: false,
    availableOnly: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 10000,
    supplierRating: 1,
    dateRange: { from: '', to: '' },
    sortBy: 'relevance',
    sortOrder: 'desc',
    tags: [],
    specifications: {},
    priceHistory: ''
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState('basic');

  const categories = [
    'Plastic', 'Paper', 'Metal', 'Glass', 'Textile', 'Electronic', 'Organic', 'Rubber', 'Wood', 'Ceramic'
  ];

  const locations = [
    'Mumbai, Maharashtra', 'Delhi, NCR', 'Bangalore, Karnataka', 'Chennai, Tamil Nadu',
    'Pune, Maharashtra', 'Hyderabad, Telangana', 'Kolkata, West Bengal', 'Ahmedabad, Gujarat'
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'quality', label: 'Quality Rating' },
    { value: 'distance', label: 'Distance' },
    { value: 'rating', label: 'Supplier Rating' },
    { value: 'newest', label: 'Newest First' },
    { value: 'ending_soon', label: 'Ending Soon (Auctions)' }
  ];

  const popularTags = [
    'organic', 'recycled', 'eco-friendly', 'bulk-available', 'premium-grade', 
    'industrial-grade', 'food-safe', 'medical-grade', 'biodegradable', 'renewable'
  ];

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchFilters: AdvancedSearchFilters) => {
      onSearch(searchFilters);
    }, 300),
    [onSearch]
  );

  // Generate suggestions based on query
  const generateSuggestions = useCallback(
    debounce((query: string) => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      const mockSuggestions: SearchSuggestion[] = [
        { id: '1', text: 'Plastic Bottles PET', type: 'material' as const, count: 45 },
        { id: '2', text: 'Cardboard Packaging', type: 'material' as const, count: 23 },
        { id: '3', text: 'Aluminum Cans', type: 'material' as const, count: 67 },
        { id: '4', text: 'EcoRecycle Ltd.', type: 'supplier' as const, count: 12 },
        { id: '5', text: 'Mumbai, Maharashtra', type: 'location' as const, count: 156 },
        { id: '6', text: 'Paper Category', type: 'category' as const, count: 89 }
      ].filter(s => s.text.toLowerCase().includes(query.toLowerCase()));

      setSuggestions(mockSuggestions);
    }, 200),
    []
  );

  useEffect(() => {
    generateSuggestions(filters.query);
  }, [filters.query, generateSuggestions]);

  useEffect(() => {
    debouncedSearch(filters);
  }, [filters, debouncedSearch]);

  const handleFilterChange = (key: keyof AdvancedSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleArrayFilterToggle = (key: 'category' | 'location' | 'tags', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      query: '',
      category: [],
      location: [],
      minPrice: 0,
      maxPrice: 100000,
      minQuality: 1,
      maxQuality: 10,
      maxDistance: 100,
      verifiedOnly: false,
      auctionsOnly: false,
      availableOnly: true,
      minOrderQuantity: 1,
      maxOrderQuantity: 10000,
      supplierRating: 1,
      dateRange: { from: '', to: '' },
      sortBy: 'relevance',
      sortOrder: 'desc',
      tags: [],
      specifications: {},
      priceHistory: ''
    });
  };

  const applySavedSearch = (savedSearch: { filters: AdvancedSearchFilters }) => {
    setFilters(savedSearch.filters);
  };

  const handleSaveSearch = () => {
    if (saveSearchName.trim()) {
      onSaveSearch(saveSearchName, filters);
      setSaveSearchName('');
      setShowSaveModal(false);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category.length > 0) count++;
    if (filters.location.length > 0) count++;
    if (filters.minPrice > 0 || filters.maxPrice < 100000) count++;
    if (filters.minQuality > 1 || filters.maxQuality < 10) count++;
    if (filters.maxDistance < 100) count++;
    if (filters.verifiedOnly) count++;
    if (filters.auctionsOnly) count++;
    if (filters.tags.length > 0) count++;
    if (filters.supplierRating > 1) count++;
    return count;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Main Search Bar */}
      <div className="relative mb-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => {
                handleFilterChange('query', e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Search materials, suppliers, or categories..."
            />
            {filters.query && (
              <button
                onClick={() => handleFilterChange('query', '')}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
            {loading && (
              <div className="absolute right-12 top-4">
                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 px-4 py-4 rounded-lg border transition-colors ${
                showAdvancedFilters || getActiveFiltersCount() > 0
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <span className="bg-white text-purple-600 rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <button
              onClick={() => setShowSaveModal(true)}
              className="px-4 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <BookmarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search Suggestions */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
            >
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => {
                    handleFilterChange('query', suggestion.text);
                    setShowSuggestions(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      suggestion.type === 'material' ? 'bg-purple-500' :
                      suggestion.type === 'supplier' ? 'bg-green-500' :
                      suggestion.type === 'category' ? 'bg-blue-500' : 'bg-orange-500'
                    }`}></div>
                    <span>{suggestion.text}</span>
                    <span className="text-xs text-gray-500 capitalize">{suggestion.type}</span>
                  </div>
                  {suggestion.count && (
                    <span className="text-sm text-gray-400">{suggestion.count} items</span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Saved Searches:</p>
          <div className="flex flex-wrap gap-2">
            {savedSearches.map((search) => (
              <button
                key={search.id}
                onClick={() => applySavedSearch(search)}
                className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 flex items-center gap-2"
              >
                <SparklesIcon className="h-3 w-3" />
                {search.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t pt-6"
          >
            {/* Filter Tabs */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  {[
                    { key: 'basic', label: 'Basic Filters' },
                    { key: 'advanced', label: 'Advanced' },
                    { key: 'supplier', label: 'Supplier' },
                    { key: 'logistics', label: 'Logistics' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveFilterTab(tab.key)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeFilterTab === tab.key
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Basic Filters */}
            {activeFilterTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Categories</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {categories.map(category => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.category.includes(category)}
                          onChange={() => handleArrayFilterToggle('category', category)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Locations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Locations</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {locations.map(location => (
                      <label key={location} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.location.includes(location)}
                          onChange={() => handleArrayFilterToggle('location', location)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{location}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Price Range: ₹{filters.minPrice.toLocaleString()} - ₹{filters.maxPrice.toLocaleString()}
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Min Price</label>
                      <input
                        type="range"
                        min="0"
                        max="50000"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Max Price</label>
                      <input
                        type="range"
                        min="1000"
                        max="100000"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Quality Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Quality: {filters.minQuality}/10 - {filters.maxQuality}/10
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Min Quality</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={filters.minQuality}
                        onChange={(e) => handleFilterChange('minQuality', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Max Quality</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={filters.maxQuality}
                        onChange={(e) => handleFilterChange('maxQuality', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Distance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Max Distance: {filters.maxDistance}km
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="500"
                    value={filters.maxDistance}
                    onChange={(e) => handleFilterChange('maxDistance', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Quick Toggles */}
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.verifiedOnly}
                      onChange={(e) => handleFilterChange('verifiedOnly', e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Verified suppliers only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.auctionsOnly}
                      onChange={(e) => handleFilterChange('auctionsOnly', e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Auctions only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.availableOnly}
                      onChange={(e) => handleFilterChange('availableOnly', e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Available stock only</span>
                  </label>
                </div>
              </div>
            )}

            {/* Advanced Filters */}
            {activeFilterTab === 'advanced' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Tags */}
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleArrayFilterToggle('tags', tag)}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          filters.tags.includes(tag)
                            ? 'bg-purple-100 text-purple-700 border-purple-300'
                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order Quantity Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Order Quantity: {filters.minOrderQuantity} - {filters.maxOrderQuantity}
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Min Quantity</label>
                      <input
                        type="number"
                        value={filters.minOrderQuantity}
                        onChange={(e) => handleFilterChange('minOrderQuantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Max Quantity</label>
                      <input
                        type="number"
                        value={filters.maxOrderQuantity}
                        onChange={(e) => handleFilterChange('maxOrderQuantity', parseInt(e.target.value) || 10000)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Date Range</label>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">From</label>
                      <input
                        type="date"
                        value={filters.dateRange.from}
                        onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, from: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">To</label>
                      <input
                        type="date"
                        value={filters.dateRange.to}
                        onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, to: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Price History */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Price Trend</label>
                  <select
                    value={filters.priceHistory}
                    onChange={(e) => handleFilterChange('priceHistory', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="">Any Trend</option>
                    <option value="increasing">Price Increasing</option>
                    <option value="decreasing">Price Decreasing</option>
                    <option value="stable">Price Stable</option>
                  </select>
                </div>
              </div>
            )}

            {/* Supplier Filters */}
            {activeFilterTab === 'supplier' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Min Supplier Rating: {filters.supplierRating}/5
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={filters.supplierRating}
                    onChange={(e) => handleFilterChange('supplierRating', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Clear All Filters
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => onSearch(filters)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Search Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Search</h3>
              <input
                type="text"
                value={saveSearchName}
                onChange={(e) => setSaveSearchName(e.target.value)}
                placeholder="Enter search name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSearch}
                  disabled={!saveSearchName.trim()}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  Save Search
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedSearchSystem;
