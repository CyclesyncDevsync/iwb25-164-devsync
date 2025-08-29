'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  PhotoIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface MaterialData {
  materialId: string;
  workflowId: string;
  title: string;
  category: string;
  subCategory: string;
  quantity: number;
  unit: string;
  photos: string[];
  verifiedQuantity: number;
  qualityScore: number;
  conditionRating: number;
  agentNotes?: string;
  expectedPrice: number;
  agentSuggestedPrice?: number;
  agentVisitCost: number;
}

interface AuctionCreationInterfaceProps {
  materialData: MaterialData;
  supplierId: string;
  onAuctionCreated?: (auctionId: string) => void;
}

export default function AuctionCreationInterface({
  materialData,
  supplierId,
  onAuctionCreated
}: AuctionCreationInterfaceProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [showPriceAnalysis, setShowPriceAnalysis] = useState(false);
  
  // Auction parameters
  const [auctionType, setAuctionType] = useState<'standard' | 'dutch' | 'sealed'>('standard');
  const [startingPrice, setStartingPrice] = useState(materialData.agentSuggestedPrice || materialData.expectedPrice * 0.7);
  const [reservePrice, setReservePrice] = useState(materialData.agentSuggestedPrice || materialData.expectedPrice * 0.85);
  const [bidIncrement, setBidIncrement] = useState(Math.round(startingPrice * 0.05));
  const [durationDays, setDurationDays] = useState(7);
  const [description, setDescription] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Calculate fees and estimates
  const platformFeePercent = 5;
  const estimatedFinalPrice = (startingPrice + reservePrice) / 2;
  const platformFee = estimatedFinalPrice * (platformFeePercent / 100);
  const netAmount = estimatedFinalPrice - platformFee - materialData.agentVisitCost;

  // Price recommendations
  const marketAnalysis = {
    averagePrice: materialData.expectedPrice * 0.95,
    recentSales: [
      { price: materialData.expectedPrice * 0.92, daysAgo: 3 },
      { price: materialData.expectedPrice * 0.98, daysAgo: 7 },
      { price: materialData.expectedPrice * 0.88, daysAgo: 10 }
    ],
    demandLevel: materialData.qualityScore > 80 ? 'High' : materialData.qualityScore > 60 ? 'Medium' : 'Low',
    recommendedDuration: materialData.qualityScore > 80 ? 5 : 7
  };

  useEffect(() => {
    // Generate description based on material data
    const qualityText = materialData.qualityScore > 80 ? 'excellent' : materialData.qualityScore > 60 ? 'good' : 'fair';
    const autoDescription = `${materialData.title} in ${qualityText} condition. Verified quantity: ${materialData.verifiedQuantity} ${materialData.unit}. Quality score: ${materialData.qualityScore}/100. ${materialData.agentNotes || ''}`;
    setDescription(autoDescription);
  }, [materialData]);

  const handleCreateAuction = async () => {
    if (!acceptTerms) {
      alert('Please accept the terms and conditions');
      return;
    }

    setIsCreating(true);

    try {
      const auctionData = {
        materialId: materialData.materialId,
        workflowId: materialData.workflowId,
        supplierId,
        title: materialData.title,
        description,
        category: materialData.category,
        subCategory: materialData.subCategory,
        quantity: materialData.verifiedQuantity,
        unit: materialData.unit,
        conditionRating: materialData.conditionRating,
        qualityScore: materialData.qualityScore,
        startingPrice,
        reservePrice,
        bidIncrement,
        auctionType,
        durationDays,
        photos: materialData.photos,
        verificationDetails: {
          verifiedQuantity: materialData.verifiedQuantity,
          qualityScore: materialData.qualityScore,
          conditionRating: materialData.conditionRating
        },
        agentNotes: materialData.agentNotes
      };

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      const auctionId = `auction_${Date.now()}`;
      
      console.log('Auction created:', auctionData);
      onAuctionCreated?.(auctionId);
    } catch (error) {
      console.error('Error creating auction:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Create Auction Listing
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your material has been approved! Set up your auction parameters.
          </p>
        </div>

        {/* Material Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Material Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Material</span>
              <p className="font-medium text-gray-900 dark:text-white">{materialData.title}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Verified Quantity</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {materialData.verifiedQuantity} {materialData.unit}
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Quality Score</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {materialData.qualityScore}/100
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Expected Price</span>
              <p className="font-medium text-gray-900 dark:text-white">
                LKR {materialData.expectedPrice.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Photos Preview */}
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Photos</p>
            <div className="flex space-x-2 overflow-x-auto">
              {materialData.photos.slice(0, 5).map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Material ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Auction Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Auction Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                type: 'standard' as const,
                name: 'Standard Auction',
                description: 'Price increases with each bid',
                icon: ChartBarIcon
              },
              {
                type: 'dutch' as const,
                name: 'Dutch Auction',
                description: 'Price decreases over time',
                icon: ClockIcon
              },
              {
                type: 'sealed' as const,
                name: 'Sealed Bid',
                description: 'Bidders submit one sealed bid',
                icon: InformationCircleIcon
              }
            ].map(({ type, name, description, icon: Icon }) => (
              <button
                key={type}
                type="button"
                onClick={() => setAuctionType(type)}
                className={`p-4 rounded-lg border-2 transition-colors text-left ${
                  auctionType === type
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <Icon className={`w-6 h-6 mb-2 ${
                  auctionType === type ? 'text-emerald-600' : 'text-gray-400'
                }`} />
                <h4 className="font-medium text-gray-900 dark:text-white">{name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Price Analysis */}
        <div className="border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-lg p-4">
          <button
            type="button"
            onClick={() => setShowPriceAnalysis(!showPriceAnalysis)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center">
              <ChartBarIcon className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-800 dark:text-blue-200">
                Market Price Analysis
              </span>
            </div>
            <span className="text-blue-600">
              {showPriceAnalysis ? 'Hide' : 'Show'}
            </span>
          </button>

          {showPriceAnalysis && (
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <span className="text-blue-700 dark:text-blue-300">Market Average:</span>
                <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">
                  LKR {marketAnalysis.averagePrice.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300">Demand Level:</span>
                <span className={`ml-2 font-medium ${
                  marketAnalysis.demandLevel === 'High' ? 'text-green-700' :
                  marketAnalysis.demandLevel === 'Medium' ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {marketAnalysis.demandLevel}
                </span>
              </div>
              <div>
                <p className="text-blue-700 dark:text-blue-300 mb-1">Recent Sales:</p>
                {marketAnalysis.recentSales.map((sale, index) => (
                  <div key={index} className="flex justify-between text-blue-600 dark:text-blue-400">
                    <span>{sale.daysAgo} days ago</span>
                    <span>LKR {sale.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pricing Settings */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">Pricing Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Starting Price (LKR)
              </label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(Number(e.target.value))}
                  className="pl-10 w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              {materialData.agentSuggestedPrice && (
                <p className="text-xs text-gray-500 mt-1">
                  Agent suggested: LKR {materialData.agentSuggestedPrice.toLocaleString()}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reserve Price (LKR)
              </label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={reservePrice}
                  onChange={(e) => setReservePrice(Number(e.target.value))}
                  className="pl-10 w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimum price you're willing to accept
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bid Increment (LKR)
              </label>
              <input
                type="number"
                value={bidIncrement}
                onChange={(e) => setBidIncrement(Number(e.target.value))}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duration (Days)
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="pl-10 w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {[3, 5, 7, 10, 14].map(days => (
                    <option key={days} value={days}>
                      {days} days
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Auction Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Provide additional details about your material..."
          />
        </div>

        {/* Fee Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Fee Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Estimated Sale Price</span>
              <span className="text-gray-900 dark:text-white">
                LKR {estimatedFinalPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Platform Fee ({platformFeePercent}%)</span>
              <span className="text-gray-900 dark:text-white">
                - LKR {platformFee.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Agent Visit Cost</span>
              <span className="text-gray-900 dark:text-white">
                - LKR {materialData.agentVisitCost.toLocaleString()}
              </span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between font-medium">
              <span className="text-gray-900 dark:text-white">Estimated Net Amount</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                LKR {netAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-yellow-700 dark:text-yellow-300">
                The actual net amount will depend on the final auction price. Fees are only charged on successful sales.
              </p>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div>
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              I agree to the auction terms and conditions, including the platform fee of {platformFeePercent}% 
              and understand that the agent visit cost will be deducted from my payment.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-6 border-t">
          <button
            type="button"
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={handleCreateAuction}
            disabled={isCreating || !acceptTerms}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                Creating Auction...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Create Auction
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}