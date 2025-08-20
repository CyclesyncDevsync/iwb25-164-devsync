import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
  
  // Use refs to track previous values and prevent unnecessary re-renders
  const prevPriceRef = useRef<number>(auction.currentPrice);
  const hasJoinedAuctionRef = useRef<boolean>(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize real-time data to prevent re-calculations on every render
  const realtimeAuction = useMemo(() => realTimeData[auction.id], [realTimeData, auction.id]);
  const currentPrice = useMemo(() => realtimeAuction?.currentPrice ?? auction.currentPrice, [realtimeAuction?.currentPrice, auction.currentPrice]);
  const activeBidders = useMemo(() => realtimeAuction?.activeBidders ?? 0, [realtimeAuction?.activeBidders]);
  const lastBidTime = useMemo(() => realtimeAuction?.lastBidTime, [realtimeAuction?.lastBidTime]);

  // Memoize status checks to prevent recalculations
  const isEnded = useMemo(() => auction.status === 'ended', [auction.status]);
  const isActive = useMemo(() => auction.status === 'active', [auction.status]);
  const isUpcoming = useMemo(() => auction.status === 'upcoming', [auction.status]);

  // Calculate time remaining - optimized to prevent unnecessary re-renders
  useEffect(() => {
    // Only calculate time remaining for active auctions
    if (!isActive) {
      setTimeRemaining(0);
      setIsExpiring(false);
      return;
    }

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
  }, [auction.endTime, isActive]);

  // Track price changes for animation - optimized to prevent continuous triggers
  useEffect(() => {
    const newPrice = realtimeAuction?.currentPrice ?? auction.currentPrice;
    const prevPrice = prevPriceRef.current;
    
    if (newPrice !== prevPrice) {
      const change = newPrice - prevPrice;
      setPriceChange(change);
      setShowPriceAnimation(true);
      
      // Clear previous timeout
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      
      // Set new timeout
      animationTimeoutRef.current = setTimeout(() => {
        setShowPriceAnimation(false);
        animationTimeoutRef.current = null;
      }, 2000);
      
      // Update the previous price reference
      prevPriceRef.current = newPrice;
    }
  }, [realtimeAuction?.currentPrice, auction.currentPrice]);

  // Cleanup animation timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Join auction room for real-time updates - optimized to prevent duplicate joins
  useEffect(() => {
    if (realTime && webSocket.isConnected && !hasJoinedAuctionRef.current) {
      webSocket.joinAuction(auction.id);
      hasJoinedAuctionRef.current = true;
      
      return () => {
        webSocket.leaveAuction(auction.id);
        hasJoinedAuctionRef.current = false;
      };
    }
  }, [realTime, webSocket.isConnected, auction.id]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // Intentionally excluding webSocket from dependencies to prevent infinite re-renders

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
      whileHover={{ 
        y: -4,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        borderColor: "#93c5fd"
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      className={`
        bg-white rounded-xl shadow-lg border cursor-pointer transition-all duration-300
        hover:shadow-xl
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
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getAuctionTypeColor(auction.type)}`}
            >
              <motion.div
                animate={auction.type === 'dutch' ? { rotate: [0, -10, 0, 10, 0] } : {}}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                {getAuctionTypeIcon(auction.type)}
              </motion.div>
              <span className="capitalize">{auction.type.replace('_', ' ')}</span>
            </motion.div>
            
            {auction.status === 'active' && isExpiring && (
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  backgroundColor: ["#fee2e2", "#fecaca", "#fee2e2"]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5,
                  ease: "easeInOut"
                }}
                className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium"
              >
                <motion.div
                  animate={{ rotate: [-5, 5, -5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <AlertTriangle className="w-3 h-3" />
                </motion.div>
                <span>Ending Soon</span>
              </motion.div>
            )}
          </div>

          {showWatchButton && (
            <motion.button
              whileHover={{ 
                scale: 1.1,
                backgroundColor: auction.isUserWatching ? '#fecaca' : '#f3f4f6'
              }}
              whileTap={{ scale: 0.9 }}
              initial={{ 
                boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)" 
              }}
              animate={auction.isUserWatching ? {
                scale: [1, 1.1, 1],
                transition: { duration: 0.3 }
              } : {}}
              onClick={handleWatchToggle}
              disabled={loading.watching}
              className={`
                p-2 rounded-full transition-all duration-300
                ${auction.isUserWatching 
                  ? 'text-red-500 bg-red-50' 
                  : 'text-gray-400 bg-gray-50 hover:text-red-500'
                }
              `}
            >
              <motion.div
                animate={auction.isUserWatching ? {
                  scale: [1, 1.3, 1],
                } : {}}
                transition={{ 
                  repeat: auction.isUserWatching ? 1 : 0,
                  duration: 0.5,
                  ease: "easeInOut"
                }}
              >
                <Heart className={`w-4 h-4 ${auction.isUserWatching ? 'fill-current' : ''}`} />
              </motion.div>
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
            <motion.div 
              className="absolute top-2 left-2 flex items-center space-x-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium"
              animate={{ 
                boxShadow: ["0 0 0px rgba(239, 68, 68, 0.2)", "0 0 8px rgba(239, 68, 68, 0.6)", "0 0 0px rgba(239, 68, 68, 0.2)"]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2,
                ease: "easeInOut"
              }}
            >
              <motion.div 
                className="w-2 h-2 bg-white rounded-full"
                animate={{ 
                  opacity: [1, 0.4, 1],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5,
                  ease: "easeInOut"
                }}
              />
              <span>LIVE</span>
            </motion.div>
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
                  animate={showPriceAnimation ? { 
                    scale: [1, 1.2, 1], 
                    color: ['#111827', '#16a34a', '#111827'] 
                  } : {}}
                  transition={{ 
                    duration: 0.8,
                    ease: "easeInOut"
                  }}
                >
                  {formatCurrency(currentPrice)}
                </motion.span>
                
                <AnimatePresence>
                  {showPriceAnimation && priceChange > 0 && (
                    <motion.span
                      key={`price-change-${currentPrice}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="text-green-600 text-sm font-medium"
                    >
                      +{formatCurrency(priceChange)}
                    </motion.span>
                  )}
                </AnimatePresence>
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
            <motion.div 
              className={`text-center py-2 px-3 rounded-lg ${isExpiring ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}
              animate={isExpiring ? { 
                backgroundColor: ["#fee2e2", "#fef2f2", "#fee2e2"],
                transition: { repeat: Infinity, duration: 2 }
              } : {}}
            >
              <div className="flex items-center justify-center space-x-1">
                <motion.div
                  animate={isExpiring ? { 
                    rotate: [-5, 0, 5, 0, -5],
                    scale: [1, 1.1, 1, 1.1, 1],
                    transition: { repeat: Infinity, duration: 1.5 }
                  } : {}}
                >
                  <Clock className="w-4 h-4" />
                </motion.div>
                <motion.span 
                  className="font-medium"
                  animate={isExpiring ? {
                    opacity: [1, 0.8, 1],
                    scale: [1, 1.02, 1],
                    transition: { repeat: Infinity, duration: 1.5 }
                  } : {}}
                >
                  {timeRemaining > 0 ? formatTimeRemaining(timeRemaining) : 'Auction Ended'}
                </motion.span>
              </div>
            </motion.div>
          ) : isUpcoming ? (
            <motion.div 
              className="text-center py-2 px-3 rounded-lg bg-gray-50 text-gray-700"
              whileHover={{ backgroundColor: "#f3f4f6" }}
            >
              <div className="flex items-center justify-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Starts {formatDate(auction.startTime, 'relative')}</span>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-2 px-3 rounded-lg bg-green-50 text-green-700"
              whileHover={{ backgroundColor: "#dcfce7" }}
            >
              <div className="flex items-center justify-center space-x-1">
                <motion.div 
                  initial={{ y: -5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <Crown className="w-4 h-4" />
                </motion.div>
                <span>Auction Ended</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Action buttons */}
        {(showBidButton && isActive) && (
          <motion.button
            whileHover={{ 
              scale: 1.03,
              backgroundColor: "#2563eb"
            }}
            whileTap={{ scale: 0.97 }}
            initial={{ boxShadow: "0px 0px 0px rgba(37, 99, 235, 0)" }}
            animate={isActive ? {
              boxShadow: ["0px 0px 0px rgba(37, 99, 235, 0)", "0px 0px 8px rgba(37, 99, 235, 0.5)", "0px 0px 0px rgba(37, 99, 235, 0)"],
            } : {}}
            transition={{
              boxShadow: { repeat: Infinity, duration: 2 },
              backgroundColor: { duration: 0.2 },
              scale: { type: "spring", stiffness: 400, damping: 10 }
            }}
            onClick={handleBidClick}
            disabled={loading.placingBid}
            className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading.placingBid ? 'Placing Bid...' : 'Place Bid'}
          </motion.button>
        )}

        {auction.buyItNowPrice && isActive && (
          <motion.button
            whileHover={{ 
              scale: 1.03,
              backgroundColor: "#16a34a"  
            }}
            whileTap={{ scale: 0.97 }}
            transition={{
              scale: { type: "spring", stiffness: 400, damping: 10 },
              backgroundColor: { duration: 0.2 }
            }}
            onClick={(e) => {
              e.stopPropagation();
              // Handle Buy It Now
            }}
            className="w-full mt-2 bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
          >
            Buy Now - {formatCurrency(auction.buyItNowPrice)}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(AuctionCard, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.auction.id === nextProps.auction.id &&
    prevProps.auction.currentPrice === nextProps.auction.currentPrice &&
    prevProps.auction.totalBids === nextProps.auction.totalBids &&
    prevProps.auction.status === nextProps.auction.status &&
    prevProps.auction.isUserWatching === nextProps.auction.isUserWatching &&
    prevProps.size === nextProps.size &&
    prevProps.showWatchButton === nextProps.showWatchButton &&
    prevProps.showBidButton === nextProps.showBidButton &&
    prevProps.realTime === nextProps.realTime &&
    prevProps.className === nextProps.className
  );
});
