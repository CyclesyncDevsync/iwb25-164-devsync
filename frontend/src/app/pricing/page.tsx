'use client';

import React from 'react';
import { PriceCalculator } from '@/components/pricing/PriceCalculator';
import { MarketAnalysis } from '@/components/pricing/MarketAnalysis';
import { PriceTrends } from '@/components/pricing/PriceTrends';
import { BidRecommendation } from '@/components/pricing/BidRecommendation';

export default function PricingDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Dynamic Pricing Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Price Calculator */}
          <PriceCalculator />
          
          {/* Market Analysis */}
          <MarketAnalysis />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Price Trends */}
          <PriceTrends />
          
          {/* Bid Recommendation */}
          <BidRecommendation />
        </div>
      </div>
    </div>
  );
}