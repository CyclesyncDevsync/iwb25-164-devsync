// Demand Prediction Service
// Main service that handles demand forecasting requests and provides predictions

import ballerina/http;
import ballerina/time;
import ballerina/log;
import ballerina/uuid;
import ballerina/lang.'float as floats;
import ballerina/lang.array;

// Use a different port to avoid conflict, or better yet, share the main listener
listener http:Listener demandListener = new(8084);

// Main demand prediction service
@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000", "https://cyclesync.com"],
        allowCredentials: true,
        allowHeaders: ["Authorization", "Content-Type"]
    }
}
service /api/ai/demand on demandListener {
    
    private final DemandForecaster forecaster;
    
    function init() {
        self.forecaster = new DemandForecaster();
        log:printInfo("Demand Prediction Service initialized successfully");
    }
    
    // Get demand forecast for specific waste type and location
    resource function post forecast(@http:Payload DemandPredictionRequest request) returns DemandForecast|http:BadRequest|http:InternalServerError {
        log:printInfo(string `Processing demand prediction request for ${request.wasteType} in ${request.location}`);
        
        return self.generateForecast(request);
    }
    
    private function generateForecast(DemandPredictionRequest request) returns DemandForecast|http:BadRequest|http:InternalServerError {
        // Validate request
        string? validationError = validatePredictionRequest(request);
        if (validationError is string) {
            http:BadRequest badRequest = {
                body: {
                    "error": "Invalid request",
                    "message": validationError
                }
            };
            return badRequest;
        }
        
        // Fetch historical data from database
        WasteDataPoint[]|error historicalDataResult = getHistoricalData(request.wasteType, request.location);
        if (historicalDataResult is error) {
            log:printError("Failed to fetch historical data", historicalDataResult);
            http:InternalServerError serverError = {
                body: {
                    "error": "Database error",
                    "message": "Failed to fetch historical data"
                }
            };
            return serverError;
        }
        
        DemandHistory demandHistory = convertToHistoricalData(historicalDataResult, request.wasteType, request.location);
        
        // Get current market conditions from database
        MarketConditions|error marketConditionsResult = getMarketConditions(request.location);
        if (marketConditionsResult is error) {
            log:printError("Failed to fetch market conditions", marketConditionsResult);
            http:InternalServerError serverError = {
                body: {
                    "error": "Database error",
                    "message": "Failed to fetch market conditions"
                }
            };
            return serverError;
        }
        MarketConditions marketConditions = marketConditionsResult;
        
        // Get seasonal patterns from database
        SeasonalPattern|error seasonalPatternResult = getSeasonalPattern(request.wasteType, request.location);
        if (seasonalPatternResult is error) {
            log:printError("Failed to fetch seasonal patterns", seasonalPatternResult);
            // Use default seasonal pattern as fallback
            seasonalPatternResult = getSeasonalPattern(request.wasteType);
            if (seasonalPatternResult is error) {
                log:printError("Failed to fetch default seasonal patterns", seasonalPatternResult);
                http:InternalServerError serverError = {
                    body: {
                        "error": "Database error",
                        "message": "Failed to fetch seasonal patterns"
                    }
                };
                return serverError;
            }
        }
        
        // Handle the result properly
        SeasonalPattern seasonalPattern;
        if (seasonalPatternResult is SeasonalPattern) {
            seasonalPattern = seasonalPatternResult;
        } else {
            // This shouldn't happen but add a fallback
            http:InternalServerError serverError = {
                body: {
                    "error": "Database error",
                    "message": "Failed to process seasonal patterns"
                }
            };
            return serverError;
        }
        
        // Determine forecast horizon
        int forecastDays = getForecastDays(request.timeHorizon);
        
        // Generate ensemble forecast
        float[] demandForecasts = self.forecaster.ensembleForecast(demandHistory, marketConditions, seasonalPattern, forecastDays);
        
        // Calculate aggregate predictions
        float nextWeekDemand = calculatePeriodSum(demandForecasts, 7);
        float nextMonthDemand = calculatePeriodSum(demandForecasts, 30);
        float nextQuarterDemand = calculatePeriodSum(demandForecasts, 90);
        
        // Calculate confidence intervals
        float avgDemand = nextWeekDemand / 7.0;
        var confidenceResult = self.forecaster.calculateConfidenceIntervals(demandHistory.demandTrend, avgDemand);
        
        // Forecast pricing if requested
        var priceForecast = forecastPricing(demandHistory, marketConditions);
        
        // Generate market insights
        string[] keyDrivers = generateKeyDrivers(marketConditions, demandHistory.wasteType);
        string marketTrend = determineMarketTrend(demandHistory.demandTrend);
        float opportunityScore = calculateOpportunityScore(demandHistory, marketConditions, confidenceResult["confidence"] ?: 0.0);
        
        DemandForecast forecast = {
            wasteType: request.wasteType,
            location: request.location,
            predictionId: uuid:createType4AsString(),
            generatedAt: time:utcNow(),
            
            nextWeekDemand: nextWeekDemand,
            nextMonthDemand: nextMonthDemand,
            nextQuarterDemand: nextQuarterDemand,

            confidenceLevel: confidenceResult["confidence"] ?: 0.0,
            demandLowerBound: (confidenceResult["lower"] ?: 0.0) * 7.0, // Weekly lower bound
            demandUpperBound: (confidenceResult["upper"] ?: 0.0) * 7.0, // Weekly upper bound
            
            predictedPricePerTon: priceForecast.predictedPrice,
            priceVolatility: priceForecast.priceVolatility,
            
            keyDrivers: keyDrivers,
            marketTrend: marketTrend,
            opportunityScore: opportunityScore
        };
        
        // Store forecast in database for future reference
        error? storeError = storeDemandForecast(forecast);
        if (storeError is error) {
            log:printError("Failed to store demand forecast", storeError);
            // Continue anyway - forecast can still be returned
        }
        
        log:printInfo(string `Generated demand forecast for ${request.wasteType}: ${nextWeekDemand} tons/week`);
        return forecast;
    }
    
    // Get bidding recommendations based on demand prediction
    resource function post 'bidding\-recommendations(@http:Payload record {string wasteStreamId; string wasteType; string location; float quantity;} request) 
                                                 returns BiddingRecommendation|http:BadRequest|http:InternalServerError {
        log:printInfo(string `Processing bidding recommendation request for waste stream ${request.wasteStreamId}`);
        
        // Get demand forecast first
        DemandPredictionRequest forecastRequest = {
            wasteType: request.wasteType,
            location: request.location,
            timeHorizon: "week"
        };
        
        DemandForecast|http:BadRequest|http:InternalServerError forecastResult = self.generateForecast(forecastRequest);
        if (forecastResult is http:BadRequest || forecastResult is http:InternalServerError) {
            return forecastResult;
        }
        
        DemandForecast forecast = <DemandForecast>forecastResult;
        
        // Generate bidding recommendations
        BiddingRecommendation recommendation = generateBiddingRecommendation(request.wasteStreamId, forecast, request.quantity);
        
        log:printInfo(string `Generated bidding recommendation: $${recommendation.suggestedStartingBid}/ton`);
        return recommendation;
    }
    
    // Get batch predictions for multiple waste types/locations
    resource function post 'batch\-forecast(@http:Payload BatchPredictionRequest request) 
                                        returns record {DemandForecast[] forecasts; int totalProcessed; string[] errors;}|http:BadRequest {
        log:printInfo(string `Processing batch prediction request for ${request.wasteTypes.length()} waste types`);
        
        DemandForecast[] forecasts = [];
        string[] errors = [];
        int totalProcessed = 0;
        
        foreach string wasteType in request.wasteTypes {
            foreach string location in request.locations {
                DemandPredictionRequest individualRequest = {
                    wasteType: wasteType,
                    location: location,
                    timeHorizon: request.timeHorizon
                };
                
                DemandForecast|http:BadRequest|http:InternalServerError result = self.generateForecast(individualRequest);
                
                if (result is DemandForecast) {
                    forecasts.push(result);
                    totalProcessed += 1;
                } else {
                    errors.push(string `Failed to process ${wasteType} in ${location}`);
                }
            }
        }
        
        return {
            forecasts: forecasts,
            totalProcessed: totalProcessed,
            errors: errors
        };
    }
    
    // Get historical demand analysis
    resource function get history/[string wasteType]/[string location]() returns DemandHistory|http:NotFound|http:InternalServerError {
        log:printInfo(string `Fetching demand history for ${wasteType} in ${location}`);
        
        // Fetch from database
        WasteDataPoint[]|error historicalDataResult = getHistoricalData(wasteType, location);
        if (historicalDataResult is error) {
            log:printError("Failed to fetch historical data", historicalDataResult);
            http:InternalServerError serverError = {
                body: {
                    "error": "Database error",
                    "message": "Failed to fetch historical data"
                }
            };
            return serverError;
        }
        
        if (historicalDataResult.length() == 0) {
            http:NotFound notFound = {
                body: {
                    "error": "Not found",
                    "message": string `No historical data found for ${wasteType} in ${location}`
                }
            };
            return notFound;
        }
        
        DemandHistory history = convertToHistoricalData(historicalDataResult, wasteType, location);
        return history;
    }
    
    // Get market conditions for a location
    resource function get 'market\-conditions/[string location]() returns MarketConditions|http:InternalServerError {
        log:printInfo(string `Fetching market conditions for ${location}`);
        
        MarketConditions|error conditions = getMarketConditions(location);
        if (conditions is error) {
            log:printError("Failed to fetch market conditions", conditions);
            http:InternalServerError serverError = {
                body: {
                    "error": "Database error",
                    "message": "Failed to fetch market conditions"
                }
            };
            return serverError;
        }
        
        return conditions;
    }
    
    // Get seasonal patterns for waste type
    resource function get 'seasonal\-pattern/[string wasteType]/[string location]() returns SeasonalPattern|http:InternalServerError {
        log:printInfo(string `Fetching seasonal pattern for ${wasteType} in ${location}`);
        
        SeasonalPattern|error pattern = getSeasonalPattern(wasteType, location);
        if (pattern is error) {
            log:printError("Failed to fetch seasonal pattern", pattern);
            http:InternalServerError serverError = {
                body: {
                    "error": "Database error", 
                    "message": "Failed to fetch seasonal pattern"
                }
            };
            return serverError;
        }
        
        return pattern;
    }
    
    // Health check endpoint
    resource function get health() returns record {string status; string message; time:Utc timestamp;} {
        return {
            status: "healthy",
            message: "Demand Prediction Service is operational",
            timestamp: time:utcNow()
        };
    }
}

