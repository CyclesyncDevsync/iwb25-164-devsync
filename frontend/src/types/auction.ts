// Auction Types
export type AuctionType = 'standard' | 'buy_it_now' | 'reserve' | 'dutch' | 'bulk';
export type AuctionStatus = 'upcoming' | 'active' | 'paused' | 'ended' | 'cancelled';
export type BidStatus = 'pending' | 'accepted' | 'outbid' | 'winning' | 'lost';

// Base Auction Interface
export interface Auction {
  id: string;
  title: string;
  description: string;
  type: AuctionType;
  status: AuctionStatus;
  materialId: string;
  materialName: string;
  materialCategory: string;
  quantity: number;
  unit: string;
  location: string;
  images: string[];
  
  // Pricing
  startingPrice: number;
  currentPrice: number;
  reservePrice?: number;
  buyItNowPrice?: number;
  incrementAmount: number;
  
  // Timing
  startTime: Date;
  endTime: Date;
  timeExtension?: number; // minutes to extend on last-minute bids
  
  // Participation
  totalBids: number;
  totalBidders: number;
  winningBidderId?: string;
  isUserWatching?: boolean;
  isUserBidding?: boolean;
  userHighestBid?: number;
  
  // Additional data
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// Bid Interface
export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderName?: string; // Anonymous by default
  amount: number;
  timestamp: Date;
  status: BidStatus;
  isAutomatic?: boolean;
}

// Dutch Auction specific
export interface DutchAuction extends Auction {
  type: 'dutch';
  decrementAmount: number;
  decrementInterval: number; // minutes
  minimumPrice: number;
}

// Bulk Auction specific
export interface BulkAuction extends Auction {
  type: 'bulk';
  minQuantityPerBid: number;
  maxQuantityPerBid: number;
  bulkDiscountPercentage?: number;
}

// Real-time Auction State
export interface AuctionRealTimeState {
  auctionId: string;
  currentPrice: number;
  lastBidTime?: Date;
  timeRemaining: number;
  activeBidders: number;
  recentBids: Bid[];
  priceHistory: PricePoint[];
  isExtended?: boolean;
}

// Price Point for charts
export interface PricePoint {
  timestamp: Date;
  price: number;
  bidCount: number;
}

// Bidding Interfaces
export interface BidRequest {
  auctionId: string;
  amount: number;
  maxAmount?: number; // For automatic bidding
}

export interface AutoBidSettings {
  enabled: boolean;
  maxAmount: number;
  incrementType: 'minimum' | 'custom';
  customIncrement?: number;
}

// Auction Creation/Management
export interface CreateAuctionRequest {
  title: string;
  description: string;
  type: AuctionType;
  materialId: string;
  quantity: number;
  unit: string;
  startingPrice: number;
  reservePrice?: number;
  buyItNowPrice?: number;
  incrementAmount: number;
  startTime: Date;
  endTime: Date;
  timeExtension?: number;
  
  // Dutch auction specific
  decrementAmount?: number;
  decrementInterval?: number;
  minimumPrice?: number;
  
  // Bulk auction specific
  minQuantityPerBid?: number;
  maxQuantityPerBid?: number;
  bulkDiscountPercentage?: number;
}

// Auction Analytics
export interface AuctionAnalytics {
  auctionId: string;
  totalViews: number;
  totalWatchers: number;
  totalBids: number;
  uniqueBidders: number;
  averageBidAmount: number;
  highestBid: number;
  priceAppreciation: number;
  bidFrequency: number; // bids per hour
  peakBiddingTime: Date;
  geographicDistribution: { [country: string]: number };
  deviceDistribution: { mobile: number; desktop: number; tablet: number };
}

// Auction Search/Filter
export interface AuctionFilters {
  type?: AuctionType[];
  category?: string[];
  location?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  status?: AuctionStatus[];
  endingIn?: number; // hours
  sortBy?: 'ending_soon' | 'price_low' | 'price_high' | 'newest' | 'most_bids';
  searchQuery?: string;
}

// WebSocket Event Types
export interface AuctionWebSocketEvents {
  // Incoming events
  'auction:updated': AuctionRealTimeState;
  'auction:bid_placed': Bid;
  'auction:time_extended': { auctionId: string; newEndTime: Date };
  'auction:ended': { auctionId: string; winnerId?: string; finalPrice: number };
  'auction:price_updated': { auctionId: string; newPrice: number; timestamp: Date };
  
  // Outgoing events
  'auction:join': { auctionId: string };
  'auction:leave': { auctionId: string };
  'auction:place_bid': BidRequest;
  'auction:watch': { auctionId: string };
  'auction:unwatch': { auctionId: string };
}

// Auction List Response
export interface AuctionListResponse {
  auctions: Auction[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Auction Detail Response
export interface AuctionDetailResponse extends Auction {
  bids: Bid[];
  analytics: AuctionAnalytics;
  similarAuctions: Auction[];
}
