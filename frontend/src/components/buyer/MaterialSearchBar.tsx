'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  MapPinIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface SearchFilters {
  category: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  minQuality: number;
  maxDistance: number;
  verifiedOnly: boolean;
}

interface MaterialSearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  savedSearches: string[];
  onSaveSearch: (query: string) => void;
}

const MaterialSearchBar: React.FC<MaterialSearchBarProps> = ({
  onSearch,
  savedSearches,
  onSaveSearch
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    location: '',
    minPrice: 0,
    maxPrice: 10000,
    minQuality: 1,
    maxDistance: 50,
    verifiedOnly: false
  });

  const categories = [
    'All Categories', 'Plastic', 'Paper', 'Metal', 'Glass', 'Textile', 'Electronic', 'Organic'
  ];

  const locations = [
    'All Locations', 'Mumbai, Maharashtra', 'Delhi, NCR', 'Bangalore, Karnataka', 
    'Chennai, Tamil Nadu', 'Pune, Maharashtra', 'Hyderabad, Telangana'
  ];

  const handleSearch = () => {
    onSearch(searchQuery, filters);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      minPrice: 0,
      maxPrice: 10000,
      minQuality: 1,
      maxDistance: 50,
      verifiedOnly: false
    });
  };

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for materials, categories, or suppliers..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <FunnelIcon className="h-5 w-5" />
          Filters
        </button>
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          Search
        </button>
      </div>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-2">Saved Searches:</p>
          <div className="flex flex-wrap gap-2">
            {savedSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => setSearchQuery(search)}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Search Filters</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              >
                {categories.map(category => (
                  <option key={category} value={category === 'All Categories' ? '' : category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              >
                {locations.map(location => (
                  <option key={location} value={location === 'All Locations' ? '' : location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price: ₹{filters.maxPrice}
              </label>
              <input
                type="range"
                min="0"
                max="10000"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>

            {/* Quality Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Quality: {filters.minQuality}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={filters.minQuality}
                onChange={(e) => setFilters(prev => ({ ...prev, minQuality: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.verifiedOnly}
                onChange={(e) => setFilters(prev => ({ ...prev, verifiedOnly: e.target.checked }))}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">Verified suppliers only</span>
            </label>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MaterialSearchBar;
