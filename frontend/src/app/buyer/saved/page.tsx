'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookmarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import MaterialCard from '../../../components/buyer/MaterialCard';
import { Material } from '../../../types/buyer';

interface SavedMaterial extends Material {
  savedAt: Date;
  notes?: string;
}

const BuyerSavedPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock saved materials data with proper Supplier objects
  const [savedMaterials, setSavedMaterials] = useState<SavedMaterial[]>([
    {
      id: '1',
      title: 'Industrial Plastic Scrap',
      description: 'Mixed plastic waste from manufacturing processes. High quality recyclable materials.',
      category: 'plastic',
      price: 18,
      unit: 'kg',
      quality: 8,
      location: 'Ahmedabad, Gujarat',
      distance: 3.2,
      supplier: {
        id: 'sup1',
        name: 'Industrial Waste Solutions',
        rating: 4.7,
        totalRatings: 89,
        contact: '+91-9876543210',
        address: 'Ahmedabad, Gujarat',
        verificationLevel: 'verified',
        joinedDate: '2023-01-15',
        totalSales: 1250,
        responseTime: '1 hour',
        languages: ['English', 'Hindi', 'Gujarati']
      },
      images: ['/api/placeholder/300/200'],
      availableQuantity: 750,
      isLiked: false,
      isSaved: true,
      verificationStatus: 'verified',
      savedAt: new Date('2024-01-18'),
      notes: 'Good for our recycling process, consistent quality'
    },
    {
      id: '2',
      title: 'Office Paper Waste',
      description: 'Clean office paper waste, suitable for recycling and paper production.',
      category: 'paper',
      price: 10,
      unit: 'kg',
      quality: 9,
      location: 'Pune, Maharashtra',
      distance: 8.9,
      supplier: {
        id: 'sup2',
        name: 'Office Recycling Co.',
        rating: 4.5,
        totalRatings: 67,
        contact: '+91-9876543211',
        address: 'Pune, Maharashtra',
        verificationLevel: 'verified',
        joinedDate: '2023-03-20',
        totalSales: 980,
        responseTime: '3 hours',
        languages: ['English', 'Hindi', 'Marathi']
      },
      images: ['/api/placeholder/300/200'],
      availableQuantity: 1500,
      isLiked: false,
      isSaved: true,
      verificationStatus: 'verified',
      savedAt: new Date('2024-01-16'),
      notes: 'High quality paper, minimal contamination'
    },
    {
      id: '3',
      title: 'Aluminum Cans Collection',
      description: 'Sorted aluminum beverage cans, ready for recycling.',
      category: 'metal',
      price: 35,
      unit: 'kg',
      quality: 9,
      location: 'Jaipur, Rajasthan',
      distance: 12.5,
      supplier: {
        id: 'sup3',
        name: 'Metal Masters Ltd.',
        rating: 4.8,
        totalRatings: 134,
        contact: '+91-9876543212',
        address: 'Jaipur, Rajasthan',
        verificationLevel: 'premium',
        joinedDate: '2023-06-10',
        totalSales: 2100,
        responseTime: '2 hours',
        languages: ['English', 'Hindi']
      },
      images: ['/api/placeholder/300/200'],
      availableQuantity: 400,
      isLiked: false,
      isSaved: true,
      verificationStatus: 'verified',
      savedAt: new Date('2024-01-14'),
      notes: 'Premium quality aluminum, excellent sorting'
    },
    {
      id: '4',
      title: 'Glass Containers Mix',
      description: 'Assorted glass containers from beverage industry.',
      category: 'glass',
      price: 14,
      unit: 'kg',
      quality: 7,
      location: 'Surat, Gujarat',
      distance: 18.7,
      supplier: {
        id: 'sup4',
        name: 'Glass Recovery Systems',
        rating: 4.3,
        totalRatings: 45,
        contact: '+91-9876543213',
        address: 'Surat, Gujarat',
        verificationLevel: 'verified',
        joinedDate: '2023-08-05',
        totalSales: 675,
        responseTime: '4 hours',
        languages: ['English', 'Gujarati']
      },
      images: ['/api/placeholder/300/200'],
      availableQuantity: 950,
      isLiked: false,
      isSaved: true,
      verificationStatus: 'verified',
      savedAt: new Date('2024-01-12'),
      notes: 'Good variety of glass types'
    },
    {
      id: '5',
      title: 'Textile Waste Bundle',
      description: 'Mixed textile waste from garment manufacturing.',
      category: 'textile',
      price: 22,
      unit: 'kg',
      quality: 6,
      location: 'Tirupur, Tamil Nadu',
      distance: 25.3,
      supplier: {
        id: 'sup5',
        name: 'Textile Waste Management',
        rating: 4.2,
        totalRatings: 78,
        contact: '+91-9876543214',
        address: 'Tirupur, Tamil Nadu',
        verificationLevel: 'basic',
        joinedDate: '2023-11-12',
        totalSales: 345,
        responseTime: '6 hours',
        languages: ['English', 'Tamil']
      },
      images: ['/api/placeholder/300/200'],
      availableQuantity: 600,
      isLiked: false,
      isSaved: true,
      verificationStatus: 'pending',
      savedAt: new Date('2024-01-10')
    }
  ]);

  const categories = ['all', 'plastic', 'paper', 'metal', 'glass', 'textile', 'electronic', 'organic', 'rubber', 'wood', 'ceramic'];

  const filteredAndSortedMaterials = useMemo(() => {
    const filtered = savedMaterials.filter(material => {
      const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          material.supplier.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort materials
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'quality':
          return b.quality - a.quality;
        case 'distance':
          return a.distance - b.distance;
        default:
          return 0;
      }
    });

    return filtered;
  }, [savedMaterials, searchQuery, selectedCategory, sortBy]);

  const handleRemoveSaved = async (materialId: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    setSavedMaterials(prev => prev.filter(material => material.id !== materialId));
    setIsLoading(false);
  };

  const handleLike = (materialId: string) => {
    setSavedMaterials(prev =>
      prev.map(material =>
        material.id === materialId
          ? { ...material, isLiked: !material.isLiked }
          : material
      )
    );
  };

  const handleSave = (materialId: string) => {
    setSavedMaterials(prev =>
      prev.map(material =>
        material.id === materialId
          ? { ...material, isSaved: !material.isSaved }
          : material
      )
    );
  };

  const handleViewDetails = (material: Material) => {
    // Navigate to material details page
    console.log('View details for:', material.id);
  };

  const handleContact = (material: Material) => {
    // Open contact modal or navigate to contact page
    console.log('Contact supplier for:', material.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <BookmarkSolidIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Items</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {savedMaterials.length} saved material{savedMaterials.length !== 1 ? 's' : ''} for later
                </p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search saved items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-dark-bg text-gray-900 dark:text-white"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <FunnelIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>

              <div className="flex items-center gap-2 border-l border-gray-300 dark:border-gray-600 pl-4">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="w-4 h-4 flex flex-col gap-0.5">
                    <div className="bg-current h-0.5 w-full rounded-sm"></div>
                    <div className="bg-current h-0.5 w-full rounded-sm"></div>
                    <div className="bg-current h-0.5 w-3/4 rounded-sm"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-green-500 bg-white dark:bg-dark-bg text-gray-900 dark:text-white"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-green-500 bg-white dark:bg-dark-bg text-gray-900 dark:text-white"
                    >
                      <option value="recent">Recently Saved</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="quality">Quality</option>
                      <option value="distance">Distance</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredAndSortedMaterials.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <BookmarkIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No saved items yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Save materials you're interested in for quick access later.
            </p>
            <div className="mt-6">
              <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                Browse Materials
              </button>
            </div>
          </motion.div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}>
            {filteredAndSortedMaterials.map((material, index) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <MaterialCard
                  material={material}
                  viewMode={viewMode}
                  onLike={handleLike}
                  onSave={handleSave}
                  onViewDetails={handleViewDetails}
                  onContact={handleContact}
                />

                {/* Saved-specific actions */}
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => handleRemoveSaved(material.id)}
                    disabled={isLoading}
                    className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                    title="Remove from saved items"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Saved date and notes */}
                <div className="mt-2 px-4 pb-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Saved {new Date(material.savedAt).toLocaleDateString()}
                  </div>
                  {material.notes && (
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                      <strong>Note:</strong> {material.notes}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More Button (if needed for pagination) */}
        {filteredAndSortedMaterials.length > 0 && (
          <div className="mt-8 text-center">
            <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
              <ShoppingCartIcon className="h-5 w-5 mr-2" />
              Load More Saved Items
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerSavedPage;