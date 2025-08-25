import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  AIState,
  SmartMatchingFilters,
  SmartMatchingResponse,
  AnalyticsDashboardData,
  AIInsight,
  CustomReport,
} from '@/types/ai';
import aiService from '@/services/aiService';

// Initial state
const initialState: AIState = {
  smartMatching: {
    isLoading: false,
    results: null,
    filters: {
      wasteTypes: [],
      locations: [],
      qualityRange: [1, 10],
      priceRange: [0, 10000],
      quantityRange: [0, 1000],
      timeframe: '30d',
      urgency: 'medium',
      preferredSuppliers: [],
      paymentTerms: [],
    },
    history: [],
    error: null,
  },
  analytics: {
    isLoading: false,
    dashboardData: null,
    customReports: [],
    error: null,
    lastRefresh: null,
  },
  insights: {
    active: [],
    dismissed: [],
    unread: 0,
  },
  preferences: {
    autoRefresh: true,
    refreshInterval: 300000, // 5 minutes
    notifications: true,
    confidenceThreshold: 0.7,
  },
};

// Async thunks
export const fetchSmartRecommendations = createAsyncThunk(
  'ai/fetchSmartRecommendations',
  async (filters: SmartMatchingFilters, { rejectWithValue }) => {
    try {
      const response = await aiService.getSmartRecommendations(filters);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch smart recommendations');
    }
  }
);

export const fetchAnalyticsDashboard = createAsyncThunk(
  'ai/fetchAnalyticsDashboard',
  async ({ userId, role }: { userId: string; role: string }, { rejectWithValue }) => {
    try {
      const response = await aiService.getDashboardData(userId, role);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch analytics dashboard');
    }
  }
);

export const fetchAIInsights = createAsyncThunk(
  'ai/fetchAIInsights',
  async ({ userId, category }: { userId: string; category?: string }, { rejectWithValue }) => {
    try {
      const response = await aiService.getAIInsights(userId, category);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch AI insights');
    }
  }
);

export const dismissAIInsight = createAsyncThunk(
  'ai/dismissAIInsight',
  async (insightId: string, { rejectWithValue }) => {
    try {
      const response = await aiService.dismissInsight(insightId);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return insightId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to dismiss insight');
    }
  }
);

export const generateCustomReport = createAsyncThunk(
  'ai/generateCustomReport',
  async (reportConfig: any, { rejectWithValue }) => {
    try {
      const response = await aiService.generateCustomReport(reportConfig);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to generate custom report');
    }
  }
);

export const fetchCustomReports = createAsyncThunk(
  'ai/fetchCustomReports',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await aiService.getCustomReports(userId);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch custom reports');
    }
  }
);

// Slice
const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    updateSmartMatchingFilters: (state, action: PayloadAction<Partial<SmartMatchingFilters>>) => {
      state.smartMatching.filters = { ...state.smartMatching.filters, ...action.payload };
    },
    clearSmartMatchingResults: (state) => {
      state.smartMatching.results = null;
      state.smartMatching.error = null;
    },
    addToMatchingHistory: (state, action: PayloadAction<SmartMatchingResponse>) => {
      state.smartMatching.history.unshift(action.payload);
      // Keep only last 10 searches
      state.smartMatching.history = state.smartMatching.history.slice(0, 10);
    },
    addNewInsight: (state, action: PayloadAction<AIInsight>) => {
      state.insights.active.unshift(action.payload);
      state.insights.unread += 1;
    },
    markInsightAsRead: (state, action: PayloadAction<string>) => {
      const insight = state.insights.active.find(i => i.id === action.payload);
      if (insight && state.insights.unread > 0) {
        state.insights.unread -= 1;
      }
    },
    clearAllInsights: (state) => {
      state.insights.dismissed.push(...state.insights.active);
      state.insights.active = [];
      state.insights.unread = 0;
    },
    updatePreferences: (state, action: PayloadAction<Partial<typeof initialState.preferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    clearAnalyticsError: (state) => {
      state.analytics.error = null;
    },
    clearSmartMatchingError: (state) => {
      state.smartMatching.error = null;
    },
    setAnalyticsRefreshTime: (state) => {
      state.analytics.lastRefresh = new Date();
    },
  },
  extraReducers: (builder) => {
    // Smart Recommendations
    builder
      .addCase(fetchSmartRecommendations.pending, (state) => {
        state.smartMatching.isLoading = true;
        state.smartMatching.error = null;
      })
      .addCase(fetchSmartRecommendations.fulfilled, (state, action) => {
        state.smartMatching.isLoading = false;
        state.smartMatching.results = action.payload;
        state.smartMatching.history.unshift(action.payload);
        state.smartMatching.history = state.smartMatching.history.slice(0, 10);
      })
      .addCase(fetchSmartRecommendations.rejected, (state, action) => {
        state.smartMatching.isLoading = false;
        state.smartMatching.error = action.payload as string;
      });

    // Analytics Dashboard
    builder
      .addCase(fetchAnalyticsDashboard.pending, (state) => {
        state.analytics.isLoading = true;
        state.analytics.error = null;
      })
      .addCase(fetchAnalyticsDashboard.fulfilled, (state, action) => {
        state.analytics.isLoading = false;
        state.analytics.dashboardData = action.payload;
        state.analytics.lastRefresh = new Date();
      })
      .addCase(fetchAnalyticsDashboard.rejected, (state, action) => {
        state.analytics.isLoading = false;
        state.analytics.error = action.payload as string;
      });

    // AI Insights
    builder
      .addCase(fetchAIInsights.fulfilled, (state, action) => {
        state.insights.active = action.payload;
        state.insights.unread = action.payload.filter(insight => !insight.id).length; // Simplified read logic
      })
      .addCase(dismissAIInsight.fulfilled, (state, action) => {
        const insightIndex = state.insights.active.findIndex(i => i.id === action.payload);
        if (insightIndex !== -1) {
          const [dismissedInsight] = state.insights.active.splice(insightIndex, 1);
          state.insights.dismissed.push(dismissedInsight);
          if (state.insights.unread > 0) {
            state.insights.unread -= 1;
          }
        }
      });

    // Custom Reports
    builder
      .addCase(generateCustomReport.fulfilled, (state, action) => {
        state.analytics.customReports.unshift(action.payload);
      })
      .addCase(fetchCustomReports.fulfilled, (state, action) => {
        state.analytics.customReports = action.payload;
      });
  },
});

export const {
  updateSmartMatchingFilters,
  clearSmartMatchingResults,
  addToMatchingHistory,
  addNewInsight,
  markInsightAsRead,
  clearAllInsights,
  updatePreferences,
  clearAnalyticsError,
  clearSmartMatchingError,
  setAnalyticsRefreshTime,
} = aiSlice.actions;

export default aiSlice.reducer;
