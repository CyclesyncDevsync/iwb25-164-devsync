import axios from "axios";
import {
  Auction,
  AuctionListResponse,
  AuctionDetailResponse,
  CreateAuctionRequest,
  AuctionFilters,
  AuctionAnalytics,
  BidRequest,
  AutoBidSettings,
} from "@/types/auction";

const AUCTION_API_URL = "http://localhost:8096/api/auction";

// Create axios instance with interceptors
const auctionApi = axios.create({
  baseURL: AUCTION_API_URL,
  timeout: 10000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add auth token and CORS handling to requests
auctionApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Add response interceptor for better error handling
auctionApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Auction API Error:", error);
    if (error.code === "ERR_NETWORK") {
      console.error(
        "Network error - check if backend is running on:",
        AUCTION_API_URL
      );
    }
    return Promise.reject(error);
  }
);

export class AuctionApiService {
  // Get auction list with filters
  static async getAuctions(
    page: number = 1,
    limit: number = 20,
    filters?: AuctionFilters
  ): Promise<AuctionListResponse> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    if (filters) {
      if (filters.type?.length) {
        filters.type.forEach((type) => params.append("type", type));
      }
      if (filters.category?.length) {
        filters.category.forEach((cat) => params.append("category", cat));
      }
      if (filters.location?.length) {
        filters.location.forEach((loc) => params.append("location", loc));
      }
      if (filters.priceRange) {
        params.append("minPrice", filters.priceRange.min.toString());
        params.append("maxPrice", filters.priceRange.max.toString());
      }
      if (filters.status?.length) {
        filters.status.forEach((status) => params.append("status", status));
      }
      if (filters.endingIn) {
        params.append("endingIn", filters.endingIn.toString());
      }
      if (filters.sortBy) {
        params.append("sortBy", filters.sortBy);
      }
      if (filters.searchQuery) {
        params.append("search", filters.searchQuery);
      }
    }

