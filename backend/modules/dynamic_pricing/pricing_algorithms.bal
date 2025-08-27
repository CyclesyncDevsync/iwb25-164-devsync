import ballerina/time;
import ballerina/log;
import ballerina/lang.'float as floats;

# Core pricing algorithms implementation
public class PricingAlgorithms {
    
    private final MarketDataAnalyzer marketAnalyzer;
    private final TransportCalculator transportCalculator;
    
    public function init() {
        self.marketAnalyzer = new MarketDataAnalyzer();
        self.transportCalculator = new TransportCalculator();
    }
    
    # Calculate optimal price for materials
    # + request - Pricing request
    # + return - Pricing response or error
    public function calculatePrice(PricingRequest request) returns PricingResponse|error {
        log:printInfo(string `Calculating price for ${request.quantity}kg of ${request.materialType}`);
        
        // Step 1: Get market data
        MarketData marketData = check self.marketAnalyzer.getMarketData(request.materialType, request.pickup);
        
        // Step 2: Calculate base price
        float basePrice = check self.calculateBasePrice(marketData, request);
        
        // Step 3: Apply quality adjustment
        float qualityAdjustedPrice = self.applyQualityFactor(basePrice, request.qualityScore);
        
        // Step 4: Calculate transport cost
        float transportCost = check self.transportCalculator.calculateTransportCost(
            request.pickup, request.delivery, request.quantity, request.urgency
        );
        
        // Step 5: Apply market dynamics
        float marketAdjustedPrice = self.applyMarketDynamics(qualityAdjustedPrice, marketData);
        
        // Step 6: Apply competition factor
        float finalPrice = self.applyCompetitionFactor(marketAdjustedPrice, marketData.competition);
        
        // Step 7: Generate pricing recommendation
        PricingResponse response = check self.generatePricingRecommendation(
            basePrice, finalPrice, transportCost, marketData
        );
        
        // Step 8: Store pricing response in database for analytics
        string locationCity = self.getLocationFromRequest(request);
        error? storeError = storePricingResponse(response, request.materialType, locationCity);
        if (storeError is error) {
            log:printWarn("Failed to store pricing response in database", storeError);
            // Continue anyway - response can still be returned
        }
        
        return response;
    }
    
    # Calculate base price
    # + marketData - Current market data
    # + request - Pricing request
    # + return - Base price
    private function calculateBasePrice(MarketData marketData, PricingRequest request) returns float|error {
        // Get historical average
        float[] historicalPrices = check self.marketAnalyzer.getHistoricalPrices(request.materialType, 30);
        float historicalAvg = self.calculateAverage(historicalPrices);
        
        // Get forecasted price
        float[] forecast = check self.marketAnalyzer.getForecast(request.materialType, 1);
        float predictedPrice = forecast.length() > 0 ? forecast[0] : marketData.avgPrice;
        
        // Weighted average: 60% current market, 30% historical, 10% predicted
        float basePrice = (marketData.avgPrice * 0.6) + 
                         (historicalAvg * 0.3) + 
                         (predictedPrice * 0.1);
        
        log:printInfo(string `Base price calculated: Market=${marketData.avgPrice}, ` +
                     string `Historical=${historicalAvg}, Predicted=${predictedPrice}, ` +
                     string `Base=${basePrice}`);
        
        return basePrice;
    }
    
    # Apply quality factor to price
    # + basePrice - Base price
    # + qualityScore - Quality score (0-100)
    # + return - Quality adjusted price
    private function applyQualityFactor(float basePrice, float qualityScore) returns float {
        float qualityMultiplier = 1.0;
        
        if (qualityScore >= 80.0) {
            // Premium quality: 5-20% premium
            qualityMultiplier = 1.0 + ((qualityScore - 80.0) / 100.0);
        } else if (qualityScore >= 60.0) {
            // Standard quality: 0-5% premium
            qualityMultiplier = 1.0 + ((qualityScore - 60.0) / 400.0);
        } else if (qualityScore >= 40.0) {
            // Acceptable quality: 0-10% discount
            qualityMultiplier = 0.9 + ((qualityScore - 40.0) / 200.0);
        } else {
            // Substandard quality: 10-30% discount
            qualityMultiplier = 0.7 + (qualityScore / 133.33);
        }
        
        float adjustedPrice = basePrice * qualityMultiplier;
        
        log:printInfo(string `Quality adjustment: Score=${qualityScore}, ` +
                     string `Multiplier=${qualityMultiplier}, Adjusted=${adjustedPrice}`);
        
        return adjustedPrice;
    }
    
