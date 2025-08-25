import axios, { AxiosInstance } from 'axios';
import {
  AIResponse,
  SmartMatchingFilters,
  SmartMatchingResponse,
  AnalyticsDashboardData,
  DemandForecast,
  MaterialRecommendation,
  BuyerSuggestion,
  PriceOptimization,
  MarketInsight,
  CustomReport,
  OptimizationSuggestion,
  AIInsight
} from '@/types/ai';

class AIService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8081/api/ai';
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds for AI operations
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('AI Service Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // Smart Matching Services
  async getSmartRecommendations(filters: SmartMatchingFilters): Promise<AIResponse<SmartMatchingResponse>> {
    try {
      const response = await this.api.post('/smart-matching/recommendations', filters);
      return {
        success: true,
        data: response.data,
        processingTime: response.headers['x-processing-time'] || 0,
        requestId: response.headers['x-request-id'] || '',
        timestamp: new Date(),
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as SmartMatchingResponse,
        error: error.response?.data?.message || 'Failed to get smart recommendations',
        processingTime: 0,
        requestId: '',
        timestamp: new Date(),
      };
    }
  }

  async getMaterialRecommendations(
    buyerId: string,
    preferences: any
  ): Promise<AIResponse<MaterialRecommendation[]>> {
    try {
      const response = await this.api.post('/smart-matching/materials', {
        buyerId,
        preferences,
      });
      return {
        success: true,
        data: response.data,
        processingTime: response.headers['x-processing-time'] || 0,
        requestId: response.headers['x-request-id'] || '',
        timestamp: new Date(),
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Failed to get material recommendations',
        processingTime: 0,
        requestId: '',
        timestamp: new Date(),
      };
    }
  }

  async getBuyerSuggestions(
    supplierId: string,
    materialType: string
  ): Promise<AIResponse<BuyerSuggestion[]>> {
    try {
      const response = await this.api.get('/smart-matching/buyers', {
        params: { supplierId, materialType },
      });
      return {
        success: true,
        data: response.data,
        processingTime: response.headers['x-processing-time'] || 0,
        requestId: response.headers['x-request-id'] || '',
        timestamp: new Date(),
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Failed to get buyer suggestions',
        processingTime: 0,
        requestId: '',
        timestamp: new Date(),
      };
    }
  }

  async getPriceOptimization(
    materialType: string,
    quantity: number,
    location: string
  ): Promise<AIResponse<PriceOptimization>> {
    try {
      const response = await this.api.post('/smart-matching/price-optimization', {
        materialType,
        quantity,
        location,
      });
      return {
        success: true,
        data: response.data,
        processingTime: response.headers['x-processing-time'] || 0,
        requestId: response.headers['x-request-id'] || '',
        timestamp: new Date(),
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as PriceOptimization,
        error: error.response?.data?.message || 'Failed to get price optimization',
        processingTime: 0,
        requestId: '',
        timestamp: new Date(),
      };
    }
  }

  async getMarketInsights(
    materialTypes: string[],
    region?: string
  ): Promise<AIResponse<MarketInsight[]>> {
    try {
      const response = await this.api.get('/analytics/market-insights', {
        params: { materialTypes: materialTypes.join(','), region },
      });
      return {
        success: true,
        data: response.data,
        processingTime: response.headers['x-processing-time'] || 0,
        requestId: response.headers['x-request-id'] || '',
        timestamp: new Date(),
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Failed to get market insights',
        processingTime: 0,
        requestId: '',
        timestamp: new Date(),
      };
    }
  }

  // Analytics Dashboard Services
  async getDashboardData(userId: string, role: string): Promise<AIResponse<AnalyticsDashboardData>> {
    try {
      const response = await this.api.get('/analytics/dashboard', {
        params: { userId, role },
      });
      return {
        success: true,
        data: response.data,
        processingTime: response.headers['x-processing-time'] || 0,
        requestId: response.headers['x-request-id'] || '',
        timestamp: new Date(),
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as AnalyticsDashboardData,
        error: error.response?.data?.message || 'Failed to get dashboard data',
        processingTime: 0,
        requestId: '',
        timestamp: new Date(),
      };
    }
  }

  async getDemandForecast(
    materialTypes: string[],
    location: string,
    timeframe: string
  ): Promise<AIResponse<DemandForecast>> {
    try {
      const response = await this.api.post('/demand/forecast', {
        materialTypes,
        location,
        timeframe,
      });
      return {
        success: true,
        data: response.data,
        processingTime: response.headers['x-processing-time'] || 0,
        requestId: response.headers['x-request-id'] || '',
        timestamp: new Date(),
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as DemandForecast,
        error: error.response?.data?.message || 'Failed to get demand forecast',
        processingTime: 0,
        requestId: '',
        timestamp: new Date(),
      };
    }
  }

  async getOptimizationSuggestions(
    userId: string,
    context: any
  ): Promise<AIResponse<OptimizationSuggestion[]>> {
    try {
      const response = await this.api.post('/analytics/optimization-suggestions', {
        userId,
        context,
      });
      return {
        success: true,
        data: response.data,
        processingTime: response.headers['x-processing-time'] || 0,
        requestId: response.headers['x-request-id'] || '',
        timestamp: new Date(),
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Failed to get optimization suggestions',
        processingTime: 0,
        requestId: '',
        timestamp: new Date(),
      };
    }
  }

  // Custom Reports
  async generateCustomReport(reportConfig: any): Promise<AIResponse<CustomReport>> {
    try {
      const response = await this.api.post('/analytics/reports/generate', reportConfig);
      return {
        success: true,
        data: response.data,
        processingTime: response.headers['x-processing-time'] || 0,
        requestId: response.headers['x-request-id'] || '',
        timestamp: new Date(),
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as CustomReport,
        error: error.response?.data?.message || 'Failed to generate custom report',
        processingTime: 0,
        requestId: '',
        timestamp: new Date(),
      };
    }
  }

  async getCustomReports(userId: string): Promise<AIResponse<CustomReport[]>> {
    try {
      const response = await this.api.get('/analytics/reports', {
        params: { userId },
      });
      return {
        success: true,
        data: response.data,
        processingTime: response.headers['x-processing-time'] || 0,
        requestId: response.headers['x-request-id'] || '',
        timestamp: new Date(),
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Failed to get custom reports',
        processingTime: 0,
        requestId: '',
        timestamp: new Date(),
      };
    }
  }

  // AI Insights
  async getAIInsights(userId: string, category?: string): Promise<AIResponse<AIInsight[]>> {
    try {
      const response = await this.api.get('/insights', {
        params: { userId, category },
      });
      return {
        success: true,
        data: response.data,
        processingTime: response.headers['x-processing-time'] || 0,
        requestId: response.headers['x-request-id'] || '',
        timestamp: new Date(),
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Failed to get AI insights',
        processingTime: 0,
        requestId: '',
        timestamp: new Date(),
      };
    }
  }

  async dismissInsight(insightId: string): Promise<AIResponse<boolean>> {
    try {
      await this.api.patch(`/insights/${insightId}/dismiss`);
      return {
        success: true,
        data: true,
        processingTime: 0,
        requestId: '',
        timestamp: new Date(),
      };
    } catch (error: any) {
      return {
        success: false,
        data: false,
        error: error.response?.data?.message || 'Failed to dismiss insight',
        processingTime: 0,
        requestId: '',
        timestamp: new Date(),
      };
    }
  }

  // Real-time updates
  async subscribeToInsights(userId: string, callback: (insight: AIInsight) => void): Promise<void> {
    // WebSocket connection for real-time insights
    try {
      const wsUrl = this.baseURL.replace('http', 'ws') + `/insights/subscribe?userId=${userId}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onmessage = (event) => {
        try {
          const insight = JSON.parse(event.data);
          callback(insight);
        } catch (error) {
          console.error('Failed to parse insight data:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('AI insights WebSocket connection closed');
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
    }
  }

  // Utility methods
  async getModelPerformance(): Promise<AIResponse<any>> {
    try {
      const response = await this.api.get('/models/performance');
      return {
        success: true,
        data: response.data,
        processingTime: response.headers['x-processing-time'] || 0,
        requestId: response.headers['x-request-id'] || '',
        timestamp: new Date(),
      };
    } catch (error: any) {
      return {
        success: false,
        data: {},
        error: error.response?.data?.message || 'Failed to get model performance',
        processingTime: 0,
        requestId: '',
        timestamp: new Date(),
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.api.get('/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

export const aiService = new AIService();
export default aiService;