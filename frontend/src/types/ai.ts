// AI-related type definitions for CircularSync

// Base AI interfaces
export interface AIConfidence {
  level: number; // 0-1
  reason: string;
  dataPoints: number;
}

export interface AIInsight {
  id: string;
  type: 'trend' | 'opportunity' | 'risk' | 'optimization';
  title: string;
  description: string;
  confidence: AIConfidence;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  suggestedActions?: string[];
  createdAt: Date;
  expiresAt?: Date;
}

// Demand Prediction Types
export interface DemandPrediction {
  wasteType: string;
  location: string;
  period: 'week' | 'month' | 'quarter';
  predictedDemand: number; // in tons
  demandRange: {
    lower: number;
    upper: number;
  };
  confidence: AIConfidence;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  seasonalFactors: string[];
  marketDrivers: string[];
  lastUpdated: Date;
}

export interface DemandForecast {
  predictions: DemandPrediction[];
  overview: {
    totalDemand: number;
    growthRate: number;
    marketOpportunityScore: number; // 0-100
    volatilityIndex: number; // 0-1
  };
  insights: AIInsight[];
}

// Smart Matching Types
export interface MaterialRecommendation {
  materialId: string;
  materialType: string;
  supplierName: string;
  location: string;
  quality: number; // 1-10
  price: number;
  quantity: number;
  matchScore: number; // 0-100
  reasons: string[];
  estimatedDemand: number;
  competitionLevel: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
  images: string[];
  availabilityWindow: {
    start: Date;
    end: Date;
  };
}

export interface BuyerSuggestion {
  buyerId: string;
  buyerName: string;
  industry: string;
  location: string;
  preferredMaterials: string[];
  averageOrderValue: number;
  paymentTerms: string;
  matchScore: number; // 0-100
  reasons: string[];
  historicalVolume: number;
  reliability: number; // 1-10
  responseTime: string;
  lastActive: Date;
}

export interface PriceOptimization {
  materialType: string;
  currentPrice: number;
  recommendedPrice: number;
  priceRange: {
    min: number;
    max: number;
    optimal: number;
  };
  confidence: AIConfidence;
  marketComparison: {
    belowMarket: number;
    atMarket: number;
    aboveMarket: number;
  };
  demandElasticity: number;
  competitorPrices: Array<{
    competitor: string;
    price: number;
    quality: number;
  }>;
  pricingStrategy: 'competitive' | 'premium' | 'economy';
  expectedOutcome: {
    salesProbability: number;
    profitMargin: number;
    timeToSell: string;
  };
}

export interface MarketInsight {
  type: 'price_trend' | 'demand_shift' | 'competition' | 'opportunity';
  impact: 'positive' | 'negative' | 'neutral';
  severity: 'low' | 'medium' | 'high';
  timeframe: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  affectedMaterials: string[];
  regions: string[];
  description: string;
  recommendations: string[];
  confidence: AIConfidence;
  sources: string[];
}

// Analytics Types
export interface PredictiveAnalytics {
  revenue: {
    predicted: number;
    confidence: AIConfidence;
    factors: string[];
    timeframe: string;
  };
  marketShare: {
    current: number;
    predicted: number;
    competitors: Array<{
      name: string;
      share: number;
      trend: 'up' | 'down' | 'stable';
    }>;
  };
  customerBehavior: {
    acquisitionRate: number;
    retentionRate: number;
    churnPrediction: number;
    valueSegments: Array<{
      segment: string;
      size: number;
      value: number;
      growth: number;
    }>;
  };
}

export interface MarketTrend {
  id: string;
  name: string;
  description: string;
  impact: number; // -100 to 100
  probability: number; // 0-100
  timeframe: string;
  affectedSegments: string[];
  keyIndicators: Array<{
    name: string;
    value: number;
    change: number;
    unit: string;
  }>;
  relatedTrends: string[];
  lastUpdated: Date;
}

export interface PerformanceInsight {
  metric: string;
  currentValue: number;
  benchmarkValue: number;
  trend: 'improving' | 'declining' | 'stable';
  changePercentage: number;
  timeframe: string;
  factors: Array<{
    factor: string;
    impact: number; // -100 to 100
    controllable: boolean;
  }>;
  recommendations: string[];
  potentialImpact: number;
}

export interface OptimizationSuggestion {
  id: string;
  category: 'pricing' | 'inventory' | 'operations' | 'marketing' | 'supply_chain';
  title: string;
  description: string;
  currentState: string;
  proposedChange: string;
  expectedBenefit: {
    financial: number;
    timeframe: string;
    probability: number;
  };
  implementationComplexity: 'low' | 'medium' | 'high';
  requiredResources: string[];
  risks: string[];
  dependencies: string[];
  priority: number; // 1-10
  confidence: AIConfidence;
}

export interface CustomReport {
  id: string;
  name: string;
  description: string;
  type: 'demand' | 'pricing' | 'performance' | 'market' | 'custom';
  parameters: Record<string, any>;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
  format: 'pdf' | 'excel' | 'json' | 'dashboard';
  sections: Array<{
    title: string;
    type: 'chart' | 'table' | 'metric' | 'text';
    data: any;
  }>;
  createdAt: Date;
  lastGenerated?: Date;
  isActive: boolean;
}

// Smart Matching Interface Types
export interface SmartMatchingFilters {
  wasteTypes: string[];
  locations: string[];
  qualityRange: [number, number];
  priceRange: [number, number];
  quantityRange: [number, number];
  timeframe: string;
  urgency: 'low' | 'medium' | 'high';
  preferredSuppliers: string[];
  paymentTerms: string[];
}

export interface SmartMatchingResponse {
  materialRecommendations: MaterialRecommendation[];
  buyerSuggestions: BuyerSuggestion[];
  priceOptimizations: PriceOptimization[];
  marketInsights: MarketInsight[];
  totalMatches: number;
  searchId: string;
  generatedAt: Date;
  validUntil: Date;
}

// Analytics Dashboard Types
export interface AnalyticsDashboardData {
  predictiveAnalytics: PredictiveAnalytics;
  marketTrends: MarketTrend[];
  performanceInsights: PerformanceInsight[];
  optimizationSuggestions: OptimizationSuggestion[];
  demandForecast: DemandForecast;
  keyMetrics: Array<{
    name: string;
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    unit: string;
    period: string;
  }>;
  alerts: AIInsight[];
  lastUpdated: Date;
}

// AI Service Request/Response Types
export interface AIRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, any>;
  body?: any;
  timeout?: number;
}

export interface AIResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
  confidence?: AIConfidence;
  processingTime: number;
  requestId: string;
  timestamp: Date;
}

// Chart and Visualization Types
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }>;
}

export interface MetricCard {
  title: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  unit?: string;
  description?: string;
  color?: string;
  icon?: string;
}

// State management types
export interface AIState {
  smartMatching: {
    isLoading: boolean;
    results: SmartMatchingResponse | null;
    filters: SmartMatchingFilters;
    history: SmartMatchingResponse[];
    error: string | null;
  };
  analytics: {
    isLoading: boolean;
    dashboardData: AnalyticsDashboardData | null;
    customReports: CustomReport[];
    error: string | null;
    lastRefresh: Date | null;
  };
  insights: {
    active: AIInsight[];
    dismissed: AIInsight[];
    unread: number;
  };
  preferences: {
    autoRefresh: boolean;
    refreshInterval: number;
    notifications: boolean;
    confidenceThreshold: number;
  };
}