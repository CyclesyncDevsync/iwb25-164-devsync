// Copyright (c) 2025 CircularSync
// Auction Service for frontend

import { Auction } from '@/types/auction';

const AUCTION_API_URL = process.env.NEXT_PUBLIC_AUCTION_API_URL || 'http://localhost:8096/api/auction';

export interface BackendAuction {
  auction_id: string;
  title: string;
  description: string;
  category: string;
  sub_category: string | null;
  quantity: number;
  unit: string;
  starting_price: number;
  current_price: number;
  reserve_price?: number;
  status: string;
  start_time: string;
  end_time: string;
  bid_count: number;
  location: string;
  photos: string[] | null;
  supplier_id: number;
}

export interface AuctionServiceResponse {
  status: string;
  data: BackendAuction[];
  count: number;
}

export interface AuctionDetailResponse {
  status: string;
  data: {
    auction: BackendAuction;
    recentBids: Array<{
      bid_id: string;
      bidder_id: number;
      bid_amount: number;
      created_at: string;
    }>;
  };
}

class AuctionService {
  // Initialize auction system database
  async initializeSystem(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${AUCTION_API_URL}/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error initializing auction system:', error);
      throw error;
    }
  }

  // Add dummy data to the system
  async addDummyData(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${AUCTION_API_URL}/dummyData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding dummy data:', error);
      throw error;
    }
  }

  // Fetch all active auctions
  async getActiveAuctions(): Promise<BackendAuction[]> {
    try {
      console.log('Fetching auctions from:', `${AUCTION_API_URL}/auctions`);
      const response = await fetch(`${AUCTION_API_URL}/auctions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: AuctionServiceResponse = await response.json();
      console.log('Auction service response:', result);
      return result.data || [];
    } catch (error) {
      console.error('Error fetching auctions:', error);
      console.error('AUCTION_API_URL:', AUCTION_API_URL);
      throw error; // Re-throw the error instead of returning empty array
    }
  }

  // Fetch auction by ID
  async getAuctionById(auctionId: string): Promise<AuctionDetailResponse | null> {
    try {
      const response = await fetch(`${AUCTION_API_URL}/auction/${auctionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching auction details:', error);
      return null;
    }
  }

  // Convert backend auction to frontend auction format
  convertToFrontendAuction(backendAuction: BackendAuction): Auction {
    const endTime = new Date(backendAuction.end_time);
    const now = new Date();
    const timeLeft = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
    
    // Determine status based on time and backend status
    let status: 'upcoming' | 'active' | 'paused' | 'ended' | 'cancelled' = 'active';
    if (backendAuction.status === 'upcoming') {
      status = 'upcoming';
    } else if (backendAuction.status === 'ended' || timeLeft <= 0) {
      status = 'ended';
    } else if (backendAuction.status === 'paused') {
      status = 'paused';
    } else if (backendAuction.status === 'cancelled') {
      status = 'cancelled';
    }

    return {
      id: backendAuction.auction_id,
      title: backendAuction.title,
      description: backendAuction.description,
      type: 'standard',
      status: status,
      materialId: backendAuction.auction_id, // Using auction_id as material ID for now
      materialName: backendAuction.title,
      materialCategory: backendAuction.category,
      quantity: backendAuction.quantity,
      unit: backendAuction.unit,
      location: backendAuction.location,
      images: backendAuction.photos || [],
      
      // Pricing
      startingPrice: backendAuction.starting_price,
      currentPrice: backendAuction.current_price,
      reservePrice: backendAuction.reserve_price,
      buyItNowPrice: undefined,
      incrementAmount: 500, // Default increment
      
      // Timing
      startTime: new Date(backendAuction.start_time),
      endTime: endTime,
      timeExtension: 10, // Default 10 minutes
      
      // Participation
      totalBids: backendAuction.bid_count,
      totalBidders: 0, // Will be populated from auction metrics
      winningBidderId: undefined,
      isUserWatching: false,
      isUserBidding: false,
      userHighestBid: undefined,
      
      // Additional data
      sellerId: backendAuction.supplier_id.toString(),
      sellerName: 'Supplier', // Will be populated from user data
      sellerRating: 0,
      
      createdAt: new Date(backendAuction.start_time),
      updatedAt: new Date()
    };
  }

  // Convert backend auction to simple auction format used in the auctions page
  convertToSimpleAuction(backendAuction: BackendAuction) {
    const endTime = new Date(backendAuction.end_time);
    const now = new Date();
    const timeLeft = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
    
    // Determine status based on time
    let status: 'upcoming' | 'live' | 'ending_soon' | 'ended' = 'live';
    if (backendAuction.status === 'upcoming') {
      status = 'upcoming';
    } else if (backendAuction.status === 'ended' || timeLeft <= 0) {
      status = 'ended';
    } else if (timeLeft <= 1800) { // 30 minutes
      status = 'ending_soon';
    }

    return {
      id: backendAuction.auction_id,
      title: backendAuction.title,
      description: backendAuction.description,
      category: backendAuction.category,
      startingPrice: backendAuction.starting_price,
      currentPrice: backendAuction.current_price,
      reservePrice: backendAuction.reserve_price,
      quantity: backendAuction.quantity,
      unit: backendAuction.unit,
      timeLeft: timeLeft,
      status: status,
      totalBids: backendAuction.bid_count,
      participants: 0, // Will need to calculate from unique bidders
      isParticipating: false, // Will need user context
      myHighestBid: undefined,
      myPosition: undefined,
      autoBidEnabled: false,
      autoBidMax: undefined,
      images: backendAuction.photos || ['/api/placeholder/400/300'],
      supplier: 'Supplier', // Will get from user data
      location: backendAuction.location || 'Location',
      endTime: backendAuction.end_time
    };
  }

  // Get auctions by status
  async getAuctionsByStatus(status?: string): Promise<any[]> {
    try {
      const auctions = await this.getActiveAuctions();
      return auctions.map(auction => this.convertToSimpleAuction(auction));
    } catch (error) {
      console.error('Error fetching auctions by status:', error);
      throw error;
    }
  }
}

export const auctionService = new AuctionService();
export default auctionService;