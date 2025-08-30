'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ClockIcon,
  EyeIcon,
  FireIcon,
  TrophyIcon,
  BoltIcon,
  CurrencyRupeeIcon,
  PlayIcon,
  StopIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { 
  selectAuctions, 
  selectFeaturedAuctions,
  fetchAuctions 
} from '@/store/slices/auctionSlice';
import type { AppDispatch } from '@/store';
import type { Auction } from '@/types/auction';

// Using Auction interface from types/auction.ts

interface BidHistory {
  id: string;
  amount: number;
  timestamp: string;
  bidder: string;
  isMyBid: boolean;
}

const AuctionsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auctions = useSelector(selectAuctions);
  const loading = useSelector((state: any) => state.auctions.loading.auctions);
  const error = useSelector((state: any) => state.auctions.error.auctions);
  
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'ended' | 'my_bids'>('live');
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [autoBidMax, setAutoBidMax] = useState('');
  const [showBidHistory, setShowBidHistory] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>(['1', '3']);

  const [bidHistory, setBidHistory] = useState<BidHistory[]>([
    { id: '1', amount: 1250, timestamp: '2 minutes ago', bidder: 'Bidder A', isMyBid: false },
    { id: '2', amount: 1200, timestamp: '5 minutes ago', bidder: 'You', isMyBid: true },
    { id: '3', amount: 1150, timestamp: '8 minutes ago', bidder: 'Bidder B', isMyBid: false },
    { id: '4', amount: 1100, timestamp: '12 minutes ago', bidder: 'Bidder C', isMyBid: false }
  ]);

  const getTimeLeft = (endTime: Date): number => {
    const now = new Date();
    return Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
  };

  const getAuctionDisplayStatus = (auction: Auction) => {
    const timeLeft = getTimeLeft(auction.endTime);
    if (timeLeft <= 0) return 'ended';
    if (timeLeft <= 1800 && auction.status === 'active') return 'ending_soon'; // 30 minutes
    if (auction.status === 'active') return 'live';
    return auction.status;
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'text-green-600 bg-green-100';
      case 'ending_soon': return 'text-red-600 bg-red-100 animate-pulse';
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'ended': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const placeBid = (auctionId: string, amount: number) => {
    setAuctions(prev => prev.map(auction => 
      auction.id === auctionId 
        ? { 
            ...auction, 
            currentPrice: amount,
            totalBids: auction.totalBids + 1,
            isParticipating: true,
            myHighestBid: amount,
            myPosition: 1
          }
        : auction
    ));
    
    setBidHistory(prev => [
      { 
        id: Date.now().toString(), 
        amount, 
        timestamp: 'Just now', 
        bidder: 'You', 
        isMyBid: true 
      },
      ...prev
    ]);
    
    setBidAmount('');
  };

  const enableAutoBid = (auctionId: string, maxAmount: number) => {
    setAuctions(prev => prev.map(auction => 
      auction.id === auctionId 
        ? { ...auction, autoBidEnabled: true, autoBidMax: maxAmount }
        : auction
    ));
    setAutoBidMax('');
  };

  const toggleWatchlist = (auctionId: string) => {
    setWatchlist(prev => 
      prev.includes(auctionId) 
        ? prev.filter(id => id !== auctionId)
        : [...prev, auctionId]
    );
  };

  const filteredAuctions = auctions.filter(auction => {
    const displayStatus = getAuctionDisplayStatus(auction);
    switch (activeTab) {
      case 'live': return displayStatus === 'live' || displayStatus === 'ending_soon';
      case 'upcoming': return displayStatus === 'upcoming';
      case 'ended': return displayStatus === 'ended';
      case 'my_bids': return auction.isUserBidding || false;
      default: return true;
    }
  });

  // Load auctions from Redux
  useEffect(() => {
    console.log('Dispatching fetchAuctions action...');
    dispatch(fetchAuctions({ page: 1, limit: 20 }));
  }, [dispatch]);

  // Note: Real-time updates should be handled via WebSocket and Redux actions
  // This simulation is removed since we're using Redux state

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Live Auctions</h1>
              <p className="text-gray-600">Participate in real-time bidding for materials</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-green-600">Live Updates Active</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { key: 'live', label: 'Live Auctions', count: auctions.filter(a => {
                  const displayStatus = getAuctionDisplayStatus(a);
                  return displayStatus === 'live' || displayStatus === 'ending_soon';
                }).length },
                { key: 'upcoming', label: 'Upcoming', count: auctions.filter(a => getAuctionDisplayStatus(a) === 'upcoming').length },
                { key: 'my_bids', label: 'My Bids', count: auctions.filter(a => a.isUserBidding || false).length },
                { key: 'ended', label: 'Ended', count: auctions.filter(a => getAuctionDisplayStatus(a) === 'ended').length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2">
              <FireIcon className="h-5 w-5 text-red-500" />
              <span className="text-sm text-gray-600">Active Auctions</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{auctions.filter(a => getAuctionDisplayStatus(a) === 'live').length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2">
              <TrophyIcon className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-gray-600">My Wins</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">3</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2">
              <BoltIcon className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-600">Auto Bids</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2">
              <EyeIcon className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-gray-600">Watchlist</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{watchlist.length}</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredAuctions.length === 0 && (
          <div className="text-center py-12">
            <FireIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No auctions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'live' ? 'No live auctions at the moment.' : 
               activeTab === 'upcoming' ? 'No upcoming auctions.' :
               activeTab === 'my_bids' ? 'You haven\'t participated in any auctions yet.' :
               'No ended auctions.'}
            </p>
          </div>
        )}

        {/* Auctions Grid */}
        {!loading && !error && filteredAuctions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAuctions.map((auction, index) => (
            <motion.div
              key={auction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all duration-300"
            >
              {/* Image and Status */}
              <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(auction.status)}`}>
                    {auction.status === 'ending_soon' ? 'Ending Soon!' : 
                     auction.status === 'live' ? 'Live' :
                     auction.status === 'upcoming' ? 'Upcoming' : 'Ended'}
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                  {auction.isParticipating && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                      Participating
                    </span>
                  )}
                  <button
                    onClick={() => toggleWatchlist(auction.id)}
                    className={`p-1.5 rounded-full ${
                      watchlist.includes(auction.id) 
                        ? 'bg-purple-100 text-purple-600' 
                        : 'bg-white text-gray-400'
                    }`}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {formatTimeLeft(auction.timeLeft)}
                      </span>
                      <span className="flex items-center gap-1">
                        <UserGroupIcon className="h-4 w-4" />
                        {auction.participants}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{auction.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{auction.description}</p>

                {/* Price Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Current Bid:</span>
                    <span className="text-lg font-bold text-purple-600">
                      ₹{auction.currentPrice.toLocaleString()}
                    </span>
                  </div>
                  
                  {auction.reservePrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Reserve:</span>
                      <span className={`text-xs ${auction.currentPrice >= auction.reservePrice ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{auction.reservePrice.toLocaleString()}
                        {auction.currentPrice >= auction.reservePrice && (
                          <CheckCircleIcon className="h-4 w-4 inline ml-1" />
                        )}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Quantity:</span>
                    <span>{auction.quantity} {auction.unit}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total Bids:</span>
                    <span>{auction.totalBids}</span>
                  </div>

                  {auction.isParticipating && auction.myPosition && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">My Position:</span>
                      <span className={`font-medium ${
                        auction.myPosition === 1 ? 'text-green-600' : 
                        auction.myPosition <= 3 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        #{auction.myPosition}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {auction.status === 'live' || auction.status === 'ending_soon' ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedAuction(auction)}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                    >
                      {auction.isParticipating ? 'Place New Bid' : 'Join Auction'}
                    </button>
                    
                    {auction.autoBidEnabled ? (
                      <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                        <BoltIcon className="h-4 w-4" />
                        Auto-bid active (max: ₹{auction.autoBidMax?.toLocaleString()})
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedAuction(auction)}
                        className="w-full px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium"
                      >
                        Enable Auto-bid
                      </button>
                    )}
                  </div>
                ) : auction.status === 'upcoming' ? (
                  <button
                    onClick={() => toggleWatchlist(auction.id)}
                    className={`w-full px-4 py-2 rounded-lg font-medium ${
                      watchlist.includes(auction.id)
                        ? 'bg-purple-100 text-purple-700'
                        : 'border border-purple-600 text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    {watchlist.includes(auction.id) ? 'In Watchlist' : 'Add to Watchlist'}
                  </button>
                ) : (
                  <div className="text-center py-2 text-gray-500">
                    Auction Ended
                  </div>
                )}
              </div>
            </motion.div>
            ))}
          </div>
        )}

        {/* Bid Modal */}
        <AnimatePresence>
          {selectedAuction && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedAuction(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Place Bid</h3>
                    <button
                      onClick={() => setSelectedAuction(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">{selectedAuction.title}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Current bid: ₹{selectedAuction.currentPrice.toLocaleString()}</p>
                      <p>Minimum next bid: ₹{(selectedAuction.currentPrice + 50).toLocaleString()}</p>
                      <p className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        Time left: {formatTimeLeft(selectedAuction.timeLeft)}
                      </p>
                    </div>
                  </div>

                  {/* Quick Bid Buttons */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[50, 100, 200].map(increment => (
                      <button
                        key={increment}
                        onClick={() => setBidAmount((selectedAuction.currentPrice + increment).toString())}
                        className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                      >
                        +₹{increment}
                      </button>
                    ))}
                  </div>

                  {/* Bid Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Bid Amount
                    </label>
                    <div className="relative">
                      <CurrencyRupeeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter amount"
                        min={selectedAuction.currentPrice + 50}
                      />
                    </div>
                  </div>

                  {/* Auto-bid Section */}
                  <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                    <label className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={selectedAuction.autoBidEnabled}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Enable Auto-bid</span>
                    </label>
                    <input
                      type="number"
                      value={autoBidMax}
                      onChange={(e) => setAutoBidMax(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      placeholder="Maximum auto-bid amount"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      We'll automatically bid for you up to this amount
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowBidHistory(!showBidHistory)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Bid History
                    </button>
                    <button
                      onClick={() => {
                        if (bidAmount) {
                          placeBid(selectedAuction.id, parseInt(bidAmount));
                          setSelectedAuction(null);
                        }
                      }}
                      disabled={!bidAmount || parseInt(bidAmount) <= selectedAuction.currentPrice}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Place Bid
                    </button>
                  </div>

                  {/* Bid History */}
                  {showBidHistory && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Recent Bids</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {bidHistory.map((bid) => (
                          <div
                            key={bid.id}
                            className={`flex items-center justify-between p-2 rounded text-sm ${
                              bid.isMyBid ? 'bg-purple-50' : 'bg-gray-50'
                            }`}
                          >
                            <span className={bid.isMyBid ? 'font-medium text-purple-700' : 'text-gray-600'}>
                              {bid.bidder}
                            </span>
                            <div className="text-right">
                              <div className="font-medium">₹{bid.amount.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">{bid.timestamp}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuctionsPage;
