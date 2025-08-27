'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  BidRecommendationRequest,
  BidRecommendationResponse,
  MATERIAL_TYPES,
  Location
} from '@/types/pricing';
import { pricingApi } from '@/services/pricingApi';

export const BidRecommendation: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<BidRecommendationResponse | null>(null);
  
  const [formData, setFormData] = useState<BidRecommendationRequest>({
    materialType: 'plastic',
    quantity: 100,
    qualityScore: 75,
    location: { latitude: 19.0760, longitude: 72.8777 }, // Mumbai default
    targetMargin: 0.15
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await pricingApi.getBidRecommendation(formData);
      setRecommendation(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get bid recommendation');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof BidRecommendationRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getWinProbabilityColor = (probability: number) => {
    if (probability > 0.7) return 'text-green-600';
    if (probability > 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getWinProbabilityLabel = (probability: number) => {
    if (probability > 0.7) return 'High';
    if (probability > 0.4) return 'Medium';
    return 'Low';
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Bid Recommendation</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Material Type</label>
          <Select
            value={formData.materialType}
            onChange={(value) => handleInputChange('materialType', value)}
            className="w-full"
          >
            {MATERIAL_TYPES.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Quantity (kg)</label>
          <Input
            type="number"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value))}
            min="1"
            step="0.1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Quality Score (0-100)</label>
          <Input
            type="number"
            value={formData.qualityScore}
            onChange={(e) => handleInputChange('qualityScore', parseFloat(e.target.value))}
            min="0"
            max="100"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Target Profit Margin (%)</label>
          <Input
            type="number"
            value={(formData.targetMargin || 0.15) * 100}
            onChange={(e) => handleInputChange('targetMargin', parseFloat(e.target.value) / 100)}
            min="0"
            max="50"
            step="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Latitude"
              value={formData.location.latitude}
              onChange={(e) => handleInputChange('location', {
                ...formData.location,
                latitude: parseFloat(e.target.value)
              })}
              step="0.000001"
              required
            />
            <Input
              type="number"
              placeholder="Longitude"
              value={formData.location.longitude}
              onChange={(e) => handleInputChange('location', {
                ...formData.location,
                longitude: parseFloat(e.target.value)
              })}
              step="0.000001"
              required
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Getting Recommendation...' : 'Get Bid Recommendation'}
        </Button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
          {error}
        </div>
      )}

      {recommendation && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">Bidding Strategy</h3>
          
          {/* Recommended Bid */}
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Suggested Bid</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              ₹{recommendation.suggestedBid.toFixed(2)}/kg
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Total: ₹{(recommendation.suggestedBid * formData.quantity).toFixed(2)}
            </p>
          </div>

          {/* Bid Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">Minimum Acceptable</p>
              <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                ₹{recommendation.minAcceptable.toFixed(2)}/kg
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">Maximum Reasonable</p>
              <p className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                ₹{recommendation.maxReasonable.toFixed(2)}/kg
              </p>
            </div>
          </div>

          {/* Win Probability */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Win Probability</span>
              <span className={`text-2xl font-bold ${getWinProbabilityColor(recommendation.winProbability)}`}>
                {(recommendation.winProbability * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  recommendation.winProbability > 0.7 ? 'bg-green-600' :
                  recommendation.winProbability > 0.4 ? 'bg-yellow-600' :
                  'bg-red-600'
                }`}
                style={{ width: `${recommendation.winProbability * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {getWinProbabilityLabel(recommendation.winProbability)} chance of winning
            </p>
          </div>

          {/* Strategy Recommendation */}
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded">
            <h4 className="font-semibold mb-2">Recommended Strategy</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {recommendation.strategy}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};