// Validation functions
function validatePredictionRequest(DemandPredictionRequest request) returns string? {
    if (request.wasteType.trim() == "") {
        return "Waste type cannot be empty";
    }
    
    if (request.location.trim() == "") {
        return "Location cannot be empty";
    }
    
    string[] validHorizons = ["week", "month", "quarter"];
    boolean found = false;
    foreach string horizon in validHorizons {
        if (horizon == request.timeHorizon) {
            found = true;
            break;
        }
    }
    if (!found) {
        return "Time horizon must be one of: week, month, quarter";
    }
    
    return (); // Valid
}

// Helper function to get forecast days based on time horizon
function getForecastDays(string timeHorizon) returns int {
    match timeHorizon {
        "week" => { return 7; }
        "month" => { return 30; }
        "quarter" => { return 90; }
        _ => { return 7; }
    }
}

// Calculate sum for specific period
function calculatePeriodSum(float[] forecasts, int days) returns float {
    float sum = 0.0;
    int maxDays = forecasts.length() < days ? forecasts.length() : days;
    
    foreach int i in 0 ..< maxDays {
        sum += forecasts[i];
    }
    
    // If we need more days than forecasts, extrapolate with last value
    if (days > forecasts.length() && forecasts.length() > 0) {
        float lastValue = forecasts[forecasts.length() - 1];
        int remainingDays = days - forecasts.length();
        sum += lastValue * <float>remainingDays;
    }
    
    return sum;
}

