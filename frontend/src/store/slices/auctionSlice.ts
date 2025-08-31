import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { 
  Auction, 
  AuctionListResponse, 
  AuctionDetailResponse,
  AuctionFilters,
  AuctionRealTimeState,
  Bid,
  AutoBidSettings
} from '@/types/auction';
import { AuctionApiService } from '@/services/auctionApi';

// Async thunks
export const fetchAuctions = createAsyncThunk(
  'auctions/fetchAuctions',
  async ({ page, limit, filters }: { page: number; limit: number; filters?: AuctionFilters }) => {
    const result = await AuctionApiService.getAuctions(page, limit, filters);
    // Convert Date objects to strings for Redux serialization
    return {
      ...result,
      auctions: result.auctions.map(toSerializableAuction)
    };
  }
);

export const fetchAuctionDetails = createAsyncThunk(
  'auctions/fetchAuctionDetails',
  async (auctionId: string) => {
    return await AuctionApiService.getAuctionById(auctionId);
  }
);

export const placeBid = createAsyncThunk(
  'auctions/placeBid',
  async ({ auctionId, amount, maxAmount }: { auctionId: string; amount: number; maxAmount?: number }) => {
    await AuctionApiService.placeBid({ auctionId, amount, maxAmount });
    return { auctionId, amount, maxAmount };
  }
);

export const watchAuction = createAsyncThunk(
  'auctions/watchAuction',
  async (auctionId: string) => {
    await AuctionApiService.watchAuction(auctionId);
    return auctionId;
  }
);

export const unwatchAuction = createAsyncThunk(
  'auctions/unwatchAuction',
  async (auctionId: string) => {
    await AuctionApiService.unwatchAuction(auctionId);
    return auctionId;
  }
);

export const fetchWatchedAuctions = createAsyncThunk(
  'auctions/fetchWatchedAuctions',
  async ({ page, limit }: { page: number; limit: number }) => {
    const result = await AuctionApiService.getWatchedAuctions(page, limit);
    return {
      ...result,
      auctions: result.auctions.map(toSerializableAuction)
    };
  }
);

export const setAutoBid = createAsyncThunk(
  'auctions/setAutoBid',
  async ({ auctionId, settings }: { auctionId: string; settings: AutoBidSettings }) => {
    await AuctionApiService.setAutoBidSettings(auctionId, settings);
    return { auctionId, settings };
  }
);

// Interface for auction state
interface AuctionState {
  // Lists (using serializable auctions for Redux state)
  auctions: SerializableAuction[];
  watchedAuctions: SerializableAuction[];
  featuredAuctions: SerializableAuction[];
  trendingAuctions: SerializableAuction[];
  
  // Current auction details
  currentAuction: AuctionDetailResponse | null;
  
  // Real-time data
  realTimeData: { [auctionId: string]: AuctionRealTimeState };
  
  // Auto-bid settings
  autoBidSettings: { [auctionId: string]: AutoBidSettings };
  
  // Pagination and filters
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
  filters: AuctionFilters;
  
  // Loading states
  loading: {
    auctions: boolean;
    auctionDetails: boolean;
    placingBid: boolean;
    watching: boolean;
    autoBid: boolean;
  };
  
  // Error states
  error: {
    auctions: string | null;
    auctionDetails: string | null;
    placingBid: string | null;
    watching: string | null;
    autoBid: string | null;
  };
  
  // UI state
  selectedAuctionId: string | null;
  isWebSocketConnected: boolean;
  showBidModal: boolean;
  showAutoBidModal: boolean;
}

// Define a serializable auction interface for Redux state
interface SerializableAuction extends Omit<Auction, 'startTime' | 'endTime' | 'createdAt' | 'updatedAt'> {
  startTime: string; // ISO string instead of Date
  endTime: string;   // ISO string instead of Date
  createdAt: string; // ISO string instead of Date
  updatedAt: string; // ISO string instead of Date
}

// Helper function to convert Auction to SerializableAuction
const toSerializableAuction = (auction: Auction): SerializableAuction => ({
  ...auction,
  startTime: auction.startTime.toISOString(),
  endTime: auction.endTime.toISOString(),
  createdAt: auction.createdAt.toISOString(),
  updatedAt: auction.updatedAt.toISOString(),
});

// Helper function to convert SerializableAuction to Auction
export const fromSerializableAuction = (auction: SerializableAuction): Auction => ({
  ...auction,
  startTime: new Date(auction.startTime),
  endTime: new Date(auction.endTime),
  createdAt: new Date(auction.createdAt),
  updatedAt: new Date(auction.updatedAt),
});

