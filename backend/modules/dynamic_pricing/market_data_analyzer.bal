import ballerina/time;
import ballerina/lang.'float as floats;
import ballerina/log;

# Analyzes market data and provides market insights
public class MarketDataAnalyzer {
    
    # Get current market data for a material type
    # + materialType - Type of material
    # + location - Optional location for regional pricing
    # + return - Market data or error
    public function getMarketData(string materialType, Location? location = ()) returns MarketData|error {
        // Get market data from database instead of simulating
        string locationCity = self.getLocationCity(location);
        
        // Try to get market data from database first
        MarketData|error dbMarketData = getMarketDataForPricing(materialType, locationCity);
        
        if (dbMarketData is MarketData) {
            return dbMarketData;
        } else {
            log:printWarn("Failed to get market data from database, falling back to simulation", dbMarketData);
            
            // Fallback to simulated data if database fails
            float basePrice = BASE_MATERIAL_PRICES[materialType] ?: 50.0;
            
            // Simulate market volatility
            float volatility = check self.calculateVolatility(materialType);
            
            // Simulate supply and demand indices
            float demandIndex = check self.calculateDemandIndex(materialType);
            float supplyIndex = check self.calculateSupplyIndex(materialType);
            
            // Determine trend based on supply-demand
            string trend = self.determineTrend(demandIndex, supplyIndex);
            
            // Get competition data
            CompetitionData competition = check self.getCompetitionData(materialType, location);
            
            // Simulate market variation
            float priceVariation = (time:utcNow()[0] % 10) * 0.02 - 0.1; // -10% to +10%
            
            return {
                avgPrice: basePrice * (1.0 + priceVariation),
                volatility: volatility,
                trend: trend,
                demandIndex: demandIndex,
                supplyIndex: supplyIndex,
                competition: competition
            };
        }
    }
    
    # Calculate market volatility
    # + materialType - Type of material
    # + return - Volatility score
    private function calculateVolatility(string materialType) returns float|error {
        // Simulate volatility based on material type
        map<float> baseVolatility = {
            "plastic": 0.15,
            "metal": 0.25,
            "paper": 0.10,
            "glass": 0.08,
            "electronic": 0.30,
            "textile": 0.12
        };
        
        float base = baseVolatility[materialType] ?: 0.15;
        float timeFactor = (<float>(time:utcNow()[0] % 100)) / 1000.0; // 0 to 0.1
        return base + timeFactor;
    }
    
    # Calculate demand index
    # + materialType - Type of material
    # + return - Demand index (0-100)
    private function calculateDemandIndex(string materialType) returns float|error {
        // Simulate seasonal demand
        time:Utc currentTime = time:utcNow();
        time:Civil civil = time:utcToCivil(currentTime);
        int month = civil.month;
        
        // Get seasonal factor
        map<float>? seasonalFactors = SEASONAL_FACTORS[materialType];
        float seasonalFactor = 1.0;
        if (seasonalFactors is map<float>) {
            seasonalFactor = seasonalFactors[month.toString()] ?: 1.0;
        }
        
        // Base demand varies by material
        map<float> baseDemand = {
            "plastic": 70.0,
            "metal": 80.0,
            "paper": 60.0,
            "glass": 50.0,
            "electronic": 85.0,
            "textile": 55.0
        };
        
        float base = baseDemand[materialType] ?: 65.0;
        float timeVariation = (<float>(time:utcNow()[0] % 20) - 10.0); // -10 to +10
        
        return floats:min(100.0, floats:max(0.0, base * seasonalFactor + timeVariation));
    }
    
    # Calculate supply index
    # + materialType - Type of material
    # + return - Supply index (0-100)
    private function calculateSupplyIndex(string materialType) returns float|error {
        // Supply tends to be inverse of demand with some lag
        float demandIndex = check self.calculateDemandIndex(materialType);
        float inverseSupply = 100.0 - (demandIndex * 0.7);
        float timeVariation = (<float>(time:utcNow()[0] % 15) - 7.5); // -7.5 to +7.5
        
        return floats:min(100.0, floats:max(0.0, inverseSupply + timeVariation));
    }
    
    # Determine market trend
    # + demandIndex - Current demand index
    # + supplyIndex - Current supply index
    # + return - Market trend
    private function determineTrend(float demandIndex, float supplyIndex) returns string {
        float ratio = demandIndex / (supplyIndex + 0.1);
        
        if (ratio > 1.2) {
            return "rising";
        } else if (ratio < 0.8) {
            return "falling";
        }
        return "stable";
    }
    
    # Get competition data
    # + materialType - Type of material
    # + location - Optional location
    # + return - Competition data
    private function getCompetitionData(string materialType, Location? location) returns CompetitionData|error {
        // Simulate competition data
        int baseListings = 10 + (time:utcNow()[0] % 40); // 10 to 50
        float basePrice = BASE_MATERIAL_PRICES[materialType] ?: 50.0;
        
        float priceVariation = (<float>(time:utcNow()[0] % 30)) / 100.0; // 0 to 0.3
        float avgCompetitorPrice = basePrice * (1.0 + priceVariation - 0.15);
        
        return {
            activeListings: baseListings,
            avgCompetitorPrice: avgCompetitorPrice,
            priceRange: basePrice * 0.2
        };
    }
    
