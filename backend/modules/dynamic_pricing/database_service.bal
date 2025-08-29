// Database Service for Dynamic Pricing
// Replaces dummy data with actual database queries for pricing calculations

import ballerina/sql;
import ballerina/time;
import ballerina/log;
import ballerinax/postgresql;

// Import database configuration
import Cyclesync.database_config;

// Get pricing factors from database for a specific waste type and location
public function getPricingFactors(string wasteType, string location, float quantity) returns PriceFactors|error {
    postgresql:Client|error dbClient = database_config:getDbClient();
    if (dbClient is error) {
        return dbClient;
    }
    
    // Get base pricing information
    sql:ParameterizedQuery baseQuery = `
        SELECT 
            wt.base_price,
            md.demand_index,
            md.supply_index,
            md.volatility,
            md.competition_level,
            mc.economic_index,
            mc.raw_material_prices,
            mc.transportation_costs,
            mc.fuel_price_index
        FROM waste_types wt
        JOIN market_data md ON md.waste_type_id = wt.id
        JOIN locations l ON md.location_id = l.id
        LEFT JOIN market_conditions mc ON mc.location_id = l.id
        WHERE wt.name = ${wasteType}
        AND l.city = ${location}
        ORDER BY md.recorded_at DESC, mc.recorded_at DESC
        LIMIT 1
    `;
    
    record {|
        decimal base_price;
        decimal demand_index;
        decimal supply_index;
        decimal volatility;
        decimal competition_level;
        decimal? economic_index;
        decimal? raw_material_prices;
        decimal? transportation_costs;
        decimal? fuel_price_index;
    |}|error baseData = dbClient->queryRow(baseQuery);
    
    if (baseData is error) {
        log:printError("Error fetching base pricing data", baseData);
        return baseData;
    }
    
    // Get seasonal factor for current time
    float seasonalFactor = check getSeasonalFactor(wasteType, location);
    
    // Get quality factor based on recent data quality
    float qualityFactor = check getQualityFactor(wasteType, location);
    
    // Calculate various pricing factors
    float demandFactor = <float>baseData.demand_index;
    float supplyFactor = 2.0 - <float>baseData.supply_index; // Inverse relationship
    float marketVolatility = <float>baseData.volatility;
    float competitionLevel = <float>baseData.competition_level;
    
    // Economic factors
    float economicImpact = baseData.economic_index is decimal ? 
        <float>baseData.economic_index : 1.0;
    float transportCostFactor = baseData.transportation_costs is decimal ? 
        <float>baseData.transportation_costs : 1.0;
    float fuelPriceFactor = baseData.fuel_price_index is decimal ? 
        <float>baseData.fuel_price_index : 1.0;
    
    // Quantity-based pricing (bulk discounts)
    float quantityFactor = calculateQuantityFactor(quantity);
    
    return {
        marketTrend: "stable", // Default value, would be determined from trend analysis
        demandLevel: getDemandLevelString(demandFactor),
        competitionLevel: getCompetitionLevelString(competitionLevel),
        qualityPremium: qualityFactor - 1.0,
        seasonalAdjustment: seasonalFactor
    };
}

// Get current market conditions for pricing
public function getMarketDataForPricing(string wasteType, string location) returns MarketData|error {
    postgresql:Client|error dbClient = database_config:getDbClient();
    if (dbClient is error) {
        return dbClient;
    }
    
    sql:ParameterizedQuery query = `
        SELECT 
            md.avg_price,
            md.volatility,
            md.trend,
            md.demand_index,
            md.supply_index,
            md.competition_level,
            md.market_share
        FROM market_data md
        JOIN waste_types wt ON md.waste_type_id = wt.id
        JOIN locations l ON md.location_id = l.id
        WHERE wt.name = ${wasteType}
        AND l.city = ${location}
        ORDER BY md.recorded_at DESC
        LIMIT 1
    `;
    
    record {|
        decimal avg_price;
        decimal volatility;
        string trend;
        decimal demand_index;
        decimal supply_index;
        decimal competition_level;
        decimal market_share;
    |}|error result = dbClient->queryRow(query);
    
    if (result is error) {
        log:printError("Error fetching market data for pricing", result);
        return result;
    }
    
    return {
        avgPrice: <float>result.avg_price,
        volatility: <float>result.volatility,
        trend: result.trend,
        demandIndex: <float>result.demand_index,
        supplyIndex: <float>result.supply_index,
        competition: {
            activeListings: 10, // Default value - would be calculated from database
            avgCompetitorPrice: <float>result.avg_price * (1.0 + <float>result.competition_level * 0.1),
            priceRange: <float>result.avg_price * <float>result.volatility
        }
    };
}