    # Apply market dynamics
    # + price - Current price
    # + marketData - Market data
    # + return - Market adjusted price
    private function applyMarketDynamics(float price, MarketData marketData) returns float {
        // Calculate supply-demand ratio
        float sdRatio = marketData.demandIndex / (marketData.supplyIndex + 0.1);
        
        float marketMultiplier = 1.0;
        if (sdRatio > 1.5) {
            // High demand, low supply: increase price
            marketMultiplier = 1.0 + (float:min(sdRatio - 1.5, 0.5) * 0.3);
        } else if (sdRatio < 0.7) {
            // Low demand, high supply: decrease price
            marketMultiplier = 0.85 + (sdRatio * 0.214);
        }
        
        // Apply trend factor
        float trendFactor = 1.0;
        if (marketData.trend == "rising") {
            trendFactor = 1.05;
        } else if (marketData.trend == "falling") {
            trendFactor = 0.95;
        }
        
        float adjustedPrice = price * marketMultiplier * trendFactor;
        
        log:printInfo(string `Market dynamics: SD Ratio=${sdRatio}, Trend=${marketData.trend}, ` +
                     string `Market multiplier=${marketMultiplier}, Adjusted=${adjustedPrice}`);
        
        return adjustedPrice;
    }
    
    # Apply competition factor
    # + price - Current price
    # + competition - Competition data
    # + return - Competition adjusted price
    private function applyCompetitionFactor(float price, CompetitionData competition) returns float {
        float competitionMultiplier = 1.0;
        
        if (competition.activeListings == 0) {
            // No competition: slight premium
            competitionMultiplier = 1.05;
        } else if (price > competition.avgCompetitorPrice * 1.1) {
            // We're too expensive
            competitionMultiplier = 0.95;
        } else if (price < competition.avgCompetitorPrice * 0.9) {
            // We're too cheap (might indicate quality issues)
            competitionMultiplier = 1.05;
        }
        
        float adjustedPrice = price * competitionMultiplier;
        
        log:printInfo(string `Competition adjustment: Active listings=${competition.activeListings}, ` +
                     string `Avg competitor price=${competition.avgCompetitorPrice}, ` +
                     string `Multiplier=${competitionMultiplier}, Adjusted=${adjustedPrice}`);
        
        return adjustedPrice;
    }
    
    # Generate pricing recommendation
    # + basePrice - Base price
    # + adjustedPrice - Final adjusted price
    # + transportCost - Transport cost
    # + marketData - Market data
    # + return - Pricing response
    private function generatePricingRecommendation(float basePrice, float adjustedPrice, 
                                                   float transportCost, MarketData marketData) returns PricingResponse|error {
        // Calculate price range based on volatility
        float priceRange = adjustedPrice * marketData.volatility * 0.1;
        
        float minPrice = adjustedPrice - priceRange;
        float maxPrice = adjustedPrice + priceRange;
        
        // Ensure minimum profit margin
        float totalCost = (basePrice * 0.7) + transportCost;
        if (minPrice < totalCost * (1.0 + MIN_PROFIT_MARGIN)) {
            minPrice = totalCost * (1.0 + MIN_PROFIT_MARGIN);
        }
        
        // Calculate profit margin
        float profitMargin = (adjustedPrice - totalCost) / adjustedPrice;
        
        // Determine confidence level
        string confidence = self.calculateConfidence(marketData.volatility, profitMargin);
        
        // Get price factors
        PriceFactors factors = {
            marketTrend: marketData.trend,
            demandLevel: self.getDemandLevel(marketData.demandIndex),
            competitionLevel: self.getCompetitionLevel(marketData.competition.activeListings),
            qualityPremium: (adjustedPrice - basePrice) / basePrice,
            seasonalAdjustment: 1.0 // Already applied in calculation
        };
        
        // Get current timestamp
        time:Utc currentTime = time:utcNow();
        
        return {
            basePrice: basePrice,
            recommendedPrice: adjustedPrice,
            minPrice: minPrice,
            maxPrice: maxPrice,
            transportCost: transportCost,
            profitMargin: profitMargin,
            confidence: confidence,
            factors: factors,
            timestamp: time:utcToString(currentTime)
        };
    }
    
    # Calculate confidence level
    # + volatility - Market volatility
    # + profitMargin - Profit margin
    # + return - Confidence level
    private function calculateConfidence(float volatility, float profitMargin) returns string {
        if (volatility > VOLATILITY_THRESHOLD || profitMargin < 0.1) {
            return "low";
        } else if (volatility > 0.15 || profitMargin < 0.2) {
            return "medium";
        }
        return "high";
    }
    
