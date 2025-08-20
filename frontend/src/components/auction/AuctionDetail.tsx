import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Heart, 
  Eye, 
  Share2, 
  Gavel,
  MapPin,
  User,
  Star,
  TrendingUp,
  AlertTriangle,
  Crown,
  Zap,
  Info,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Calendar,
  Package,
  DollarSign
} from 'lucide-react';
import { RootState, AppDispatch } from '@/store';
import { 
  fetchAuctionDetails,
  setShowBidModal,
  watchAuction,
  unwatchAuction,
  clearAuctionDetails,
  updateAuctionRealTime,
  addNewBid
} from '@/store/slices/auctionSlice';
import { useAuctionWebSocket } from '@/services/auctionWebSocket';
import { formatCurrency, formatTimeRemaining, formatDate } from '@/utils/formatters';
import AuctionCard from './AuctionCard';
import BidModal from './BidModal';
import { Bid } from '@/types/auction';

interface AuctionDetailProps {
  auctionId: string;
}

const AuctionDetail: React.FC<AuctionDetailProps> = ({ auctionId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { 
    currentAuction, 
    realTimeData, 
    loading, 
    error,
    showBidModal 
  } = useSelector((state: RootState) => state.auctions);
  
  const webSocket = useAuctionWebSocket();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeTab, setActiveTab] = useState<'bids' | 'info' | 'similar'>('bids');

  // Get real-time data for this auction
  const realtimeData = realTimeData[auctionId];
  const currentPrice = realtimeData?.currentPrice ?? currentAuction?.currentPrice ?? 0;
  const activeBidders = realtimeData?.activeBidders ?? 0;
  const recentBids = realtimeData?.recentBids ?? currentAuction?.bids ?? [];

  // Load auction details on mount
  useEffect(() => {
    dispatch(fetchAuctionDetails(auctionId));
    
    return () => {
      dispatch(clearAuctionDetails());
    };
  }, [dispatch, auctionId]);

  // Connect to real-time updates
  useEffect(() => {
    if (webSocket.isConnected && auctionId) {
      webSocket.joinAuction(auctionId);
      
      // Set up real-time event listeners
      const handleAuctionUpdate = (data: any) => {
        if (data.auctionId === auctionId) {
          dispatch(updateAuctionRealTime(data));
        }
      };
      
      const handleNewBid = (bid: Bid) => {
        if (bid.auctionId === auctionId) {
          dispatch(addNewBid(bid));
        }
      };
      
      webSocket.onAuctionUpdated(handleAuctionUpdate);
      webSocket.onBidPlaced(handleNewBid);
      
      return () => {
        webSocket.leaveAuction(auctionId);
      };
    }
  }, [webSocket.isConnected, auctionId, dispatch]);

  // Calculate time remaining
  useEffect(() => {
    if (!currentAuction) return;
    
    const updateTimeRemaining = () => {
      const now = new Date().getTime();
      const end = new Date(currentAuction.endTime).getTime();
      const remaining = Math.max(0, end - now);
      setTimeRemaining(remaining);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [currentAuction?.endTime]);

  // Handle watch toggle
  const handleWatchToggle = useCallback(() => {
    if (!currentAuction) return;
    
    if (currentAuction.isUserWatching) {
      dispatch(unwatchAuction(currentAuction.id));
    } else {
      dispatch(watchAuction(currentAuction.id));
    }
  }, [currentAuction, dispatch]);

  // Handle bid button click
  const handleBidClick = useCallback(() => {
    dispatch(setShowBidModal(true));
  }, [dispatch]);

  // Handle image navigation
  const handlePrevImage = useCallback(() => {
    if (!currentAuction?.images.length) return;
    setCurrentImageIndex(prev => 
      prev === 0 ? currentAuction.images.length - 1 : prev - 1
    );
  }, [currentAuction?.images.length]);

  const handleNextImage = useCallback(() => {
    if (!currentAuction?.images.length) return;
    setCurrentImageIndex(prev => 
      prev === currentAuction.images.length - 1 ? 0 : prev + 1
    );
  }, [currentAuction?.images.length]);

  // Handle share
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentAuction?.title,
          text: `Check out this auction: ${currentAuction?.title}`,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }, [currentAuction?.title]);

  if (loading.auctionDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading auction details...</p>
        </div>
      </div>
    );
  }

  if (error.auctionDetails || !currentAuction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Auction Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error.auctionDetails || 'The auction you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <button
            onClick={() => router.push('/auction')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Auctions
          </button>
        </div>
      </div>
    );
  }

  const isActive = currentAuction.status === 'active';
  const isEnded = currentAuction.status === 'ended';
  const isUpcoming = currentAuction.status === 'upcoming';
  const isExpiringSoon = timeRemaining > 0 && timeRemaining <= 300000; // 5 minutes
  const hasReservePriceBeenMet = !currentAuction.reservePrice || currentPrice >= currentAuction.reservePrice;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to auctions</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Images and details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative aspect-video">
                {currentAuction.images.length > 0 ? (
                  <>
                    <img
                      src={currentAuction.images[currentImageIndex]}
                      alt={currentAuction.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Image navigation */}
                    {currentAuction.images.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        
                        {/* Image indicators */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {currentAuction.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Live indicator */}
                    {isActive && (
                      <div className="absolute top-4 left-4 flex items-center space-x-1 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span>LIVE</span>
                      </div>
                    )}

                    {/* Auction type badge */}
                    <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
                      {currentAuction.type.replace('_', ' ')}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {currentAuction.images.length > 1 && (
                <div className="p-4 flex space-x-2 overflow-x-auto">
                  {currentAuction.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-blue-500' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${currentAuction.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auction details tabs */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="border-b border-gray-200">
                <div className="flex space-x-8 px-6">
                  {[
                    { id: 'info', label: 'Details', icon: Info },
                    { id: 'bids', label: 'Bid History', icon: Gavel },
                    { id: 'similar', label: 'Similar', icon: TrendingUp },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`
                        flex items-center space-x-2 py-4 border-b-2 transition-colors duration-200
                        ${activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                        }
                      `}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                      <div className={`text-gray-700 ${!showFullDescription ? 'line-clamp-3' : ''}`}>
                        {currentAuction.description}
                      </div>
                      {currentAuction.description.length > 200 && (
                        <button
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          {showFullDescription ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Item Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Category:</span>
                            <span className="text-gray-900">{currentAuction.materialCategory}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Quantity:</span>
                            <span className="text-gray-900">{currentAuction.quantity} {currentAuction.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Location:</span>
                            <span className="text-gray-900">{currentAuction.location}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Auction Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Start Time:</span>
                            <span className="text-gray-900">{formatDate(currentAuction.startTime, 'long')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">End Time:</span>
                            <span className="text-gray-900">{formatDate(currentAuction.endTime, 'long')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Starting Price:</span>
                            <span className="text-gray-900">{formatCurrency(currentAuction.startingPrice)}</span>
                          </div>
                          {currentAuction.reservePrice && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Reserve Price:</span>
                              <span className={hasReservePriceBeenMet ? 'text-green-600' : 'text-orange-600'}>
                                {formatCurrency(currentAuction.reservePrice)}
                                {hasReservePriceBeenMet ? ' (Met)' : ' (Not Met)'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Seller info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Seller Information</h4>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{currentAuction.sellerName}</div>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Star className="w-4 h-4 fill-current text-yellow-400" />
                            <span>{currentAuction.sellerRating.toFixed(1)} rating</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'bids' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Bid History ({recentBids.length})
                      </h3>
                      {activeBidders > 0 && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Eye className="w-4 h-4" />
                          <span>{activeBidders} bidders watching</span>
                        </div>
                      )}
                    </div>

                    {recentBids.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No bids yet. Be the first to bid!
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {recentBids.map((bid, index) => (
                          <motion.div
                            key={bid.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`
                              flex items-center justify-between p-3 rounded-lg border
                              ${index === 0 ? 'border-green-200 bg-green-50' : 'border-gray-200'}
                            `}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {bid.bidderName || 'Anonymous Bidder'}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {formatDate(bid.timestamp, 'relative')}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg text-gray-900">
                                {formatCurrency(bid.amount)}
                              </div>
                              {index === 0 && (
                                <div className="text-sm text-green-600">Winning bid</div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'similar' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Similar Auctions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentAuction.similarAuctions?.map(auction => (
                        <AuctionCard
                          key={auction.id}
                          auction={auction}
                          size="small"
                          realTime={false}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column - Bidding panel */}
          <div className="space-y-6">
            {/* Auction status card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-gray-900 mb-2">{currentAuction.title}</h1>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{currentAuction.location}</span>
                </div>
              </div>

              {/* Current price */}
              <div className="text-center mb-6">
                <div className="text-sm text-gray-600 mb-1">
                  {currentAuction.type === 'dutch' ? 'Current Price' : 'Current Bid'}
                </div>
                <motion.div
                  className="text-3xl font-bold text-gray-900"
                  animate={realtimeData ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {formatCurrency(currentPrice)}
                </motion.div>
                
                {!hasReservePriceBeenMet && currentAuction.reservePrice && (
                  <div className="text-sm text-orange-600 mt-1">
                    Reserve not met ({formatCurrency(currentAuction.reservePrice)})
                  </div>
                )}
              </div>

              {/* Time remaining */}
              <div className="mb-6">
                {isActive ? (
                  <div className={`text-center py-3 px-4 rounded-lg ${isExpiringSoon ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Time Remaining</span>
                    </div>
                    <div className="text-lg font-bold">
                      {timeRemaining > 0 ? formatTimeRemaining(timeRemaining) : 'Auction Ended'}
                    </div>
                  </div>
                ) : isUpcoming ? (
                  <div className="text-center py-3 px-4 rounded-lg bg-gray-50 text-gray-700">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>Starts</span>
                    </div>
                    <div className="font-medium">{formatDate(currentAuction.startTime, 'relative')}</div>
                  </div>
                ) : (
                  <div className="text-center py-3 px-4 rounded-lg bg-green-50 text-green-700">
                    <div className="flex items-center justify-center space-x-1">
                      <Crown className="w-4 h-4" />
                      <span className="font-medium">Auction Ended</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                {isActive && (
                  <button
                    onClick={handleBidClick}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Gavel className="w-4 h-4" />
                    <span>Place Bid</span>
                  </button>
                )}

                {currentAuction.buyItNowPrice && isActive && (
                  <button
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Buy Now - {formatCurrency(currentAuction.buyItNowPrice)}</span>
                  </button>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={handleWatchToggle}
                    className={`
                      flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg border transition-colors duration-200
                      ${currentAuction.isUserWatching
                        ? 'border-red-500 text-red-600 bg-red-50 hover:bg-red-100'
                        : 'border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-600'
                      }
                    `}
                  >
                    <Heart className={`w-4 h-4 ${currentAuction.isUserWatching ? 'fill-current' : ''}`} />
                    <span>{currentAuction.isUserWatching ? 'Watching' : 'Watch'}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center p-2 border border-gray-300 text-gray-700 hover:border-blue-300 hover:text-blue-600 rounded-lg transition-colors duration-200"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Auction stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{currentAuction.totalBids}</div>
                    <div className="text-sm text-gray-600">Bids</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{currentAuction.totalBidders}</div>
                    <div className="text-sm text-gray-600">Bidders</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      <BidModal
        isOpen={showBidModal}
        onClose={() => dispatch(setShowBidModal(false))}
      />
    </div>
  );
};

export default AuctionDetail;
