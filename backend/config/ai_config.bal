// AI Services Configuration
// Essential configurations for AI-related services

// Demand Prediction Settings
public configurable record {|
    int historicalDataDays;
    float confidenceThreshold;
    int maxForecastDays;
    boolean enableSeasonalAdjustment;
|} demandPredictionConfig = {
    historicalDataDays: 365,
    confidenceThreshold: 0.7,
    maxForecastDays: 90,
    enableSeasonalAdjustment: true
};

// Quality Assessment Settings
public configurable record {|
    float qualityThreshold;
    boolean enableAutoApproval;
    string[] supportedImageFormats;
|} qualityAssessmentConfig = {
    qualityThreshold: 0.75,
    enableAutoApproval: false,
    supportedImageFormats: ["jpg", "jpeg", "png", "webp"]
};

// Pricing Algorithm Settings
public configurable record {|
    float minPricePerTon;
    float maxPricePerTon;
    boolean enableDynamicPricing;
|} pricingConfig = {
    minPricePerTon: 10.0,
    maxPricePerTon: 5000.0,
    enableDynamicPricing: true
};

// Route Optimization Settings
public configurable record {|
    int maxRouteDistance; // in kilometers
    int maxStopsPerRoute;
    float fuelCostPerKm;
|} routeOptimizationConfig = {
    maxRouteDistance: 200,
    maxStopsPerRoute: 10,
    fuelCostPerKm: 0.15
};

// Agent Matching Settings
public configurable record {|
    float maxAgentDistance; // in kilometers
    int maxAgentWorkload;
    float skillWeightFactor;
|} agentMatchingConfig = {
    maxAgentDistance: 50.0,
    maxAgentWorkload: 5,
    skillWeightFactor: 0.7
};

// Supported Business Parameters
public configurable record {|
    string[] supportedWasteTypes;
    string[] supportedLocations;
|} businessConfig = {
    supportedWasteTypes: [
        "plastic", "metal", "organic", "paper", 
        "glass", "textiles", "electronics"
    ],
    supportedLocations: [
        "colombo", "kandy", "galle", "jaffna",
        "negombo", "matara", "batticaloa", "trincomalee"
    ]
};

// Alert Thresholds
public configurable record {|
    float demandSpikeThreshold;
    float demandDropThreshold;
    float priceVolatilityThreshold;
|} alertThresholds = {
    demandSpikeThreshold: 0.5, // 50% increase
    demandDropThreshold: 0.3,  // 30% decrease
    priceVolatilityThreshold: 0.4 // 40% price swing
};