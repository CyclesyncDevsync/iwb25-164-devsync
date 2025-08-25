'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClockIcon,
  FireIcon,
  EyeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  BoltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  StopIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  MapPinIcon,
  TrophyIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../components/ui/Button';

interface Auction {
  id: number;
  title: string;
  description: string;
  material: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    condition: string;
    specifications: {
      grade: string;
      purity: string;
    };
  };
  seller: {
    name: string;
    rating: number;
    verified: boolean;
    location: string;
  };
  auction: {
    type: 'live' | 'timed' | 'dutch' | 'reserve';
    status: 'upcoming' | 'live' | 'ending-soon' | 'ended';
    startTime: string;
    endTime: string;
    currentBid: number;
    startingBid: number;
    reservePrice?: number;
    bidIncrement: number;
    totalBids: number;
    participants: number;
    autoExtend: boolean;
  };
  images: string[];
  tags: string[];
  featured: boolean;
  createdAt: string;
}

const mockAuctions: Auction[] = [
  {
    id: 1,
    title: 'Premium Steel Rebar Collection - Construction Grade',
    description: 'High-quality steel rebar perfect for construction projects. All items have been inspected and meet industry standards.',
    material: {
      name: 'Steel Rebar',
      category: 'Metals',
      quantity: 50,
      unit: 'tons',
      condition: 'Excellent',
      specifications: {
        grade: 'Grade 60',
        purity: '99.2%'
      }
    },
    seller: {
      name: 'MetalWorks Industries',
      rating: 4.8,
      verified: true,
      location: 'Chicago, IL'
    },
    auction: {
      type: 'live',
      status: 'live',
      startTime: '2024-01-25T10:00:00Z',
      endTime: '2024-01-25T14:00:00Z',
      currentBid: 12500,
      startingBid: 8000,
      bidIncrement: 250,
      totalBids: 47,
      participants: 12,
      autoExtend: true
    },
    images: ['/placeholder-steel.jpg'],
    tags: ['construction', 'high-grade', 'certified'],
    featured: true,
    createdAt: '2024-01-20'
  },
  {
    id: 2,
    title: 'Aluminum Sheet Stock - Aerospace Quality',
    description: 'Clean aluminum sheets suitable for aerospace and automotive applications. Sourced from certified suppliers.',
    material: {
      name: 'Aluminum Sheets',
      category: 'Metals',
      quantity: 25,
      unit: 'tons',
      condition: 'Like New',
      specifications: {
        grade: '6061-T6',
        purity: '99.8%'
      }
    },
    seller: {
      name: 'AeroMetal Solutions',
      rating: 4.9,
      verified: true,
      location: 'Seattle, WA'
    },
    auction: {
      type: 'timed',
      status: 'ending-soon',
      startTime: '2024-01-24T08:00:00Z',
      endTime: '2024-01-25T16:30:00Z',
      currentBid: 18750,
      startingBid: 15000,
      reservePrice: 20000,
      bidIncrement: 500,
      totalBids: 23,
      participants: 8,
      autoExtend: false
    },
    images: ['/placeholder-aluminum.jpg'],
    tags: ['aerospace', 'automotive', 'premium'],
    featured: true,
    createdAt: '2024-01-19'
  },
  {
    id: 3,
    title: 'Mixed Plastic Polymer Lot - Food Grade',
    description: 'Various food-grade plastic polymers including HDPE, PP, and PET. Perfect for packaging manufacturers.',
    material: {
      name: 'Mixed Plastics',
      category: 'Plastics',
      quantity: 100,
      unit: 'kg',
      condition: 'Good',
      specifications: {
        grade: 'Food Grade',
        purity: '98.5%'
      }
    },
    seller: {
      name: 'PlasticRecycle Pro',
      rating: 4.6,
      verified: true,
      location: 'Houston, TX'
    },
    auction: {
      type: 'dutch',
      status: 'live',
      startTime: '2024-01-25T12:00:00Z',
      endTime: '2024-01-25T18:00:00Z',
      currentBid: 2500,
      startingBid: 3500,
      bidIncrement: 100,
      totalBids: 15,
      participants: 6,
      autoExtend: false
    },
    images: ['/placeholder-plastic.jpg'],
    tags: ['food-grade', 'packaging', 'certified'],
    featured: false,
    createdAt: '2024-01-21'
  },
  {
    id: 4,
    title: 'Copper Wire Bundle - Electronic Grade',
    description: 'High-purity copper wire suitable for electronic applications. Minimal oxidation, excellent conductivity.',
    material: {
      name: 'Copper Wire',
      category: 'Metals',
      quantity: 5,
      unit: 'tons',
      condition: 'Excellent',
      specifications: {
        grade: 'Electronic Grade',
        purity: '99.9%'
      }
    },
    seller: {
      name: 'TechMetal Recycling',
      rating: 4.7,
      verified: true,
      location: 'San Jose, CA'
    },
    auction: {
      type: 'reserve',
      status: 'upcoming',
      startTime: '2024-01-26T10:00:00Z',
      endTime: '2024-01-26T16:00:00Z',
      currentBid: 0,
      startingBid: 5000,
      reservePrice: 8000,
      bidIncrement: 200,
      totalBids: 0,
      participants: 0,
      autoExtend: true
    },
    images: ['/placeholder-copper.jpg'],
    tags: ['electronics', 'high-purity', 'conductive'],
    featured: false,
    createdAt: '2024-01-22'
  }
];

const auctionTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'live', label: 'Live Auctions' },
  { value: 'timed', label: 'Timed Auctions' },
  { value: 'dutch', label: 'Dutch Auctions' },
  { value: 'reserve', label: 'Reserve Auctions' }
];

const auctionStatuses = [
  { value: 'all', label: 'All Statuses' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'live', label: 'Live Now' },
  { value: 'ending-soon', label: 'Ending Soon' },
  { value: 'ended', label: 'Ended' }
];

const categories = [
  'All Categories',
  'Metals',
  'Plastics',
  'Glass',
  'Electronics',
  'Textiles',
  'Paper',
  'Rubber'
];

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>(mockAuctions);
  const [filteredAuctions, setFilteredAuctions] = useState<Auction[]>(mockAuctions);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showFilters, setShowFilters] = useState(false);
  const [showFeatured, setShowFeatured] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update time every second for countdown timers
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter auctions with error handling
  useEffect(() => {
    try {
      let filtered = [...auctions]; // Create a copy to avoid mutation

      // Search filter
      if (searchQuery.trim()) {
        filtered = filtered.filter(auction =>
          auction?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          auction?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          auction?.material?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          auction?.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          auction?.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      // Type filter
      if (selectedType !== 'all') {
        filtered = filtered.filter(auction => auction?.auction?.type === selectedType);
      }

      // Status filter
      if (selectedStatus !== 'all') {
        filtered = filtered.filter(auction => auction?.auction?.status === selectedStatus);
      }

      // Category filter
      if (selectedCategory !== 'All Categories') {
        filtered = filtered.filter(auction => auction?.material?.category === selectedCategory);
      }

      // Featured filter
      if (showFeatured) {
        filtered = filtered.filter(auction => auction?.featured);
      }

      setFilteredAuctions(filtered);
      setError(null);
      console.log('Filtered auctions:', filtered.length, 'from', auctions.length); // Debug log
    } catch (err) {
      console.error('Error filtering auctions:', err);
      setError('Error filtering auctions. Please try again.');
      setFilteredAuctions(auctions); // Fallback to showing all auctions
    }
  }, [auctions, searchQuery, selectedType, selectedStatus, selectedCategory, showFeatured]);

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime);
    const now = currentTime;
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const getStatusColor = (status: Auction['auction']['status']) => {
    switch (status) {
      case 'live':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'ending-soon':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      case 'upcoming':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'ended':
        return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: Auction['auction']['type']) => {
    switch (type) {
      case 'live':
        return <BoltIcon className="h-4 w-4" />;
      case 'timed':
        return <ClockIcon className="h-4 w-4" />;
      case 'dutch':
        return <FireIcon className="h-4 w-4" />;
      case 'reserve':
        return <TrophyIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  // Handler functions for auction actions
  const handlePlaceBid = (auctionId: number) => {
    try {
      console.log('Place bid for auction:', auctionId);
      // Navigate to bid page or open bid modal
      if (typeof window !== 'undefined') {
        window.location.href = `/auction/${auctionId}/bid`;
      }
    } catch (error) {
      console.error('Error navigating to bid page:', error);
      setError('Unable to place bid. Please try again.');
    }
  };

  const handleWatchAuction = (auctionId: number) => {
    try {
      console.log('Watch auction:', auctionId);
      // Add to watchlist functionality would go here
      // For now, just show a success message
      alert('Auction added to watchlist!');
    } catch (error) {
      console.error('Error watching auction:', error);
      setError('Unable to watch auction. Please try again.');
    }
  };

  const handleSetReminder = (auctionId: number) => {
    try {
      console.log('Set reminder for auction:', auctionId);
      // Set up reminder notification
      alert('Reminder set for upcoming auction!');
    } catch (error) {
      console.error('Error setting reminder:', error);
      setError('Unable to set reminder. Please try again.');
    }
  };

  const handlePreviewAuction = (auctionId: number) => {
    try {
      console.log('Preview auction:', auctionId);
      // Navigate to auction preview
      if (typeof window !== 'undefined') {
        window.location.href = `/auction/${auctionId}`;
      }
    } catch (error) {
      console.error('Error previewing auction:', error);
      setError('Unable to preview auction. Please try again.');
    }
  };

  const AuctionCard = ({ auction }: { auction: Auction }) => {
    if (!auction || !auction.auction) {
      return null;
    }

    // Provide fallbacks for potentially undefined values
    const title = auction.title || 'Untitled Auction';
    const description = auction.description || 'No description available';
    const currentBid = auction.auction.currentBid || 0;
    const startingBid = auction.auction.startingBid || 0;
    const status = auction.auction.status || 'upcoming';
    const endTime = auction.auction.endTime || new Date().toISOString();
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full min-h-[500px]"
      >
      {/* Header */}
      <div className="relative">
        {/* Image */}
        <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 relative">
          {auction.featured && (
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 text-xs font-bold bg-yellow-400 text-yellow-900 rounded-full flex items-center">
                <SparklesIcon className="h-3 w-3 mr-1" />
                Featured
              </span>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
              {status.replace('-', ' ').toUpperCase()}
            </span>
          </div>
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-1 text-xs font-medium bg-black/50 text-white rounded-full flex items-center">
              {getTypeIcon(auction.auction.type)}
              <span className="ml-1 capitalize">{auction.auction.type}</span>
            </span>
          </div>
        </div>

        {/* Live indicator */}
        {status === 'live' && (
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-ping"></div>
              LIVE
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Title and Description */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-shrink-0">
          {description}
        </p>

        {/* Material Info */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {auction.material.name}
            </span>
            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
              {auction.material.category}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div>Quantity: {auction.material.quantity} {auction.material.unit}</div>
            <div>Grade: {auction.material.specifications.grade}</div>
            <div>Condition: {auction.material.condition}</div>
            <div>Purity: {auction.material.specifications.purity}</div>
          </div>
        </div>

        {/* Seller Info */}
        <div className="flex items-center mb-4">
          <div className="flex-1">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {auction.seller.name}
              </span>
              {auction.seller.verified && (
                <CheckCircleIcon className="h-4 w-4 text-green-500 ml-1" />
              )}
            </div>
            <div className="flex items-center mt-1 text-xs text-gray-600 dark:text-gray-400">
              <span>Rating: {auction.seller.rating}/5</span>
              <span className="mx-2">•</span>
              <MapPinIcon className="h-3 w-3 mr-1" />
              <span>{auction.seller.location}</span>
            </div>
          </div>
        </div>

        {/* Auction Details */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Bid</div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                ${currentBid.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Time Remaining</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {getTimeRemaining(endTime)}
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span className="flex items-center">
                <UserGroupIcon className="h-3 w-3 mr-1" />
                {auction.auction.participants} bidders
              </span>
              <span className="flex items-center">
                <EyeIcon className="h-3 w-3 mr-1" />
                {auction.auction.totalBids} bids
              </span>
              <span>
                Min. ${auction.auction.bidIncrement}
              </span>
            </div>
          </div>
        </div>

        {/* Reserve Price */}
        {auction.auction.reservePrice && (
          <div className="mb-4">
            <div className="flex items-center text-xs text-orange-600 dark:text-orange-400">
              <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
              Reserve: ${auction.auction.reservePrice.toLocaleString()}
              {auction.auction.currentBid >= auction.auction.reservePrice && (
                <span className="ml-2 text-green-600 dark:text-green-400">Met</span>
              )}
            </div>
          </div>
        )}

        {/* Spacer to push buttons to bottom */}
        <div className="flex-1"></div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-auto">
          {status === 'live' || status === 'ending-soon' ? (
            <>
              <Button size="sm" className="flex-1" onClick={() => handlePlaceBid(auction.id)}>
                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                Place Bid
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleWatchAuction(auction.id)}>
                <EyeIcon className="h-4 w-4 mr-1" />
                Watch
              </Button>
            </>
          ) : status === 'upcoming' ? (
            <>
              <Button size="sm" variant="outline" className="flex-1" onClick={() => handleSetReminder(auction.id)}>
                <CalendarIcon className="h-4 w-4 mr-1" />
                Set Reminder
              </Button>
              <Button size="sm" variant="outline" onClick={() => handlePreviewAuction(auction.id)}>
                <EyeIcon className="h-4 w-4 mr-1" />
                Preview
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" className="w-full" disabled>
              Auction Ended
            </Button>
          )}
        </div>
      </div>
    </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Active Auctions
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Participate in live bidding for premium recycled materials
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                {filteredAuctions.filter(a => a.auction.status === 'live').length} Live Now
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredAuctions.filter(a => a.auction.status === 'ending-soon').length} Ending Soon
              </div>
            </div>
          </div>

          {/* Search and Quick Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search auctions, materials, or sellers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              {auctionStatuses.slice(1).map(status => (
                <Button
                  key={status.value}
                  size="sm"
                  variant={selectedStatus === status.value ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus(selectedStatus === status.value ? 'all' : status.value)}
                  className="text-xs"
                >
                  {status.label}
                </Button>
              ))}
            </div>

            {/* Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              More Filters
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
                  {/* Auction Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Auction Type
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    >
                      {auctionTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Featured Only */}
                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={showFeatured}
                        onChange={(e) => setShowFeatured(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Featured Only
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
              Showing {filteredAuctions.length} of {auctions.length} auctions
              {searchQuery && ` (filtered by "${searchQuery}")`}
            </p>
            <div className="text-xs text-gray-500">
              {selectedType !== 'all' && `Type: ${selectedType} | `}
              {selectedStatus !== 'all' && `Status: ${selectedStatus} | `}
              {selectedCategory !== 'All Categories' && `Category: ${selectedCategory} | `}
              {showFeatured && 'Featured only'}
            </div>
          </div>
        </div>
      </div>

      {/* Auctions Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-200 animate-pulse rounded-xl h-96"></div>
            ))}
          </div>
        ) : filteredAuctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            <AnimatePresence mode="popLayout">
              {filteredAuctions.map((auction, index) => {
                console.log('Rendering auction:', auction.id, auction.title); // Debug log
                return <AuctionCard key={`auction-${auction.id}-${index}`} auction={auction} />;
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No auctions found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria or filters
            </p>
          </motion.div>
        )}
      </div>

      {/* Live Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-red-500 text-white px-4 py-2 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-white rounded-full mr-3 animate-pulse"></div>
            <span className="font-medium">
              {filteredAuctions.filter(a => a.auction.status === 'live').length} live auctions in progress
            </span>
          </div>
          <Button size="sm" className="bg-white text-red-500 hover:bg-gray-100">
            View All Live
          </Button>
        </div>
      </div>
    </div>
  );
}
