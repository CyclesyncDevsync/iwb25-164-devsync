// Dynamic Pricing Types

export interface Location {
  latitude: number;
  longitude: number;
}

export interface PricingRequest {
  materialType: string;
  quantity: number;
  qualityScore: number;
  pickup: Location;
  delivery: Location;
  urgency: 'immediate' | 'standard' | 'flexible';
  supplierId?: string;
  buyerId?: string;
}

export interface PriceFactors {
  marketTrend: string;
  demandLevel: string;
  competitionLevel: string;
  qualityPremium: number;
  seasonalAdjustment: number;
}

export interface PricingResponse {
  basePrice: number;
  recommendedPrice: number;
  minPrice: number;
  maxPrice: number;
  transportCost: number;
  profitMargin: number;
  confidence: 'high' | 'medium' | 'low';
  factors: PriceFactors;
  timestamp: string;
}

export interface MarketData {
  avgPrice: number;
  volatility: number;
  trend: 'rising' | 'falling' | 'stable';
  demandIndex: number;
  supplyIndex: number;
  competition: CompetitionData;
}

export interface CompetitionData {
  activeListings: number;
  avgCompetitorPrice: number;
  priceRange: number;
}

export interface TransportCostRequest {
  pickup: Location;
  delivery: Location;
  quantity: number;
  urgency?: 'immediate' | 'standard' | 'flexible';
  vehicleType?: string;
}

export interface TransportCostResponse {
  distance: number;
  baseCost: number;
  urgencyMultiplier: number;
  totalCost: number;
  estimatedTime: string;
}

export interface MarketAnalysisResponse {
  currentMarket: MarketData;
  priceHistory: number[];
  insights: string[];
  competitorPrices: Record<string, number>;
}

export interface HistoricalPrice {
  date: string;
  price: number;
  volume: number;
}

export interface PriceTrendResponse {
  history: HistoricalPrice[];
  currentPrice: number;
  priceChange: number;
  percentChange: number;
  trend: string;
  forecast: number[];
}

export interface BidRecommendationRequest {
  materialType: string;
  quantity: number;
  qualityScore: number;
  location: Location;
  targetMargin?: number;
}

export interface BidRecommendationResponse {
  suggestedBid: number;
  minAcceptable: number;
  maxReasonable: number;
  winProbability: number;
  strategy: string;
}

export const MATERIAL_TYPES = [
  'plastic',
  'metal',
  'paper',
  'glass',
  'electronic',
  'textile'
] as const;

export type MaterialType = typeof MATERIAL_TYPES[number];

export const URGENCY_LEVELS = [
  { value: 'immediate', label: 'Immediate (2-4 hours)', multiplier: 1.5 },
  { value: 'standard', label: 'Standard (1-2 days)', multiplier: 1.0 },
  { value: 'flexible', label: 'Flexible (3-5 days)', multiplier: 0.8 }
] as const;