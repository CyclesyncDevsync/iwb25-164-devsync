// Copyright (c) 2025 CircularSync
// Auction HTTP Controller

import Cyclesync.database_config;

import ballerina/http;
import ballerina/log;

// No additional imports needed - functions are available from the same package

// Initialize auction service with database configuration
@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"],
        allowCredentials: false,
        allowHeaders: ["*"],
        allowMethods: ["*"],
        maxAge: 84900
    }
}
service /api/auction on new http:Listener(8096) {

    # Initialize auction and wallet database schema
    resource function post init() returns http:Response {
        http:Response response = new;

        log:printInfo("Initializing auction system database schema");

        // Initialize database connection
        error? dbInitResult = database_config:initDatabaseConnection();
        if dbInitResult is error {
            log:printError("Failed to initialize database connection", dbInitResult);
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Database connection failed",
                "message": dbInitResult.message()
            });
            return response;
        }

        // Initialize auction schema
        error? schemaResult = initializeAuctionAndWalletSchema();
        if schemaResult is error {
            log:printError("Failed to initialize auction schema", schemaResult);
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Schema initialization failed",
                "message": schemaResult.message()
            });
            return response;
        }

        response.statusCode = 200;
        response.setJsonPayload({
            "status": "success",
            "message": "Auction system database schema initialized successfully"
        });
        return response;
    }

    # Get all active auctions
    resource function get auctions() returns http:Response {
        http:Response response = new;

        do {
            var dbClient = check database_config:getDbClient();

            // Query active auctions with basic information
            stream<record {
                string auction_id;
                string title;
                string description;
                string category;
                string? sub_category;
                decimal quantity;
                string unit;
                decimal starting_price;
                decimal current_price;
                decimal? reserve_price;
                string status;
                string start_time;
                string end_time;
                int bid_count;
                string? location;
                string[]? photos;
                int supplier_id;
            }, error?> auctionStream = dbClient->query(`
                SELECT 
                    auction_id, title, description, category, sub_category,
                    quantity, unit, starting_price, current_price, reserve_price,
                    status, start_time::text, end_time::text, bid_count, location, photos, supplier_id
                FROM auctions 
                WHERE status = 'active'
                ORDER BY created_at DESC
                LIMIT 50
            `);

            record {
                string auction_id;
                string title;
                string description;
                string category;
                string? sub_category;
                decimal quantity;
                string unit;
                decimal starting_price;
                decimal current_price;
                decimal? reserve_price;
                string status;
                string start_time;
                string end_time;
                int bid_count;
                string? location;
                string[]? photos;
                int supplier_id;
            }[] auctions = [];

            check auctionStream.forEach(function(record {
                        string auction_id;
                        string title;
                        string description;
                        string category;
                        string? sub_category;
                        decimal quantity;
                        string unit;
                        decimal starting_price;
                        decimal current_price;
                        decimal? reserve_price;
                        string status;
                        string start_time;
                        string end_time;
                        int bid_count;
                        string? location;
                        string[]? photos;
                        int supplier_id;
                    } auction) {
                auctions.push(auction);
            });

            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "data": auctions.toJson(),
                "count": auctions.length()
            });

        } on fail error e {
            log:printError("Failed to fetch auctions", e);
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Failed to fetch auctions",
                "message": e.message()
            });
        }

        return response;
    }

    # Get auction by ID
    resource function get auction/[string auctionId]() returns http:Response {
        http:Response response = new;

        do {
            var dbClient = check database_config:getDbClient();

            // Query specific auction with detailed information
            record {
                string auction_id;
                string title;
                string description;
                string category;
                string sub_category;
                decimal quantity;
                string unit;
                decimal starting_price;
                decimal current_price;
                decimal? reserve_price;
                string status;
                string start_time;
                string end_time;
                int bid_count;
                string location;
                string[] photos;
                int supplier_id;
            }|error auctionResult = dbClient->queryRow(`
                SELECT 
                    auction_id, title, description, category, sub_category,
                    quantity, unit, starting_price, current_price, reserve_price,
                    status, start_time::text, end_time::text, bid_count, location, photos, supplier_id
                FROM auctions 
                WHERE auction_id = ${auctionId}
            `);

            if auctionResult is error {
                response.statusCode = 404;
                response.setJsonPayload({
                    "error": "Auction not found",
                    "message": "No auction found with the provided ID"
                });
                return response;
            }

            // Get recent bids for this auction
            stream<record {
                string bid_id;
                int bidder_id;
                decimal bid_amount;
                string created_at;
            }, error?> bidStream = dbClient->query(`
                SELECT bid_id, bidder_id, bid_amount, created_at::text
                FROM bids 
                WHERE auction_id = ${auctionId}
                ORDER BY created_at DESC
                LIMIT 10
            `);

            record {
                string bid_id;
                int bidder_id;
                decimal bid_amount;
                string created_at;
            }[] recentBids = [];

            check bidStream.forEach(function(record {
                        string bid_id;
                        int bidder_id;
                        decimal bid_amount;
                        string created_at;
                    } bid) {
                recentBids.push(bid);
            });

            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "data": {
                    "auction": auctionResult.toJson(),
                    "recentBids": recentBids.toJson()
                }
            });

        } on fail error e {
            log:printError("Failed to fetch auction details", e);
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Failed to fetch auction details",
                "message": e.message()
            });
        }

        return response;
    }

    # Add dummy data for testing
    resource function post dummyData() returns http:Response {
        http:Response response = new;

        do {
            // Initialize database connection if not already done
            error? dbInitResult = database_config:initDatabaseConnection();
            if dbInitResult is error {
                response.statusCode = 500;
                response.setJsonPayload({
                    "error": "Database connection failed",
                    "message": dbInitResult.message()
                });
                return response;
            }

            // Insert simple auction data
            error? dummyResult = insertSimpleAuctionDataDirect();
            if dummyResult is error {
                log:printError("Failed to insert dummy data", dummyResult);
                response.statusCode = 500;
                response.setJsonPayload({
                    "error": "Failed to insert dummy data",
                    "message": dummyResult.message()
                });
                return response;
            }

            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "message": "Dummy auction data inserted successfully"
            });

        } on fail error e {
            log:printError("Failed to add dummy data", e);
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Failed to add dummy data",
                "message": e.message()
            });
        }

        return response;
    }
}