    # Get historical prices
    # + materialType - Type of material
    # + days - Number of days of history
    # + return - Array of historical prices
    public function getHistoricalPrices(string materialType, int days) returns float[]|error {
        float[] prices = [];
        float basePrice = BASE_MATERIAL_PRICES[materialType] ?: 50.0;
        
        // Generate simulated historical data
        float currentPrice = basePrice;
        int i = days;
        while (i > 0) {
            // Add some time-based variation to simulate price movement
            float change = (<float>((time:utcNow()[0] + i) % 4)) / 100.0 - 0.02; // -2% to +2%
            currentPrice = currentPrice * (1.0 + change);
            prices.push(currentPrice);
            i -= 1;
        }
        
        return prices;
    }
    
    # Analyze market for insights
    # + marketData - Current market data
    # + return - Array of insights
    public function generateInsights(MarketData marketData) returns string[] {
        string[] insights = [];
        
        // Volatility insights
        if (marketData.volatility > 0.3) {
            insights.push("High market volatility detected. Consider wider price ranges.");
        } else if (marketData.volatility < 0.1) {
            insights.push("Market is stable. Prices are predictable.");
        }
        
        // Supply-demand insights
        float sdRatio = marketData.demandIndex / (marketData.supplyIndex + 0.1);
        if (sdRatio > 1.5) {
            insights.push("High demand with limited supply. Premium pricing opportunity.");
        } else if (sdRatio < 0.7) {
            insights.push("Oversupply situation. Consider competitive pricing.");
        }
        
        // Competition insights
        if (marketData.competition.activeListings > 30) {
            insights.push("High competition in market. Focus on quality differentiation.");
        } else if (marketData.competition.activeListings < 10) {
            insights.push("Limited competition. Opportunity for market leadership.");
        }
        
        // Trend insights
        if (marketData.trend == "rising") {
            insights.push("Prices trending upward. Consider holding inventory.");
        } else if (marketData.trend == "falling") {
            insights.push("Prices trending downward. Quick turnover recommended.");
        }
        
        return insights;
    }
    
    # Get price forecast
    # + materialType - Type of material
    # + days - Number of days to forecast
    # + return - Forecasted prices
    public function getForecast(string materialType, int days) returns float[]|error {
        // Get historical prices
        float[] historical = check self.getHistoricalPrices(materialType, 30);
        
        // Simple moving average forecast
        float[] forecast = [];
        float ma7 = self.calculateMovingAverage(historical, 7);
        float ma14 = self.calculateMovingAverage(historical, 14);
        
        // Trend calculation
        float trend = (ma7 - ma14) / ma14;
        
        // Generate forecast
        float currentPrice = historical[historical.length() - 1];
        int i = 0;
        while (i < days) {
            float variation = (<float>((time:utcNow()[0] + i) % 2)) / 100.0 - 0.01; // -1% to +1%
            currentPrice = currentPrice * (1.0 + trend + variation);
            forecast.push(currentPrice);
            i += 1;
        }
        
        return forecast;
    }
    
    # Calculate moving average
    # + prices - Array of prices
    # + period - Period for moving average
    # + return - Moving average
    private function calculateMovingAverage(float[] prices, int period) returns float {
        if (prices.length() < period) {
            return prices.reduce(function(float sum, float price) returns float {
                return sum + price;
            }, 0.0) / <float>prices.length();
        }
        
        float sum = 0.0;
        int startIdx = prices.length() - period;
        foreach int i in startIdx...prices.length() - 1 {
            sum += prices[i];
        }
        
        return sum / <float>period;
    }
    
    # Helper function to extract city from location
    private function getLocationCity(Location? location) returns string {
        // For now, return a default city since we don't have a location-to-city mapping
        // In production, this would use geocoding services
        return "Colombo"; // Default to Colombo for Sri Lanka
    }
    
    # Get competition data from database
    private function getCompetitionDataFromDB(string materialType, string locationCity) returns CompetitionData|error {
        // Try to get market data which includes competition info
        MarketData|error marketData = getMarketDataForPricing(materialType, locationCity);
        
        if (marketData is MarketData) {
            // In our database schema, competition data is embedded in market_data table
            // For now, simulate based on the data we have
            int activeListings = 10; // Default active listings
            float avgCompetitorPrice = marketData.avgPrice * 1.02; // Slightly higher
            float priceRange = marketData.avgPrice * 0.2; // 20% price range
            
            return {
                activeListings: activeListings,
                avgCompetitorPrice: avgCompetitorPrice,
                priceRange: priceRange
            };
        }
        
        // Fallback to simulated competition data
        return self.getCompetitionData(materialType, ());
    }
}