import ballerina/http;
import ballerina/log;
import ballerina/time;
import ballerina/cache;

# Dynamic Pricing Service
@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000"],
        allowMethods: ["GET", "POST", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"]
    }
}
service /pricing on new http:Listener(check int:fromString(PRICING_SERVICE_PORT)) {
    
    private final PricingAlgorithms pricingEngine;
    private final MarketDataAnalyzer marketAnalyzer;
    private final TransportCalculator transportCalculator;
    private final cache:Cache priceCache;
    
    function init() {
        self.pricingEngine = new();
        self.marketAnalyzer = new();
        self.transportCalculator = new();
        self.priceCache = new({
            capacity: 100,
            evictionPolicy: cache:LRU,
            defaultMaxAge: <decimal>300
        });
    }
    
    # Calculate optimal price for materials
    # + request - Pricing calculation request
    # + return - Pricing response or error
    resource function post calculate(@http:Payload PricingRequest request) returns PricingResponse|http:BadRequest|http:InternalServerError {
        log:printInfo(string `Price calculation request received for ${request.materialType}`);
        
        // Validate request
        var validationResult = self.validatePricingRequest(request);
        if (validationResult is error) {
            return <http:BadRequest>{
                body: {
                    message: validationResult.message()
                }
            };
        }
        
        // Check cache
        string cacheKey = self.generateCacheKey(request);
        any|error cachedPrice = self.priceCache.get(cacheKey);
        if (cachedPrice is PricingResponse) {
            log:printInfo("Returning cached price");
            return cachedPrice;
        }
        
        // Calculate price
        PricingResponse|error response = self.pricingEngine.calculatePrice(request);
        if (response is error) {
            log:printError("Error calculating price", 'error = response);
            return <http:InternalServerError>{
                body: {
                    message: "Failed to calculate price",
                    detail: response.message()
                }
            };
        }
        
        // Cache the response
        error? cacheResult = self.priceCache.put(cacheKey, response);
        if (cacheResult is error) {
            log:printWarn("Failed to cache pricing response", 'error = cacheResult);
        }
        
        return response;
    }
    
    # Get market analysis for a material type
    # + materialType - Type of material
    # + lat - Optional latitude (query param)
    # + lng - Optional longitude (query param)
    # + radius - Search radius in km (query param, default 50)
    # + return - Market analysis or error
    resource function get market/[string materialType](
        float? lat = (), 
        float? lng = (), 
        int radius = 50
    ) returns MarketAnalysisResponse|http:BadRequest|http:InternalServerError {
        
        log:printInfo(string `Market analysis request for ${materialType}`);
        
        Location? location = ();
        if (lat is float && lng is float) {
            location = {
                latitude: lat,
                longitude: lng
            };
        }
        
        // Get market data
        MarketData|error marketData = self.marketAnalyzer.getMarketData(materialType, location);
        if (marketData is error) {
            return <http:InternalServerError>{
                body: {
                    message: "Failed to get market data",
                    detail: marketData.message()
                }
            };
        }
        
        // Get historical prices
        float[]|error priceHistoryResult = self.marketAnalyzer.getHistoricalPrices(materialType, 30);
        float[] priceHistory = [];
        if (priceHistoryResult is float[]) {
            priceHistory = priceHistoryResult;
        }
        
        // Generate insights
        string[] insights = self.marketAnalyzer.generateInsights(marketData);
        
        // Get competitor prices (simulated)
        map<float> competitorPrices = {
            "competitor1": marketData.competition.avgCompetitorPrice * 0.95,
            "competitor2": marketData.competition.avgCompetitorPrice * 1.05,
            "competitor3": marketData.competition.avgCompetitorPrice * 0.98
        };
        
        MarketAnalysisResponse response = {
            currentMarket: marketData,
            priceHistory: priceHistory,
            insights: insights,
            competitorPrices: competitorPrices
        };
        
        return response;
    }
    
    # Calculate transport cost
    # + request - Transport cost request
    # + return - Transport cost response or error
    resource function post transport(@http:Payload TransportCostRequest request) returns TransportCostResponse|http:BadRequest|http:InternalServerError {
        log:printInfo("Transport cost calculation request received");
        
        // Validate locations
        if (!self.isValidLocation(request.pickup) || !self.isValidLocation(request.delivery)) {
            return <http:BadRequest>{
                body: {
                    message: "Invalid location coordinates"
                }
            };
        }
        
        // Calculate transport cost
        TransportCostResponse|error response = self.transportCalculator.calculateDetailedCost(request);
        if (response is error) {
            log:printError("Error calculating transport cost", 'error = response);
            return <http:InternalServerError>{
                body: {
                    message: "Failed to calculate transport cost",
                    detail: response.message()
                }
            };
        }
        
        return response;
    }
    
    # Get price trends for a material type
    # + materialType - Type of material
    # + days - Number of days of history (query param, default 30)
    # + forecast - Include forecast (query param, default true)
    # + return - Price trends or error
    resource function get trends/[string materialType](
        int days = 30,
        boolean forecast = true
    ) returns PriceTrendResponse|http:BadRequest|http:InternalServerError {
        
        log:printInfo(string `Price trend request for ${materialType}`);
        
        // Get historical prices
        float[]|error historicalPrices = self.marketAnalyzer.getHistoricalPrices(materialType, days);
        if (historicalPrices is error) {
            return <http:InternalServerError>{
                body: {
                    message: "Failed to get historical prices",
                    detail: historicalPrices.message()
                }
            };
        }
        
        // Convert to historical price records
        HistoricalPrice[] history = [];
        time:Utc currentTime = time:utcNow();
        
        foreach int i in 0...historicalPrices.length() - 1 {
            time:Utc date = time:utcAddSeconds(currentTime, -((days - i) * 86400));
            history.push({
                date: time:utcToString(date),
                price: historicalPrices[i],
                volume: 1000.0 + (<float>i * 10) // Simulated volume
            });
        }
        
        // Calculate price changes
        float currentPrice = historicalPrices[historicalPrices.length() - 1];
        float previousPrice = historicalPrices[0];
        float priceChange = currentPrice - previousPrice;
        float percentChange = (priceChange / previousPrice) * 100.0;
        
        // Determine trend
        string trend = "stable";
        if (percentChange > 5.0) {
            trend = "rising";
        } else if (percentChange < -5.0) {
            trend = "falling";
        }
        
        // Get forecast if requested
        float[] forecastData = [];
        if (forecast) {
            float[]|error forecastResult = self.marketAnalyzer.getForecast(materialType, 7);
            if (forecastResult is float[]) {
                forecastData = forecastResult;
            }
        }
        
        return {
            history: history,
            currentPrice: currentPrice,
            priceChange: priceChange,
            percentChange: percentChange,
            trend: trend,
            forecast: forecastData
        };
    }
    
    # Get bid recommendation
    # + request - Bid recommendation request
    # + return - Bid recommendation or error
    resource function post bid\-recommendation(@http:Payload BidRecommendationRequest request) returns BidRecommendationResponse|http:BadRequest|http:InternalServerError {
        log:printInfo(string `Bid recommendation request for ${request.materialType}`);
        
        // Validate request
        if (request.quantity <= 0.0 || request.qualityScore < 0.0 || request.qualityScore > 100.0) {
            return <http:BadRequest>{
                body: {
                    message: "Invalid request parameters"
                }
            };
        }
        
        // Generate bid recommendation
        BidRecommendationResponse|error response = self.pricingEngine.generateBidRecommendation(request);
        if (response is error) {
            log:printError("Error generating bid recommendation", 'error = response);
            return <http:InternalServerError>{
                body: {
                    message: "Failed to generate bid recommendation",
                    detail: response.message()
                }
            };
        }
        
        return response;
    }
    
    # Health check endpoint
    # + return - Health status information
    resource function get health() returns json {
        return {
            "status": "healthy",
            "service": "Dynamic Pricing Service", 
            "timestamp": time:utcToString(time:utcNow())
        };
    }
    
    # Validate pricing request
    # + request - Pricing request to validate
    # + return - Error if validation fails
    private function validatePricingRequest(PricingRequest request) returns error? {
        if (request.quantity <= 0.0) {
            return error("Quantity must be greater than 0");
        }
        
        if (request.qualityScore < 0.0 || request.qualityScore > 100.0) {
            return error("Quality score must be between 0 and 100");
        }
        
        if (!self.isValidLocation(request.pickup) || !self.isValidLocation(request.delivery)) {
            return error("Invalid location coordinates");
        }
        
        string[] validMaterials = ["plastic", "metal", "paper", "glass", "electronic", "textile"];
        if (!validMaterials.some(mat => mat == request.materialType)) {
            return error(string `Invalid material type: ${request.materialType}`);
        }
        
        string[] validUrgency = ["immediate", "standard", "flexible"];
        if (!validUrgency.some(urg => urg == request.urgency)) {
            return error(string `Invalid urgency: ${request.urgency}`);
        }
    }
    
    # Check if location is valid
    # + location - Location to validate
    # + return - True if valid
    private function isValidLocation(Location location) returns boolean {
        return location.latitude >= -90.0 && location.latitude <= 90.0 &&
               location.longitude >= -180.0 && location.longitude <= 180.0;
    }
    
    # Generate cache key for pricing request
    # + request - Pricing request
    # + return - Cache key
    private function generateCacheKey(PricingRequest request) returns string {
        return string `${request.materialType}_${request.quantity}_${request.qualityScore}_` +
               string `${request.pickup.latitude},${request.pickup.longitude}_` +
               string `${request.delivery.latitude},${request.delivery.longitude}_${request.urgency}`;
    }
}