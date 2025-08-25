// Demand Prediction Forecasting Algorithms
// Implementation of various forecasting techniques for waste demand prediction

import ballerina/lang.'float as floats;
import ballerina/lang.'int as ints;
import ballerina/lang.array;

// Main forecasting engine that combines multiple algorithms
public class DemandForecaster {
    
    // Weights for different forecasting methods (should sum to 1.0)
    private final float movingAverageWeight = 0.25;
    private final float exponentialSmoothingWeight = 0.30;
    private final float linearRegressionWeight = 0.25;
    private final float seasonalWeight = 0.20;
    
    // Simple Moving Average (SMA) - Good for stable trends
    // Science: Averages the last N data points to smooth out short-term fluctuations
    public function simpleMovingAverage(float[] data, int window = 7) returns float {
        if (data.length() < window || window <= 0) {
            return data.length() > 0 ? data[data.length() - 1] : 0.0;
        }
        
        float sum = 0.0;
        int startIndex = data.length() - window;
        
        foreach int i in startIndex ..< data.length() {
            sum += data[i];
        }
        
        return sum / <float>window;
    }
    
    // Exponential Weighted Moving Average (EWMA) - Recent data has more influence
    // Science: More weight to recent observations, exponentially decreasing for older data
    public function exponentialWeightedMovingAverage(float[] data, float alpha = 0.3) returns float {
        if (data.length() == 0) {
            return 0.0;
        }
        
        if (data.length() == 1) {
            return data[0];
        }
        
        float ewma = data[0]; // Initialize with first value
        
        foreach int i in 1 ..< data.length() {
            ewma = alpha * data[i] + (1.0 - alpha) * ewma;
        }
        
        return ewma;
    }
    
    // Linear Trend Analysis - Identifies if demand is increasing/decreasing
    // Science: Uses least squares regression to fit a line through the data points
    public function linearTrendForecast(float[] data) returns record {float prediction; float slope; float confidence;} {
        int n = data.length();
        
        if (n < 2) {
            return {
                prediction: n > 0 ? data[0] : 0.0,
                slope: 0.0,
                confidence: 0.0
            };
        }
        
        // Calculate means
        float xMean = (<float>n - 1.0) / 2.0; // Time index mean
        float yMean = array:reduce(data, function(float acc, float val) returns float => acc + val, 0.0) / <float>n;
        
        // Calculate slope and intercept using least squares
        float numerator = 0.0;
        float denominator = 0.0;
        
        foreach int i in 0 ..< n {
            float xi = <float>i;
            float yi = data[i];
            
            numerator += (xi - xMean) * (yi - yMean);
            denominator += floats:pow(xi - xMean, 2.0);
        }
        
        float slope = denominator != 0.0 ? numerator / denominator : 0.0;
        float intercept = yMean - slope * xMean;
        
        // Predict next value (time = n)
        float prediction = slope * <float>n + intercept;
        
        // Calculate R-squared for confidence
        float ssRes = 0.0; // Sum of squares of residuals
        float ssTot = 0.0; // Total sum of squares
        
        foreach int i in 0 ..< n {
            float predicted = slope * <float>i + intercept;
            ssRes += floats:pow(data[i] - predicted, 2.0);
            ssTot += floats:pow(data[i] - yMean, 2.0);
        }
        
        float rSquared = ssTot != 0.0 ? 1.0 - (ssRes / ssTot) : 0.0;
        float confidence = floats:max(0.0, floats:min(1.0, rSquared));
        
        return {
            prediction: prediction,
            slope: slope,
            confidence: confidence
        };
    }
    
    // Seasonal Decomposition - Handles weekly/monthly patterns
    // Science: Separates trend, seasonal, and residual components
    public function seasonalForecast(float[] data, SeasonalPattern pattern, int forecastDays = 7) returns float[] {
        float[] forecasts = [];
        
        if (data.length() == 0) {
            return forecasts;
        }
        
        // Get base trend prediction
        var trendResult = self.linearTrendForecast(data);
        float basePrediction = trendResult.prediction;
        float trendSlope = trendResult.slope;
        
        // Generate forecasts for the next N days
        foreach int day in 0 ..< forecastDays {
            // Base trend prediction for this future day
            float trendValue = basePrediction + (trendSlope * <float>day);
            
            // Apply seasonal adjustments
            int dayOfWeek = (data.length() + day) % 7;
            int monthOfYear = self.getCurrentMonth(); // Simplified - use current month
            
            float weeklyMultiplier = pattern.weeklyMultipliers[dayOfWeek];
            float monthlyMultiplier = pattern.monthlyMultipliers[monthOfYear];
            
            // Combine seasonal effects (geometric mean to avoid extreme values)
            float seasonalMultiplier = floats:sqrt(weeklyMultiplier * monthlyMultiplier);
            
            float seasonalForecast = trendValue * seasonalMultiplier;
            forecasts.push(floats:max(0.0, seasonalForecast)); // Ensure non-negative
        }
        
        return forecasts;
    }
    