// Store pricing response in database
public function storePricingResponse(PricingResponse pricingResponse, string wasteType, 
                                   string location, string? supplierId = ()) returns error? {
    postgresql:Client|error dbClient = database_config:getDbClient();
    if (dbClient is error) {
        return dbClient;
    }
    
    // Get waste type and location IDs
    sql:ParameterizedQuery wasteTypeQuery = `SELECT id FROM waste_types WHERE name = ${wasteType}`;
    string|error wasteTypeId = dbClient->queryRow(wasteTypeQuery);
    if (wasteTypeId is error) {
        return wasteTypeId;
    }
    
    sql:ParameterizedQuery locationQuery = `SELECT id FROM locations WHERE city = ${location}`;
    string|error locationId = dbClient->queryRow(locationQuery);
    if (locationId is error) {
        return locationId;
    }
    
    // Use current timestamp
    time:Utc timestamp = time:utcNow();
    
    time:Civil|error civilTime = time:utcToCivil(timestamp);
    if (civilTime is error) {
        return civilTime;
    }
    
    sql:ParameterizedQuery insertQuery = `
        INSERT INTO pricing_responses (
            waste_type_id, location_id, supplier_id, quantity,
            base_price, recommended_price, min_price, max_price,
            transport_cost, profit_margin, confidence,
            quality_factor, market_factor, seasonal_factor, demand_factor,
            calculated_at, expires_at
        ) VALUES (
            ${wasteTypeId}, ${locationId}, ${supplierId}, 1.0,
            ${pricingResponse.basePrice}, ${pricingResponse.recommendedPrice},
            ${pricingResponse.minPrice}, ${pricingResponse.maxPrice},
            ${pricingResponse.transportCost}, ${pricingResponse.profitMargin},
            ${pricingResponse.confidence},
            1.0, 1.0,
            1.0, 1.0,
            ${civilTime}, NOW() + INTERVAL '24 hours'
        )
    `;
    
    sql:ExecutionResult result = check dbClient->execute(insertQuery);
    log:printInfo("Stored pricing response for " + wasteType + " in " + location);
    return;
}

// Get recent pricing history for a waste type and location
public function getPricingHistory(string wasteType, string location, int days = 30) returns record {|
    float[] prices;
    time:Utc[] timestamps;
    float avgPrice;
    float priceVolatility;
|}|error {
    postgresql:Client|error dbClient = database_config:getDbClient();
    if (dbClient is error) {
        return dbClient;
    }
    
    sql:ParameterizedQuery query = `
        SELECT 
            phs.avg_price,
            phs.price_volatility,
            phs.date_period
        FROM price_history_summary phs
        JOIN waste_types wt ON phs.waste_type_id = wt.id
        JOIN locations l ON phs.location_id = l.id
        WHERE wt.name = ${wasteType}
        AND l.city = ${location}
        AND phs.date_period >= CURRENT_DATE - INTERVAL '${days} days'
        ORDER BY phs.date_period ASC
    `;
    
    stream<record {|
        decimal avg_price;
        decimal? price_volatility;
        string date_period;
    |}, sql:Error?> resultStream = dbClient->query(query);
    
    float[] prices = [];
    time:Utc[] timestamps = [];
    float totalPrice = 0.0;
    float totalVolatility = 0.0;
    int count = 0;
    
    error? e = resultStream.forEach(function(record {|
        decimal avg_price;
        decimal? price_volatility;
        string date_period;
    |} row) {
        prices.push(<float>row.avg_price);
        totalPrice += <float>row.avg_price;
        
        if (row.price_volatility is decimal) {
            totalVolatility += <float>row.price_volatility;
        }
        
        // Convert date string to UTC timestamp (approximate)
        time:Utc approxTime = [time:utcNow()[0], 0.0]; // Simplified for now
        timestamps.push(approxTime);
        
        count += 1;
    });
    
    if (e is error) {
        log:printError("Error processing pricing history", e);
        return e;
    }
    
    check resultStream.close();
    
    return {
        prices: prices,
        timestamps: timestamps,
        avgPrice: count > 0 ? totalPrice / <float>count : 0.0,
        priceVolatility: count > 0 ? totalVolatility / <float>count : 0.0
    };
}