// Dummy auction data for demonstration (with serializable dates)
const dummyAuctions: SerializableAuction[] = [
  {
    id: 'auction-001',
    title: 'Premium Aluminum Cans Collection - Food Grade',
    description: 'High-quality aluminum cans from beverage manufacturing. Clean, sorted, and ready for recycling. Perfect for aluminum smelting or can-to-can recycling processes. All cans are food-grade quality with minimal contamination.',
    type: 'standard',
    status: 'active',
    materialId: 'mat-aluminum-001',
    materialName: 'Aluminum Cans',
    materialCategory: 'Metal',
    quantity: 2500,
    unit: 'kg',
    location: 'Los Angeles, CA',
    images: [
      'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=600&fit=crop'
    ],
    startingPrice: 1200,
    currentPrice: 1875,
    incrementAmount: 50,
    buyItNowPrice: 2800,
    reservePrice: 1500,
    startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // Started 4 hours ago
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),   // Ends in 6 hours
    timeExtension: 10,
    totalBids: 23,
    totalBidders: 12,
    sellerId: 'seller-premium-001',
    sellerName: 'EcoMetal Solutions Inc.',
    sellerRating: 4.9,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'auction-002',
    title: 'Mixed Electronic Components - Circuit Boards & Components',
    description: 'Large collection of electronic components from computer manufacturing facility. Includes circuit boards, processors, memory modules, capacitors, and various electronic parts. Excellent for precious metal recovery and component harvesting.',
    type: 'dutch',
    status: 'active',
    materialId: 'mat-electronics-002',
    materialName: 'Electronic Components',
    materialCategory: 'Electronics',
    quantity: 150,
    unit: 'boxes',
    location: 'San Francisco, CA',
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop'
    ],
    startingPrice: 8500,
    currentPrice: 6200,
    incrementAmount: 100,
    reservePrice: 5000,
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Started 2 hours ago
    endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),   // Ends in 4 hours
    timeExtension: 15,
    totalBids: 8,
    totalBidders: 6,
    sellerId: 'seller-tech-002',
    sellerName: 'TechRecycle Pro',
    sellerRating: 4.7,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  }
];

const initialState: AuctionState = {
  auctions: [],
  watchedAuctions: [],
  featuredAuctions: [],
  trendingAuctions: [],
  currentAuction: null,
  realTimeData: {},
  autoBidSettings: {},
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  hasMore: false,
  filters: {},
  loading: {
    auctions: false,
    auctionDetails: false,
    placingBid: false,
    watching: false,
    autoBid: false,
  },
  error: {
    auctions: null,
    auctionDetails: null,
    placingBid: null,
    watching: null,
    autoBid: null,
  },
  selectedAuctionId: null,
  isWebSocketConnected: false,
  showBidModal: false,
  showAutoBidModal: false,
};

