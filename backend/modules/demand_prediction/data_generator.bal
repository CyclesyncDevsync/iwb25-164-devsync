// Demand Prediction Dummy Data Generator
// Generates realistic historical data and market conditions for testing

import ballerina/time;
import ballerina/random;
import ballerina/lang.'float as floats;
import ballerina/lang.'int as ints;

// Generate realistic historical waste data for the past 12 months
public function generateHistoricalData(string wasteType, string location) returns WasteDataPoint[] {
    WasteDataPoint[] historicalData = [];
    
    // Base values vary by waste type
    map<record {float baseQuantity; float basePrice; float seasonality;}> wasteProfiles = {
        "plastic": {baseQuantity: 15.5, basePrice: 450.0, seasonality: 0.3},
        "metal": {baseQuantity: 8.2, basePrice: 890.0, seasonality: 0.2},
        "organic": {baseQuantity: 45.8, basePrice: 85.0, seasonality: 0.7},
        "paper": {baseQuantity: 22.1, basePrice: 120.0, seasonality: 0.4},
        "glass": {baseQuantity: 6.7, basePrice: 95.0, seasonality: 0.1},
        "textiles": {baseQuantity: 12.3, basePrice: 180.0, seasonality: 0.5},
        "electronics": {baseQuantity: 3.1, basePrice: 2500.0, seasonality: 0.6}
    };
    
    record {float baseQuantity; float basePrice; float seasonality;}? profileOrNull = wasteProfiles[wasteType];
    record {float baseQuantity; float basePrice; float seasonality;} profile;
    
    if (profileOrNull is ()) {
        profile = {baseQuantity: 10.0, basePrice: 200.0, seasonality: 0.3};
    } else {
        profile = profileOrNull;
    }
    
    // Generate data for past 365 days
    int startTime = time:utcNow()[0] - (365 * 24 * 60 * 60);
    
    foreach int i in 0 ..< 365 {
        int currentTime = startTime + (i * 24 * 60 * 60);
        time:Utc timestamp = [currentTime, 0.0];
        
        // Add seasonal variation (higher demand in certain months)
        float seasonalFactor = 1.0 + profile.seasonality * 
            floats:sin(2.0 * 3.14159265359 * <float>i / 365.0);
        
        // Add weekly pattern (lower on weekends)
        int dayOfWeek = (i % 7);
        float weeklyFactor = dayOfWeek < 5 ? 1.0 : 0.6;
        
        // Add random noise and trend
        float noiseFactor = 0.8 + (random:createFloat() * 0.4);
        float trendFactor = 1.0 + (<float>i / 365.0) * 0.15; // 15% annual growth
        
        float quantity = profile.baseQuantity * seasonalFactor * 
                        weeklyFactor * noiseFactor * trendFactor;
        
        float price = profile.basePrice * (0.85 + random:createFloat() * 0.3) * trendFactor;
        
        WasteDataPoint dataPoint = {
            id: string `${wasteType}_${location}_${i}`,
            wasteType: wasteType,
            category: getCategoryForWasteType(wasteType),
            quantity: floats:round(quantity * 100.0) / 100.0,
            location: location,
            price: floats:round(price * 100.0) / 100.0,
            timestamp: timestamp,
            qualityMetrics: generateQualityMetrics(wasteType),
            sourceIndustry: getRandomSourceIndustry(wasteType)
        };
        
        historicalData.push(dataPoint);
    }
    
    return historicalData;
}

// Generate current market conditions
public function generateMarketConditions(string location) returns MarketConditions {
    return {
        economicIndex: 65.0 + (random:createFloat() * 20.0), // 65-85
        rawMaterialPrices: 800.0 + (random:createFloat() * 400.0), // 800-1200
        transportationCosts: 2.5 + (random:createFloat() * 1.0), // 2.5-3.5 per mile
        weatherFactor: 0.7 + (random:createFloat() * 0.6), // 0.7-1.3
        industryGrowth: {
            "manufacturing": 0.03 + (random:createFloat() * 0.05), // 3-8%
            "construction": 0.02 + (random:createFloat() * 0.04), // 2-6%
            "retail": 0.01 + (random:createFloat() * 0.03), // 1-4%
            "hospitality": 0.04 + (random:createFloat() * 0.06) // 4-10%
        },
        regulatoryImpact: 0.1 + (random:createFloat() * 0.3) // 10-40% policy impact
    };
}