    // Ensemble Forecast - Combines multiple methods for better accuracy
    // Science: Uses weighted average of different forecasting methods
    public function ensembleForecast(DemandHistory demandHistory, MarketConditions marketConditions, 
                                   SeasonalPattern seasonalPattern, int forecastDays = 7) returns float[] {
        float[] data = demandHistory.demandTrend;
        float[] forecasts = [];
        
        if (data.length() == 0) {
            return forecasts;
        }
        
        // Method 1: Moving Average
        float maForecast = self.simpleMovingAverage(data, 7);
        
        // Method 2: Exponential Smoothing
        float ewmaForecast = self.exponentialWeightedMovingAverage(data, 0.3);
        
        // Method 3: Linear Trend
        var trendResult = self.linearTrendForecast(data);
        float trendForecast = trendResult.prediction;
        
        // Method 4: Seasonal Forecast
        float[] seasonalForecasts = self.seasonalForecast(data, seasonalPattern, forecastDays);
        
        // Generate ensemble forecasts for each day
        foreach int day in 0 ..< forecastDays {
            float seasonalValue = seasonalForecasts.length() > day ? seasonalForecasts[day] : maForecast;
            
            // Apply market condition adjustments
            float marketMultiplier = self.calculateMarketMultiplier(marketConditions, demandHistory.wasteType);
            
            // Weighted ensemble
            float ensembleForecast = (
                self.movingAverageWeight * maForecast +
                self.exponentialSmoothingWeight * ewmaForecast +
                self.linearRegressionWeight * (trendForecast + trendResult.slope * <float>day) +
                self.seasonalWeight * seasonalValue
            ) * marketMultiplier;
            
            // Apply volatility bounds
            float volatilityAdjustment = 1.0 + (demandHistory.volatilityIndex * 0.2);
            ensembleForecast = ensembleForecast * volatilityAdjustment;
            
            forecasts.push(floats:max(0.1, ensembleForecast)); // Minimum 0.1 tons
        }
        
        return forecasts;
    }
    
    // Calculate market condition multiplier
    // Science: External factors affecting waste generation and demand
    private function calculateMarketMultiplier(MarketConditions conditions, string wasteType) returns float {
        // Economic health effect (positive correlation with waste generation)
        float economicEffect = 0.7 + (conditions.economicIndex / 100.0) * 0.6; // 0.7 to 1.3
        
        // Raw material prices (inverse correlation - higher virgin prices = higher waste demand)
        float priceEffect = 1.0 + (floats:max(0.0, conditions.rawMaterialPrices - 1000.0) / 1000.0) * 0.3;
        
        // Transportation cost effect (negative correlation)
        float transportEffect = 1.0 - ((conditions.transportationCosts - 2.5) / 5.0) * 0.2;
        
        // Industry-specific growth
        string[] relevantIndustries = self.getRelevantIndustries(wasteType);
        float industryGrowthEffect = 1.0;
        
        foreach string industry in relevantIndustries {
            float? growthRate = conditions.industryGrowth[industry];
            if (growthRate is float) {
                industryGrowthEffect *= (1.0 + growthRate);
            }
        }
        
        // Regulatory impact
        float regulatoryEffect = 1.0 + conditions.regulatoryImpact;
        
        // Combine all effects (geometric mean to prevent extreme values)
        float combinedMultiplier = floats:pow(
            economicEffect * priceEffect * transportEffect * industryGrowthEffect * regulatoryEffect,
            0.2 // Fifth root to moderate the combined effect
        );
        
        // Bound the multiplier to reasonable range (0.5 to 2.0)
        return floats:max(0.5, floats:min(2.0, combinedMultiplier));
    }
    
