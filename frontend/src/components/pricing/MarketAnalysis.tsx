'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { MATERIAL_TYPES, MarketAnalysisResponse } from '@/types/pricing';
import { pricingApi } from '@/services/pricingApi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export const MarketAnalysis: React.FC = () => {
  const [selectedMaterial, setSelectedMaterial] = useState<string>('plastic');
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState<MarketAnalysisResponse | null>(null);

  useEffect(() => {
    fetchMarketData();
  }, [selectedMaterial]);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      console.log(`Fetching market data for: ${selectedMaterial}`);
      const data = await pricingApi.getMarketAnalysis(selectedMaterial);
      console.log('Market data received:', data);
      setMarketData(data);
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      // You might want to set an error state here
      setMarketData(null);
    } finally {
      setLoading(false);
    }
  };

  const getSupplyDemandData = () => {
    if (!marketData) return [];
    return [
      { name: 'Supply', value: marketData.currentMarket.supplyIndex },
      { name: 'Demand', value: marketData.currentMarket.demandIndex }
    ];
  };

  const getPriceHistoryData = () => {
    if (!marketData) return [];
    return marketData.priceHistory.map((price, index) => ({
      day: `Day ${index + 1}`,
      price: price
    }));
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Market Analysis</h2>
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
        <div className="text-center py-8">Loading market data...</div>
      ) : marketData ? (
        <div className="space-y-6">
          {/* Price History Chart */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Price History (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getPriceHistoryData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3B82F6" 
                  name="Price (LKR/kg)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>


        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">No data available</div>
      )}
    </Card>
  );
};