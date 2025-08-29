'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  PricingRequest,
  PricingResponse,
  MATERIAL_TYPES,
  URGENCY_LEVELS,
  Location
} from '@/types/pricing';
import { pricingApi } from '@/services/pricingApi';

interface PriceCalculatorProps {
  onPriceCalculated?: (response: PricingResponse) => void;
  defaultLocation?: Location;
}

export const PriceCalculator: React.FC<PriceCalculatorProps> = ({
  onPriceCalculated,
  defaultLocation = { latitude: 19.0760, longitude: 72.8777 } // Mumbai default
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pricingResponse, setPricingResponse] = useState<PricingResponse | null>(null);
  
  const [formData, setFormData] = useState<PricingRequest>({
    materialType: 'plastic',
    quantity: 100,
    qualityScore: 75,
    pickup: defaultLocation,
    delivery: defaultLocation,
    urgency: 'standard'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await pricingApi.calculatePrice(formData);
      setPricingResponse(response);
      onPriceCalculated?.(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate price');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PricingRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Dynamic Price Calculator</h2>
      
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
          <label className="block text-sm font-medium mb-2">Urgency</label>
          <Select
            value={formData.urgency}
            onChange={(value) => handleInputChange('urgency', value)}
            className="w-full"
          >
            {URGENCY_LEVELS.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Pickup Location</label>
            <Input
              type="text"
              placeholder="Latitude"
              value={formData.pickup.latitude}
              onChange={(e) => handleInputChange('pickup', {
                ...formData.pickup,
                latitude: parseFloat(e.target.value)
              })}
              required
            />
            <Input
              type="text"
              placeholder="Longitude"
              value={formData.pickup.longitude}
              onChange={(e) => handleInputChange('pickup', {
                ...formData.pickup,
                longitude: parseFloat(e.target.value)
              })}
              className="mt-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Delivery Location</label>
            <Input
              type="text"
              placeholder="Latitude"
              value={formData.delivery.latitude}
              onChange={(e) => handleInputChange('delivery', {
                ...formData.delivery,
                latitude: parseFloat(e.target.value)
              })}
              required
            />
            <Input
              type="text"
              placeholder="Longitude"
              value={formData.delivery.longitude}
              onChange={(e) => handleInputChange('delivery', {
                ...formData.delivery,
                longitude: parseFloat(e.target.value)
              })}
              className="mt-2"
              required
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Calculating...' : 'Calculate Price'}
        </Button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
          {error}
        </div>
      )}

      {pricingResponse && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">Price Calculation Results</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">Recommended Price</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₹{pricingResponse.recommendedPrice.toFixed(2)}/kg
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">Price Range</p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                ₹{pricingResponse.minPrice.toFixed(2)} - ₹{pricingResponse.maxPrice.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Base Price:</span>
              <span>₹{pricingResponse.basePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Transport Cost:</span>
              <span>₹{pricingResponse.transportCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Profit Margin:</span>
              <span>{(pricingResponse.profitMargin * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Confidence Level:</span>
              <span className={`font-semibold ${
                pricingResponse.confidence === 'high' ? 'text-green-600' :
                pricingResponse.confidence === 'medium' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {pricingResponse.confidence.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded">
            <h4 className="font-semibold mb-2">Market Factors</h4>
            <div className="space-y-1 text-sm">
              <p>Market Trend: <span className="font-medium">{pricingResponse.factors.marketTrend}</span></p>
              <p>Demand Level: <span className="font-medium">{pricingResponse.factors.demandLevel}</span></p>
              <p>Competition: <span className="font-medium">{pricingResponse.factors.competitionLevel}</span></p>
              <p>Quality Premium: <span className="font-medium">{(pricingResponse.factors.qualityPremium * 100).toFixed(1)}%</span></p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};