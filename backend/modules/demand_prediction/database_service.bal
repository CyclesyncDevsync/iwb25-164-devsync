// Database Service for Demand Prediction
// Replaces dummy data generation with actual database queries

import ballerina/sql;
import ballerina/time;
import ballerina/log;
import ballerinax/postgresql;

// Import database configuration
import Cyclesync.database_config;

// Get historical waste data from database
public function getHistoricalData(string wasteType, string location, int days = 365) returns WasteDataPoint[]|error {
    WasteDataPoint[] historicalData = [];
    
    postgresql:Client|error dbClient = database_config:getDbClient();
    if (dbClient is error) {
        log:printError("Failed to get database client", dbClient);
        return dbClient;
    }
    
    // Query to get historical waste data with joins
    sql:ParameterizedQuery query = `
        SELECT 
            wdp.id,
            wt.name as waste_type,
            wt.category,
            wdp.quantity,
            l.city as location,
            wdp.price_per_ton as price,
            wdp.recorded_at as timestamp,
            wdp.quality_purity,
            wdp.quality_contamination,
            wdp.quality_moisture,
            s.industry as source_industry
        FROM waste_data_points wdp
        JOIN waste_types wt ON wdp.waste_type_id = wt.id
        JOIN locations l ON wdp.location_id = l.id
        LEFT JOIN suppliers s ON wdp.supplier_id = s.id
        WHERE wt.name = ${wasteType}
        AND l.city = ${location}
        AND wdp.recorded_at >= NOW() - INTERVAL '${days} days'
        ORDER BY wdp.recorded_at ASC
    `;
    
    stream<record {|
        string id;
        string waste_type;
        string category;
        decimal quantity;
        string location;
        decimal price;
        time:Civil timestamp;
        decimal? quality_purity;
        decimal? quality_contamination;
        decimal? quality_moisture;
        string? source_industry;
    |}, sql:Error?> resultStream = dbClient->query(query);
    
    error? e = resultStream.forEach(function(record {|
        string id;
        string waste_type;
        string category;
        decimal quantity;
        string location;
        decimal price;
        time:Civil timestamp;
        decimal? quality_purity;
        decimal? quality_contamination;
        decimal? quality_moisture;
        string? source_industry;
    |} row) {
        
        // Convert Civil time to Utc
        time:Utc|error utcTime = time:utcFromCivil(row.timestamp);
        if (utcTime is error) {
            log:printError("Error converting timestamp", utcTime);
            return;
        }
        
        WasteDataPoint dataPoint = {
            id: row.id,
            wasteType: row.waste_type,
            category: row.category,
            quantity: <float>row.quantity,
            location: row.location,
            price: <float>row.price,
            timestamp: utcTime,
            qualityMetrics: {
                "purity": row.quality_purity is decimal ? <float>row.quality_purity : 85.0,
                "contamination": row.quality_contamination is decimal ? <float>row.quality_contamination : 5.0,
                "moisture": row.quality_moisture is decimal ? <float>row.quality_moisture : 10.0
            },
            sourceIndustry: row.source_industry ?: "unknown"
        };
        
        historicalData.push(dataPoint);
    });
    
    if (e is error) {
        log:printError("Error processing historical data", e);
        return e;
    }
    
    check resultStream.close();
    return historicalData;
}

