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
          className="w-48"
        >
          {MATERIAL_TYPES.map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading market data...</div>
      ) : marketData ? (
        <div className="space-y-6">
          {/* Market Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Price</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ₹{marketData.currentMarket.avgPrice.toFixed(2)}/kg
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Trend: {marketData.currentMarket.trend}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Market Volatility</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {(marketData.currentMarket.volatility * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {marketData.currentMarket.volatility > 0.3 ? 'High' : 
                 marketData.currentMarket.volatility > 0.15 ? 'Medium' : 'Low'}
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Listings</h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {marketData.currentMarket.competition.activeListings}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Avg: ₹{marketData.currentMarket.competition.avgCompetitorPrice.toFixed(2)}
              </p>
            </div>
          </div>

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
                  name="Price (₹/kg)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Supply vs Demand */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Supply vs Demand</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={getSupplyDemandData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Market Insights */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Market Insights</h3>
            <div className="space-y-2">
              {marketData.insights.map((insight, index) => (
                <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Competitor Prices */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Competitor Prices</h3>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(marketData.competitorPrices).map(([competitor, price]) => (
                <div key={competitor} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{competitor}</p>
                  <p className="font-semibold">₹{price.toFixed(2)}/kg</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">No data available</div>
      )}
    </Card>
  );
};