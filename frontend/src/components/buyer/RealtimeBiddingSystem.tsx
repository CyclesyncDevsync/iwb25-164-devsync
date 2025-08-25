'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClockIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
  BoltIcon,
  TrophyIcon,
  ChartBarIcon,
  SpeakerWaveIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlayIcon,
  PauseIcon,
  CameraIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

interface RealtimeBid {
  id: string;
  amount: number;
  timestamp: number;
  bidder: {
    id: string;
    name: string;
    avatar?: string;
    isVerified: boolean;
  };
  isMyBid: boolean;
  autoBid?: boolean;
  increment: number;
}

interface AuctionStats {
  totalBids: number;
  participants: number;
  averageBid: number;
  priceIncrease: number;
  bidsPerMinute: number;
  timeActive: number;
}

interface RealtimeBiddingProps {
  auction: {
    id: string;
    title: string;
    currentPrice: number;
    startingPrice: number;
    reservePrice?: number;
    timeLeft: number;
    endTime: string;
    minimumIncrement: number;
    status: 'live' | 'ending_soon' | 'ended';
    images: string[];
    description: string;
    quantity: number;
    unit: string;
  };
  onPlaceBid: (amount: number) => Promise<boolean>;
  onEnableAutoBid: (maxAmount: number, increment: number) => void;
  onJoinAuction: () => void;
  onLeaveAuction: () => void;
  isParticipating: boolean;
}