// Get current market conditions from database
public function getMarketConditions(string location) returns MarketConditions|error {
    postgresql:Client|error dbClient = database_config:getDbClient();
    if (dbClient is error) {
        return dbClient;
    }
    
    // Get the most recent market conditions
    sql:ParameterizedQuery query = `
        SELECT 
            mc.economic_index,
            mc.raw_material_prices,
            mc.transportation_costs,
            mc.weather_factor,
            mc.regulatory_impact
        FROM market_conditions mc
        JOIN locations l ON mc.location_id = l.id
        WHERE l.city = ${location}
        ORDER BY mc.recorded_at DESC
        LIMIT 1
    `;
    
    record {|
        decimal economic_index;
        decimal raw_material_prices;
        decimal transportation_costs;
        decimal weather_factor;
        decimal regulatory_impact;
    |}|error result = dbClient->queryRow(query);
    
    if (result is error) {
        log:printError("Error fetching market conditions", result);
        return result;
    }
    
    // Get industry growth rates
    sql:ParameterizedQuery industryQuery = `
        SELECT 
            igr.industry,
            igr.growth_rate
        FROM industry_growth_rates igr
        JOIN locations l ON igr.location_id = l.id
        WHERE l.city = ${location}
        AND igr.quarter = (
            SELECT MAX(quarter) FROM industry_growth_rates 
            WHERE location_id = l.id
        )
    `;
    
    stream<record {|
        string industry;
        decimal growth_rate;
    |}, sql:Error?> industryStream = dbClient->query(industryQuery);
    
    map<float> industryGrowth = {};
    error? industryError = industryStream.forEach(function(record {|
        string industry;
        decimal growth_rate;
    |} row) {
        industryGrowth[row.industry] = <float>row.growth_rate;
    });
    
    if (industryError is error) {
        log:printError("Error fetching industry growth rates", industryError);
    }
    
    check industryStream.close();
    
    return {
        economicIndex: <float>result.economic_index,
        rawMaterialPrices: <float>result.raw_material_prices * 1000, // Convert to actual price range
        transportationCosts: <float>result.transportation_costs * 3, // Convert to per-mile cost
        weatherFactor: <float>result.weather_factor,
        industryGrowth: industryGrowth,
        regulatoryImpact: <float>result.regulatory_impact
    };
}

// Get seasonal patterns from database
public function getSeasonalPattern(string wasteType, string? location = ()) returns SeasonalPattern|error {
    postgresql:Client|error dbClient = database_config:getDbClient();
    if (dbClient is error) {
        return dbClient;
    }
    
    // Query seasonal patterns
    sql:ParameterizedQuery query = location is string ? `
        SELECT 
            sp.month_of_year,
            sp.week_of_year,
            sp.day_of_week,
            sp.price_multiplier,
            sp.quantity_multiplier,
            sp.demand_multiplier
        FROM seasonal_patterns sp
        JOIN waste_types wt ON sp.waste_type_id = wt.id
        LEFT JOIN locations l ON sp.location_id = l.id
        WHERE wt.name = ${wasteType}
        AND (l.city = ${location} OR sp.location_id IS NULL)
        ORDER BY sp.month_of_year, sp.week_of_year, sp.day_of_week
    ` : `
        SELECT 
            sp.month_of_year,
            sp.week_of_year,
            sp.day_of_week,
            sp.price_multiplier,
            sp.quantity_multiplier,
            sp.demand_multiplier
        FROM seasonal_patterns sp
        JOIN waste_types wt ON sp.waste_type_id = wt.id
        WHERE wt.name = ${wasteType}
        AND sp.location_id IS NULL
        ORDER BY sp.month_of_year, sp.week_of_year, sp.day_of_week
    `;
    
    stream<record {|
        int? month_of_year;
        int? week_of_year;
        int? day_of_week;
        decimal price_multiplier;
        decimal quantity_multiplier;
        decimal demand_multiplier;
    |}, sql:Error?> resultStream = dbClient->query(query);
    
    float[] weeklyFactors = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]; // Default
    float[] monthlyFactors = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]; // Default
    
    error? e = resultStream.forEach(function(record {|
        int? month_of_year;
        int? week_of_year;
        int? day_of_week;
        decimal price_multiplier;
        decimal quantity_multiplier;
        decimal demand_multiplier;
    |} row) {
        if (row.month_of_year is int) {
            int monthIndex = <int>row.month_of_year - 1;
            if (monthIndex >= 0 && monthIndex < 12) {
                monthlyFactors[monthIndex] = <float>row.demand_multiplier;
            }
        }
        
        if (row.day_of_week is int) {
            int dayIndex = <int>row.day_of_week - 1;
            if (dayIndex >= 0 && dayIndex < 7) {
                weeklyFactors[dayIndex] = <float>row.demand_multiplier;
            }
        }
    });
    
    if (e is error) {
        log:printError("Error processing seasonal patterns", e);
        return e;
    }
    
    check resultStream.close();
    
    return {
        location: location ?: "global",
        wasteType: wasteType,
        weeklyMultipliers: weeklyFactors,
        monthlyMultipliers: monthlyFactors,
        holidayEffects: {},
        industryEvents: {}
    };
}

