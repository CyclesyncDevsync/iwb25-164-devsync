// Demand Prediction Calculation Utilities
// Contains calculation functions used by the demand prediction service

import ballerina/lang.'float as floats;
import ballerina/lang.array;

// Calculate how seasonal the waste type is based on demand trend data
public function calculateSeasonalityFactor(float[] demandTrend) returns float {
    if (demandTrend.length() < 12) {
        return 0.3; // Default low seasonality
    }
    
    // Simple seasonality calculation: variance across months
    float[] monthlyAverages = [];
    int monthSize = demandTrend.length() / 12;
    
    foreach int month in 0 ..< 12 {
        float monthSum = 0.0;
        int startIdx = month * monthSize;
        int endIdx = startIdx + monthSize;
        
        foreach int i in startIdx ..< endIdx {
            if (i < demandTrend.length()) {
                monthSum += demandTrend[i];
            }
        }
        monthlyAverages.push(monthSum / <float>monthSize);
    }
    
    // Calculate coefficient of variation for monthly averages
    float mean = array:reduce(monthlyAverages, function(float acc, float val) returns float => acc + val, 0.0) / 12.0;
    float variance = 0.0;
    
    foreach float monthlyAvg in monthlyAverages {
        variance += floats:pow(monthlyAvg - mean, 2.0);
    }
    variance = variance / 12.0;
    
    float standardDeviation = floats:sqrt(variance);
    float coefficientOfVariation = standardDeviation / mean;
    
    // Normalize to 0.0-1.0 range
    return floats:min(coefficientOfVariation, 1.0);
}

// Calculate volatility index (how unpredictable the demand is)
public function calculateVolatilityIndex(float[] demandTrend) returns float {
    if (demandTrend.length() < 2) {
        return 0.5; // Default medium volatility
    }
    
    // Calculate day-to-day percentage changes
    float[] percentChanges = [];
    foreach int i in 1 ..< demandTrend.length() {
        if (demandTrend[i-1] != 0.0) {
            float percentChangeRaw = (demandTrend[i] - demandTrend[i-1]) / demandTrend[i-1];
            float percentChange = 0.0;
            if (percentChangeRaw < 0.0) {
                percentChange = -percentChangeRaw;
            } else {
                percentChange = percentChangeRaw;
            }
            percentChanges.push(percentChange);
        }
    }
    
    if (percentChanges.length() == 0) {
        return 0.5;
    }
    
    // Calculate average volatility
    float avgVolatility = array:reduce(percentChanges, function(float acc, float val) returns float => acc + val, 0.0) 
                         / <float>percentChanges.length();
    
    // Normalize to 0.0-1.0 range (cap at 100% daily change = 1.0 volatility)
    return floats:min(avgVolatility, 1.0);
}