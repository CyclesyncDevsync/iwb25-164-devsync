"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  DollarSign, 
  Users, 
  MapPin, 
  Eye,
  Heart,
  HeartOff,
  Gavel,
  TrendingUp,
  Shield,
  AlertCircle,
  CheckCircle,
  Zap,
  Timer,
  Star,
  Package
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { placeBid, watchAuction, unwatchAuction } from '@/store/slices/auctionSlice';
import { formatCurrency } from '@/utils/formatters';
import { Auction } from '@/types/auction';

// Add missing formatter function
const formatTimeRemaining = (endTime: Date | string): string => {
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return 'Ended';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const BidPlacePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const auctionId = params.id as string;

  const { auctions, loading, error } = useSelector((state: RootState) => state.auctions);
  const auction = auctions.find(a => a.id === auctionId);

  const [bidAmount, setBidAmount] = useState<string>('');
  const [isWatching, setIsWatching] = useState(false);
  const [showBidConfirm, setShowBidConfirm] = useState(false);
  const [autoBidEnabled, setAutoBidEnabled] = useState(false);
  const [maxAutoBid, setMaxAutoBid] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Mock real-time price updates
  const [currentPrice, setCurrentPrice] = useState(auction?.currentPrice || 0);
  const [totalBids, setTotalBids] = useState(auction?.totalBids || 0);

  // Default values for properties that might not exist in the Auction type
  const sellerName = auction?.sellerName || 'Seller';
  const sellerRating = auction?.sellerRating || 4.5;
  const images = auction?.images || [];
  const isUserWatching = auction?.isUserWatching || false;
  const timeExtension = auction?.timeExtension || 5;
  const reservePrice = auction?.reservePrice;
  const endTime = auction?.endTime ? new Date(auction.endTime) : new Date(Date.now() + 24 * 60 * 60 * 1000);

  useEffect(() => {
    if (auction) {
      setBidAmount((auction.currentPrice + auction.incrementAmount).toString());
      setIsWatching(isUserWatching);
      setCurrentPrice(auction.currentPrice);
      setTotalBids(auction.totalBids);
    }
  }, [auction, isUserWatching]);

  // Simulate real-time updates
  useEffect(() => {
    const timer = setInterval(() => {
      if (auction) {
        setTimeRemaining(formatTimeRemaining(endTime));
        
        // Simulate random bid updates (10% chance every 3 seconds)
        if (Math.random() < 0.1) {
          setCurrentPrice(prev => prev + auction.incrementAmount);
          setTotalBids(prev => prev + 1);
        }
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [auction, endTime]);

  if (!auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Auction Not Found</h2>
          <p className="text-gray-600 mb-4">The auction you're looking for doesn't exist.</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handlePlaceBid = async () => {
    const amount = parseFloat(bidAmount);
    if (amount <= currentPrice) {
      alert('Bid amount must be higher than current price');
      return;
    }

    try {
      await dispatch(placeBid({ 
        auctionId: auction.id, 
        amount,
        maxAmount: autoBidEnabled ? parseFloat(maxAutoBid) : undefined
      }));
      setShowBidConfirm(false);
      // Update local state optimistically
      setCurrentPrice(amount);
      setTotalBids(prev => prev + 1);
    } catch (error) {
      console.error('Failed to place bid:', error);
    }
  };

  const handleWatchToggle = async () => {
    try {
      if (isWatching) {
        await dispatch(unwatchAuction(auction.id));
      } else {
        await dispatch(watchAuction(auction.id));
      }
      setIsWatching(!isWatching);
    } catch (error) {
      console.error('Failed to toggle watch:', error);
    }
  };

  const suggestedBids = [
    currentPrice + auction.incrementAmount,
    currentPrice + auction.incrementAmount * 2,
    currentPrice + auction.incrementAmount * 3,
    currentPrice + auction.incrementAmount * 5,
  ];

  const isAuctionEnding = endTime.getTime() - Date.now() < 30 * 60 * 1000; // 30 minutes

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Auctions</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleWatchToggle}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isWatching 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isWatching ? <HeartOff className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                <span>{isWatching ? 'Unwatch' : 'Watch'}</span>
              </button>
              
              <div className="flex items-center space-x-2 bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Live Auction</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Auction Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{auction.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Package className="w-4 h-4" />
                      <span>{auction.quantity} {auction.unit}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{auction.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{sellerRating}/5</span>
                    </div>
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  auction.type === 'standard' ? 'bg-blue-100 text-blue-600' :
                  auction.type === 'dutch' ? 'bg-orange-100 text-orange-600' :
                  auction.type === 'buy_it_now' ? 'bg-green-100 text-green-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {auction.type.replace('_', ' ').toUpperCase()}
                </div>
              </div>

              {/* Time Warning */}
              {isAuctionEnding && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
                >
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Auction Ending Soon!</span>
                  </div>
                  <p className="text-sm text-red-500 mt-1">
                    This auction will end in less than 30 minutes. Place your bids quickly!
                  </p>
                </motion.div>
              )}

              <p className="text-gray-700 leading-relaxed">{auction.description}</p>
            </motion.div>

            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-xl font-semibold mb-4">Product Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.length > 0 ? (
                  images.map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`${auction.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  ))
                ) : (
                  // Placeholder if no images
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center col-span-3">
                    <span className="text-gray-500">No images available</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Seller Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-xl font-semibold mb-4">Seller Information</h3>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">
                    {sellerName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{sellerName}</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">{sellerRating}/5</span>
                    </div>
                    <div className="flex items-center space-x-1 text-green-600">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm">Verified Seller</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bidding Panel */}
          <div className="space-y-6">
            {/* Current Price */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="text-center mb-6">
                <div className="text-sm text-gray-600 mb-1">Current Price</div>
                <div className="text-4xl font-bold text-green-600">
                  {formatCurrency(currentPrice)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Starting: {formatCurrency(auction.startingPrice)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Bidders</span>
                  </div>
                  <div className="text-2xl font-bold">{auction.totalBidders || 0}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-purple-600 mb-1">
                    <Gavel className="w-4 h-4" />
                    <span className="text-sm">Total Bids</span>
                  </div>
                  <div className="text-2xl font-bold">{totalBids}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Time Remaining</span>
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
                <div className={`text-xl font-bold ${isAuctionEnding ? 'text-red-600' : 'text-gray-900'}`}>
                  {timeRemaining || formatTimeRemaining(endTime)}
                </div>
              </div>
            </motion.div>

            {/* Bidding Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-xl font-semibold mb-4">Place Your Bid</h3>
              
              {/* Quick Bid Buttons */}
              <div className="mb-4">
                <label className="text-sm text-gray-600 mb-2 block">Quick Bid Amounts</label>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedBids.map((amount, index) => (
                    <button
                      key={index}
                      onClick={() => setBidAmount(amount.toString())}
                      className="bg-gray-100 hover:bg-blue-100 hover:text-blue-600 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {formatCurrency(amount)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Bid Input */}
              <div className="mb-4">
                <label className="text-sm text-gray-600 mb-2 block">Custom Bid Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter bid amount"
                    min={currentPrice + auction.incrementAmount}
                    step={auction.incrementAmount}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Minimum bid: {formatCurrency(currentPrice + auction.incrementAmount)}
                </div>
              </div>

              {/* Auto Bid Settings */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-600">Enable Auto-bidding</label>
                  <button
                    onClick={() => setAutoBidEnabled(!autoBidEnabled)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      autoBidEnabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      autoBidEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                
                {autoBidEnabled && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="relative"
                  >
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={maxAutoBid}
                      onChange={(e) => setMaxAutoBid(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Maximum auto-bid amount"
                    />
                  </motion.div>
                )}
              </div>

              {/* Bid Button */}
              <button
                onClick={() => setShowBidConfirm(true)}
                disabled={!bidAmount || parseFloat(bidAmount) <= currentPrice}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                  !bidAmount || parseFloat(bidAmount) <= currentPrice
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Gavel className="w-5 h-5" />
                  <span>Place Bid</span>
                </div>
              </button>

              {/* Buy It Now Button */}
              {auction.buyItNowPrice && (
                <button
                  className="w-full mt-3 py-3 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Buy Now - {formatCurrency(auction.buyItNowPrice)}</span>
                  </div>
                </button>
              )}
            </motion.div>

            {/* Auction Statistics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Auction Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reserve Price</span>
                  <span className="font-medium">
                    {reservePrice ? formatCurrency(reservePrice) : 'None'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Increment</span>
                  <span className="font-medium">{formatCurrency(auction.incrementAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time Extension</span>
                  <span className="font-medium">{timeExtension} minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium">247</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bid Confirmation Modal */}
      <AnimatePresence>
        {showBidConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gavel className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Your Bid</h3>
                <p className="text-gray-600">You are about to place a bid of:</p>
                <div className="text-3xl font-bold text-green-600 my-2">
                  {formatCurrency(parseFloat(bidAmount) || 0)}
                </div>
                {autoBidEnabled && maxAutoBid && (
                  <p className="text-sm text-blue-600">
                    Auto-bidding up to {formatCurrency(parseFloat(maxAutoBid))}
                  </p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBidConfirm(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePlaceBid}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Confirm Bid
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BidPlacePage;
