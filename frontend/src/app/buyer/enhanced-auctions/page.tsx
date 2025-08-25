'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClockIcon,
  FunnelIcon,
  BoltIcon,
  TrophyIcon,
  UserGroupIcon,
  ChartBarIcon,
  SpeakerWaveIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  CalendarIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';
import { BuyerLayout, RealtimeBiddingSystem } from '@/components/buyer';

interface Auction {
  id: string;
  title: string;
  description: string;
  currentPrice: number;
  startingPrice: number;
  reservePrice?: number;
  timeLeft: number;
  endTime: string;
  minimumIncrement: number;
  status: 'live' | 'ending_soon' | 'ended';
  images: string[];
  quantity: number;
  unit: string;
  category: string;
  condition: string;
  location: string;
  supplier: {
    id: string;
    name: string;
    rating: number;
    verified: boolean;
  };
  participants: number;
  totalBids: number;
  myHighestBid?: number;
  myPosition?: number;
  specifications: Record<string, any>;
  certifications: string[];
  isWatching: boolean;
  autoBidEnabled?: boolean;
  autoBidMax?: number;
}

const EnhancedAuctionsPage = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<Auction[]>([]);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [showBiddingModal, setShowBiddingModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'live' | 'ending_soon' | 'my_bids' | 'watching'>('all');
  const [sortBy, setSortBy] = useState<'time_left' | 'price' | 'participants' | 'bids'>('time_left');
  const [isParticipating, setIsParticipating] = useState<Record<string, boolean>>({});
  const [notifications, setNotifications] = useState<string[]>([]);

  // Mock auctions data
  useEffect(() => {
    const mockAuctions: Auction[] = [
      {
        id: '1',
        title: 'Premium Recycled Steel Beams',
        description: 'High-grade structural steel beams from demolished commercial buildings. Perfect for construction projects requiring certified materials.',
        currentPrice: 14500,
        startingPrice: 12000,
        reservePrice: 15000,
        timeLeft: 3600, // 1 hour
        endTime: '2024-02-15T18:00:00Z',
        minimumIncrement: 100,
        status: 'live',
        images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        quantity: 50,
        unit: 'tons',
        category: 'Construction Materials',
        condition: 'Excellent',
        location: 'Mumbai, Maharashtra',
        supplier: {
          id: 'sup1',
          name: 'GreenBuild Materials',
          rating: 4.8,
          verified: true
        },
        participants: 12,
        totalBids: 45,
        myHighestBid: 14200,
        myPosition: 2,
        specifications: {
          grade: 'Grade 50',
          length: '6-12 meters',
          weight: '45-60 kg/m',
          coating: 'Galvanized'
        },
        certifications: ['ISI Certified', 'Green Building Approved'],
        isWatching: true,
        autoBidEnabled: true,
        autoBidMax: 15500
      },
      {
        id: '2',
        title: 'Salvaged Copper Pipes Collection',
        description: 'High-purity copper pipes recovered from demolished residential and commercial properties.',
        currentPrice: 44200,
        startingPrice: 40000,
        timeLeft: 1800, // 30 minutes
        endTime: '2024-02-14T20:00:00Z',
        minimumIncrement: 200,
        status: 'ending_soon',
        images: ['/api/placeholder/400/300'],
        quantity: 5,
        unit: 'tons',
        category: 'Metal Materials',
        condition: 'Excellent',
        location: 'Delhi, Delhi',
        supplier: {
          id: 'sup2',
          name: 'MetalCycle Pro',
          rating: 4.9,
          verified: true
        },
        participants: 8,
        totalBids: 28,
        specifications: {
          purity: '99.9% Cu',
          diameter: '15-50mm',
          thickness: '1-3mm'
        },
        certifications: ['ISI Mark', 'BIS Certified'],
        isWatching: false
      },
      {
        id: '3',
        title: 'Reclaimed Teak Wood Planks',
        description: 'Beautiful aged teak wood planks from heritage buildings. Perfect for premium furniture and interior projects.',
        currentPrice: 8800,
        startingPrice: 7500,
        timeLeft: 7200, // 2 hours
        endTime: '2024-02-15T21:00:00Z',
        minimumIncrement: 100,
        status: 'live',
        images: ['/api/placeholder/400/300'],
        quantity: 25,
        unit: 'cubic meters',
        category: 'Wood Materials',
        condition: 'Good',
        location: 'Bangalore, Karnataka',
        supplier: {
          id: 'sup3',
          name: 'Heritage Wood Co.',
          rating: 4.6,
          verified: true
        },
        participants: 15,
        totalBids: 32,
        specifications: {
          species: 'Teak',
          dimensions: '2m x 15cm x 5cm',
          moisture: '12-15%'
        },
        certifications: ['FSC Certified'],
        isWatching: true
      },
      {
        id: '4',
        title: 'Industrial Grade Recycled Plastic',
        description: 'High-quality HDPE plastic ready for manufacturing. Sourced from sorted and cleaned industrial waste.',
        currentPrice: 2200,
        startingPrice: 2000,
        timeLeft: 14400, // 4 hours
        endTime: '2024-02-16T02:00:00Z',
        minimumIncrement: 50,
        status: 'live',
        images: ['/api/placeholder/400/300'],
        quantity: 1000,
        unit: 'kg',
        category: 'Plastic Materials',
        condition: 'New',
        location: 'Chennai, Tamil Nadu',
        supplier: {
          id: 'sup4',
          name: 'PlastiWood Industries',
          rating: 4.7,
          verified: true
        },
        participants: 6,
        totalBids: 18,
        specifications: {
          material: '100% Recycled HDPE',
          density: '0.95 g/cm³',
          uvResistance: 'UV Stabilized'
        },
        certifications: ['ISO 14001', 'Recycled Content Verified'],
        isWatching: false
      }
    ];

    setAuctions(mockAuctions);
    setFilteredAuctions(mockAuctions);

    // Initialize participation status
    const participationStatus: Record<string, boolean> = {};
    mockAuctions.forEach(auction => {
      participationStatus[auction.id] = auction.myHighestBid !== undefined;
    });
    setIsParticipating(participationStatus);
  }, []);

  // Real-time auction updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setAuctions(prev => prev.map(auction => {
        if (auction.status === 'live' || auction.status === 'ending_soon') {
          const newTimeLeft = Math.max(0, auction.timeLeft - 1);
          const newStatus = newTimeLeft <= 300 ? 'ending_soon' : 
                           newTimeLeft === 0 ? 'ended' : auction.status;
          
          // Simulate bid updates
          let newPrice = auction.currentPrice;
          let newBids = auction.totalBids;
          if (Math.random() > 0.95) {
            newPrice += auction.minimumIncrement + Math.floor(Math.random() * 500);
            newBids += 1;
            
            // Add notification
            if (auction.isWatching) {
              setNotifications(prev => 
                [`New bid on ${auction.title}: ₹${newPrice.toLocaleString()}`, ...prev].slice(0, 5)
              );
            }
          }

          return {
            ...auction,
            timeLeft: newTimeLeft,
            status: newStatus as any,
            currentPrice: newPrice,
            totalBids: newBids
          };
        }
        return auction;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Filter auctions
  useEffect(() => {
    let filtered = auctions;

    switch (filter) {
      case 'live':
        filtered = auctions.filter(a => a.status === 'live');
        break;
      case 'ending_soon':
        filtered = auctions.filter(a => a.status === 'ending_soon');
        break;
      case 'my_bids':
        filtered = auctions.filter(a => a.myHighestBid !== undefined);
        break;
      case 'watching':
        filtered = auctions.filter(a => a.isWatching);
        break;
    }

    // Sort filtered results
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'time_left':
          return a.timeLeft - b.timeLeft;
        case 'price':
          return b.currentPrice - a.currentPrice;
        case 'participants':
          return b.participants - a.participants;
        case 'bids':
          return b.totalBids - a.totalBids;
        default:
          return 0;
      }
    });

    setFilteredAuctions(filtered);
  }, [auctions, filter, sortBy]);

  const formatTimeLeft = (seconds: number) => {
    if (seconds <= 0) return 'Ended';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getTimeColor = (seconds: number) => {
    if (seconds <= 300) return 'text-red-600';
    if (seconds <= 1800) return 'text-orange-600';
    return 'text-green-600';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      live: 'bg-green-100 text-green-800 border-green-200',
      ending_soon: 'bg-red-100 text-red-800 border-red-200',
      ended: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return badges[status as keyof typeof badges];
  };

  const handleJoinAuction = (auctionId: string) => {
    setIsParticipating(prev => ({ ...prev, [auctionId]: true }));
    console.log('Joined auction:', auctionId);
  };

  const handleLeaveAuction = (auctionId: string) => {
    setIsParticipating(prev => ({ ...prev, [auctionId]: false }));
    console.log('Left auction:', auctionId);
  };

  const handlePlaceBid = async (amount: number) => {
    if (!selectedAuction) return false;
    
    // Simulate bid placement
    const success = amount >= selectedAuction.currentPrice + selectedAuction.minimumIncrement;
    
    if (success) {
      setAuctions(prev => prev.map(auction => 
        auction.id === selectedAuction.id 
          ? {
              ...auction,
              currentPrice: amount,
              totalBids: auction.totalBids + 1,
              myHighestBid: amount,
              myPosition: 1
            }
          : auction
      ));
    }
    
    return success;
  };

  const handleEnableAutoBid = (maxAmount: number, increment: number) => {
    if (!selectedAuction) return;
    
    setAuctions(prev => prev.map(auction => 
      auction.id === selectedAuction.id 
        ? {
            ...auction,
            autoBidEnabled: true,
            autoBidMax: maxAmount
          }
        : auction
    ));
  };

  const handleWatchAuction = (auctionId: string) => {
    setAuctions(prev => prev.map(auction => 
      auction.id === auctionId 
        ? { ...auction, isWatching: !auction.isWatching }
        : auction
    ));
  };

  const renderAuctionCard = (auction: Auction) => (
    <motion.div
      key={auction.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Image and Status */}
      <div className="relative">
        <img 
          src={auction.images[0]} 
          alt={auction.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(auction.status)}`}>
            {auction.status === 'ending_soon' ? 'Ending Soon' : auction.status.toUpperCase()}
          </span>
          {auction.autoBidEnabled && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200">
              <BoltIcon className="h-3 w-3 inline mr-1" />
              Auto-bid
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 flex gap-2">
          <button 
            onClick={() => handleWatchAuction(auction.id)}
            className={`p-2 rounded-full ${auction.isWatching ? 'bg-red-500 text-white' : 'bg-white text-gray-600'} hover:scale-110 transition-transform`}
          >
            <HeartIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{auction.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{auction.description}</p>
        </div>

        {/* Price and Time */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Current Bid</p>
            <p className="text-2xl font-bold text-purple-600">₹{auction.currentPrice.toLocaleString()}</p>
            {auction.reservePrice && auction.currentPrice < auction.reservePrice && (
              <p className="text-xs text-orange-600">Reserve not met</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Time Left</p>
            <p className={`text-xl font-bold ${getTimeColor(auction.timeLeft)}`}>
              {formatTimeLeft(auction.timeLeft)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <UserGroupIcon className="h-4 w-4" />
            <span>{auction.participants} bidders</span>
          </div>
          <div className="flex items-center gap-1">
            <ChartBarIcon className="h-4 w-4" />
            <span>{auction.totalBids} bids</span>
          </div>
          <div className="flex items-center gap-1">
            <TrophyIcon className="h-4 w-4" />
            <span>{auction.quantity} {auction.unit}</span>
          </div>
        </div>

        {/* My Position */}
        {auction.myPosition && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-green-800 font-medium">Your Position: #{auction.myPosition}</span>
              <span className="text-green-600 text-sm">Bid: ₹{auction.myHighestBid?.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedAuction(auction);
              setShowBiddingModal(true);
            }}
            disabled={auction.status === 'ended'}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {auction.status === 'ended' ? 'Auction Ended' : 'Place Bid'}
          </button>
          <button
            onClick={() => {
              setSelectedAuction(auction);
              // Open auction details modal
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <ShareIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <BuyerLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Live Auctions</h1>
          <p className="text-gray-600">Participate in real-time bidding with advanced features and real-time updates</p>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <SpeakerWaveIcon className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Live Updates</span>
              </div>
              <div className="space-y-1">
                {notifications.map((notification, index) => (
                  <p key={index} className="text-sm text-blue-800">{notification}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters and Sort */}
        <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <div className="flex gap-1">
                {[
                  { key: 'all', label: 'All Auctions' },
                  { key: 'live', label: 'Live' },
                  { key: 'ending_soon', label: 'Ending Soon' },
                  { key: 'my_bids', label: 'My Bids' },
                  { key: 'watching', label: 'Watching' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key as any)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      filter === key
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="time_left">Time Left</option>
                <option value="price">Highest Price</option>
                <option value="participants">Most Participants</option>
                <option value="bids">Most Bids</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Live Auctions</p>
                <p className="text-2xl font-bold text-green-600">
                  {auctions.filter(a => a.status === 'live').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BoltIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ending Soon</p>
                <p className="text-2xl font-bold text-red-600">
                  {auctions.filter(a => a.status === 'ending_soon').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Active Bids</p>
                <p className="text-2xl font-bold text-purple-600">
                  {auctions.filter(a => a.myHighestBid !== undefined).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrophyIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Watching</p>
                <p className="text-2xl font-bold text-blue-600">
                  {auctions.filter(a => a.isWatching).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <HeartIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Auctions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map(renderAuctionCard)}
        </div>

        {/* No Results */}
        {filteredAuctions.length === 0 && (
          <div className="text-center py-12">
            <TrophyIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No auctions found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later for new auctions</p>
          </div>
        )}

        {/* Real-time Bidding Modal */}
        <AnimatePresence>
          {showBiddingModal && selectedAuction && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowBiddingModal(false)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <RealtimeBiddingSystem
                  auction={selectedAuction}
                  onPlaceBid={handlePlaceBid}
                  onEnableAutoBid={handleEnableAutoBid}
                  onJoinAuction={() => handleJoinAuction(selectedAuction.id)}
                  onLeaveAuction={() => handleLeaveAuction(selectedAuction.id)}
                  isParticipating={isParticipating[selectedAuction.id] || false}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BuyerLayout>
  );
};

export default EnhancedAuctionsPage;