const auctionSlice = createSlice({
  name: 'auctions',
  initialState,
  reducers: {
    // Real-time updates
    updateAuctionRealTime: (state, action: PayloadAction<AuctionRealTimeState>) => {
      const { auctionId } = action.payload;
      state.realTimeData[auctionId] = action.payload;
      
      // Update auction in lists if present
      const updateAuctionInList = (auctions: SerializableAuction[]) => {
        const index = auctions.findIndex(a => a.id === auctionId);
        if (index !== -1) {
          auctions[index].currentPrice = action.payload.currentPrice;
          auctions[index].totalBids = action.payload.recentBids.length;
        }
      };
      
      updateAuctionInList(state.auctions);
      updateAuctionInList(state.watchedAuctions);
      updateAuctionInList(state.featuredAuctions);
      updateAuctionInList(state.trendingAuctions);
      
      // Update current auction if viewing details
      if (state.currentAuction && state.currentAuction.id === auctionId) {
        state.currentAuction.currentPrice = action.payload.currentPrice;
        state.currentAuction.totalBids = action.payload.recentBids.length;
      }
    },
    
    addNewBid: (state, action: PayloadAction<Bid>) => {
      const { auctionId } = action.payload;
      if (state.realTimeData[auctionId]) {
        state.realTimeData[auctionId].recentBids.unshift(action.payload);
        // Keep only last 10 bids
        state.realTimeData[auctionId].recentBids = state.realTimeData[auctionId].recentBids.slice(0, 10);
      }
      
      // Update current auction bids if viewing details
      if (state.currentAuction && state.currentAuction.id === auctionId) {
        state.currentAuction.bids.unshift(action.payload);
      }
    },
    
    updateAuctionTimeExtended: (state, action: PayloadAction<{ auctionId: string; newEndTime: string }>) => {
      const { auctionId, newEndTime } = action.payload;
      
      const updateEndTime = (auctions: SerializableAuction[]) => {
        const index = auctions.findIndex(a => a.id === auctionId);
        if (index !== -1) {
          auctions[index].endTime = newEndTime;
        }
      };
      
      updateEndTime(state.auctions);
      updateEndTime(state.watchedAuctions);
      updateEndTime(state.featuredAuctions);
      updateEndTime(state.trendingAuctions);
      
      if (state.currentAuction && state.currentAuction.id === auctionId) {
        state.currentAuction.endTime = new Date(newEndTime);
      }
    },
    
    markAuctionEnded: (state, action: PayloadAction<{ auctionId: string; winnerId?: string; finalPrice: number }>) => {
      const { auctionId, winnerId, finalPrice } = action.payload;
      
      const updateAuctionStatus = (auctions: SerializableAuction[]) => {
        const index = auctions.findIndex(a => a.id === auctionId);
        if (index !== -1) {
          auctions[index].status = 'ended';
          auctions[index].currentPrice = finalPrice;
          auctions[index].winningBidderId = winnerId;
        }
      };
      
      updateAuctionStatus(state.auctions);
      updateAuctionStatus(state.watchedAuctions);
      updateAuctionStatus(state.featuredAuctions);
      updateAuctionStatus(state.trendingAuctions);
      
      if (state.currentAuction && state.currentAuction.id === auctionId) {
        state.currentAuction.status = 'ended';
        state.currentAuction.currentPrice = finalPrice;
        state.currentAuction.winningBidderId = winnerId;
      }
    },
    
    // Filters and UI
    setFilters: (state, action: PayloadAction<AuctionFilters>) => {
      state.filters = action.payload;
      state.currentPage = 1; // Reset to first page when filters change
    },
    
    clearFilters: (state) => {
      state.filters = {};
      state.currentPage = 1;
    },
    
    setSelectedAuction: (state, action: PayloadAction<string | null>) => {
      state.selectedAuctionId = action.payload;
    },
    
    setWebSocketConnection: (state, action: PayloadAction<boolean>) => {
      state.isWebSocketConnected = action.payload;
    },
    
    setShowBidModal: (state, action: PayloadAction<boolean>) => {
      state.showBidModal = action.payload;
    },
    
    setShowAutoBidModal: (state, action: PayloadAction<boolean>) => {
      state.showAutoBidModal = action.payload;
    },
    
    // Auto-bid settings
    updateAutoBidSettings: (state, action: PayloadAction<{ auctionId: string; settings: AutoBidSettings }>) => {
      const { auctionId, settings } = action.payload;
      state.autoBidSettings[auctionId] = settings;
    },
    
    // Clear state
    clearAuctionDetails: (state) => {
      state.currentAuction = null;
      state.error.auctionDetails = null;
    },
    
    clearErrors: (state) => {
      state.error = {
        auctions: null,
        auctionDetails: null,
        placingBid: null,
        watching: null,
        autoBid: null,
      };
    },
  },
  
  extraReducers: (builder) => {
    // Fetch auctions
    builder
      .addCase(fetchAuctions.pending, (state) => {
        state.loading.auctions = true;
        state.error.auctions = null;
      })
      .addCase(fetchAuctions.fulfilled, (state, action) => {
        state.loading.auctions = false;
        const { auctions, total, page, hasMore } = action.payload;
        
        if (page === 1) {
          state.auctions = auctions; // Already serialized in thunk
        } else {
          state.auctions.push(...auctions); // Already serialized in thunk
        }
        
        state.currentPage = page;
        state.totalItems = total;
        state.hasMore = hasMore;
        state.totalPages = Math.ceil(total / 20); // Assuming 20 items per page
      })
      .addCase(fetchAuctions.rejected, (state, action) => {
        state.loading.auctions = false;
        state.error.auctions = action.error.message || 'Failed to fetch auctions';
      });
    
    // Fetch auction details
    builder
      .addCase(fetchAuctionDetails.pending, (state) => {
        state.loading.auctionDetails = true;
        state.error.auctionDetails = null;
      })
      .addCase(fetchAuctionDetails.fulfilled, (state, action) => {
        state.loading.auctionDetails = false;
        state.currentAuction = action.payload;
      })
      .addCase(fetchAuctionDetails.rejected, (state, action) => {
        state.loading.auctionDetails = false;
        state.error.auctionDetails = action.error.message || 'Failed to fetch auction details';
      });
    
    // Place bid
    builder
      .addCase(placeBid.pending, (state) => {
        state.loading.placingBid = true;
        state.error.placingBid = null;
      })
      .addCase(placeBid.fulfilled, (state) => {
        state.loading.placingBid = false;
        state.showBidModal = false;
      })
      .addCase(placeBid.rejected, (state, action) => {
        state.loading.placingBid = false;
        state.error.placingBid = action.error.message || 'Failed to place bid';
      });
    
    // Watch auction
    builder
      .addCase(watchAuction.pending, (state) => {
        state.loading.watching = true;
        state.error.watching = null;
      })
      .addCase(watchAuction.fulfilled, (state, action) => {
        state.loading.watching = false;
        const auctionId = action.payload;
        
        // Mark auction as watched in all lists
        const markAsWatched = (auctions: SerializableAuction[]) => {
          const index = auctions.findIndex(a => a.id === auctionId);
          if (index !== -1) {
            auctions[index].isUserWatching = true;
          }
        };
        
        markAsWatched(state.auctions);
        markAsWatched(state.featuredAuctions);
        markAsWatched(state.trendingAuctions);
        
        if (state.currentAuction && state.currentAuction.id === auctionId) {
          state.currentAuction.isUserWatching = true;
        }
      })
      .addCase(watchAuction.rejected, (state, action) => {
        state.loading.watching = false;
        state.error.watching = action.error.message || 'Failed to watch auction';
      });
    
    // Unwatch auction
    builder
      .addCase(unwatchAuction.fulfilled, (state, action) => {
        const auctionId = action.payload;
        
        // Mark auction as not watched in all lists
        const markAsUnwatched = (auctions: SerializableAuction[]) => {
          const index = auctions.findIndex(a => a.id === auctionId);
          if (index !== -1) {
            auctions[index].isUserWatching = false;
          }
        };
        
        markAsUnwatched(state.auctions);
        markAsUnwatched(state.featuredAuctions);
        markAsUnwatched(state.trendingAuctions);
        
        // Remove from watched auctions list
        state.watchedAuctions = state.watchedAuctions.filter(a => a.id !== auctionId);
        
        if (state.currentAuction && state.currentAuction.id === auctionId) {
          state.currentAuction.isUserWatching = false;
        }
      });
    
    // Fetch watched auctions
    builder
      .addCase(fetchWatchedAuctions.fulfilled, (state, action) => {
        state.watchedAuctions = action.payload.auctions; // Already serialized in thunk
      });
    
    // Set auto-bid
    builder
      .addCase(setAutoBid.pending, (state) => {
        state.loading.autoBid = true;
        state.error.autoBid = null;
      })
      .addCase(setAutoBid.fulfilled, (state, action) => {
        state.loading.autoBid = false;
        state.showAutoBidModal = false;
        const { auctionId, settings } = action.payload;
        state.autoBidSettings[auctionId] = settings;
      })
      .addCase(setAutoBid.rejected, (state, action) => {
        state.loading.autoBid = false;
        state.error.autoBid = action.error.message || 'Failed to set auto-bid';
      });
  },
});