    // Get industries relevant to waste type
    private function getRelevantIndustries(string wasteType) returns string[] {
        map<string[]> wasteIndustryMap = {
            "plastic": ["manufacturing", "retail"],
            "organic": ["hospitality", "retail"],
            "paper": ["manufacturing", "retail"],
            "metal": ["manufacturing", "construction"],
            "electronics": ["manufacturing"]
        };
        
        return wasteIndustryMap[wasteType] ?: ["manufacturing"];
    }
    
    // Helper to get current month (simplified implementation)
    private function getCurrentMonth() returns int {
        // Simplified - in real implementation, use proper date parsing
        return 6; // July (0-based index)
    }
    
    // Calculate confidence intervals for predictions
    public function calculateConfidenceIntervals(float[] historicalData, float prediction) 
                                               returns map<float> {
        if (historicalData.length() < 3) {
            return {
                lower: prediction * 0.8,
                upper: prediction * 1.2,
                confidence: 0.3
            };
        }
        
        // Calculate historical prediction errors
        float[] errors = [];
        int windowSize = ints:min(30, historicalData.length() - 1);
        
        foreach int i in (historicalData.length() - windowSize) ..< (historicalData.length() - 1) {
            float[] trainingData = historicalData.slice(0, i);
            float actualValue = historicalData[i];
            float predictedValue = self.simpleMovingAverage(trainingData, 7);
            
            float diff = actualValue - predictedValue;
            float absError = 0.00;
            if (diff < 0.0) {
                absError = absError - diff;
            } else {
                absError = diff;
            }
            errors.push(absError);
        }
        
        if (errors.length() == 0) {
            return {
                lower: prediction * 0.8,
                upper: prediction * 1.2,
                confidence: 0.5
            };
        }
        
        // Calculate mean absolute error
        float mae = array:reduce(errors, function(float acc, float val) returns float => acc + val, 0.0) / <float>errors.length();
        
        // Calculate confidence based on error consistency
        float errorStd = self.calculateStandardDeviation(errors);
        float confidence = floats:max(0.1, floats:min(0.95, 1.0 - (errorStd / (mae + 0.01))));
        
        // Calculate prediction intervals (using MAE for simplicity)
        float interval = mae * 1.96; // Approximate 95% confidence interval
        
        return {
            lower: floats:max(0.0, prediction - interval),
            upper: prediction + interval,
            confidence: confidence
        };
    }
    
    // Helper function to calculate standard deviation
    public function calculateStandardDeviation(float[] values) returns float {
        if (values.length() <= 1) {
            return 0.0;
        }
        
        float mean = array:reduce(values, function(float acc, float val) returns float => acc + val, 0.0) / <float>values.length();
        
        float sumSquaredDiffs = 0.0;
        foreach float value in values {
            sumSquaredDiffs += floats:pow(value - mean, 2.0);
        }
        
        float variance = sumSquaredDiffs / <float>(values.length() - 1);
        return floats:sqrt(variance);
    }
}

// Price forecasting using correlation with demand
public function forecastPricing(DemandHistory demandHistory, MarketConditions marketConditions) 
                               returns record {float predictedPrice; float priceVolatility;} {
    float[] quantities = [];
    float[] prices = [];
    
    // Extract quantity and price data
    foreach var dataPoint in demandHistory.historicalData {
        quantities.push(dataPoint.quantity);
        prices.push(dataPoint.price);
    }
    
    if (prices.length() == 0) {
        return {predictedPrice: 100.0, priceVolatility: 0.5};
    }
    
    // Calculate price trend
    DemandForecaster forecaster = new();
    var pricetrend = forecaster.linearTrendForecast(prices);
    
    // Base price prediction
    float basePricePredict = pricetrend.prediction;
    
    // Adjust for market conditions
    float marketPriceMultiplier = 1.0;
    
    // Raw material prices effect (positive correlation)
    marketPriceMultiplier *= (0.8 + marketConditions.rawMaterialPrices / 2000.0);
    
    // Economic conditions (positive correlation)
    marketPriceMultiplier *= (0.9 + marketConditions.economicIndex / 200.0);
    
    float predictedPrice = basePricePredict * marketPriceMultiplier;
    
    // Calculate price volatility
    float priceVolatility = forecaster.calculateStandardDeviation(prices) / 
                           (array:reduce(prices, function(float acc, float val) returns float => acc + val, 0.0) / <float>prices.length());
    
    return {
        predictedPrice: floats:max(10.0, predictedPrice), // Minimum $10/ton
        priceVolatility: floats:max(0.1, floats:min(1.0, priceVolatility))
    };
}