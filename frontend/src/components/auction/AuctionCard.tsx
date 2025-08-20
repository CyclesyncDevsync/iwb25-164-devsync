import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Heart, 
  Eye, 
  TrendingUp, 
  Gavel,
  MapPin,
  Users,
  AlertTriangle,
  Crown,
  Zap
} from 'lucide-react';
import { Auction, AuctionType } from '@/types/auction';
import { RootState, AppDispatch } from '@/store';
import { 
  setSelectedAuction, 
  setShowBidModal, 
  watchAuction, 
  unwatchAuction 
} from '@/store/slices/auctionSlice';
import { useAuctionWebSocket } from '@/services/auctionWebSocket';
import { formatCurrency, formatTimeRemaining, formatDate } from '@/utils/formatters';

interface AuctionCardProps {
  auction: Auction;
  size?: 'small' | 'medium' | 'large';
  showWatchButton?: boolean;
  showBidButton?: boolean;
  realTime?: boolean;
  className?: string;
}

const AuctionCard: React.FC<AuctionCardProps> = ({
  auction,
  size = 'medium',
  showWatchButton = true,
  showBidButton = true,
  realTime = true,
  className = '',
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { realTimeData, loading } = useSelector((state: RootState) => state.auctions);
  const webSocket = useAuctionWebSocket();
  
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpiring, setIsExpiring] = useState(false);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [showPriceAnimation, setShowPriceAnimation] = useState(false);

  // Get real-time data for this auction
  const realtimeAuction = realTimeData[auction.id];
  const currentPrice = realtimeAuction?.currentPrice ?? auction.currentPrice;
  const activeBidders = realtimeAuction?.activeBidders ?? 0;
  const lastBidTime = realtimeAuction?.lastBidTime;

  // Calculate time remaining
  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date().getTime();
      const end = new Date(auction.endTime).getTime();
      const remaining = Math.max(0, end - now);
      
      setTimeRemaining(remaining);
      setIsExpiring(remaining <= 300000); // 5 minutes
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [auction.endTime]);

  // Track price changes for animation
  useEffect(() => {
    if (realtimeAuction && auction.currentPrice !== realtimeAuction.currentPrice) {
      const change = realtimeAuction.currentPrice - auction.currentPrice;
      setPriceChange(change);
      setShowPriceAnimation(true);
      
      setTimeout(() => setShowPriceAnimation(false), 2000);
    }
  }, [realtimeAuction?.currentPrice, auction.currentPrice]);

  // Join auction room for real-time updates
  useEffect(() => {
    if (realTime && webSocket.isConnected) {
      webSocket.joinAuction(auction.id);
      return () => webSocket.leaveAuction(auction.id);
    }
  }, [realTime, webSocket.isConnected, auction.id]);

  const handleWatchToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (auction.isUserWatching) {
      dispatch(unwatchAuction(auction.id));
    } else {
      dispatch(watchAuction(auction.id));
    }
  }, [auction.id, auction.isUserWatching, dispatch]);

  const handleBidClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/auction/${auction.id}/bid`);
  }, [auction.id, router]);

  const handleCardClick = useCallback(() => {
    router.push(`/auction/${auction.id}`);
  }, [auction.id, router]);

  const getAuctionTypeIcon = (type: AuctionType) => {
    switch (type) {
      case 'dutch': return <TrendingUp className="w-4 h-4" />;
      case 'reserve': return <Crown className="w-4 h-4" />;
      case 'buy_it_now': return <Zap className="w-4 h-4" />;
      case 'bulk': return <Users className="w-4 h-4" />;
      default: return <Gavel className="w-4 h-4" />;
    }
  };

  const getAuctionTypeColor = (type: AuctionType) => {
    switch (type) {
      case 'dutch': return 'text-orange-600 bg-orange-100';
      case 'reserve': return 'text-purple-600 bg-purple-100';
      case 'buy_it_now': return 'text-green-600 bg-green-100';
      case 'bulk': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isEnded = auction.status === 'ended';
  const isActive = auction.status === 'active';
  const isUpcoming = auction.status === 'upcoming';

  const cardSizeClasses = {
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6',
  };

  const imageSizeClasses = {
    small: 'h-32',
    medium: 'h-40',
    large: 'h-48',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className={`
        bg-white rounded-xl shadow-lg border cursor-pointer transition-all duration-200
        hover:shadow-xl hover:border-blue-300
        ${isEnded ? 'opacity-75' : ''}
        ${isExpiring && isActive ? 'ring-2 ring-red-500 ring-opacity-50' : ''}
        ${className}
      `}
      onClick={handleCardClick}
    >
      <div className={cardSizeClasses[size]}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getAuctionTypeColor(auction.type)}`}>
              {getAuctionTypeIcon(auction.type)}
              <span className="capitalize">{auction.type.replace('_', ' ')}</span>
            </div>
            
            {auction.status === 'active' && isExpiring && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Ending Soon</span>
              </motion.div>
            )}
          </div>

          {showWatchButton && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWatchToggle}
              disabled={loading.watching}
              className={`
                p-2 rounded-full transition-colors duration-200
                ${auction.isUserWatching 
                  ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                  : 'text-gray-400 bg-gray-50 hover:bg-gray-100 hover:text-red-500'
                }
              `}
            >
              <Heart className={`w-4 h-4 ${auction.isUserWatching ? 'fill-current' : ''}`} />
            </motion.button>
          )}
        </div>

        {/* Image */}
        <div className={`relative rounded-lg overflow-hidden mb-3 ${imageSizeClasses[size]}`}>
          <img
            src={auction.images[0] || '/placeholder-auction.jpg'}
            alt={auction.title}
            className="w-full h-full object-cover"
          />
          
          {/* Live indicator */}
          {isActive && realTime && (
            <div className="absolute top-2 left-2 flex items-center space-x-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>LIVE</span>
            </div>
          )}

          {/* Buy It Now badge */}
          {auction.buyItNowPrice && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Buy Now: {formatCurrency(auction.buyItNowPrice)}
            </div>
          )}
        </div>

        {/* Title and location */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
            {auction.title}
          </h3>
          <div className="flex items-center text-xs text-gray-500">
            <MapPin className="w-3 h-3 mr-1" />
            <span>{auction.location}</span>
          </div>
        </div>

        {/* Price section */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">
                {auction.type === 'dutch' ? 'Current Price' : 'Current Bid'}
              </div>
              <div className="flex items-center space-x-2">
                <motion.span 
                  className="font-bold text-lg text-gray-900"
                  animate={showPriceAnimation ? { scale: [1, 1.2, 1], color: ['#111827', '#16a34a', '#111827'] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {formatCurrency(currentPrice)}
                </motion.span>
                
                {showPriceAnimation && priceChange > 0 && (
                  <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-green-600 text-sm font-medium"
                  >
                    +{formatCurrency(priceChange)}
                  </motion.span>
                )}
              </div>
            </div>

            {auction.reservePrice && currentPrice < auction.reservePrice && (
              <div className="text-right">
                <div className="text-xs text-gray-500">Reserve</div>
                <div className="text-sm font-medium text-orange-600">Not Met</div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Gavel className="w-3 h-3" />
              <span>{auction.totalBids} bids</span>
            </div>
            
            {realTime && activeBidders > 0 && (
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{activeBidders} watching</span>
              </div>
            )}
          </div>

          {lastBidTime && (
            <div className="text-xs text-gray-400">
              Last bid: {formatDate(lastBidTime, 'relative')}
            </div>
          )}
        </div>

        {/* Time remaining */}
        <div className="mb-4">
          {isActive ? (
            <div className={`text-center py-2 px-3 rounded-lg ${isExpiring ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
              <div className="flex items-center justify-center space-x-1">
                <Clock className="w-4 h-4" />
                <span className="font-medium">
                  {timeRemaining > 0 ? formatTimeRemaining(timeRemaining) : 'Auction Ended'}
                </span>
              </div>
            </div>
          ) : isUpcoming ? (
            <div className="text-center py-2 px-3 rounded-lg bg-gray-50 text-gray-700">
              <div className="flex items-center justify-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Starts {formatDate(auction.startTime, 'relative')}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-2 px-3 rounded-lg bg-green-50 text-green-700">
              <div className="flex items-center justify-center space-x-1">
                <Crown className="w-4 h-4" />
                <span>Auction Ended</span>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {(showBidButton && isActive) && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBidClick}
            disabled={loading.placingBid}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            {loading.placingBid ? 'Placing Bid...' : 'Place Bid'}
          </motion.button>
        )}

        {auction.buyItNowPrice && isActive && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              // Handle Buy It Now
            }}
            className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Buy Now - {formatCurrency(auction.buyItNowPrice)}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default AuctionCard;