// Generate seasonal patterns for a waste type
public function generateSeasonalPattern(string wasteType, string location) returns SeasonalPattern {
    
    // Different waste types have different seasonal patterns
    map<record {float[] weekly; float[] monthly;}> patterns = {
        "plastic": {
            weekly: [1.2, 1.1, 1.0, 1.0, 1.1, 0.8, 0.7], // Lower on weekends
            monthly: [0.9, 0.9, 1.0, 1.1, 1.2, 1.3, 1.2, 1.1, 1.0, 1.0, 1.1, 1.4] // Peak in June & December
        },
        "organic": {
            weekly: [1.0, 1.0, 1.0, 1.0, 1.1, 1.3, 1.4], // Higher on weekends (restaurants)
            monthly: [0.8, 0.8, 0.9, 1.0, 1.1, 1.3, 1.4, 1.3, 1.2, 1.1, 1.2, 1.5] // Peak in summer/holidays
        },
        "paper": {
            weekly: [1.1, 1.0, 1.0, 1.0, 1.1, 0.9, 0.8], // Office waste pattern
            monthly: [0.9, 1.0, 1.1, 1.1, 1.0, 0.9, 0.8, 0.9, 1.1, 1.2, 1.3, 1.0] // Q4 peak
        }
    };
    
    record {float[] weekly; float[] monthly;}? patternOrNull = patterns[wasteType];
    record {float[] weekly; float[] monthly;} pattern;
    
    if (patternOrNull is ()) {
        // Default pattern
        pattern = {
            weekly: [1.0, 1.0, 1.0, 1.0, 1.0, 0.9, 0.8],
            monthly: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
        };
    } else {
        pattern = patternOrNull;
    }
    
    return {
        wasteType: wasteType,
        location: location,
        weeklyMultipliers: pattern.weekly,
        monthlyMultipliers: pattern.monthly,
        holidayEffects: {
            "christmas": 1.8,
            "black_friday": 2.2,
            "earth_day": 1.3,
            "new_year": 1.5,
            "summer_vacation": 0.7
        },
        industryEvents: {
            "fashion_week": wasteType == "textiles" ? 2.5 : 1.0,
            "harvest_season": wasteType == "organic" ? 3.2 : 1.0,
            "back_to_school": wasteType == "paper" ? 1.8 : 1.0,
            "construction_season": wasteType == "metal" ? 2.1 : 1.0
        }
    };
}

// Generate dummy demand history with calculated trends
public function generateDemandHistory(string wasteType, string location) returns DemandHistory {
    WasteDataPoint[] historicalData = generateHistoricalData(wasteType, location);
    
    // Calculate demand trend from historical data
    float[] demandTrend = [];
    foreach var dataPoint in historicalData {
        demandTrend.push(dataPoint.quantity);
    }
    
    // Calculate seasonality factor (how much seasonal variation affects this waste type)
    float seasonalityFactor = calculateSeasonalityFactor(demandTrend);
    
    // Calculate volatility index (how unpredictable the demand is)
    float volatilityIndex = calculateVolatilityIndex(demandTrend);
    
    return {
        wasteType: wasteType,
        location: location,
        historicalData: historicalData,
        demandTrend: demandTrend,
        seasonalityFactor: seasonalityFactor,
        volatilityIndex: volatilityIndex
    };
}

// Helper function to get waste category
function getCategoryForWasteType(string wasteType) returns string {
    map<string> categories = {
        "plastic": "recyclable",
        "metal": "recyclable", 
        "organic": "compostable",
        "paper": "recyclable",
        "glass": "recyclable",
        "textiles": "reusable",
        "electronics": "hazardous"
    };
    
    return categories[wasteType] ?: "general";
}

// Helper function to generate quality metrics
function generateQualityMetrics(string wasteType) returns map<float> {
    map<float> baseMetrics = {
        "purity": 0.7 + (random:createFloat() * 0.25), // 70-95%
        "contamination": random:createFloat() * 0.3, // 0-30%
        "moisture": random:createFloat() * 0.2 // 0-20%
    };
    
    // Add waste-type specific metrics
    if (wasteType == "organic") {
        baseMetrics["decomposition_rate"] = random:createFloat() * 0.5;
        baseMetrics["nutrient_content"] = 0.3 + (random:createFloat() * 0.4);
    } else if (wasteType == "plastic") {
        baseMetrics["polymer_type_consistency"] = 0.6 + (random:createFloat() * 0.35);
        baseMetrics["color_consistency"] = 0.5 + (random:createFloat() * 0.4);
    } else if (wasteType == "metal") {
        baseMetrics["alloy_purity"] = 0.8 + (random:createFloat() * 0.15);
        baseMetrics["oxidation_level"] = random:createFloat() * 0.4;
    }
    
    return baseMetrics;
}

// Helper function to get random source industry
function getRandomSourceIndustry(string wasteType) returns string {
    map<string[]> industries = {
        "plastic": ["manufacturing", "packaging", "retail", "food_service"],
        "organic": ["food_service", "agriculture", "hospitality", "residential"],
        "paper": ["office", "printing", "retail", "education"],
        "metal": ["manufacturing", "construction", "automotive", "aerospace"],
        "electronics": ["tech", "telecommunications", "consumer_electronics", "office"]
    };
    
    string[] typeIndustries = industries[wasteType] ?: ["general", "mixed", "commercial"];
    int randomIndex = <int>(random:createFloat() * <float>typeIndustries.length());
    // Ensure index is within bounds (random can return 1.0 which would cause out of bounds)
    randomIndex = ints:min(randomIndex, typeIndustries.length() - 1);
    return typeIndustries[randomIndex];
}