// Generate key market drivers
function generateKeyDrivers(MarketConditions conditions, string wasteType) returns string[] {
    string[] drivers = [];
    
    if (conditions.economicIndex > 75.0) {
        drivers.push("Strong economic conditions increasing waste generation");
    } else if (conditions.economicIndex < 50.0) {
        drivers.push("Economic slowdown reducing waste volumes");
    }
    
    if (conditions.rawMaterialPrices > 1000.0) {
        drivers.push("High virgin material prices boosting recycled demand");
    }
    
    if (conditions.transportationCosts > 3.0) {
        drivers.push("Rising transportation costs affecting profitability");
    }
    
    if (conditions.regulatoryImpact > 0.3) {
        drivers.push("New environmental regulations driving demand");
    }
    
    // Waste-type specific drivers
    match wasteType {
        "plastic" => {
            drivers.push("Plastic pollution awareness increasing recycling demand");
        }
        "organic" => {
            drivers.push("Composting initiatives and food waste reduction programs");
        }
        "electronics" => {
            drivers.push("Technology refresh cycles and e-waste regulations");
        }
    }
    
    return drivers.length() > 0 ? drivers : ["Normal market conditions"];
}

// Determine market trend
function determineMarketTrend(float[] demandTrend) returns string {
    if (demandTrend.length() < 10) {
        return "stable";
    }
    
    // Compare recent average to earlier average
    int recentPeriod = 10;
    int earlierPeriod = 10;
    int startRecent = demandTrend.length() - recentPeriod;
    int startEarlier = startRecent - earlierPeriod;
    
    if (startEarlier < 0) {
        return "stable";
    }
    
    float recentSum = 0.0;
    float earlierSum = 0.0;
    
    foreach int i in startRecent ..< demandTrend.length() {
        recentSum += demandTrend[i];
    }
    
    foreach int i in startEarlier ..< startRecent {
        earlierSum += demandTrend[i];
    }
    
    float recentAvg = recentSum / <float>recentPeriod;
    float earlierAvg = earlierSum / <float>earlierPeriod;
    
    float changePercent = (recentAvg - earlierAvg) / earlierAvg;
    
    if (changePercent > 0.1) {
        return "increasing";
    } else if (changePercent < -0.1) {
        return "decreasing";
    } else {
        return "stable";
    }
}

