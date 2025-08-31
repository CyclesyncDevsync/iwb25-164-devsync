'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { MATERIAL_TYPES, PriceTrendResponse } from '@/types/pricing';
import { pricingApi } from '@/services/pricingApi';

export const PriceTrends: React.FC = () => {
  const [selectedMaterial, setSelectedMaterial] = useState<string>('plastic');
  const [loading, setLoading] = useState(false);
  const [trendData, setTrendData] = useState<PriceTrendResponse | null>(null);

  useEffect(() => {
    fetchTrendData();
  }, [selectedMaterial]);

  const fetchTrendData = async () => {
    setLoading(true);
    try {
      const data = await pricingApi.getPriceTrends(selectedMaterial, 30, true);
      setTrendData(data);
    } catch (error) {
      console.error('Failed to fetch trend data:', error);
    } finally {
      setLoading(false);
    }
  };


  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising': return 'text-green-600';
      case 'falling': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return '📈';
      case 'falling': return '📉';
      default: return '➡️';
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Price Trends & Forecast</h2>
        <Select
          value={selectedMaterial}
          onChange={(value) => setSelectedMaterial(value)}
          options={MATERIAL_TYPES.map(type => ({
            value: type,
            label: type.charAt(0).toUpperCase() + type.slice(1)
          }))}
          className="w-48"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Loading trend data...</div>
      ) : trendData ? (
        <div className="space-y-6">
          {/* Current Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Price</p>
              <p className="text-xl font-bold text-blue-600">
                LKR {trendData.currentPrice.toFixed(2)}
              </p>
            </div>
            
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">Change</p>
              <p className={`text-xl font-bold ${trendData.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trendData.priceChange >= 0 ? '+' : ''}LKR {trendData.priceChange.toFixed(2)}
              </p>
            </div>
            
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">% Change</p>
              <p className={`text-xl font-bold ${trendData.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trendData.percentChange >= 0 ? '+' : ''}{trendData.percentChange.toFixed(1)}%
              </p>
            </div>
            
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">Trend</p>
              <p className={`text-xl font-bold ${getTrendColor(trendData.trend)}`}>
                {getTrendIcon(trendData.trend)} {trendData.trend}
              </p>
            </div>
          </div>


          {/* Forecast Summary */}
          {trendData.forecast.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">7-Day Forecast</h3>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tomorrow</p>
                    <p className="font-semibold">LKR {trendData.forecast[0]?.toFixed(2) || 'N/A'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">3 Days</p>
                    <p className="font-semibold">LKR {trendData.forecast[2]?.toFixed(2) || 'N/A'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">5 Days</p>
                    <p className="font-semibold">LKR {trendData.forecast[4]?.toFixed(2) || 'N/A'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">7 Days</p>
                    <p className="font-semibold">LKR {trendData.forecast[6]?.toFixed(2) || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">No data available</div>
      )}
    </Card>
  );
};