export const {
  updateAuctionRealTime,
  addNewBid,
  updateAuctionTimeExtended,
  markAuctionEnded,
  setFilters,
  clearFilters,
  setSelectedAuction,
  setWebSocketConnection,
  setShowBidModal,
  setShowAutoBidModal,
  updateAutoBidSettings,
  clearAuctionDetails,
  clearErrors,
} = auctionSlice.actions;

// Base selectors for raw state
const selectAuctionState = (state: any) => state.auctions;
const selectRawAuctions = (state: any) => state.auctions.auctions;
const selectRawWatchedAuctions = (state: any) => state.auctions.watchedAuctions;
const selectRawFeaturedAuctions = (state: any) => state.auctions.featuredAuctions;
const selectRawTrendingAuctions = (state: any) => state.auctions.trendingAuctions;

// Memoized selectors that convert serializable auctions back to proper format
export const selectAuctions = createSelector(
  [selectRawAuctions],
  (auctions) => auctions.map(fromSerializableAuction)
);

export const selectWatchedAuctions = createSelector(
  [selectRawWatchedAuctions],
  (auctions) => auctions.map(fromSerializableAuction)
);

export const selectFeaturedAuctions = createSelector(
  [selectRawFeaturedAuctions],
  (auctions) => auctions.map(fromSerializableAuction)
);

export const selectTrendingAuctions = createSelector(
  [selectRawTrendingAuctions],
  (auctions) => auctions.map(fromSerializableAuction)
);

export default auctionSlice.reducer;
