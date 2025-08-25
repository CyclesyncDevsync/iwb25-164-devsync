import axios from 'axios';
import { 
  Auction, 
  AuctionListResponse, 
  AuctionDetailResponse, 
  CreateAuctionRequest,
  AuctionFilters,
  AuctionAnalytics,
  BidRequest,
  AutoBidSettings
} from '@/types/auction';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Create axios instance with interceptors
const auctionApi = axios.create({
  baseURL: `${API_BASE_URL}/auctions`,
  timeout: 10000,
});

// Add auth token to requests
auctionApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export class AuctionApiService {
  // Get auction list with filters
  static async getAuctions(
    page: number = 1,
    limit: number = 20,
    filters?: AuctionFilters
  ): Promise<AuctionListResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (filters) {
      if (filters.type?.length) {
        filters.type.forEach(type => params.append('type', type));
      }
      if (filters.category?.length) {
        filters.category.forEach(cat => params.append('category', cat));
      }
      if (filters.location?.length) {
        filters.location.forEach(loc => params.append('location', loc));
      }
      if (filters.priceRange) {
        params.append('minPrice', filters.priceRange.min.toString());
        params.append('maxPrice', filters.priceRange.max.toString());
      }
      if (filters.status?.length) {
        filters.status.forEach(status => params.append('status', status));
      }
      if (filters.endingIn) {
        params.append('endingIn', filters.endingIn.toString());
      }
      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy);
      }
      if (filters.searchQuery) {
        params.append('search', filters.searchQuery);
      }
    }

    const response = await auctionApi.get(`?${params.toString()}`);
    return response.data;
  }

  // Get auction by ID
  static async getAuctionById(id: string): Promise<AuctionDetailResponse> {
    const response = await auctionApi.get(`/${id}`);
    return response.data;
  }

  // Create new auction
  static async createAuction(auctionData: CreateAuctionRequest): Promise<Auction> {
    const response = await auctionApi.post('/', auctionData);
    return response.data;
  }

  // Update auction
  static async updateAuction(id: string, auctionData: Partial<CreateAuctionRequest>): Promise<Auction> {
    const response = await auctionApi.put(`/${id}`, auctionData);
    return response.data;
  }

  // Delete auction
  static async deleteAuction(id: string): Promise<void> {
    await auctionApi.delete(`/${id}`);
  }

  // Place bid
  static async placeBid(bidData: BidRequest): Promise<void> {
    await auctionApi.post(`/${bidData.auctionId}/bids`, {
      amount: bidData.amount,
      maxAmount: bidData.maxAmount,
    });
  }

  // Get auction bids
  static async getAuctionBids(auctionId: string, page: number = 1, limit: number = 50) {
    const response = await auctionApi.get(`/${auctionId}/bids`, {
      params: { page, limit }
    });
    return response.data;
  }

  // Get user's bids
  static async getUserBids(page: number = 1, limit: number = 20) {
    const response = await auctionApi.get('/user/bids', {
      params: { page, limit }
    });
    return response.data;
  }

  // Watch/unwatch auction
  static async watchAuction(auctionId: string): Promise<void> {
    await auctionApi.post(`/${auctionId}/watch`);
  }

  static async unwatchAuction(auctionId: string): Promise<void> {
    await auctionApi.delete(`/${auctionId}/watch`);
  }

  // Get watched auctions
  static async getWatchedAuctions(page: number = 1, limit: number = 20) {
    const response = await auctionApi.get('/user/watched', {
      params: { page, limit }
    });
    return response.data;
  }

  // Auto-bid settings
  static async setAutoBidSettings(auctionId: string, settings: AutoBidSettings): Promise<void> {
    await auctionApi.post(`/${auctionId}/auto-bid`, settings);
  }

  static async getAutoBidSettings(auctionId: string): Promise<AutoBidSettings> {
    const response = await auctionApi.get(`/${auctionId}/auto-bid`);
    return response.data;
  }

  // Auction analytics
  static async getAuctionAnalytics(auctionId: string): Promise<AuctionAnalytics> {
    const response = await auctionApi.get(`/${auctionId}/analytics`);
    return response.data;
  }

  // Get auction performance metrics
  static async getAuctionPerformance(auctionId: string, timeframe: '1h' | '6h' | '24h' | '7d' = '24h') {
    const response = await auctionApi.get(`/${auctionId}/performance`, {
      params: { timeframe }
    });
    return response.data;
  }

  // Bulk operations
  static async bulkUpdateAuctions(auctionIds: string[], updates: Partial<Auction>): Promise<void> {
    await auctionApi.post('/bulk/update', {
      auctionIds,
      updates,
    });
  }

  static async bulkDeleteAuctions(auctionIds: string[]): Promise<void> {
    await auctionApi.post('/bulk/delete', {
      auctionIds,
    });
  }

  // Search suggestions
  static async getSearchSuggestions(query: string): Promise<string[]> {
    const response = await auctionApi.get('/search/suggestions', {
      params: { q: query }
    });
    return response.data;
  }

  // Featured auctions
  static async getFeaturedAuctions(limit: number = 6): Promise<Auction[]> {
    const response = await auctionApi.get('/featured', {
      params: { limit }
    });
    return response.data;
  }

  // Trending auctions
  static async getTrendingAuctions(limit: number = 10): Promise<Auction[]> {
    const response = await auctionApi.get('/trending', {
      params: { limit }
    });
    return response.data;
  }

  // Similar auctions
  static async getSimilarAuctions(auctionId: string, limit: number = 5): Promise<Auction[]> {
    const response = await auctionApi.get(`/${auctionId}/similar`, {
      params: { limit }
    });
    return response.data;
  }

  // Auction categories
  static async getAuctionCategories(): Promise<string[]> {
    const response = await auctionApi.get('/categories');
    return response.data;
  }

  // Auction locations
  static async getAuctionLocations(): Promise<string[]> {
    const response = await auctionApi.get('/locations');
    return response.data;
  }

  // Export auction data
  static async exportAuctionData(auctionId: string, format: 'csv' | 'pdf' | 'excel' = 'csv'): Promise<Blob> {
    const response = await auctionApi.get(`/${auctionId}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  // Auction templates (for quick creation)
  static async getAuctionTemplates(): Promise<CreateAuctionRequest[]> {
    const response = await auctionApi.get('/templates');
    return response.data;
  }

  static async saveAuctionTemplate(template: CreateAuctionRequest & { name: string }): Promise<void> {
    await auctionApi.post('/templates', template);
  }
}
