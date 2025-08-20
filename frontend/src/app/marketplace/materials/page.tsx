'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  StarIcon,
  MapPinIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  HeartIcon,
  ShoppingCartIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid
} from '@heroicons/react/24/solid';
import { Button } from '../../../components/ui/Button';

interface Material {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  unit: string;
  description: string;
  supplier: {
    name: string;
    rating: number;
    verified: boolean;
    location: string;
  };
  images: string[];
  inStock: boolean;
  quantity: number;
  certifications: string[];
  specifications: {
    purity: string;
    grade: string;
    composition: string;
  };
  shipping: {
    available: boolean;
    cost: number;
    estimatedDays: number;
  };
  tags: string[];
  createdAt: string;
  views: number;
  favorites: number;
}

const mockMaterials: Material[] = [
  {
    id: 1,
    name: 'Premium Steel Bars - Grade A',
    category: 'Metals',
    subcategory: 'Steel',
    price: 245.00,
    unit: 'per ton',
    description: 'High-quality recycled steel bars perfect for construction projects. These grade A steel bars meet all industry standards and are sourced from certified recycling facilities.',
    supplier: {
      name: 'EcoSteel Corporation',
      rating: 4.8,
      verified: true,
      location: 'Detroit, MI'
    },
    images: ['/placeholder-steel.jpg'],
    inStock: true,
    quantity: 500,
    certifications: ['ISO 14001', 'ASTM A615', 'Green Building Council'],
    specifications: {
      purity: '99.2%',
      grade: 'Grade A',
      composition: 'Carbon Steel'
    },
    shipping: {
      available: true,
      cost: 50,
      estimatedDays: 3
    },
    tags: ['construction', 'high-grade', 'certified'],
    createdAt: '2024-01-15',
    views: 1250,
    favorites: 89
  },
  {
    id: 2,
    name: 'Recycled Plastic Pellets - HDPE',
    category: 'Plastics',
    subcategory: 'HDPE',
    price: 89.50,
    unit: 'per kg',
    description: 'Clean, high-density polyethylene pellets suitable for manufacturing containers, pipes, and various plastic products.',
    supplier: {
      name: 'GreenPlastic Solutions',
      rating: 4.6,
      verified: true,
      location: 'Houston, TX'
    },
    images: ['/placeholder-plastic.jpg'],
    inStock: true,
    quantity: 2000,
    certifications: ['FDA Approved', 'RCS Certified', 'ISO 9001'],
    specifications: {
      purity: '98.5%',
      grade: 'Food Grade',
      composition: 'HDPE'
    },
    shipping: {
      available: true,
      cost: 25,
      estimatedDays: 5
    },
    tags: ['food-grade', 'clean', 'containers'],
    createdAt: '2024-01-20',
    views: 890,
    favorites: 56
  },
  {
    id: 3,
    name: 'Crushed Glass Aggregate',
    category: 'Glass',
    subcategory: 'Aggregate',
    price: 32.75,
    unit: 'per m³',
    description: 'Processed glass aggregate perfect for landscaping, concrete production, and decorative applications.',
    supplier: {
      name: 'ClearGlass Recycling',
      rating: 4.9,
      verified: true,
      location: 'Phoenix, AZ'
    },
    images: ['/placeholder-glass.jpg'],
    inStock: false,
    quantity: 0,
    certifications: ['LEED Approved', 'ASTM C33'],
    specifications: {
      purity: '99.8%',
      grade: 'Premium',
      composition: 'Mixed Glass'
    },
    shipping: {
      available: true,
      cost: 75,
      estimatedDays: 7
    },
    tags: ['landscaping', 'decorative', 'concrete'],
    createdAt: '2024-01-18',
    views: 654,
    favorites: 34
  },
  {
    id: 4,
    name: 'Aluminum Scrap - 6061 Alloy',
    category: 'Metals',
    subcategory: 'Aluminum',
    price: 1850.00,
    unit: 'per ton',
    description: 'Clean aluminum 6061 alloy scrap, ideal for aerospace and automotive applications.',
    supplier: {
      name: 'MetalMax Recycling',
      rating: 4.7,
      verified: true,
      location: 'Seattle, WA'
    },
    images: ['/placeholder-aluminum.jpg'],
    inStock: true,
    quantity: 150,
    certifications: ['AS9100', 'ISO 14001', 'IATF 16949'],
    specifications: {
      purity: '99.6%',
      grade: '6061-T6',
      composition: 'Aluminum Alloy'
    },
    shipping: {
      available: true,
      cost: 100,
      estimatedDays: 4
    },
    tags: ['aerospace', 'automotive', 'high-purity'],
    createdAt: '2024-01-22',
    views: 743,
    favorites: 67
  }
];

