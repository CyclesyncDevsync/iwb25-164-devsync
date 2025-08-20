'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShoppingCartIcon,
  SparklesIcon,
  ClockIcon,
  TagIcon,
  ChartBarIcon,
  EyeIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';

const marketplaceStats = [
  {
    label: 'Active Materials',
    value: '2,456',
    icon: SparklesIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    label: 'Live Auctions',
    value: '127',
    icon: ClockIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    label: 'Categories',
    value: '24',
    icon: TagIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    label: 'Total Views',
    value: '45.2K',
    icon: EyeIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  }
];

const quickActions = [
  {
    title: 'Browse Materials',
    description: 'Explore all available recycled materials',
    href: '/marketplace/materials',
    icon: SparklesIcon,
    color: 'bg-gradient-to-r from-blue-500 to-blue-600',
    buttonText: 'Browse Now'
  },
  {
    title: 'Active Auctions',
    description: 'Participate in live bidding sessions',
    href: '/marketplace/auctions',
    icon: ClockIcon,
    color: 'bg-gradient-to-r from-green-500 to-green-600',
    buttonText: 'View Auctions'
  },
  {
    title: 'Categories',
    description: 'Browse materials by category',
    href: '/marketplace/categories',
    icon: TagIcon,
    color: 'bg-gradient-to-r from-purple-500 to-purple-600',
    buttonText: 'Explore Categories'
  }
];

const featuredMaterials = [
  {
    id: 1,
    name: 'Premium Steel Bars',
    category: 'Metals',
    price: '$245.00',
    unit: 'per ton',
    image: '/placeholder-material.jpg',
    supplier: 'EcoSteel Corp',
    rating: 4.8,
    inStock: true
  },
  {
    id: 2,
    name: 'Recycled Plastic Pellets',
    category: 'Plastics',
    price: '$89.50',
    unit: 'per kg',
    image: '/placeholder-material.jpg',
    supplier: 'GreenPlastic Ltd',
    rating: 4.6,
    inStock: true
  },
  {
    id: 3,
    name: 'Crushed Glass',
    category: 'Glass',
    price: '$32.75',
    unit: 'per m³',
    image: '/placeholder-material.jpg',
    supplier: 'ClearGlass Recycling',
    rating: 4.9,
    inStock: false
  }
];

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <ShoppingCartIcon className="h-16 w-16 mx-auto mb-6 text-white/90" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Marketplace
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Discover, trade, and manage recycled materials in our comprehensive marketplace
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <MagnifyingGlassIcon className="h-6 w-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search materials, suppliers, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border-0 bg-white/10 backdrop-blur-sm placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <Button
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white text-blue-600 hover:bg-gray-100"
                >
                  Search
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {marketplaceStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor} dark:bg-gray-700`}>
                  <stat.icon className={`h-8 w-8 ${stat.color} dark:text-gray-300`} />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
              >
                <div className={`h-32 ${action.color} flex items-center justify-center`}>
                  <action.icon className="h-16 w-16 text-white" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {action.description}
                  </p>
                  <Link href={action.href}>
                    <Button className="w-full group">
                      {action.buttonText}
                      <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Featured Materials */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Featured Materials
              </h2>
              <Link href="/marketplace/materials">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredMaterials.map((material, index) => (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
                    <SparklesIcon className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                        {material.category}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        material.inStock 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {material.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {material.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      by {material.supplier}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-xl font-bold text-green-600 dark:text-green-400">
                          {material.price}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                          {material.unit}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-yellow-500">★</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                          {material.rating}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-6">
              Ready to Start Trading?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of suppliers and buyers in our sustainable marketplace
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                Become a Supplier
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                Start Buying
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