    try {
      console.log("Fetching auctions from URL:", `${AUCTION_API_URL}/auctions`);

      // Use axios instance with CORS configuration
      const response = await auctionApi.get("/auctions");

      // Transform backend response to match expected format
      const backendData = response.data;

      if (backendData.status === "success" && backendData.data) {
        // Convert backend auctions to frontend format
        const auctions: Auction[] = backendData.data.map(
          (backendAuction: any) => ({
            id: backendAuction.auction_id,
            title: backendAuction.title,
            description: backendAuction.description,
            type: "standard" as const,
            status: AuctionApiService.mapBackendStatus(backendAuction.status),
            materialId: backendAuction.auction_id,
            materialName: backendAuction.title,
            materialCategory: backendAuction.category || "Materials",
            quantity: backendAuction.quantity,
            unit: backendAuction.unit,
            location: backendAuction.location || "Unknown",
            images: backendAuction.photos || ["/api/placeholder/400/300"],

            // Pricing
            startingPrice: backendAuction.starting_price,
            currentPrice: backendAuction.current_price,
            reservePrice: backendAuction.reserve_price,
            incrementAmount: 500,

            // Timing
            startTime: new Date(backendAuction.start_time),
            endTime: new Date(backendAuction.end_time),
            timeExtension: 10,

            // Participation
            totalBids: backendAuction.bid_count || 0,
            totalBidders: 0,
            isUserWatching: false,
            isUserBidding: false,

            // Additional data
            sellerId: backendAuction.supplier_id?.toString() || "1",
            sellerName: "Supplier",
            sellerRating: 4.5,

            createdAt: new Date(backendAuction.start_time),
            updatedAt: new Date(),
          })
        );

        return {
          auctions,
          total: backendData.count || auctions.length,
          page,
          limit,
          hasMore: false,
        };
      }

      return { auctions: [], total: 0, page, limit, hasMore: false };
    } catch (error) {
      console.error("Error fetching auctions:", error);
      throw error;
    }
  }

  // Map backend status to frontend status
  static mapBackendStatus(
    backendStatus: string
  ): "upcoming" | "active" | "paused" | "ended" | "cancelled" {
    switch (backendStatus?.toLowerCase()) {
      case "active":
        return "active";
      case "upcoming":
        return "upcoming";
      case "ended":
        return "ended";
      case "paused":
        return "paused";
      case "cancelled":
        return "cancelled";
      default:
        return "active";
    }
  }

  // Get auction by ID
  static async getAuctionById(id: string): Promise<AuctionDetailResponse> {
    const response = await auctionApi.get(`/${id}`);
    return response.data;
  }

  // Create new auction
  static async createAuction(
    auctionData: CreateAuctionRequest
  ): Promise<Auction> {
    const response = await auctionApi.post("/", auctionData);
    return response.data;
  }

  // Update auction
  static async updateAuction(
    id: string,
    auctionData: Partial<CreateAuctionRequest>
  ): Promise<Auction> {
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
  static async getAuctionBids(
    auctionId: string,
    page: number = 1,
    limit: number = 50
  ) {
    const response = await auctionApi.get(`/${auctionId}/bids`, {
      params: { page, limit },
    });
    return response.data;
  }

  // Get user's bids
  static async getUserBids(page: number = 1, limit: number = 20) {
    const response = await auctionApi.get("/user/bids", {
      params: { page, limit },
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
    const response = await auctionApi.get("/user/watched", {
      params: { page, limit },
    });
    return response.data;
  }

  // Auto-bid settings
  static async setAutoBidSettings(
    auctionId: string,
    settings: AutoBidSettings
  ): Promise<void> {
    await auctionApi.post(`/${auctionId}/auto-bid`, settings);
  }

  static async getAutoBidSettings(auctionId: string): Promise<AutoBidSettings> {
    const response = await auctionApi.get(`/${auctionId}/auto-bid`);
    return response.data;
  }

  // Auction analytics
  static async getAuctionAnalytics(
    auctionId: string
  ): Promise<AuctionAnalytics> {
    const response = await auctionApi.get(`/${auctionId}/analytics`);
    return response.data;
  }

  // Get auction performance metrics
  static async getAuctionPerformance(
    auctionId: string,
    timeframe: "1h" | "6h" | "24h" | "7d" = "24h"
  ) {
    const response = await auctionApi.get(`/${auctionId}/performance`, {
      params: { timeframe },
    });
    return response.data;
  }

  // Bulk operations
  static async bulkUpdateAuctions(
    auctionIds: string[],
    updates: Partial<Auction>
  ): Promise<void> {
    await auctionApi.post("/bulk/update", {
      auctionIds,
      updates,
    });
  }

  static async bulkDeleteAuctions(auctionIds: string[]): Promise<void> {
    await auctionApi.post("/bulk/delete", {
      auctionIds,
    });
  }

  // Search suggestions
  static async getSearchSuggestions(query: string): Promise<string[]> {
    const response = await auctionApi.get("/search/suggestions", {
      params: { q: query },
    });
    return response.data;
  }

  // Featured auctions
  static async getFeaturedAuctions(limit: number = 6): Promise<Auction[]> {
    const response = await auctionApi.get("/featured", {
      params: { limit },
    });
    return response.data;
  }

  // Trending auctions
  static async getTrendingAuctions(limit: number = 10): Promise<Auction[]> {
    const response = await auctionApi.get("/trending", {
      params: { limit },
    });
    return response.data;
  }

  // Similar auctions
  static async getSimilarAuctions(
    auctionId: string,
    limit: number = 5
  ): Promise<Auction[]> {
    const response = await auctionApi.get(`/${auctionId}/similar`, {
      params: { limit },
    });
    return response.data;
  }

  // Auction categories
  static async getAuctionCategories(): Promise<string[]> {
    const response = await auctionApi.get("/categories");
    return response.data;
  }

  // Auction locations
  static async getAuctionLocations(): Promise<string[]> {
    const response = await auctionApi.get("/locations");
    return response.data;
  }

  // Export auction data
  static async exportAuctionData(
    auctionId: string,
    format: "csv" | "pdf" | "excel" = "csv"
  ): Promise<Blob> {
    const response = await auctionApi.get(`/${auctionId}/export`, {
      params: { format },
      responseType: "blob",
    });
    return response.data;
  }

  // Auction templates (for quick creation)
  static async getAuctionTemplates(): Promise<CreateAuctionRequest[]> {
    const response = await auctionApi.get("/templates");
    return response.data;
  }

  static async saveAuctionTemplate(
    template: CreateAuctionRequest & { name: string }
  ): Promise<void> {
    await auctionApi.post("/templates", template);
  }
}