// Get bidding recommendations from database
public function getBiddingRecommendation(string wasteType, string location, 
                                       string auctionId, float quantity) returns BiddingRecommendation|error {
    postgresql:Client|error dbClient = database_config:getDbClient();
    if (dbClient is error) {
        return dbClient;
    }
    
    // Check if we have an existing recommendation for this auction
    sql:ParameterizedQuery existingQuery = `
        SELECT 
            br.recommended_bid,
            br.min_bid,
            br.max_bid,
            br.win_probability,
            br.profit_estimate,
            br.risk_score,
            br.strategy
        FROM bidding_recommendations br
        JOIN waste_types wt ON br.waste_type_id = wt.id
        JOIN locations l ON br.location_id = l.id
        WHERE wt.name = ${wasteType}
        AND l.city = ${location}
        AND br.auction_id = ${auctionId}
        AND br.expires_at > NOW()
        AND NOT br.used
        ORDER BY br.generated_at DESC
        LIMIT 1
    `;
    
    record {|
        decimal recommended_bid;
        decimal min_bid;
        decimal max_bid;
        decimal? win_probability;
        decimal? profit_estimate;
        decimal? risk_score;
        string? strategy;
    |}|error existingRec = dbClient->queryRow(existingQuery);
    
    if (existingRec is record {}) {
        return {
            wasteType: wasteType,
            location: location,
            auctionId: auctionId,
            recommendedBid: <float>existingRec.recommended_bid,
            minBid: <float>existingRec.min_bid,
            maxBid: <float>existingRec.max_bid,
            confidence: "medium", // Default
            winProbability: existingRec.win_probability is decimal ? <float>existingRec.win_probability : 0.5,
            profitEstimate: existingRec.profit_estimate is decimal ? <float>existingRec.profit_estimate : 0.0,
            riskFactors: ["market_volatility", "competition"],
            strategy: existingRec.strategy ?: "balanced"
        };
    }
    
    // If no existing recommendation, generate one based on current market data
    MarketData marketData = check getMarketDataForPricing(wasteType, location);
    
    float baseBid = marketData.avgPrice * quantity;
    // Calculate competition level from activeListings (normalized 0-1)
    float competitionLevel = <float>marketData.competition.activeListings / 100.0;
    if (competitionLevel > 1.0) { competitionLevel = 1.0; }
    float competitionAdjustment = 1.0 - (competitionLevel * 0.1);
    float recommendedBid = baseBid * competitionAdjustment;
    
    BiddingRecommendation recommendation = {
        wasteType: wasteType,
        location: location,
        auctionId: auctionId,
        recommendedBid: recommendedBid,
        minBid: recommendedBid * 0.85,
        maxBid: recommendedBid * 1.15,
        confidence: "medium",
        winProbability: 0.7 - competitionLevel,
        profitEstimate: recommendedBid * 0.15, // Assume 15% profit margin
        riskFactors: ["market_volatility", "competition"],
        strategy: "balanced"
    };
    
    // Store the new recommendation
    error? storeError = storeBiddingRecommendation(recommendation);
    if (storeError is error) {
        log:printError("Error storing bidding recommendation", storeError);
    }
    
    return recommendation;
}

