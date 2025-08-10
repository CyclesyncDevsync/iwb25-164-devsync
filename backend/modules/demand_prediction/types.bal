// Demand Prediction Service Types
// This module handles all data structures for waste demand forecasting

import ballerina/time;

// Core waste stream data point
public type WasteDataPoint record {|
    string id;
    string wasteType;          // plastic, metal, organic, etc.
    string category;           // recyclable, hazardous, compostable
    float quantity;            // in tons
    string location;           // city/region
    float price;               // price per ton
    time:Utc timestamp;
    map<float> qualityMetrics; // purity, contamination, etc.
    string sourceIndustry;     // manufacturing, retail, construction
|};

// Historical demand data for analysis
public type DemandHistory record {|
    string wasteType;
    string location;
    WasteDataPoint[] historicalData; // Past 12 months minimum
    float[] demandTrend;             // Calculated demand over time
    float seasonalityFactor;         // Weekly/monthly patterns (0.0-2.0)
    float volatilityIndex;           // How unpredictable the demand is (0.0-1.0)
|};

// Market conditions that affect demand
public type MarketConditions record {|
    float economicIndex;        // Regional economic health (0.0-100.0)
    float rawMaterialPrices;    // Current virgin material prices
    float transportationCosts;  // Fuel and logistics costs
    float weatherFactor;        // Seasonal weather impact
    map<float> industryGrowth;  // Growth rates by industry
    float regulatoryImpact;     // Policy changes effect (0.0-1.0)
|};

// Demand prediction result
public type DemandForecast record {|
    string wasteType;
    string location;
    string predictionId;
    time:Utc generatedAt;
    
    // Predictions for next periods
    float nextWeekDemand;       // Predicted demand for next 7 days
    float nextMonthDemand;      // Predicted demand for next 30 days
    float nextQuarterDemand;    // Predicted demand for next 90 days
    
    // Confidence intervals
    float confidenceLevel;      // 0.0-1.0 (how confident we are)
    float demandLowerBound;     // Minimum expected demand
    float demandUpperBound;     // Maximum expected demand
    
    // Price predictions
    float predictedPricePerTon;
    float priceVolatility;      // Expected price fluctuation
    
    // Market insights
    string[] keyDrivers;        // What's driving the demand
    string marketTrend;         // "increasing", "stable", "decreasing"
    float opportunityScore;     // Business opportunity rating (0.0-100.0)
|};

// Bidding recommendation based on demand prediction
public type BiddingRecommendation record {|
    string recommendationId;
    string wasteStreamId;
    time:Utc generatedAt;
    
    // Bidding strategy
    float suggestedStartingBid;
    float reservePrice;         // Minimum acceptable price
    float maximumBid;           // Don't bid higher than this
    
    // Timing recommendations
    time:Utc optimalBiddingTime;
    string biddingUrgency;      // "immediate", "within_hours", "can_wait"
    
    // Competition analysis
    float competitionLevel;     // How many others want this waste type
    string[] competitorInsights; // Insights about other bidders
    
    // Success probability
    float winProbability;       // Chance of winning at suggested bid
    float profitabilityScore;   // Expected profit score (0.0-100.0)
|};

// Seasonal pattern analysis
public type SeasonalPattern record {|
    string wasteType;
    string location;
    
    // Weekly patterns (Monday=0, Sunday=6)
    float[] weeklyMultipliers;  // [1.2, 0.8, 0.9, 1.0, 1.1, 0.7, 0.6]
    
    // Monthly patterns (Jan=0, Dec=11)  
    float[] monthlyMultipliers; // [0.9, 0.8, 1.1, 1.2, 1.0, ...]
    
    // Special events impact
    map<float> holidayEffects;  // Christmas: 0.3, Black Friday: 2.1
    map<float> industryEvents;  // Fashion Week: 1.8, Harvest Season: 2.5
|};

// Machine learning model metrics
public type ModelMetrics record {|
    string modelId;
    string algorithm;           // "linear_regression", "arima", "prophet"
    float accuracy;             // Model accuracy percentage
    float mse;                  // Mean Squared Error
    float mae;                  // Mean Absolute Error
    time:Utc lastTrainingDate;
    int trainingDataPoints;
    string modelStatus;         // "active", "training", "deprecated"
|};

// Demand prediction request payload
public type DemandPredictionRequest record {|
    string wasteType;
    string location;
    string timeHorizon;         // "week", "month", "quarter"
    boolean includeMarketAnalysis?;
    boolean includeBiddingRecommendations?;
    string[] additionalFactors?; // Custom factors to consider
|};

// Batch prediction request for multiple waste types
public type BatchPredictionRequest record {|
    string[] wasteTypes;
    string[] locations;
    string timeHorizon;
    map<anydata> customFilters?;
|};

// Real-time demand alerts
public type DemandAlert record {|
    string alertId;
    string wasteType;
    string location;
    string alertType;           // "spike", "drop", "opportunity", "shortage"
    string severity;            // "low", "medium", "high", "critical"
    string message;
    time:Utc triggeredAt;
    float threshold;            // What triggered this alert
    float currentValue;         // Current demand level
    DemandForecast? forecast?;  // Related forecast if applicable
|};