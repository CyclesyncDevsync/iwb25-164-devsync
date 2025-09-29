// Copyright (c) 2025 CircularSync
 // Auction HTTP Controller

import Cyclesync.auth;
import Cyclesync.database_config;

import ballerina/http;
import ballerina/log;
import ballerina/sql;

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

    private auth:AuthMiddleware authMiddleware = new ();

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

    # Get authenticated user ID from request
    private function getAuthenticatedUserId(http:Request request) returns int|http:Response {
        auth:AuthContext|http:Unauthorized authResult = self.authMiddleware.authenticate(request);

        if authResult is http:Unauthorized {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "error": "Unauthorized",
                "message": "Please login to place bids"
            });
            return response;
        }

        return authResult.userId;
    }

    # Place a bid on an auction
    resource function post auction/[string auctionId]/bid(http:Request request, @http:Payload json payload) returns http:Response {
        http:Response response = new;

        // Authenticate user (only buyers can bid)
        int|http:Response userResult = self.getAuthenticatedUserId(request);
        if userResult is http:Response {
            return userResult;
        }
        int bidderId = userResult;

        do {
            var dbClient = check database_config:getDbClient();

            // Debug logging
            log:printInfo(string `Received bid request for auction: ${auctionId}`);
            log:printInfo(string `Payload: ${payload.toString()}`);

            // Extract bid amount from payload
            decimal bidAmount = check payload.bid_amount;
            log:printInfo(string `Bid amount: ${bidAmount.toString()}`);

            // Validate auction exists and is active
            record {
                string auction_id;
                decimal current_price;
                decimal bid_increment;
                string status;
                string end_time;
                int? highest_bidder_id;
            }|error auctionResult = dbClient->queryRow(`
                SELECT auction_id, current_price, bid_increment, status, end_time::text, highest_bidder_id
                FROM auctions
                WHERE auction_id::text = ${auctionId} AND status = 'active'
            `);

            if auctionResult is error {
                log:printError(string `Failed to find auction ${auctionId}`, auctionResult);

                // Check if auction exists with any status
                record {string status;}|error statusCheck = dbClient->queryRow(`
                    SELECT status FROM auctions WHERE auction_id::text = ${auctionId}
                `);

                if statusCheck is record {} {
                    log:printInfo(string `Auction ${auctionId} exists but has status: ${statusCheck.status}`);
                } else {
                    log:printInfo(string `Auction ${auctionId} does not exist in database`);
                }

                response.statusCode = 404;
                response.setJsonPayload({
                    "error": "Auction not found or not active",
                    "message": "Cannot place bid on this auction"
                });
                return response;
            }

            decimal currentPrice = auctionResult.current_price;
            decimal minBidAmount = currentPrice + auctionResult.bid_increment;

            // Validate bid amount
            if bidAmount < minBidAmount {
                response.statusCode = 400;
                response.setJsonPayload({
                    "error": "Bid amount too low",
                    "message": string `Minimum bid amount is Rs.${minBidAmount.toString()}`
                });
                return response;
            }

            // Check user's wallet balance
            record {
                string wallet_id;
                decimal available_balance;
            }|error walletResult = dbClient->queryRow(`
                SELECT wallet_id::text as wallet_id, available_balance
                FROM user_wallets
                WHERE user_id = ${bidderId}
            `);

            if walletResult is error {
                response.statusCode = 400;
                response.setJsonPayload({
                    "error": "Wallet not found",
                    "message": "Please create a wallet before bidding"
                });
                return response;
            }

            if walletResult.available_balance < bidAmount {
                response.statusCode = 400;
                response.setJsonPayload({
                    "error": "Insufficient balance",
                    "message": "Not enough funds to place this bid"
                });
                return response;
            }

            // Start transaction for bid placement
            var txResult = dbClient->execute(`BEGIN`);
            if txResult is error {
                log:printError("Failed to start transaction", txResult);
            }

            // 1. Release previous bid freeze for this user in this auction (if any)
            var unfreezeResult = dbClient->execute(`
                UPDATE user_wallets
                SET available_balance = available_balance + bf.frozen_amount,
                    frozen_balance = frozen_balance - bf.frozen_amount
                FROM bid_freezes bf
                WHERE user_wallets.user_id = ${bidderId}
                AND bf.user_id = ${bidderId}
                AND bf.auction_id = ${auctionId}::uuid
                AND bf.is_active = true
            `);

            if unfreezeResult is error {
                log:printWarn("Failed to unfreeze previous bid", unfreezeResult);
            }

            // Mark previous freezes as inactive
            var deactivateResult = dbClient->execute(`
                UPDATE bid_freezes
                SET is_active = false, released_at = CURRENT_TIMESTAMP
                WHERE user_id = ${bidderId}
                AND auction_id = ${auctionId}::uuid
                AND is_active = true
            `);

            if deactivateResult is error {
                log:printWarn("Failed to deactivate previous freezes", deactivateResult);
            }

            // 2. Freeze new bid amount
            var freezeResult = dbClient->execute(`
                UPDATE user_wallets
                SET available_balance = available_balance - ${bidAmount},
                    frozen_balance = frozen_balance + ${bidAmount}
                WHERE user_id = ${bidderId}
            `);

            if freezeResult is error {
                sql:ExecutionResult|error rollbackResult = dbClient->execute(`ROLLBACK`);
                if rollbackResult is error {
                    log:printError("Failed to rollback transaction", rollbackResult);
                }
                log:printError("Failed to freeze bid amount", freezeResult);
                response.statusCode = 500;
                response.setJsonPayload({
                    "error": "Failed to freeze bid amount",
                    "message": freezeResult.message()
                });
                return response;
            }

            // 3. Create bid record
            var bidResult = dbClient->execute(`
                INSERT INTO bids (auction_id, bidder_id, bid_amount, status, created_at)
                VALUES (${auctionId}::uuid, ${bidderId}, ${bidAmount}, 'active', CURRENT_TIMESTAMP)
            `);

            if bidResult is error {
                sql:ExecutionResult|error rollbackResult = dbClient->execute(`ROLLBACK`);
                if rollbackResult is error {
                    log:printError("Failed to rollback transaction", rollbackResult);
                }
                log:printError("Failed to create bid record", bidResult);
                response.statusCode = 500;
                response.setJsonPayload({
                    "error": "Failed to create bid",
                    "message": bidResult.message()
                });
                return response;
            }

            // 4. Update auction current price and highest bidder
            var updateAuctionResult = dbClient->execute(`
                UPDATE auctions
                SET current_price = ${bidAmount},
                    highest_bidder_id = ${bidderId},
                    last_bid_time = CURRENT_TIMESTAMP,
                    bid_count = bid_count + 1
                WHERE auction_id = ${auctionId}::uuid
            `);

            if updateAuctionResult is error {
                sql:ExecutionResult|error rollbackResult = dbClient->execute(`ROLLBACK`);
                if rollbackResult is error {
                    log:printError("Failed to rollback transaction", rollbackResult);
                }
                log:printError("Failed to update auction", updateAuctionResult);
                response.statusCode = 500;
                response.setJsonPayload({
                    "error": "Failed to update auction",
                    "message": updateAuctionResult.message()
                });
                return response;
            }

            // 5. Create bid freeze record
            var freezeRecordResult = dbClient->execute(`
                INSERT INTO bid_freezes (auction_id, user_id, frozen_amount, is_active, created_at)
                VALUES (${auctionId}::uuid, ${bidderId}, ${bidAmount}, true, CURRENT_TIMESTAMP)
            `);

            if freezeRecordResult is error {
                log:printWarn("Failed to create freeze record", freezeRecordResult);
            }

            // 6. Create wallet transaction for freeze
            var transactionResult = dbClient->execute(`
                INSERT INTO wallet_transactions (
                    wallet_id, user_id, type, amount, status, description,
                    auction_id, balance_before, balance_after
                ) VALUES (
                    ${walletResult.wallet_id}::uuid, ${bidderId}, 'bid_freeze', ${bidAmount}, 'completed',
                    'Funds frozen for auction bid', ${auctionId}::uuid,
                    ${walletResult.available_balance}, ${walletResult.available_balance - bidAmount}
                )
            `);

            if transactionResult is error {
                log:printWarn("Failed to create transaction record", transactionResult);
            }

            // Commit transaction
            var commitResult = dbClient->execute(`COMMIT`);
            if commitResult is error {
                log:printError("Failed to commit transaction", commitResult);
            }

            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "message": "Bid placed successfully",
                "data": {
                    "auction_id": auctionId,
                    "bid_amount": bidAmount,
                    "current_price": bidAmount,
                    "bidder_id": bidderId
                }
            });

        } on fail error e {
            log:printError("Failed to place bid", e);
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Failed to place bid",
                "message": e.message()
            });
        }

        return response;
    }

    # End auction and process winner
    resource function post auction/[string auctionId]/end() returns http:Response {
        http:Response response = new;

        do {
            var dbClient = check database_config:getDbClient();

            // Start transaction for auction ending
            var txResult = dbClient->execute(`BEGIN`);
            if txResult is error {
                log:printError("Failed to start transaction", txResult);
            }

            // 1. Get auction details and highest bidder
            record {
                string auction_id;
                decimal current_price;
                int? highest_bidder_id;
                string status;
                int supplier_id;
            }|error auctionResult = dbClient->queryRow(`
                SELECT auction_id, current_price, highest_bidder_id, status, supplier_id
                FROM auctions
                WHERE auction_id = ${auctionId}
            `);

            if auctionResult is error {
                response.statusCode = 404;
                response.setJsonPayload({
                    "error": "Auction not found",
                    "message": "Cannot end this auction"
                });
                return response;
            }

            if auctionResult.status == "ended" {
                response.statusCode = 400;
                response.setJsonPayload({
                    "error": "Auction already ended",
                    "message": "This auction has already been processed"
                });
                return response;
            }

            // 2. Update auction status to ended
            var updateAuctionResult = dbClient->execute(`
                UPDATE auctions
                SET status = 'ended', completed_at = CURRENT_TIMESTAMP, final_price = ${auctionResult.current_price}
                WHERE auction_id::text = ${auctionId}
            `);

            if updateAuctionResult is error {
                sql:ExecutionResult|error rollbackResult = dbClient->execute(`ROLLBACK`);
                if rollbackResult is error {
                    log:printError("Failed to rollback transaction", rollbackResult);
                }
                log:printError("Failed to update auction status", updateAuctionResult);
                response.statusCode = 500;
                response.setJsonPayload({
                    "error": "Failed to end auction",
                    "message": updateAuctionResult.message()
                });
                return response;
            }

            int? winnerId = auctionResult.highest_bidder_id;
            decimal finalPrice = auctionResult.current_price;

            if winnerId is int {
                // 3. Process winner payment (move from frozen to payment)
                record {
                    string wallet_id;
                    decimal frozen_balance;
                }|error winnerWalletResult = dbClient->queryRow(`
                    SELECT wallet_id::text as wallet_id, frozen_balance
                    FROM user_wallets
                    WHERE user_id = ${winnerId}
                `);

                if winnerWalletResult is record {} {
                    // Unfreeze winner's bid amount and mark as payment
                    var unfreezeWinnerResult = dbClient->execute(`
                        UPDATE user_wallets
                        SET frozen_balance = frozen_balance - ${finalPrice}
                        WHERE user_id = ${winnerId}
                    `);

                    if unfreezeWinnerResult is error {
                        log:printError("Failed to unfreeze winner amount", unfreezeWinnerResult);
                    }

                    // Create payment transaction for winner
                    var winnerTransactionResult = dbClient->execute(`
                        INSERT INTO wallet_transactions (
                            wallet_id, user_id, type, amount, status, description,
                            auction_id, related_user_id
                        ) VALUES (
                            ${winnerWalletResult.wallet_id}::uuid, ${winnerId}, 'auction_payment',
                            ${finalPrice}, 'completed', 'Payment for won auction',
                            ${auctionId}, ${auctionResult.supplier_id}
                        )
                    `);

                    if winnerTransactionResult is error {
                        log:printWarn("Failed to create winner transaction", winnerTransactionResult);
                    }

                    // Update bid freeze record for winner
                    var updateWinnerFreezeResult = dbClient->execute(`
                        UPDATE bid_freezes
                        SET is_active = false, released_at = CURRENT_TIMESTAMP
                        WHERE user_id = ${winnerId}
                        AND auction_id::text = ${auctionId}
                        AND is_active = true
                    `);

                    if updateWinnerFreezeResult is error {
                        log:printWarn("Failed to update winner freeze record", updateWinnerFreezeResult);
                    }
                }

                // 4. Refund all other bidders
                stream<record {
                    int user_id;
                    string wallet_id;
                    decimal frozen_amount;
                }, error?> loserBidsStream = dbClient->query(`
                    SELECT DISTINCT bf.user_id, uw.wallet_id::text as wallet_id, bf.frozen_amount
                    FROM bid_freezes bf
                    JOIN user_wallets uw ON bf.user_id = uw.user_id
                    WHERE bf.auction_id::text = ${auctionId}
                    AND bf.is_active = true
                    AND bf.user_id != ${winnerId}
                `);

                check loserBidsStream.forEach(function(record {
                            int user_id;
                            string wallet_id;
                            decimal frozen_amount;
                        } loserBid) {
                    // Refund losing bidders
                    var refundResult = dbClient->execute(`
                        UPDATE user_wallets
                        SET available_balance = available_balance + ${loserBid.frozen_amount},
                            frozen_balance = frozen_balance - ${loserBid.frozen_amount}
                        WHERE user_id = ${loserBid.user_id}
                    `);

                    if refundResult is error {
                        log:printError(string `Failed to refund bidder ${loserBid.user_id}`, refundResult);
                    }

                    // Create refund transaction
                    var refundTransactionResult = dbClient->execute(`
                        INSERT INTO wallet_transactions (
                            wallet_id, user_id, type, amount, status, description, auction_id
                        ) VALUES (
                            ${loserBid.wallet_id}::uuid, ${loserBid.user_id}, 'bid_refund',
                            ${loserBid.frozen_amount}, 'completed', 'Refund for losing bid',
                            ${auctionId}
                        )
                    `);

                    if refundTransactionResult is error {
                        log:printWarn(string `Failed to create refund transaction for ${loserBid.user_id}`, refundTransactionResult);
                    }

                    // Mark freeze as released
                    var releaseFreezeResult = dbClient->execute(`
                        UPDATE bid_freezes
                        SET is_active = false, released_at = CURRENT_TIMESTAMP
                        WHERE user_id = ${loserBid.user_id}
                        AND auction_id::text = ${auctionId}
                        AND is_active = true
                    `);

                    if releaseFreezeResult is error {
                        log:printWarn(string `Failed to release freeze for ${loserBid.user_id}`, releaseFreezeResult);
                    }
                });

            } else {
                // No bids - refund all bidders
                stream<record {
                    int user_id;
                    string wallet_id;
                    decimal frozen_amount;
                }, error?> allBidsStream = dbClient->query(`
                    SELECT DISTINCT bf.user_id, uw.wallet_id::text as wallet_id, bf.frozen_amount
                    FROM bid_freezes bf
                    JOIN user_wallets uw ON bf.user_id = uw.user_id
                    WHERE bf.auction_id::text = ${auctionId}
                    AND bf.is_active = true
                `);

                check allBidsStream.forEach(function(record {
                            int user_id;
                            string wallet_id;
                            decimal frozen_amount;
                        } bid) {
                    // Refund all bidders
                    var refundResult = dbClient->execute(`
                        UPDATE user_wallets
                        SET available_balance = available_balance + ${bid.frozen_amount},
                            frozen_balance = frozen_balance - ${bid.frozen_amount}
                        WHERE user_id = ${bid.user_id}
                    `);

                    if refundResult is error {
                        log:printError(string `Failed to refund bidder ${bid.user_id}`, refundResult);
                    }

                    // Create refund transaction
                    var refundTransactionResult = dbClient->execute(`
                        INSERT INTO wallet_transactions (
                            wallet_id, user_id, type, amount, status, description, auction_id
                        ) VALUES (
                            ${bid.wallet_id}::uuid, ${bid.user_id}, 'bid_refund',
                            ${bid.frozen_amount}, 'completed', 'Refund - auction ended without winner',
                            ${auctionId}
                        )
                    `);

                    if refundTransactionResult is error {
                        log:printWarn(string `Failed to create refund transaction for ${bid.user_id}`, refundTransactionResult);
                    }

                    // Mark freeze as released
                    var releaseFreezeResult = dbClient->execute(`
                        UPDATE bid_freezes
                        SET is_active = false, released_at = CURRENT_TIMESTAMP
                        WHERE user_id = ${bid.user_id}
                        AND auction_id::text = ${auctionId}
                        AND is_active = true
                    `);

                    if releaseFreezeResult is error {
                        log:printWarn(string `Failed to release freeze for ${bid.user_id}`, releaseFreezeResult);
                    }
                });
            }

            // Commit transaction
            var commitResult = dbClient->execute(`COMMIT`);
            if commitResult is error {
                log:printError("Failed to commit transaction", commitResult);
            }

            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "message": "Auction ended successfully",
                "data": {
                    "auction_id": auctionId,
                    "winner_id": winnerId,
                    "final_price": finalPrice,
                    "status": "ended"
                }
            });

        } on fail error e {
            log:printError("Failed to end auction", e);
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Failed to end auction",
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
