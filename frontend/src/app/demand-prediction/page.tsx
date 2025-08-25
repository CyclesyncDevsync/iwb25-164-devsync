'use client';

import { useState, useEffect } from 'react';

interface DemandForecast {
  wasteType: string;
  location: string;
  predictionId: string;
  generatedAt: [number, number];
  nextWeekDemand: number;
  nextMonthDemand: number;
  nextQuarterDemand: number;
  confidenceLevel: number;
  demandLowerBound: number;
  demandUpperBound: number;
  predictedPricePerTon: number;
  priceVolatility: number;
  keyDrivers: string[];
  marketTrend: string;
  opportunityScore: number;
}

interface BiddingRecommendation {
  recommendationId: string;
  wasteStreamId: string;
  generatedAt: [number, number];
  suggestedStartingBid: number;
  reservePrice: number;
  maximumBid: number;
  optimalBiddingTime: [number, number];
  biddingUrgency: string;
  competitionLevel: number;
  competitorInsights: string[];
  winProbability: number;
  profitabilityScore: number;
}

export default function DemandPredictionDashboard() {
  const [forecastData, setForecastData] = useState<DemandForecast | null>(null);
  const [biddingData, setBiddingData] = useState<BiddingRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wasteType, setWasteType] = useState('plastic');
  const [location, setLocation] = useState('colombo');
  const [timeHorizon, setTimeHorizon] = useState('week');

  const wasteTypes = ['plastic', 'organic', 'paper', 'metal', 'electronics'];
  const locations = ['colombo', 'kandy', 'galle', 'jaffna'];
  const timeHorizons = ['week', 'month', 'quarter'];

  const getDemandForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8081/api/ai/demand/forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wasteType,
          location,
          timeHorizon
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setForecastData(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch forecast data');
    } finally {
      setLoading(false);
    }
  };

  const getBiddingRecommendations = async () => {
    if (!forecastData) return;
    
    try {
      const response = await fetch('http://localhost:8081/api/ai/demand/bidding-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wasteStreamId: 'WS-12345',
          wasteType,
          location,
          quantity: 25.5
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setBiddingData(data);
    } catch (error) {
      console.error('Failed to fetch bidding recommendations:', error);
    }
  };

  useEffect(() => {
    getDemandForecast();
  }, []);

  useEffect(() => {
    if (forecastData) {
      getBiddingRecommendations();
    }
  }, [forecastData]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence < 0.5) return 'text-red-600 bg-red-50';
    if (confidence < 0.75) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getOpportunityLabel = (score: number) => {
    if (score >= 80) return 'Excellent Opportunity';
    if (score >= 60) return 'Good Opportunity';
    if (score >= 40) return 'Fair Opportunity';
    return 'Poor Opportunity';
  };

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      default: return '➡️';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch(urgency) {
      case 'immediate': return 'text-red-600 bg-red-50';
      case 'urgent': return 'text-orange-600 bg-orange-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">AI-Powered Demand Prediction Dashboard</h1>
        
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Forecast Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Waste Type</label>
              <select
                value={wasteType}
                onChange={(e) => setWasteType(e.target.value)}
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {wasteTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc.charAt(0).toUpperCase() + loc.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Horizon</label>
              <select
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(e.target.value)}
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {timeHorizons.map(horizon => (
                  <option key={horizon} value={horizon}>{horizon.charAt(0).toUpperCase() + horizon.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={getDemandForecast}
                disabled={loading}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-300 transition-colors"
              >
                {loading ? 'Loading...' : 'Get Forecast'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}

        {forecastData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Demand Forecast Card */}
            <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Demand Forecast - {forecastData.wasteType.charAt(0).toUpperCase() + forecastData.wasteType.slice(1)}
              </h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{Math.round(forecastData.nextWeekDemand)}</p>
                  <p className="text-sm text-gray-600">Weekly (tons)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{Math.round(forecastData.nextMonthDemand)}</p>
                  <p className="text-sm text-gray-600">Monthly (tons)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{Math.round(forecastData.nextQuarterDemand)}</p>
                  <p className="text-sm text-gray-600">Quarterly (tons)</p>
                </div>
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(forecastData.confidenceLevel)}`}>
                Confidence: {Math.round(forecastData.confidenceLevel * 100)}%
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Expected range: {Math.round(forecastData.demandLowerBound)} - {Math.round(forecastData.demandUpperBound)} tons/week
              </div>
            </div>

            {/* Market Insights Card */}
            <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Analysis</h2>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Opportunity Score</span>
                  <span className="text-sm font-medium text-green-600">{Math.round(forecastData.opportunityScore)}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${forecastData.opportunityScore}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{getOpportunityLabel(forecastData.opportunityScore)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Market Trend</p>
                  <p className="font-semibold">{getTrendIcon(forecastData.marketTrend)} {forecastData.marketTrend}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price Volatility</p>
                  <p className="font-semibold">{Math.round(forecastData.priceVolatility * 100)}%</p>
                </div>
              </div>
              <div className="text-center text-lg font-bold text-green-600 mb-4">
                ${forecastData.predictedPricePerTon.toFixed(2)}/ton
              </div>
            </div>
          </div>
        )}

        {forecastData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Drivers */}
            <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Drivers</h2>
              <ul className="space-y-2">
                {forecastData.keyDrivers.map((driver, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{driver}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bidding Recommendations */}
            {biddingData && (
              <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Bidding Recommendations</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Starting Bid</p>
                      <p className="text-lg font-semibold text-green-600">${biddingData.suggestedStartingBid.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reserve Price</p>
                      <p className="text-lg font-semibold text-yellow-600">${biddingData.reservePrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Maximum Bid</p>
                      <p className="text-lg font-semibold text-red-600">${biddingData.maximumBid.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Win Probability</p>
                      <p className="font-semibold">{Math.round(biddingData.winProbability * 100)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Competition Level</p>
                      <p className="font-semibold">{Math.round(biddingData.competitionLevel * 100)}%</p>
                    </div>
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(biddingData.biddingUrgency)}`}>
                    Urgency: {biddingData.biddingUrgency}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Competitor Insights:</p>
                    <ul className="space-y-1">
                      {biddingData.competitorInsights.map((insight, index) => (
                        <li key={index} className="text-sm text-gray-700">• {insight}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}