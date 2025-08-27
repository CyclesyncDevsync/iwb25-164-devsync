'use client';

import React, { useState, useEffect } from 'react';
import { pricingApi } from '@/services/pricingApi';
import { CurrencyDollarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface PriceWidgetProps {
  materialType: string;
  quantity: number;
  qualityScore: number;
  showDetails?: boolean;
  onPriceUpdate?: (price: number) => void;
}

export const PriceWidget: React.FC<PriceWidgetProps> = ({
  materialType,
  quantity,
  qualityScore,
  showDetails = false,
  onPriceUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [priceData, setPriceData] = useState<{
    estimatedPrice: number;
    priceRange: { min: number; max: number };
    trend?: string;
  } | null>(null);

  useEffect(() => {
    fetchPriceEstimate();
  }, [materialType, quantity, qualityScore]);

  const fetchPriceEstimate = async () => {
    if (!materialType || quantity <= 0) return;
    
    setLoading(true);
    try {
      const estimate = await pricingApi.getQuickPriceEstimate(materialType, quantity, qualityScore);
      setPriceData(estimate);
      onPriceUpdate?.(estimate.estimatedPrice);
    } catch (error) {
      console.error('Failed to get price estimate:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>
    );
  }

  if (!priceData) {
    return null;
  }

  return (
    <div className={`${showDetails ? 'space-y-2' : ''}`}>
      <div className="flex items-center space-x-2">
        <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          ₹{priceData.estimatedPrice.toFixed(2)}/kg
        </span>
      </div>
      
      {showDetails && (
        <>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Range: ₹{priceData.priceRange.min.toFixed(2)} - ₹{priceData.priceRange.max.toFixed(2)}
          </div>
          <div className="text-sm">
            <span className="font-medium">Total:</span>{' '}
            <span className="text-green-600 dark:text-green-400 font-semibold">
              ₹{(priceData.estimatedPrice * quantity).toFixed(2)}
            </span>
          </div>
        </>
      )}
    </div>
  );
};