// Calculate business opportunity score
function calculateOpportunityScore(DemandHistory demandHistory, MarketConditions conditions, float confidence) returns float {
    float score = 50.0; // Base score
    
    // High demand increases opportunity
    float avgDemand = array:reduce(demandHistory.demandTrend, function(float acc, float val) returns float => acc + val, 0.0) 
                     / <float>demandHistory.demandTrend.length();
    score += (avgDemand / 20.0) * 10.0; // Scale by average demand
    
    // Low volatility is better for business
    score += (1.0 - demandHistory.volatilityIndex) * 15.0;
    
    // High confidence increases score
    score += confidence * 20.0;
    
    // Good market conditions
    score += (conditions.economicIndex - 50.0) / 2.0;
    
    // High raw material prices create opportunity
    score += ((conditions.rawMaterialPrices - 800.0) / 400.0) * 10.0;
    
    // Cap the score between 0 and 100
    return floats:max(0.0, floats:min(100.0, score));
}

// Generate bidding recommendation
function generateBiddingRecommendation(string wasteStreamId, DemandForecast forecast, float quantity) returns BiddingRecommendation {
    
    // Base pricing from forecast
    float marketPrice = forecast.predictedPricePerTon;
    
    // Adjust for demand-supply balance
    float demandSupplyRatio = forecast.nextWeekDemand / quantity;
    float priceMultiplier = 1.0;
    
    if (demandSupplyRatio > 2.0) {
        priceMultiplier = 1.2; // High demand, bid higher
    } else if (demandSupplyRatio < 0.5) {
        priceMultiplier = 0.8; // Low demand, bid lower
    }
    
    // Pricing strategy
    float suggestedBid = marketPrice * priceMultiplier;
    float reservePrice = suggestedBid * 0.8; // Don't go below 80%
    float maxBid = suggestedBid * 1.3; // Don't exceed 130%
    
    // Timing recommendation
    string urgency = "can_wait";
    time:Utc optimalTime = time:utcNow();
    
    if (forecast.marketTrend == "increasing") {
        urgency = "immediate";
    } else if (demandSupplyRatio > 1.5) {
        urgency = "within_hours";
    }
    
    // Competition analysis
    float competitionLevel = forecast.opportunityScore / 100.0;
    string[] competitorInsights = [
        string `Expected ${floats:round(competitionLevel * 10.0)} other bidders`,
        forecast.marketTrend == "increasing" ? "Market trending up - expect higher bids" : "Stable market conditions"
    ];
    
    // Success probability based on various factors
    float winProbability = calculateWinProbability(suggestedBid, marketPrice, forecast.confidenceLevel, competitionLevel);
    
    return {
        recommendationId: uuid:createType4AsString(),
        wasteStreamId: wasteStreamId,
        generatedAt: time:utcNow(),
        
        suggestedStartingBid: floats:round(suggestedBid * 100.0) / 100.0,
        reservePrice: floats:round(reservePrice * 100.0) / 100.0,
        maximumBid: floats:round(maxBid * 100.0) / 100.0,
        
        optimalBiddingTime: optimalTime,
        biddingUrgency: urgency,
        
        competitionLevel: competitionLevel,
        competitorInsights: competitorInsights,
        
        winProbability: winProbability,
        profitabilityScore: forecast.opportunityScore
    };
}

// Calculate win probability for a bid
function calculateWinProbability(float bid, float marketPrice, float confidence, float competition) returns float {
    // Higher bid relative to market price increases win probability
    float bidRatio = bid / marketPrice;
    float baseProbability = floats:min(0.95, bidRatio - 0.5); // Scale from 50% of market price
    
    // High confidence increases probability
    baseProbability += confidence * 0.2;
    
    // High competition decreases probability
    baseProbability -= competition * 0.3;
    
    // Ensure probability is between 0.1 and 0.95
    return floats:max(0.1, floats:min(0.95, baseProbability));
}

// Helper function to convert database records to DemandHistory
function convertToHistoricalData(WasteDataPoint[] dataPoints, string wasteType, string location) returns DemandHistory {
    float[] demandTrend = [];
    
    foreach WasteDataPoint point in dataPoints {
        demandTrend.push(point.quantity);
    }
    
    // Calculate seasonality factor (simplified)
    float seasonalityFactor = calculateSeasonalityFactor(demandTrend);
    
    // Calculate volatility index
    float volatilityIndex = calculateVolatilityIndex(demandTrend);
    
    return {
        wasteType: wasteType,
        location: location,
        historicalData: dataPoints,
        demandTrend: demandTrend,
        seasonalityFactor: seasonalityFactor,
        volatilityIndex: volatilityIndex
    };
}

