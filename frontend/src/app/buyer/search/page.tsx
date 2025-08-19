'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  StarIcon,
  HeartIcon,
  BookmarkIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

interface Material {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  quality: number;
  location: string;
  distance: number;
  supplier: string;
  images: string[];
  availableQuantity: number;
  isLiked: boolean;
  isSaved: boolean;
  verificationStatus: 'verified' | 'pending' | 'unverified';
}

interface SearchFilters {
  category: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  minQuality: number;
  maxDistance: number;
  verifiedOnly: boolean;
}

const MaterialSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [savedSearches, setSavedSearches] = useState<string[]>([]);

  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    location: '',
    minPrice: 0,
    maxPrice: 10000,
    minQuality: 1,
    maxDistance: 50,
    verifiedOnly: false
  });

  const [materials, setMaterials] = useState<Material[]>([
    {
      id: '1',
      title: 'High-Grade Plastic Bottles',
      description: 'Premium PET bottles, cleaned and sorted. Perfect for recycling into new products.',
      category: 'Plastic',
      price: 15,
      unit: 'kg',
      quality: 9,
      location: 'Mumbai, Maharashtra',
      distance: 5.2,
      supplier: 'EcoRecycle Ltd.',
      images: ['/api/placeholder/300/200'],
      availableQuantity: 500,
      isLiked: false,
      isSaved: true,
      verificationStatus: 'verified'
    },
    {
      id: '2',
      title: 'Cardboard Packaging Waste',
      description: 'Clean cardboard from packaging, suitable for pulp production.',
      category: 'Paper',
      price: 8,
      unit: 'kg',
      quality: 7,
      location: 'Delhi, NCR',
      distance: 12.8,
      supplier: 'Green Solutions',
      images: ['/api/placeholder/300/200'],
      availableQuantity: 1200,
      isLiked: true,
      isSaved: false,
      verificationStatus: 'verified'
    },
    {
      id: '3',
      title: 'Mixed Metal Scraps',
      description: 'Assorted metal pieces including aluminum and steel.',
      category: 'Metal',
      price: 35,
      unit: 'kg',
      quality: 6,
      location: 'Pune, Maharashtra',
      distance: 8.5,
      supplier: 'Metro Metals',
      images: ['/api/placeholder/300/200'],
      availableQuantity: 800,
      isLiked: false,
      isSaved: false,
      verificationStatus: 'pending'
    }
  ]);

  const categories = [
    'All Categories', 'Plastic', 'Paper', 'Metal', 'Glass', 'Textile', 'Electronic', 'Organic'
  ];

  const locations = [
    'All Locations', 'Mumbai, Maharashtra', 'Delhi, NCR', 'Bangalore, Karnataka', 
    'Chennai, Tamil Nadu', 'Pune, Maharashtra', 'Hyderabad, Telangana'
  ];

  const handleLike = (materialId: string) => {
    setMaterials(prev => prev.map(material => 
      material.id === materialId 
        ? { ...material, isLiked: !material.isLiked }
        : material
    ));
  };

  const handleSave = (materialId: string) => {
    setMaterials(prev => prev.map(material => 
      material.id === materialId 
        ? { ...material, isSaved: !material.isSaved }
        : material
    ));
  };

  const saveCurrentSearch = () => {
    if (searchQuery && !savedSearches.includes(searchQuery)) {
      setSavedSearches(prev => [...prev, searchQuery]);
    }
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

  const getQualityColor = (quality: number) => {
    if (quality >= 8) return 'text-green-600';
    if (quality >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Verified</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Unverified</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Discover Materials</h1>
          
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for materials, categories, or suppliers..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={saveCurrentSearch}
                  className="absolute right-3 top-3 text-purple-600 hover:text-purple-800"
                >
                  <BookmarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <FunnelIcon className="h-5 w-5" />
              Filters
            </button>
          </div>

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <div className="mt-4">
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
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b shadow-sm"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Filters</h3>
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
                    Price Range: ₹{filters.minPrice} - ₹{filters.maxPrice}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Quality Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Quality: {filters.minQuality}/10
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-600">
              Found <span className="font-semibold">{materials.length}</span> materials
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="quality">Quality Rating</option>
              <option value="distance">Distance</option>
            </select>
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-purple-100 text-purple-700' : 'text-gray-600'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-purple-100 text-purple-700' : 'text-gray-600'}`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Materials Grid/List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {materials.map((material, index) => (
            <motion.div
              key={material.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-300 ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Image */}
              <div className={`${viewMode === 'list' ? 'w-48 h-32' : 'h-48'} bg-gray-200 rounded-t-lg ${viewMode === 'list' ? 'rounded-l-lg rounded-t-none flex-shrink-0' : ''} relative overflow-hidden`}>
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => handleLike(material.id)}
                    className="p-1.5 bg-white rounded-full shadow-sm hover:shadow-md"
                  >
                    {material.isLiked ? (
                      <HeartSolidIcon className="h-4 w-4 text-red-500" />
                    ) : (
                      <HeartIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleSave(material.id)}
                    className="p-1.5 bg-white rounded-full shadow-sm hover:shadow-md"
                  >
                    {material.isSaved ? (
                      <BookmarkSolidIcon className="h-4 w-4 text-purple-500" />
                    ) : (
                      <BookmarkIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="absolute top-2 left-2">
                  {getVerificationBadge(material.verificationStatus)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{material.title}</h3>
                  <span className="text-lg font-bold text-purple-600">₹{material.price}/{material.unit}</span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{material.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {material.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <StarIcon className={`h-4 w-4 ${getQualityColor(material.quality)}`} />
                      <span className={`text-sm font-medium ${getQualityColor(material.quality)}`}>
                        {material.quality}/10
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{material.location} • {material.distance}km away</span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Available:</span> {material.availableQuantity} {material.unit}
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Supplier:</span> {material.supplier}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                    View Details
                  </button>
                  <button className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium">
                    Contact
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
            Load More Materials
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialSearchPage;
