"use client";

import React, { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { 
  Gavel, 
  TrendingUp, 
  Zap, 
  Crown, 
  Package, 
  Monitor,
  Settings,
  BarChart3,
  Eye
} from 'lucide-react';
import AuctionCard from '@/components/auction/AuctionCard';
import AuctionList from '@/components/auction/AuctionList';
import LiveAuctionDashboard from '@/components/auction/LiveAuctionDashboard';
import AuctionManagement from '@/components/auction/AuctionManagement';
import { Auction, AuctionType } from '@/types/auction';

const AuctionDemoPage: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'list' | 'dashboard' | 'management'>('list');

  // Mock auction data for demo
  const mockAuctions: Auction[] = [
    {
      id: '1',
      title: 'High-Grade Plastic Bottles Collection',
      description: 'Premium quality plastic bottles suitable for recycling. Clean and sorted.',
      type: 'standard',
      status: 'active',
      materialId: 'mat-1',
      materialName: 'Plastic Bottles',
      materialCategory: 'Plastic',
      quantity: 500,
      unit: 'kg',
      location: 'New York, NY',
      images: ['/api/placeholder/400/300'],
      startingPrice: 150,
      currentPrice: 275,
      incrementAmount: 25,
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
      timeExtension: 5,
      totalBids: 12,
      totalBidders: 8,
      sellerId: 'seller-1',
      sellerName: 'EcoWaste Solutions',
      sellerRating: 4.8,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Aluminum Cans - Industrial Grade',
      description: 'Clean aluminum cans from beverage industry. Ready for melting.',
      type: 'dutch',
      status: 'active',
      materialId: 'mat-2',
      materialName: 'Aluminum Cans',
      materialCategory: 'Metal',
      quantity: 1000,
      unit: 'kg',
      location: 'Los Angeles, CA',
      images: ['/api/placeholder/400/300'],
      startingPrice: 800,
      currentPrice: 720,
      incrementAmount: 50,
      startTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      timeExtension: 10,
      totalBids: 5,
      totalBidders: 4,
      sellerId: 'seller-2',
      sellerName: 'Metro Recycling',
      sellerRating: 4.6,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      title: 'Electronic Components Lot',
      description: 'Mixed electronic components from computer manufacturing.',
      type: 'buy_it_now',
      status: 'active',
      materialId: 'mat-3',
      materialName: 'Electronic Components',
      materialCategory: 'Electronics',
      quantity: 50,
      unit: 'boxes',
      location: 'San Francisco, CA',
      images: ['/api/placeholder/400/300'],
      startingPrice: 200,
      currentPrice: 350,
      buyItNowPrice: 500,
      incrementAmount: 25,
      startTime: new Date(Date.now() - 30 * 60 * 1000),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      timeExtension: 5,
      totalBids: 8,
      totalBidders: 6,
      sellerId: 'seller-3',
      sellerName: 'TechRecycle Pro',
      sellerRating: 4.9,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  const features = [
    {
      id: 'list',
      title: 'Real-time Auction Interface',
      description: 'WebSocket-powered auction system with live bidding, real-time price updates, and bidder anonymity',
      icon: <Gavel className="w-6 h-6" />,
      highlights: [
        'Live bidding interface',
        'Real-time price updates', 
        'Bidder anonymity',
        'Auto-increment suggestions',
        'Last-minute extensions'
      ]
    },
    {
      id: 'dashboard',
      title: 'Live Dashboard',
      description: 'Monitor all active auctions, track real-time activity, and manage ending soon alerts',
      icon: <Monitor className="w-6 h-6" />,
      highlights: [
        'Real-time activity feed',
        'Live bidder tracking',
        'Ending soon alerts',
        'Performance metrics',
        'WebSocket connectivity status'
      ]
    },
    {
      id: 'management',
      title: 'Auction Management',
      description: 'Complete auction control interface with creation wizard, analytics, and bulk operations',
      icon: <Settings className="w-6 h-6" />,
      highlights: [
        'Auction creation wizard',
        'Schedule management',
        'Performance analytics',
        'Winner notification',
        'Payment processing integration'
      ]
    }
  ];

  const auctionTypes = [
    {
      type: 'standard',
      title: 'Standard Auctions',
      description: 'Traditional bidding where highest bid wins',
      icon: <Gavel className="w-5 h-5" />,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      type: 'dutch',
      title: 'Dutch Auctions',
      description: 'Price decreases over time until someone buys',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      type: 'buy_it_now',
      title: 'Buy It Now',
      description: 'Allow immediate purchase at fixed price',
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-green-100 text-green-600'
    },
    {
      type: 'reserve',
      title: 'Reserve Auctions',
      description: 'Set minimum price that must be met',
      icon: <Crown className="w-5 h-5" />,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      type: 'bulk',
      title: 'Bulk Auctions',
      description: 'Sell large quantities with bulk discounts',
      icon: <Package className="w-5 h-5" />,
      color: 'bg-indigo-100 text-indigo-600'
    }
  ];

  return (
    <>
      <Head>
        <title>Auction System Demo - CycleSync</title>
        <meta name="description" content="Comprehensive auction system with real-time bidding, multiple formats, and management tools" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-bold mb-6"
              >
                Advanced Auction System
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl mb-8 text-blue-100"
              >
                Real-time bidding • Multiple formats • Complete management
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap justify-center gap-4 mb-12"
              >
                <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Live WebSocket Connection</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
                  <Gavel className="w-4 h-4" />
                  <span>5 Auction Types</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
                  <BarChart3 className="w-4 h-4" />
                  <span>Real-time Analytics</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Features Navigation */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex space-x-8 overflow-x-auto">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => setActiveDemo(feature.id as any)}
                  className={`
                    flex items-center space-x-3 py-4 px-6 border-b-2 transition-colors duration-200 whitespace-nowrap
                    ${activeDemo === feature.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }
                  `}
                >
                  {feature.icon}
                  <span className="font-medium">{feature.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Feature Description */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <motion.div
              key={activeDemo}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {features.find(f => f.id === activeDemo)?.title}
              </h2>
              <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
                {features.find(f => f.id === activeDemo)?.description}
              </p>
              
              <div className="flex flex-wrap justify-center gap-3">
                {features.find(f => f.id === activeDemo)?.highlights.map((highlight, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Demo Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div
            key={activeDemo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {activeDemo === 'list' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockAuctions.map((auction) => (
                    <AuctionCard
                      key={auction.id}
                      auction={auction}
                      size="medium"
                      realTime={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeDemo === 'dashboard' && (
              <LiveAuctionDashboard />
            )}

            {activeDemo === 'management' && (
              <AuctionManagement />
            )}
          </motion.div>
        </div>

        {/* Auction Types Section */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Multiple Auction Formats
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Support for various auction types to meet different selling strategies and buyer preferences
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {auctionTypes.map((type, index) => (
                <motion.div
                  key={type.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-lg shadow-lg border hover:shadow-xl transition-shadow duration-200"
                >
                  <div className={`w-12 h-12 rounded-lg ${type.color} flex items-center justify-center mb-4`}>
                    {type.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{type.title}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Technical Features */}
        <div className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Built with Modern Technology
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Leveraging cutting-edge web technologies for optimal performance and user experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">WebSocket Real-time</h3>
                <p className="text-sm text-gray-300">Live bidding updates with Socket.io</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">Redux State Management</h3>
                <p className="text-sm text-gray-300">Predictable state updates and caching</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">TypeScript</h3>
                <p className="text-sm text-gray-300">Type-safe development and better DX</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">Framer Motion</h3>
                <p className="text-sm text-gray-300">Smooth animations and transitions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuctionDemoPage;
