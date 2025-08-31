import {
  PricingRequest,
  PricingResponse,
  TransportCostRequest,
  TransportCostResponse,
  MarketAnalysisResponse,
  PriceTrendResponse,
  BidRecommendationRequest,
  BidRecommendationResponse,
  Location
} from '@/types/pricing';

const PRICING_API_URL = process.env.NEXT_PUBLIC_PRICING_API_URL || 'http://localhost:8088';

class PricingApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = PRICING_API_URL;
  }

  // Calculate optimal price for materials
  async calculatePrice(request: PricingRequest): Promise<PricingResponse> {
    const response = await fetch(`${this.baseUrl}/pricing/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to calculate price');
    }

    return response.json();
  }

  // Get market analysis for a material type
  async getMarketAnalysis(
    materialType: string,
    location?: Location,
    radius: number = 50
  ): Promise<MarketAnalysisResponse> {
    const params = new URLSearchParams();
    if (location) {
      params.append('lat', location.latitude.toString());
      params.append('lng', location.longitude.toString());
    }
    params.append('radius', radius.toString());

    const response = await fetch(
      `${this.baseUrl}/pricing/market/${materialType}?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get market analysis');
    }

    return response.json();
  }

  // Calculate transport cost
  async calculateTransportCost(
    request: TransportCostRequest
  ): Promise<TransportCostResponse> {
    const response = await fetch(`${this.baseUrl}/pricing/transport`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to calculate transport cost');
    }

    return response.json();
  }

  // Get price trends
  async getPriceTrends(
    materialType: string,
    days: number = 30,
    includeForecast: boolean = true
  ): Promise<PriceTrendResponse> {
    const params = new URLSearchParams({
      days: days.toString(),
      forecast: includeForecast.toString(),
    });

    const response = await fetch(
      `${this.baseUrl}/pricing/trends/${materialType}?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get price trends');
    }

    return response.json();
  }

  // Get bid recommendation
  async getBidRecommendation(
    request: BidRecommendationRequest
  ): Promise<BidRecommendationResponse> {
    const response = await fetch(`${this.baseUrl}/pricing/bid-recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get bid recommendation');
    }

    return response.json();
  }

  // Quick price estimate
  async getQuickPriceEstimate(
    materialType: string,
    quantity: number,
    qualityScore: number = 70
  ): Promise<{ estimatedPrice: number; priceRange: { min: number; max: number } }> {
    // Use default locations for quick estimate
    const defaultRequest: PricingRequest = {
      materialType,
      quantity,
      qualityScore,
      pickup: { latitude: 6.9271, longitude: 79.8612 }, // Colombo
      delivery: { latitude: 6.9271, longitude: 79.8612 }, // Same city
      urgency: 'standard',
    };

    const response = await this.calculatePrice(defaultRequest);
    
    return {
      estimatedPrice: response.recommendedPrice,
      priceRange: {
        min: response.minPrice,
        max: response.maxPrice,
      },
    };
  }
}

export const pricingApi = new PricingApiService();