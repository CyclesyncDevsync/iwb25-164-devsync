
// Pricing Configuration
configurable string PRICING_SERVICE_PORT = "8085";

// Pricing Parameters
public const float MIN_PROFIT_MARGIN = 0.15;
public const float MAX_QUALITY_PREMIUM = 0.20;
public const float VOLATILITY_THRESHOLD = 0.3;
public const int PRICE_CACHE_TTL = 300; // 5 minutes
public const int HISTORICAL_DAYS = 90;
public const int FORECAST_DAYS = 7;

// Transport Cost Parameters
public const map<float> TRANSPORT_RATES = {
    "immediate": 0.5,
    "standard": 0.3,
    "flexible": 0.2
};

public const map<float> ROUTE_COMPLEXITY = {
    "urban": 1.2,
    "suburban": 1.0,
    "rural": 0.8
};

// Seasonal Factors by Material Type
public const map<map<float>> SEASONAL_FACTORS = {
    "plastic": {
        "1": 0.9, "2": 0.95, "3": 1.0, "4": 1.05, "5": 1.1, "6": 1.15,
        "7": 1.2, "8": 1.15, "9": 1.1, "10": 1.05, "11": 1.0, "12": 0.95
    },
    "metal": {
        "1": 1.05, "2": 1.0, "3": 1.0, "4": 1.0, "5": 1.05, "6": 1.1,
        "7": 1.1, "8": 1.05, "9": 1.0, "10": 1.0, "11": 0.95, "12": 0.9
    },
    "paper": {
        "1": 0.95, "2": 0.9, "3": 0.95, "4": 1.0, "5": 1.05, "6": 1.1,
        "7": 1.05, "8": 1.0, "9": 1.1, "10": 1.15, "11": 1.1, "12": 1.0
    },
    "glass": {
        "1": 1.0, "2": 1.0, "3": 1.0, "4": 1.0, "5": 1.0, "6": 1.0,
        "7": 1.0, "8": 1.0, "9": 1.0, "10": 1.0, "11": 1.0, "12": 1.0
    }
};

// Base Material Prices (per kg in currency units)
public const map<float> BASE_MATERIAL_PRICES = {
    "plastic": 45.0,
    "metal": 85.0,
    "paper": 25.0,
    "glass": 15.0,
    "electronic": 120.0,
    "textile": 30.0
};

// Quality Score Ranges
public const map<float[]> QUALITY_RANGES = {
    "premium": [80.0, 100.0],
    "standard": [60.0, 80.0],
    "acceptable": [40.0, 60.0],
    "substandard": [0.0, 40.0]
};

// Market Volatility Levels
public const map<string> VOLATILITY_LEVELS = {
    "low": "0.0-0.15",
    "medium": "0.15-0.30",
    "high": "0.30+"
};