// Store bidding recommendation in database
function storeBiddingRecommendation(BiddingRecommendation recommendation) returns error? {
    postgresql:Client|error dbClient = database_config:getDbClient();
    if (dbClient is error) {
        return dbClient;
    }
    
    // Get waste type and location IDs
    sql:ParameterizedQuery wasteTypeQuery = `SELECT id FROM waste_types WHERE name = ${recommendation.wasteType}`;
    string|error wasteTypeId = dbClient->queryRow(wasteTypeQuery);
    if (wasteTypeId is error) {
        return wasteTypeId;
    }
    
    sql:ParameterizedQuery locationQuery = `SELECT id FROM locations WHERE city = ${recommendation.location}`;
    string|error locationId = dbClient->queryRow(locationQuery);
    if (locationId is error) {
        return locationId;
    }
    
    sql:ParameterizedQuery insertQuery = `
        INSERT INTO bidding_recommendations (
            waste_type_id, location_id, auction_id,
            recommended_bid, min_bid, max_bid,
            win_probability, profit_estimate, risk_score,
            strategy, generated_at, expires_at
        ) VALUES (
            ${wasteTypeId}, ${locationId}, ${recommendation.auctionId},
            ${recommendation.recommendedBid}, ${recommendation.minBid}, ${recommendation.maxBid},
            ${recommendation.winProbability}, ${recommendation.profitEstimate}, 0.3,
            ${recommendation.strategy}, NOW(), NOW() + INTERVAL '48 hours'
        )
    `;
    
    sql:ExecutionResult result = check dbClient->execute(insertQuery);
    return;
}

// Helper functions
function getSeasonalFactor(string wasteType, string location) returns float|error {
    postgresql:Client|error dbClient = database_config:getDbClient();
    if (dbClient is error) {
        return dbClient;
    }
    
    int currentMonth = time:utcToCivil(time:utcNow()).month;
    
    sql:ParameterizedQuery query = `
        SELECT sp.price_multiplier
        FROM seasonal_patterns sp
        JOIN waste_types wt ON sp.waste_type_id = wt.id
        LEFT JOIN locations l ON sp.location_id = l.id
        WHERE wt.name = ${wasteType}
        AND sp.month_of_year = ${currentMonth}
        AND (l.city = ${location} OR sp.location_id IS NULL)
        ORDER BY sp.location_id DESC NULLS LAST
        LIMIT 1
    `;
    
    decimal|error factor = dbClient->queryRow(query);
    if (factor is error) {
        return 1.0; // Default factor
    }
    
    return <float>factor;
}

function getQualityFactor(string wasteType, string location) returns float|error {
    postgresql:Client|error dbClient = database_config:getDbClient();
    if (dbClient is error) {
        return dbClient;
    }
    
    sql:ParameterizedQuery query = `
        SELECT AVG(wdp.quality_purity / 100.0) as avg_quality
        FROM waste_data_points wdp
        JOIN waste_types wt ON wdp.waste_type_id = wt.id
        JOIN locations l ON wdp.location_id = l.id
        WHERE wt.name = ${wasteType}
        AND l.city = ${location}
        AND wdp.recorded_at >= NOW() - INTERVAL '30 days'
    `;
    
    decimal|error quality = dbClient->queryRow(query);
    if (quality is error) {
        return 1.0; // Default quality factor
    }
    
    return <float>quality;
}

function calculateQuantityFactor(float quantity) returns float {
    // Bulk discount: larger quantities get better prices
    if (quantity >= 100.0) {
        return 0.85; // 15% discount for very large quantities
    } else if (quantity >= 50.0) {
        return 0.90; // 10% discount for large quantities
    } else if (quantity >= 20.0) {
        return 0.95; // 5% discount for medium quantities
    } else {
        return 1.0; // No discount for small quantities
    }
}

// Helper function to convert demand factor to string
function getDemandLevelString(float demandFactor) returns string {
    if (demandFactor > 1.5) {
        return "very high";
    } else if (demandFactor > 1.2) {
        return "high";
    } else if (demandFactor > 0.8) {
        return "moderate";
    } else if (demandFactor > 0.5) {
        return "low";
    } else {
        return "very low";
    }
}

// Helper function to convert competition level to string
function getCompetitionLevelString(float competitionLevel) returns string {
    if (competitionLevel > 0.8) {
        return "very high";
    } else if (competitionLevel > 0.6) {
        return "high";
    } else if (competitionLevel > 0.4) {
        return "moderate";
    } else if (competitionLevel > 0.2) {
        return "low";
    } else {
        return "very low";
    }
}

// BiddingRecommendation type definition
public type BiddingRecommendation record {|
    string wasteType;
    string location;
    string auctionId;
    float recommendedBid;
    float minBid;
    float maxBid;
    string confidence;
    float winProbability;
    float profitEstimate;
    string[] riskFactors;
    string strategy;
|};