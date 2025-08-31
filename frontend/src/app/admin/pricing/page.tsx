'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PriceCalculator } from '@/components/pricing/PriceCalculator';
import { MarketAnalysis } from '@/components/pricing/MarketAnalysis';
import { PriceTrends } from '@/components/pricing/PriceTrends';
import { BidRecommendation } from '@/components/pricing/BidRecommendation';

export default function AdminPricingPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dynamic Pricing Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage pricing strategies and analyze market trends
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PriceCalculator />
          <MarketAnalysis />
          <PriceTrends />
          <BidRecommendation />
        </div>
      </div>
    </DashboardLayout>
  );
}