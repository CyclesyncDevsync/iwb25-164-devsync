'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  TagIcon,
  CubeIcon,
  BeakerIcon,
  ComputerDesktopIcon,
  DocumentIcon,
  CircleStackIcon,
  EyeIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  FireIcon,
  StarIcon,
  ShoppingBagIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../components/ui/Button';

interface Category {
  id: number;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  stats: {
    materials: number;
    auctions: number;
    suppliers: number;
    trending: boolean;
  };
  subcategories: {
    name: string;
    count: number;
  }[];
  featuredMaterials: {
    name: string;
    price: string;
    supplier: string;
  }[];
  tags: string[];
}

const categories: Category[] = [
  {
    id: 1,
    name: 'Metals',
    description: 'Steel, aluminum, copper, and other metal materials perfect for construction and manufacturing.',
    icon: CubeIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    stats: {
      materials: 1247,
      auctions: 34,
      suppliers: 89,
      trending: true
    },
    subcategories: [
      { name: 'Steel', count: 456 },
      { name: 'Aluminum', count: 312 },
      { name: 'Copper', count: 234 },
      { name: 'Brass', count: 156 },
      { name: 'Iron', count: 89 }
    ],
    featuredMaterials: [
      { name: 'Premium Steel Bars', price: '$245/ton', supplier: 'EcoSteel Corp' },
      { name: 'Aluminum Sheets', price: '$1,850/ton', supplier: 'MetalMax' },
      { name: 'Copper Wire', price: '$6,750/ton', supplier: 'TechMetal' }
    ],
    tags: ['construction', 'manufacturing', 'industrial', 'automotive']
  },
  {
    id: 2,
    name: 'Plastics',
    description: 'HDPE, PET, PVC, and other plastic polymers for packaging, manufacturing, and consumer goods.',
    icon: BeakerIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    stats: {
      materials: 892,
      auctions: 28,
      suppliers: 67,
      trending: true
    },
    subcategories: [
      { name: 'HDPE', count: 234 },
      { name: 'PET', count: 198 },
      { name: 'PVC', count: 167 },
      { name: 'PP', count: 143 },
      { name: 'PS', count: 150 }
    ],
    featuredMaterials: [
      { name: 'HDPE Pellets', price: '$89.50/kg', supplier: 'GreenPlastic' },
      { name: 'PET Flakes', price: '$76.25/kg', supplier: 'EcoPolymer' },
      { name: 'PVC Granules', price: '$92.00/kg', supplier: 'PlasticPro' }
    ],
    tags: ['packaging', 'food-grade', 'containers', 'bottles']
  },
  {
    id: 3,
    name: 'Glass',
    description: 'Clear, colored, and specialty glass materials for construction, decoration, and manufacturing.',
    icon: CircleStackIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    stats: {
      materials: 456,
      auctions: 12,
      suppliers: 34,
      trending: false
    },
    subcategories: [
      { name: 'Clear Glass', count: 156 },
      { name: 'Colored Glass', count: 123 },
      { name: 'Tempered Glass', count: 89 },
      { name: 'Laminated Glass', count: 56 },
      { name: 'Glass Aggregate', count: 32 }
    ],
    featuredMaterials: [
      { name: 'Crushed Glass', price: '$32.75/m³', supplier: 'ClearGlass' },
      { name: 'Glass Bottles', price: '$0.15/unit', supplier: 'GlassWorks' },
      { name: 'Window Glass', price: '$25.50/m²', supplier: 'TransparentTech' }
    ],
    tags: ['construction', 'decorative', 'aggregate', 'containers']
  },
  {
    id: 4,
    name: 'Electronics',
    description: 'PCBs, components, precious metals, and electronic waste for recovery and reuse.',
    icon: ComputerDesktopIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    stats: {
      materials: 678,
      auctions: 19,
      suppliers: 45,
      trending: true
    },
    subcategories: [
      { name: 'PCBs', count: 234 },
      { name: 'Cables & Wires', count: 167 },
      { name: 'Processors', count: 123 },
      { name: 'Memory', count: 89 },
      { name: 'Components', count: 65 }
    ],
    featuredMaterials: [
      { name: 'Gold-plated PCBs', price: '$125/kg', supplier: 'TechRecycle' },
      { name: 'Copper Cables', price: '$5.50/kg', supplier: 'WireWorks' },
      { name: 'RAM Modules', price: '$8.75/unit', supplier: 'MemoryMax' }
    ],
    tags: ['precious-metals', 'components', 'recovery', 'high-value']
  },
  {
    id: 5,
    name: 'Textiles',
    description: 'Cotton, polyester, wool, and synthetic fibers for fashion, upholstery, and industrial use.',
    icon: SparklesIcon,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    stats: {
      materials: 345,
      auctions: 8,
      suppliers: 28,
      trending: false
    },
    subcategories: [
      { name: 'Cotton', count: 123 },
      { name: 'Polyester', count: 89 },
      { name: 'Wool', count: 67 },
      { name: 'Denim', count: 45 },
      { name: 'Silk', count: 21 }
    ],
    featuredMaterials: [
      { name: 'Cotton Scraps', price: '$2.15/kg', supplier: 'FiberTech' },
      { name: 'Denim Waste', price: '$1.85/kg', supplier: 'TextileMax' },
      { name: 'Wool Fabric', price: '$4.50/kg', supplier: 'WoolWorks' }
    ],
    tags: ['fashion', 'upholstery', 'natural-fibers', 'synthetic']
  },
  {
    id: 6,
    name: 'Paper',
    description: 'Cardboard, newsprint, office paper, and specialty papers for recycling and reuse.',
    icon: DocumentIcon,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    stats: {
      materials: 567,
      auctions: 15,
      suppliers: 42,
      trending: false
    },
    subcategories: [
      { name: 'Cardboard', count: 198 },
      { name: 'Office Paper', count: 156 },
      { name: 'Newsprint', count: 123 },
      { name: 'Magazines', count: 67 },
      { name: 'Books', count: 23 }
    ],
    featuredMaterials: [
      { name: 'Cardboard Bales', price: '$125/ton', supplier: 'PaperTech' },
      { name: 'Office Paper', price: '$145/ton', supplier: 'RecyclePaper' },
      { name: 'Mixed Paper', price: '$89/ton', supplier: 'PaperMax' }
    ],
    tags: ['packaging', 'office', 'publishing', 'kraft']
  }
];

