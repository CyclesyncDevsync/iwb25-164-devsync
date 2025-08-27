// Dynamic Pricing Module Types

public type Location record {|
    float latitude;
    float longitude;
|};

public type PricingRequest record {|
    string materialType;
    float quantity;
    float qualityScore;
    Location pickup;
    Location delivery;
    string urgency = "standard"; // immediate, standard, flexible
    string? supplierId = ();
    string? buyerId = ();
|};

public type PriceFactors record {|
    string marketTrend;
    string demandLevel;
    string competitionLevel;
    float qualityPremium;
    float seasonalAdjustment;
|};

public type PricingResponse record {|
    float basePrice;
    float recommendedPrice;
    float minPrice;
    float maxPrice;
    float transportCost;
    float profitMargin;
    string confidence;
    PriceFactors factors;
    string timestamp;
|};

public type MarketData record {|
    float avgPrice;
    float volatility;
    string trend;
    float demandIndex;
    float supplyIndex;
    CompetitionData competition;
|};

public type CompetitionData record {|
    int activeListings;
    float avgCompetitorPrice;
    float priceRange;
|};

public type TransportCostRequest record {|
    Location pickup;
    Location delivery;
    float quantity;
    string urgency = "standard";
    string vehicleType = "standard";
|};

public type TransportCostResponse record {|
    float distance;
    float baseCost;
    float urgencyMultiplier;
    float totalCost;
    string estimatedTime;
|};

public type MarketAnalysisRequest record {|
    string materialType;
    Location? location = ();
    int radius = 50; // km
|};

public type MarketAnalysisResponse record {|
    MarketData currentMarket;
    float[] priceHistory;
    string[] insights;
    map<float> competitorPrices;
|};

public type BidRecommendationRequest record {|
    string materialType;
    float quantity;
    float qualityScore;
    Location location;
    float targetMargin = 0.15;
|};

public type BidRecommendationResponse record {|
    float suggestedBid;
    float minAcceptable;
    float maxReasonable;
    float winProbability;
    string strategy;
|};

public type HistoricalPrice record {|
    string date;
    float price;
    float volume;
|};

public type PriceTrendRequest record {|
    string materialType;
    int days = 30;
    Location? location = ();
|};

public type PriceTrendResponse record {|
    HistoricalPrice[] history;
    float currentPrice;
    float priceChange;
    float percentChange;
    string trend;
    float[] forecast;
|};

public type MaterialPriceCache record {|
    string materialType;
    float price;
    string timestamp;
    int ttl = 300; // 5 minutes
|};

public type SeasonalFactor record {|
    map<float> factors;
|};