const RealtimeBiddingSystem: React.FC<RealtimeBiddingProps> = ({
  auction,
  onPlaceBid,
  onEnableAutoBid,
  onJoinAuction,
  onLeaveAuction,
  isParticipating
}) => {
  const [bidHistory, setBidHistory] = useState<RealtimeBid[]>([]);
  const [bidAmount, setBidAmount] = useState('');
  const [autoBidEnabled, setAutoBidEnabled] = useState(false);
  const [autoBidMax, setAutoBidMax] = useState('');
  const [autoBidIncrement, setAutoBidIncrement] = useState(50);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showBidHistory, setShowBidHistory] = useState(false);
  const [myPosition, setMyPosition] = useState<number | null>(null);
  const [priceAlert, setPriceAlert] = useState<number | null>(null);
  const [biddingPaused, setBiddingPaused] = useState(false);
  const [stats, setStats] = useState<AuctionStats>({
    totalBids: 0,
    participants: 0,
    averageBid: 0,
    priceIncrease: 0,
    bidsPerMinute: 0,
    timeActive: 0
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bidHistoryRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Simulated WebSocket connection
  useEffect(() => {
    // Mock WebSocket connection
    const interval = setInterval(() => {
      // Simulate incoming bids
      if (auction.status === 'live' && Math.random() > 0.7) {
        const newBid: RealtimeBid = {
          id: Date.now().toString(),
          amount: auction.currentPrice + auction.minimumIncrement + Math.floor(Math.random() * 200),
          timestamp: Date.now(),
          bidder: {
            id: 'other_' + Math.random(),
            name: `Bidder ${Math.floor(Math.random() * 100)}`,
            isVerified: Math.random() > 0.5
          },
          isMyBid: false,
          increment: auction.minimumIncrement + Math.floor(Math.random() * 200)
        };

        setBidHistory(prev => [newBid, ...prev].slice(0, 50));
        
        if (soundEnabled) {
          playBidSound();
        }
      }
    }, 3000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, [auction.status, soundEnabled, auction.currentPrice, auction.minimumIncrement]);

  // Auto-scroll bid history
  useEffect(() => {
    if (bidHistoryRef.current) {
      bidHistoryRef.current.scrollTop = 0;
    }
  }, [bidHistory]);

  // Sound effects
  const playBidSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const formatTimeLeft = (seconds: number) => {
    if (seconds <= 0) return 'Ended';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getTimeColor = (seconds: number) => {
    if (seconds <= 60) return 'text-red-600';
    if (seconds <= 300) return 'text-orange-600';
    return 'text-green-600';
  };

  const quickBidAmounts = [
    auction.minimumIncrement,
    auction.minimumIncrement * 2,
    auction.minimumIncrement * 5,
    auction.minimumIncrement * 10
  ];

  const handlePlaceBid = async () => {
    const amount = parseInt(bidAmount);
    if (amount >= auction.currentPrice + auction.minimumIncrement) {
      const success = await onPlaceBid(amount);
      if (success) {
        const newBid: RealtimeBid = {
          id: Date.now().toString(),
          amount: amount,
          timestamp: Date.now(),
          bidder: {
            id: 'me',
            name: 'You',
            isVerified: true
          },
          isMyBid: true,
          increment: amount - auction.currentPrice
        };

        setBidHistory(prev => [newBid, ...prev]);
        setBidAmount('');
        setMyPosition(1);
      }
    }
  };

  const handleAutoBid = () => {
    const maxAmount = parseInt(autoBidMax);
    if (maxAmount > auction.currentPrice) {
      onEnableAutoBid(maxAmount, autoBidIncrement);
      setAutoBidEnabled(true);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border">
      {/* Audio for sound effects */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/bid-placed.mp3" type="audio/mpeg" />
      </audio>

      {/* Auction Header */}
      <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{auction.title}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 hover:bg-purple-500 rounded-lg"
            >
              <SpeakerWaveIcon className={`h-5 w-5 ${soundEnabled ? '' : 'opacity-50'}`} />
            </button>
            {isParticipating ? (
              <button
                onClick={onLeaveAuction}
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium"
              >
                Leave Auction
              </button>
            ) : (
              <button
                onClick={onJoinAuction}
                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-medium"
              >
                Join Auction
              </button>
            )}
          </div>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">₹{auction.currentPrice.toLocaleString()}</div>
            <div className="text-purple-200 text-sm">Current Bid</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getTimeColor(auction.timeLeft)}`}>
              {formatTimeLeft(auction.timeLeft)}
            </div>
            <div className="text-purple-200 text-sm">Time Left</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.participants}</div>
            <div className="text-purple-200 text-sm">Participants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.totalBids}</div>
            <div className="text-purple-200 text-sm">Total Bids</div>
          </div>
        </div>

        {/* Reserve Price Indicator */}
        {auction.reservePrice && (
          <div className="mt-4 p-3 bg-purple-500 bg-opacity-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm">Reserve Price:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">₹{auction.reservePrice.toLocaleString()}</span>
                {auction.currentPrice >= auction.reservePrice ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-300" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-300" />
                )}
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-purple-400 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${Math.min(100, (auction.currentPrice / auction.reservePrice) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex h-96">
        {/* Left Panel - Bidding Interface */}
        <div className="flex-1 p-6 border-r">
          {/* My Position */}
          {myPosition && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <TrophyIcon className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">
                  You're in position #{myPosition}
                </span>
              </div>
            </div>
          )}

          {/* Auto-bid Status */}
          {autoBidEnabled && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BoltIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Auto-bid Active</span>
                </div>
                <span className="text-sm text-blue-600">Max: ₹{autoBidMax}</span>
              </div>
            </div>
          )}

          {/* Quick Bid Buttons */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Bid</label>
            <div className="grid grid-cols-2 gap-2">
              {quickBidAmounts.map(amount => (
                <button
                  key={amount}
                  onClick={() => setBidAmount((auction.currentPrice + amount).toString())}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center gap-1"
                >
                  <ArrowUpIcon className="h-3 w-3" />
                  +₹{amount}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Bid Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Place Bid</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <CurrencyRupeeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder={`Min: ₹${(auction.currentPrice + auction.minimumIncrement).toLocaleString()}`}
                  min={auction.currentPrice + auction.minimumIncrement}
                />
              </div>
              <button
                onClick={handlePlaceBid}
                disabled={!bidAmount || parseInt(bidAmount) < auction.currentPrice + auction.minimumIncrement || !isParticipating}
                className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Bid
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimum next bid: ₹{(auction.currentPrice + auction.minimumIncrement).toLocaleString()}
            </p>
          </div>

          {/* Auto-bid Configuration */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Auto-bid Settings</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Maximum Amount</label>
                <input
                  type="number"
                  value={autoBidMax}
                  onChange={(e) => setAutoBidMax(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Enter max amount"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Increment: ₹{autoBidIncrement}
                </label>
                <input
                  type="range"
                  min={auction.minimumIncrement}
                  max={auction.minimumIncrement * 10}
                  value={autoBidIncrement}
                  onChange={(e) => setAutoBidIncrement(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <button
                onClick={handleAutoBid}
                disabled={!autoBidMax || parseInt(autoBidMax) <= auction.currentPrice || autoBidEnabled}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BoltIcon className="h-4 w-4 inline mr-1" />
                {autoBidEnabled ? 'Auto-bid Active' : 'Enable Auto-bid'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Live Activity */}
        <div className="w-80 flex flex-col">
          {/* Activity Header */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Live Activity</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
            </div>
          </div>

          {/* Bid History */}
          <div 
            ref={bidHistoryRef}
            className="flex-1 overflow-y-auto p-4 space-y-2"
          >
            <AnimatePresence>
              {bidHistory.map((bid, index) => (
                <motion.div
                  key={bid.id}
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-3 rounded-lg border-l-4 ${
                    bid.isMyBid 
                      ? 'bg-purple-50 border-purple-500' 
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm ${
                        bid.isMyBid ? 'text-purple-700' : 'text-gray-700'
                      }`}>
                        {bid.bidder.name}
                      </span>
                      {bid.bidder.isVerified && (
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      )}
                      {bid.autoBid && (
                        <BoltIcon className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(bid.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">
                      ₹{bid.amount.toLocaleString()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      bid.increment > auction.minimumIncrement * 2
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      +₹{bid.increment}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-2">
              <button
                onClick={() => setShowBidHistory(!showBidHistory)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100"
              >
                <ChartBarIcon className="h-4 w-4 inline mr-1" />
                Stats
              </button>
              <button className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100">
                <ChatBubbleLeftRightIcon className="h-4 w-4 inline mr-1" />
                Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Extended Stats Modal */}
      <AnimatePresence>
        {showBidHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowBidHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Auction Statistics</h3>
                  <button
                    onClick={() => setShowBidHistory(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Detailed Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.averageBid.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Avg Bid</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.priceIncrease}%</div>
                    <div className="text-sm text-gray-600">Price Increase</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.bidsPerMinute}</div>
                    <div className="text-sm text-gray-600">Bids/Min</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">{Math.floor(stats.timeActive / 60)}m</div>
                    <div className="text-sm text-gray-600">Active Time</div>
                  </div>
                </div>

                {/* Price Chart Placeholder */}
                <div className="bg-gray-100 h-40 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-gray-500">Price History Chart</span>
                </div>

                {/* Full Bid History */}
                <div className="max-h-60 overflow-y-auto">
                  <h4 className="font-medium text-gray-900 mb-3">Complete Bid History</h4>
                  <div className="space-y-2">
                    {bidHistory.map((bid) => (
                      <div key={bid.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{bid.bidder.name}</span>
                          {bid.bidder.isVerified && <CheckCircleIcon className="h-4 w-4 text-green-500" />}
                        </div>
                        <div className="text-right">
                          <div className="font-bold">₹{bid.amount.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(bid.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RealtimeBiddingSystem;