const trendingCategories = categories.filter(cat => cat.stats.trending);
const topCategories = [...categories].sort((a, b) => b.stats.materials - a.stats.materials).slice(0, 3);

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid');

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const CategoryCard = ({ category }: { category: Category }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={() => {
        setSelectedCategory(category);
        setViewMode('detail');
      }}
    >
      {/* Header */}
      <div className={`${category.bgColor} dark:bg-gray-700 p-6 relative`}>
        {category.stats.trending && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              <FireIcon className="h-3 w-3 mr-1" />
              Trending
            </span>
          </div>
        )}
        <div className="flex items-center">
          <div className={`p-4 ${category.bgColor} dark:bg-gray-600 rounded-lg`}>
            <category.icon className={`h-8 w-8 ${category.color} dark:text-gray-300`} />
          </div>
          <div className="ml-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {category.name}
            </h3>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {category.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {category.stats.materials}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Materials</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {category.stats.auctions}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Auctions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {category.stats.suppliers}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Suppliers</div>
          </div>
        </div>

        {/* Top Subcategories */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Popular Types
          </h4>
          <div className="flex flex-wrap gap-1">
            {category.subcategories.slice(0, 3).map((sub, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
              >
                {sub.name} ({sub.count})
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <Button className="w-full group">
          Explore {category.name}
          <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </motion.div>
  );

  const CategoryDetail = ({ category }: { category: Category }) => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className={`${category.bgColor} dark:bg-gray-700 p-8`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-4 ${category.bgColor} dark:bg-gray-600 rounded-lg`}>
              <category.icon className={`h-12 w-12 ${category.color} dark:text-gray-300`} />
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {category.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {category.description}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setViewMode('grid')}
            className="bg-white/10 border-white/20 text-gray-700 dark:text-gray-300"
          >
            ← Back to Categories
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gray-50 dark:bg-gray-700 px-8 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center">
            <ShoppingBagIcon className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {category.stats.materials}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Materials Available</div>
            </div>
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {category.stats.auctions}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Auctions</div>
            </div>
          </div>
          <div className="flex items-center">
            <StarIcon className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {category.stats.suppliers}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Verified Suppliers</div>
            </div>
          </div>
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                24%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Growth This Month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Subcategories */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Subcategories
            </h2>
            <div className="space-y-3">
              {category.subcategories.map((sub, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {sub.name}
                  </span>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                      {sub.count} items
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href={`/marketplace/materials?category=${category.name}`}>
                <Button variant="outline" className="w-full">
                  View All {category.name} Materials
                </Button>
              </Link>
            </div>
          </div>

          {/* Featured Materials */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Materials
            </h2>
            <div className="space-y-3">
              {category.featuredMaterials.map((material, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {material.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        by {material.supplier}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {material.price}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href={`/marketplace/auctions?category=${category.name}`}>
                <Button variant="outline" className="w-full">
                  View {category.name} Auctions
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Related Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {category.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 cursor-pointer transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {viewMode === 'grid' ? (
        <>
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center mb-8">
                <TagIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Material Categories
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Browse materials by category to find exactly what you need for your projects
                </p>
              </div>

              {/* Search */}
              <div className="max-w-2xl mx-auto relative">
                <MagnifyingGlassIcon className="h-6 w-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories, materials, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Trending Categories */}
          {trendingCategories.length > 0 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center mb-6">
                  <FireIcon className="h-6 w-6 text-red-500 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Trending Categories
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {trendingCategories.map((category, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CategoryCard category={category} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* All Categories */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                All Categories
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <CategoryCard category={category} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold mb-8">Marketplace Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-4xl font-bold mb-2">
                    {categories.reduce((sum, cat) => sum + cat.stats.materials, 0).toLocaleString()}
                  </div>
                  <div className="text-white/90">Total Materials</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-4xl font-bold mb-2">
                    {categories.reduce((sum, cat) => sum + cat.stats.auctions, 0)}
                  </div>
                  <div className="text-white/90">Active Auctions</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="text-4xl font-bold mb-2">
                    {categories.reduce((sum, cat) => sum + cat.stats.suppliers, 0)}
                  </div>
                  <div className="text-white/90">Verified Suppliers</div>
                </motion.div>
              </div>
            </div>
          </div>
        </>
      ) : selectedCategory ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CategoryDetail category={selectedCategory} />
        </div>
      ) : null}
    </div>
  );
}