// Get market data for a specific waste type and location
public function getMarketData(string wasteType, string location) returns record {|
    float avgPrice;
    float volatility;
    string trend;
    float demandIndex;
    float supplyIndex;
|}|error {
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
            md.supply_index
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
    |}|error result = dbClient->queryRow(query);
    
    if (result is error) {
        log:printError("Error fetching market data", result);
        return result;
    }
    
    return {
        avgPrice: <float>result.avg_price,
        volatility: <float>result.volatility,
        trend: result.trend,
        demandIndex: <float>result.demand_index,
        supplyIndex: <float>result.supply_index
    };
}

// Store demand forecast in database
public function storeDemandForecast(DemandForecast forecast) returns error? {
    postgresql:Client|error dbClient = database_config:getDbClient();
    if (dbClient is error) {
        return dbClient;
    }
    
    // Get waste type and location IDs
    sql:ParameterizedQuery wasteTypeQuery = `SELECT id FROM waste_types WHERE name = ${forecast.wasteType}`;
    string|error wasteTypeId = dbClient->queryRow(wasteTypeQuery);
    if (wasteTypeId is error) {
        return wasteTypeId;
    }
    
    sql:ParameterizedQuery locationQuery = `SELECT id FROM locations WHERE city = ${forecast.location}`;
    string|error locationId = dbClient->queryRow(locationQuery);
    if (locationId is error) {
        return locationId;
    }
    
    // Convert Utc to Civil time for database storage
    time:Civil|error civilTime = time:utcToCivil(forecast.generatedAt);
    if (civilTime is error) {
        return civilTime;
    }
    
    sql:ParameterizedQuery insertQuery = `
        INSERT INTO demand_forecasts (
            waste_type_id, location_id, prediction_id, generated_at,
            next_week_demand, next_month_demand, next_quarter_demand,
            confidence_level, demand_lower_bound, demand_upper_bound,
            predicted_price_per_ton, price_volatility, market_trend,
            opportunity_score, key_drivers, expires_at
        ) VALUES (
            ${wasteTypeId}, ${locationId}, ${forecast.predictionId}, ${civilTime},
            ${forecast.nextWeekDemand}, ${forecast.nextMonthDemand}, ${forecast.nextQuarterDemand},
            ${forecast.confidenceLevel}, ${forecast.demandLowerBound}, ${forecast.demandUpperBound},
            ${forecast.predictedPricePerTon}, ${forecast.priceVolatility}, ${forecast.marketTrend},
            ${forecast.opportunityScore}, ${forecast.keyDrivers}, NOW() + INTERVAL '7 days'
        )
    `;
    
    sql:ExecutionResult result = check dbClient->execute(insertQuery);
    log:printInfo("Stored demand forecast with ID: " + forecast.predictionId);
    return;
}

// Helper functions
function determinePeakSeasons(float[] monthlyFactors) returns string[] {
    string[] peakSeasons = [];
    float avgFactor = 0.0;
    foreach float factor in monthlyFactors {
        avgFactor += factor;
    }
    avgFactor /= <float>monthlyFactors.length();
    
    foreach int i in 0 ..< monthlyFactors.length() {
        if (monthlyFactors[i] > avgFactor * 1.1) {
            string month = getMonthName(i + 1);
            peakSeasons.push(month);
        }
    }
    
    return peakSeasons;
}

function calculateSeasonalVolatility(float[] monthlyFactors) returns float {
    float mean = 0.0;
    foreach float factor in monthlyFactors {
        mean += factor;
    }
    mean /= <float>monthlyFactors.length();
    
    float variance = 0.0;
    foreach float factor in monthlyFactors {
        float diff = factor - mean;
        variance += diff * diff;
    }
    variance /= <float>monthlyFactors.length();
    
    return variance; // Return variance as volatility measure
}

function getMonthName(int month) returns string {
    string[] months = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];
    if (month >= 1 && month <= 12) {
        return months[month - 1];
    }
    return "Unknown";
}