import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Gavel,
  Eye,
  AlertTriangle,
  Zap,
  Crown,
  Package
} from 'lucide-react';
import { RootState, AppDispatch } from '@/store';
import { fetchAuctions, updateAuctionRealTime, addNewBid } from '@/store/slices/auctionSlice';
import { selectAuctions } from '@/store/slices/auctionSlice';
import { formatCurrency, formatTimeRemaining, formatDate } from '@/utils/formatters';
import { Auction, AuctionRealTimeState, Bid } from '@/types/auction';
import AuctionCard from './AuctionCard';

interface LiveAuctionDashboardProps {
  className?: string;
}

const LiveAuctionDashboard: React.FC<LiveAuctionDashboardProps> = ({ className = '' }) => {
  const dispatch = useDispatch<AppDispatch>();
  const auctions = useSelector(selectAuctions);
  const { realTimeData, loading } = useSelector((state: RootState) => state.auctions);
  
  // Mock WebSocket for now
  const webSocket: {
    isConnected: boolean;
    joinAuction: (id: string) => void;
    leaveAuction: (id: string) => void;
    onAuctionUpdated: (cb: (data: AuctionRealTimeState) => void) => void;
    onBidPlaced: (cb: (bid: Bid) => void) => void;
  } = {
    isConnected: false,
    joinAuction: (id: string) => {},
    leaveAuction: (id: string) => {},
    onAuctionUpdated: (cb: (data: AuctionRealTimeState) => void) => {},
    onBidPlaced: (cb: (bid: Bid) => void) => {},
  };
  
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [liveStats, setLiveStats] = useState({
    activeBidders: 0,
    totalBidsLastHour: 0,
    highestBidToday: 0,
    endingSoonCount: 0
  });
  
  // Use refs to prevent infinite re-renders
  const hasSetupWebSocketRef = useRef<boolean>(false);
  const statsUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize active auctions to prevent infinite re-renders
  const activeAuctions = useMemo(() => 
    auctions.filter(auction => auction.status === 'active'), 
    [auctions]
  );
  
  const endingSoonAuctions = useMemo(() => 
    activeAuctions.filter(auction => {
      const timeRemaining = new Date(auction.endTime).getTime() - new Date().getTime();
      return timeRemaining <= 300000 && timeRemaining > 0; // 5 minutes
    }), 
    [activeAuctions]
  );

  // Set up WebSocket connections for all active auctions - optimized
  useEffect(() => {
    if (webSocket.isConnected && activeAuctions.length > 0 && !hasSetupWebSocketRef.current) {
      // Join all active auction rooms
      activeAuctions.forEach(auction => {
        webSocket.joinAuction(auction.id);
      });

      // Set up event listeners
      const handleAuctionUpdate = (data: AuctionRealTimeState) => {
        dispatch(updateAuctionRealTime(data));
        
        // Update live stats
        setLiveStats(prev => ({
          ...prev,
          activeBidders: prev.activeBidders + (data.activeBidders || 0)
        }));
      };

      const handleNewBid = (bid: Bid) => {
        dispatch(addNewBid(bid));
        
        // Add to recent activity
        setRecentActivity(prev => [{
          id: `bid-${bid.id}`,
          type: 'bid',
          auctionId: bid.auctionId,
          amount: bid.amount,
          timestamp: bid.timestamp,
          bidderName: bid.bidderName || 'Anonymous'
        }, ...prev].slice(0, 20));
        
        // Update stats
        setLiveStats(prev => ({
          ...prev,
          totalBidsLastHour: prev.totalBidsLastHour + 1,
          highestBidToday: Math.max(prev.highestBidToday, bid.amount)
        }));
      };

      webSocket.onAuctionUpdated(handleAuctionUpdate);
      webSocket.onBidPlaced(handleNewBid);
      
      hasSetupWebSocketRef.current = true;

      return () => {
        activeAuctions.forEach(auction => {
          webSocket.leaveAuction(auction.id);
        });
        hasSetupWebSocketRef.current = false;
      };
    }
  }, [webSocket.isConnected, activeAuctions.length, dispatch]); // Optimized: using length instead of full array
  
  // Disable exhaustive-deps warning for this specific case as we intentionally want to prevent
  // infinite re-renders that would occur if we included the full activeAuctions array
  // eslint-disable-next-line react-hooks/exhaustive-deps

  // Load initial data
  useEffect(() => {
    dispatch(fetchAuctions({ 
      page: 1, 
      limit: 50, 
      filters: { status: ['active'], sortBy: 'ending_soon' } 
    }));
  }, [dispatch]);

  // Update stats periodically - optimized with proper cleanup
  const updateEndingSoonCount = useCallback(() => {
    const endingSoon = activeAuctions.filter(auction => {
      const timeRemaining = new Date(auction.endTime).getTime() - new Date().getTime();
      return timeRemaining <= 300000 && timeRemaining > 0;
    }).length;

    setLiveStats(prev => ({
      ...prev,
      endingSoonCount: endingSoon
    }));
  }, [activeAuctions]);

  useEffect(() => {
    // Clear previous interval
    if (statsUpdateIntervalRef.current) {
      clearInterval(statsUpdateIntervalRef.current);
    }
    
    // Set new interval
    statsUpdateIntervalRef.current = setInterval(updateEndingSoonCount, 10000); // Update every 10 seconds
    
    return () => {
      if (statsUpdateIntervalRef.current) {
        clearInterval(statsUpdateIntervalRef.current);
      }
    };
  }, [updateEndingSoonCount]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: string;
  }> = ({ title, value, icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-xs text-green-600 mt-1">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  const ActivityFeed: React.FC = React.memo(() => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Live Activity</h3>
        <div className="flex items-center space-x-1 text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm">Live</span>
        </div>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {recentActivity.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Gavel className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.bidderName}</span>
                  {' '}placed a bid of{' '}
                  <span className="font-bold text-green-600">
                    {formatCurrency(activity.amount)}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(activity.timestamp, 'relative')}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {recentActivity.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  ));

  const EndingSoonSection: React.FC = React.memo(() => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Ending Soon</h3>
        {endingSoonAuctions.length > 0 && (
          <div className="flex items-center space-x-1 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{endingSoonAuctions.length} urgent</span>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {endingSoonAuctions.slice(0, 5).map((auction) => {
          const timeRemaining = new Date(auction.endTime).getTime() - new Date().getTime();
          const realtimeData = realTimeData[auction.id];
          
          return (
            <motion.div
              key={auction.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between p-3 border border-red-200 bg-red-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={auction.images[0] || '/placeholder-auction.jpg'}
                  alt={auction.title}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {auction.title}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatCurrency(realtimeData?.currentPrice || auction.currentPrice)}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-bold text-red-600">
                  {formatTimeRemaining(timeRemaining)}
                </p>
                <p className="text-xs text-gray-500">
                  {auction.totalBids} bids
                </p>
              </div>
            </motion.div>
          );
        })}
        
        {endingSoonAuctions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No auctions ending soon</p>
          </div>
        )}
      </div>
    </div>
  ));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Auction Dashboard</h1>
          <p className="text-gray-600">Real-time auction monitoring and activity</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">
              {webSocket.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Auctions"
          value={activeAuctions.length}
          icon={<Gavel className="w-6 h-6 text-blue-600" />}
          color="bg-blue-100"
        />
        
        <StatCard
          title="Live Bidders"
          value={liveStats.activeBidders}
          icon={<Users className="w-6 h-6 text-green-600" />}
          color="bg-green-100"
        />
        
        <StatCard
          title="Highest Bid Today"
          value={formatCurrency(liveStats.highestBidToday)}
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
          color="bg-purple-100"
        />
        
        <StatCard
          title="Ending Soon"
          value={liveStats.endingSoonCount}
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
          color="bg-red-100"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Auctions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Active Auctions ({activeAuctions.length})
            </h3>
            
            {loading.auctions ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading auctions...</p>
              </div>
            ) : activeAuctions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeAuctions.slice(0, 6).map((auction) => (
                  <AuctionCard
                    key={auction.id}
                    auction={auction}
                    size="small"
                    realTime={true}
                    showWatchButton={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Gavel className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Auctions</h4>
                <p>There are currently no active auctions to monitor.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <EndingSoonSection />
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
};

export default LiveAuctionDashboard;