    # Get demand level description
    # + demandIndex - Demand index (0-100)
    # + return - Demand level
    private function getDemandLevel(float demandIndex) returns string {
        if (demandIndex > 80.0) {
            return "very high";
        } else if (demandIndex > 60.0) {
            return "high";
        } else if (demandIndex > 40.0) {
            return "moderate";
        } else if (demandIndex > 20.0) {
            return "low";
        }
        return "very low";
    }
    
    # Get competition level description
    # + activeListings - Number of active listings
    # + return - Competition level
    private function getCompetitionLevel(int activeListings) returns string {
        if (activeListings > 50) {
            return "very high";
        } else if (activeListings > 30) {
            return "high";
        } else if (activeListings > 15) {
            return "moderate";
        } else if (activeListings > 5) {
            return "low";
        }
        return "very low";
    }
    
    # Get seasonal factor
    # + materialType - Type of material
    # + month - Month number
    # + return - Seasonal factor
    private function getSeasonalFactor(string materialType, int month) returns float {
        map<float>? factors = SEASONAL_FACTORS[materialType];
        if (factors is map<float>) {
            return factors[month.toString()] ?: 1.0;
        }
        return 1.0;
    }
    
    # Calculate average of array
    # + values - Array of values
    # + return - Average value
    private function calculateAverage(float[] values) returns float {
        if (values.length() == 0) {
            return 0.0;
        }
        
        float sum = 0.0;
        foreach float value in values {
            sum += value;
        }
        return sum / <float>values.length();
    }
    
    # Generate bid recommendation
    # + request - Bid recommendation request
    # + return - Bid recommendation response
    public function generateBidRecommendation(BidRecommendationRequest request) returns BidRecommendationResponse|error {
        // Create pricing request from bid request
        PricingRequest pricingRequest = {
            materialType: request.materialType,
            quantity: request.quantity,
            qualityScore: request.qualityScore,
            pickup: request.location,
            delivery: request.location, // Same location for initial calculation
            urgency: "standard"
        };
        
        // Get market data
        MarketData marketData = check self.marketAnalyzer.getMarketData(request.materialType, request.location);
        
        // Calculate base pricing
        PricingResponse pricing = check self.calculatePrice(pricingRequest);
        
        // Adjust for bidding strategy
        float suggestedBid = pricing.recommendedPrice * 0.95; // Start slightly below market
        float minAcceptable = pricing.minPrice;
        float maxReasonable = pricing.recommendedPrice * 1.1; // Don't overbid
        
        // Calculate win probability
        float winProbability = self.calculateWinProbability(suggestedBid, marketData);
        
        // Determine strategy
        string strategy = self.determineBidStrategy(marketData, winProbability);
        
        return {
            suggestedBid: suggestedBid,
            minAcceptable: minAcceptable,
            maxReasonable: maxReasonable,
            winProbability: winProbability,
            strategy: strategy
        };
    }
    
    # Calculate win probability
    # + bidPrice - Bid price
    # + marketData - Market data
    # + return - Win probability (0-1)
    private function calculateWinProbability(float bidPrice, MarketData marketData) returns float {
        float priceDiff = bidPrice - marketData.competition.avgCompetitorPrice;
        float normalizedDiff = priceDiff / marketData.competition.priceRange;
        
        // Simple probability calculation
        float probability = 0.5 + (normalizedDiff * 0.2);
        if (probability > 1.0) {
            probability = 1.0;
        }
        if (probability < 0.0) {
            probability = 0.0;
        }
        
        // Adjust for market conditions
        if (marketData.trend == "rising") {
            probability *= 0.9; // Harder to win in rising market
        } else if (marketData.trend == "falling") {
            probability *= 1.1; // Easier to win in falling market
        }
        
        return floats:min(1.0, floats:max(0.0, probability));
    }
    
    # Determine bid strategy
    # + marketData - Market data
    # + winProbability - Win probability
    # + return - Strategy recommendation
    private function determineBidStrategy(MarketData marketData, float winProbability) returns string {
        if (marketData.demandIndex > 80.0 && winProbability < 0.5) {
            return "Aggressive - High demand market, increase bid to improve chances";
        } else if (marketData.demandIndex < 30.0) {
            return "Conservative - Low demand, maintain minimum acceptable price";
        } else if (marketData.competition.activeListings > 30) {
            return "Competitive - Many alternatives available, focus on value proposition";
        } else if (winProbability > 0.7) {
            return "Confident - Good win probability at suggested price";
        }
        return "Balanced - Monitor market and adjust as needed";
    }
    
    # Helper function to extract location city from pricing request
    private function getLocationFromRequest(PricingRequest request) returns string {
        // For now, return a default city since we don't have a location-to-city mapping
        // In production, this would use geocoding services
        return "Colombo"; // Default to Colombo for Sri Lanka
    }
}