const categories = [
  'All Categories',
  'Metals',
  'Plastics', 
  'Glass',
  'Paper',
  'Textiles',
  'Electronics',
  'Rubber'
];

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'In Stock', value: 'stock' }
];

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>(mockMaterials);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 });
  const [showInStock, setShowInStock] = useState(false);
  const [showVerified, setShowVerified] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Filter and sort materials
  useEffect(() => {
    let filtered = materials;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(material =>
        material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(material => material.category === selectedCategory);
    }

    // Price range filter
    filtered = filtered.filter(material => 
      material.price >= priceRange.min && material.price <= priceRange.max
    );

    // Stock filter
    if (showInStock) {
      filtered = filtered.filter(material => material.inStock);
    }

    // Verified supplier filter
    if (showVerified) {
      filtered = filtered.filter(material => material.supplier.verified);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'popular':
          return b.views - a.views;
        case 'rating':
          return b.supplier.rating - a.supplier.rating;
        case 'stock':
          return Number(b.inStock) - Number(a.inStock);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredMaterials(filtered);
  }, [materials, searchQuery, selectedCategory, sortBy, priceRange, showInStock, showVerified]);

  const toggleFavorite = (materialId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(materialId)) {
      newFavorites.delete(materialId);
    } else {
      newFavorites.add(materialId);
    }
    setFavorites(newFavorites);
  };

  const MaterialCard = ({ material }: { material: Material }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700">
        <div className="absolute top-4 left-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            material.inStock 
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}>
            {material.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        <button
          onClick={() => toggleFavorite(material.id)}
          className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
        >
          {favorites.has(material.id) ? (
            <HeartIconSolid className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
        <div className="absolute bottom-4 left-4">
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
            {material.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {material.name}
          </h3>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {material.description}
        </p>

        {/* Supplier Info */}
        <div className="flex items-center mb-3">
          <div className="flex-1">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {material.supplier.name}
              </span>
              {material.supplier.verified && (
                <CheckCircleIcon className="h-4 w-4 text-green-500 ml-1" />
              )}
            </div>
            <div className="flex items-center mt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIconSolid
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(material.supplier.rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                  {material.supplier.rating}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-500 ml-2">
                <MapPinIcon className="h-3 w-3 inline mr-1" />
                {material.supplier.location}
              </span>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${material.price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              {material.unit}
            </span>
          </div>
          <div className="text-right">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <EyeIcon className="h-3 w-3 mr-1" />
              {material.views}
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Purity:</span>
              <span className="ml-1 text-gray-900 dark:text-white">{material.specifications.purity}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Grade:</span>
              <span className="ml-1 text-gray-900 dark:text-white">{material.specifications.grade}</span>
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="flex items-center mb-4 text-xs text-gray-600 dark:text-gray-400">
          <TruckIcon className="h-4 w-4 mr-1" />
          <span>Ships in {material.shipping.estimatedDays} days</span>
          <span className="ml-2">${material.shipping.cost} shipping</span>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button size="sm" className="flex-1">
            <EyeIcon className="h-4 w-4 mr-1" />
            View Details
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            disabled={!material.inStock}
          >
            <ShoppingCartIcon className="h-4 w-4 mr-1" />
            Add to Cart
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const MaterialListItem = ({ material }: { material: Material }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-start space-x-4">
        {/* Image */}
        <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg flex-shrink-0 relative">
          <div className="absolute top-1 right-1">
            <span className={`px-1 py-0.5 text-xs font-medium rounded ${
              material.inStock 
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}>
              {material.inStock ? 'In' : 'Out'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {material.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                {material.description}
              </p>
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {material.supplier.name}
                </span>
                {material.supplier.verified && (
                  <CheckCircleIcon className="h-4 w-4 text-green-500 ml-1" />
                )}
                <div className="flex items-center ml-3">
                  {[...Array(5)].map((_, i) => (
                    <StarIconSolid
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(material.supplier.rating)
                          ? 'text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                    {material.supplier.rating}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right ml-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${material.price.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {material.unit}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <span>
                <MapPinIcon className="h-3 w-3 inline mr-1" />
                {material.supplier.location}
              </span>
              <span>
                <TruckIcon className="h-3 w-3 inline mr-1" />
                {material.shipping.estimatedDays} days
              </span>
              <span>
                <EyeIcon className="h-3 w-3 inline mr-1" />
                {material.views} views
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleFavorite(material.id)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                {favorites.has(material.id) ? (
                  <HeartIconSolid className="h-4 w-4 text-red-500" />
                ) : (
                  <HeartIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>
              <Button size="sm" variant="outline">
                View Details
              </Button>
              <Button size="sm" disabled={!material.inStock}>
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Browse Materials
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Discover high-quality recycled materials from verified suppliers
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-600 shadow-sm' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Squares2X2Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-600 shadow-sm' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <ListBulletIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search materials, suppliers, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price Range ($)
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={showInStock}
                        onChange={(e) => setShowInStock(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        In Stock Only
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={showVerified}
                        onChange={(e) => setShowVerified(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Verified Suppliers Only
                      </span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredMaterials.length} of {materials.length} materials
            </p>
          </div>
        </div>
      </div>

      {/* Materials Grid/List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredMaterials.map(material => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredMaterials.map(material => (
                <MaterialListItem key={material.id} material={material} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {filteredMaterials.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <MagnifyingGlassIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No materials found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria or filters
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
