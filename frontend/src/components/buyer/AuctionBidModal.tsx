'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClockIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  BoltIcon,
  XMarkIcon,
  ArrowUpIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

interface AuctionBidProps {
  auction: {
    id: string;
    title: string;
    currentPrice: number;
    timeLeft: number;
    participants: number;
    totalBids: number;
    myPosition?: number;
    autoBidEnabled: boolean;
    autoBidMax?: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onPlaceBid: (amount: number) => void;
  onEnableAutoBid: (maxAmount: number) => void;
}

interface BidHistory {
  id: string;
  amount: number;
  timestamp: string;
  bidder: string;
  isMyBid: boolean;
}

const AuctionBidModal: React.FC<AuctionBidProps> = ({
  auction,
  isOpen,
  onClose,
  onPlaceBid,
  onEnableAutoBid
}) => {
  const [bidAmount, setBidAmount] = useState('');
  const [autoBidMax, setAutoBidMax] = useState('');
  const [showBidHistory, setShowBidHistory] = useState(false);
  const [timeLeft, setTimeLeft] = useState(auction.timeLeft);

  const bidHistory: BidHistory[] = [
    { id: '1', amount: auction.currentPrice, timestamp: '2 minutes ago', bidder: 'Bidder A', isMyBid: false },
    { id: '2', amount: auction.currentPrice - 50, timestamp: '5 minutes ago', bidder: 'You', isMyBid: true },
    { id: '3', amount: auction.currentPrice - 100, timestamp: '8 minutes ago', bidder: 'Bidder B', isMyBid: false },
  ];

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

  const quickBidAmounts = [50, 100, 200];
  const minNextBid = auction.currentPrice + 50;

  const handlePlaceBid = () => {
    const amount = parseInt(bidAmount);
    if (amount >= minNextBid) {
      onPlaceBid(amount);
      setBidAmount('');
      onClose();
    }
  };

  const handleEnableAutoBid = () => {
    const maxAmount = parseInt(autoBidMax);
    if (maxAmount > auction.currentPrice) {
      onEnableAutoBid(maxAmount);
      setAutoBidMax('');
    }
  };

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Place Bid</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Auction Info */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">{auction.title}</h4>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CurrencyRupeeIcon className="h-4 w-4 text-purple-600" />
                    <span className="text-gray-600">Current Bid</span>
                  </div>
                  <p className="text-lg font-bold text-purple-600">
                    ₹{auction.currentPrice.toLocaleString()}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <ClockIcon className="h-4 w-4 text-red-600" />
                    <span className="text-gray-600">Time Left</span>
                  </div>
                  <p className={`text-lg font-bold ${
                    timeLeft <= 300 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {formatTimeLeft(timeLeft)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <UserGroupIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-600">Participants</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{auction.participants}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <TrophyIcon className="h-4 w-4 text-yellow-600" />
                    <span className="text-gray-600">My Position</span>
                  </div>
                  <p className={`text-lg font-bold ${
                    auction.myPosition === 1 ? 'text-green-600' : 
                    auction.myPosition && auction.myPosition <= 3 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {auction.myPosition ? `#${auction.myPosition}` : 'Not bidding'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Bid Buttons */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Bid</p>
              <div className="grid grid-cols-3 gap-2">
                {quickBidAmounts.map(increment => (
                  <button
                    key={increment}
                    onClick={() => setBidAmount((auction.currentPrice + increment).toString())}
                    className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center justify-center gap-1"
                  >
                    <ArrowUpIcon className="h-3 w-3" />
                    +₹{increment}
                  </button>
                ))}
              </div>
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
                  placeholder={`Min: ₹${minNextBid.toLocaleString()}`}
                  min={minNextBid}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimum next bid: ₹{minNextBid.toLocaleString()}
              </p>
            </div>

            {/* Auto-bid Section */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={auction.autoBidEnabled}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    disabled
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Auto-bid {auction.autoBidEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
                {auction.autoBidEnabled && auction.autoBidMax && (
                  <span className="text-sm text-blue-600 font-medium">
                    Max: ₹{auction.autoBidMax.toLocaleString()}
                  </span>
                )}
              </div>
              
              {!auction.autoBidEnabled && (
                <>
                  <input
                    type="number"
                    value={autoBidMax}
                    onChange={(e) => setAutoBidMax(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
                    placeholder="Maximum auto-bid amount"
                  />
                  <button
                    onClick={handleEnableAutoBid}
                    disabled={!autoBidMax || parseInt(autoBidMax) <= auction.currentPrice}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <BoltIcon className="h-4 w-4 inline mr-1" />
                    Enable Auto-bid
                  </button>
                </>
              )}
              
              <p className="text-xs text-gray-600 mt-2">
                We'll automatically bid for you up to your maximum amount
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setShowBidHistory(!showBidHistory)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Bid History
              </button>
              <button
                onClick={handlePlaceBid}
                disabled={!bidAmount || parseInt(bidAmount) < minNextBid || timeLeft <= 0}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Place Bid
              </button>
            </div>

            {/* Bid History */}
            <AnimatePresence>
              {showBidHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t pt-4"
                >
                  <h4 className="font-medium text-gray-900 mb-3">Recent Bids</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {bidHistory.map((bid) => (
                      <div
                        key={bid.id}
                        className={`flex items-center justify-between p-2 rounded text-sm ${
                          bid.isMyBid ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuctionBidModal;
