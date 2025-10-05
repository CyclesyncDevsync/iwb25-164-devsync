// Copyright (c) 2025 CircularSync
// Auction End Tracking and Auto-Processing

import Cyclesync.database_config;

import ballerina/log;
import ballerina/sql;
import ballerina/task;

// Scheduler configuration
task:JobId? schedulerJobId = ();

# Initialize auction end tracking scheduler
#
# + return - Error if initialization fails
public function initializeAuctionScheduler() returns error? {
    log:printInfo("Initializing auction end tracking scheduler");

    // Run every minute to check for ended auctions
    schedulerJobId = check task:scheduleJobRecurByFrequency(new AuctionEndJob(), 60);

    log:printInfo("Auction scheduler initialized successfully - checking every 60 seconds");
    return;
}

# Stop the auction scheduler
public function stopAuctionScheduler() returns error? {
    task:JobId? jobId = schedulerJobId;
    if jobId is task:JobId {
        check task:unscheduleJob(jobId);
        log:printInfo("Auction scheduler stopped");
    }
    return;
}

# Manual trigger to immediately check and process ended auctions
#
# + return - Processing result with details
public function manualProcessEndedAuctions() returns json|error {
    AuctionEndJob job = new ();
    error? result = job.checkAndProcessEndedAuctions();

    if result is error {
        return {
            "status": "error",
            "message": result.message(),
            "timestamp": ()
        };
    }

    return {
        "status": "success",
        "message": "Ended auctions processed successfully",
        "timestamp": ()
    };
}

# Job class to check and process ended auctions
class AuctionEndJob {

    *task:Job;

    public function execute() {
        error? result = self.checkAndProcessEndedAuctions();
        if result is error {
            log:printError("Error processing ended auctions", result);
        }
    }

    # Check for auctions that have ended and process them
    public function checkAndProcessEndedAuctions() returns error? {
        var dbClient = check database_config:getDbClient();

        log:printInfo("Checking for ended auctions...");

        // Find auctions that need payment processing:
        // 1. Status is 'ended' but payment not processed yet (no completed_at)
        // 2. Status is 'active' and time has passed end_time
        stream<record {
            string auction_id;
            decimal current_price;
            int? highest_bidder_id;
            int supplier_id;
            string status;
        }, error?> endedAuctionsStream = dbClient->query(`
            SELECT auction_id, current_price, highest_bidder_id, supplier_id, status
            FROM auctions
            WHERE (
                (status = 'ended' AND completed_at IS NULL)
                OR
                (status = 'active' AND end_time <= CURRENT_TIMESTAMP)
            )
            ORDER BY end_time ASC
        `);

        int processedCount = 0;

        check endedAuctionsStream.forEach(function(record {
                    string auction_id;
                    decimal current_price;
                    int? highest_bidder_id;
                    int supplier_id;
                    string status;
                } auction) {
            string winnerStr = auction.highest_bidder_id is int ? auction.highest_bidder_id.toString() : "none";
            log:printInfo(string `Found auction to process: ${auction.auction_id}, status=${auction.status}, price=${auction.current_price.toString()}, winner=${winnerStr}`);

            error? processResult = self.processAuctionEnd(
                auction.auction_id,
                auction.current_price,
                auction.highest_bidder_id,
                auction.supplier_id
            );

            if processResult is error {
                log:printError(string `❌ Failed to process auction ${auction.auction_id}`, processResult);
            } else {
                processedCount = processedCount + 1;
                log:printInfo(string `✅ Successfully processed auction ${auction.auction_id}`);
            }
        });

        if processedCount > 0 {
            log:printInfo(string `Processed ${processedCount} ended auctions`);
        }

        return;
    }

    # Process a single auction that has ended
    #
    # + auctionId - The auction ID
    # + finalPrice - The final bid price
    # + winnerId - The winning bidder ID (null if no bids)
    # + supplierId - The supplier ID
    # + return - Error if processing fails
    public function processAuctionEnd(string auctionId, decimal finalPrice, int? winnerId, int supplierId) returns error? {
        var dbClient = check database_config:getDbClient();

        // Start transaction
        var txResult = dbClient->execute(`BEGIN`);
        if txResult is error {
            log:printError("Failed to start transaction", txResult);
        }

        // 1. Update auction status to 'ended'
        var updateAuctionResult = dbClient->execute(`
            UPDATE auctions
            SET status = 'ended', completed_at = CURRENT_TIMESTAMP, final_price = ${finalPrice}
            WHERE auction_id = ${auctionId}::uuid
        `);

        if updateAuctionResult is error {
            sql:ExecutionResult|error rollbackResult = dbClient->execute(`ROLLBACK`);
            if rollbackResult is error {
                log:printError("Failed to rollback transaction", rollbackResult);
            }
            return updateAuctionResult;
        }

        if winnerId is int {
            // Process winner payment - transfer from frozen balance to admin shared wallet
            error? winnerResult = self.processWinnerPayment(auctionId, winnerId, finalPrice, supplierId);
            if winnerResult is error {
                sql:ExecutionResult|error rollbackResult = dbClient->execute(`ROLLBACK`);
                if rollbackResult is error {
                    log:printError("Failed to rollback transaction", rollbackResult);
                }
                return winnerResult;
            }

            // Refund all losing bidders
            error? refundResult = self.refundLosingBidders(auctionId, winnerId);
            if refundResult is error {
                log:printWarn(string `Failed to refund losing bidders for auction ${auctionId}`, refundResult);
                // Don't fail the entire transaction for refund errors
            }
        } else {
            // No winner - refund all bidders
            error? refundResult = self.refundAllBidders(auctionId);
            if refundResult is error {
                log:printWarn(string `Failed to refund bidders for auction ${auctionId}`, refundResult);
            }
        }

        // Commit transaction
        var commitResult = dbClient->execute(`COMMIT`);
        if commitResult is error {
            log:printError("Failed to commit transaction", commitResult);
            return commitResult;
        }

        log:printInfo(string `Auction ${auctionId} processed successfully. Winner: ${winnerId ?: "None"}, Final Price: ${finalPrice.toString()}`);
        return;
    }

    # Process winner payment - transfer frozen funds to admin shared wallet
    #
    # + auctionId - The auction ID
    # + winnerId - The winner's user ID
    # + amount - The winning bid amount
    # + supplierId - The supplier ID
    # + return - Error if payment fails
    function processWinnerPayment(string auctionId, int winnerId, decimal amount, int supplierId) returns error? {
        var dbClient = check database_config:getDbClient();

        log:printInfo(string `Processing winner payment: auction=${auctionId}, winner=${winnerId}, amount=${amount.toString()}`);

        // 1. Get winner's buyer wallet info with validation
        record {
            string wallet_id;
            decimal available_balance;
            decimal frozen_balance;
            decimal total_balance;
        }|error winnerWalletResult = dbClient->queryRow(`
            SELECT
                wallet_id::text as wallet_id,
                available_balance,
                frozen_balance,
                total_balance
            FROM user_wallets
            WHERE user_id = ${winnerId}
            AND wallet_type = 'buyer'
            LIMIT 1
        `);

        if winnerWalletResult is error {
            log:printError("Winner buyer wallet not found", winnerWalletResult);
            return error("Winner buyer wallet not found for user " + winnerId.toString());
        }

        // 2. Validate winner has sufficient frozen balance
        if winnerWalletResult.frozen_balance < amount {
            log:printError(string `Insufficient frozen balance. Required: ${amount.toString()}, Available: ${winnerWalletResult.frozen_balance.toString()}`);
            return error(string `Insufficient frozen balance for winner ${winnerId}. Required: ${amount.toString()}, Available: ${winnerWalletResult.frozen_balance.toString()}`);
        }

        // 3. Get admin shared wallet info
        record {
            string wallet_id;
            decimal available_balance;
        }|error adminWalletResult = dbClient->queryRow(`
            SELECT
                wallet_id::text as wallet_id,
                available_balance
            FROM user_wallets
            WHERE wallet_type = 'admin_shared'
            AND is_shared = TRUE
            LIMIT 1
        `);

        if adminWalletResult is error {
            log:printError("Admin shared wallet not found", adminWalletResult);
            return error("Admin shared wallet not found");
        }

        // 4. Calculate new balances
        decimal winnerNewFrozenBalance = winnerWalletResult.frozen_balance - amount;
        decimal adminNewBalance = adminWalletResult.available_balance + amount;

        log:printInfo(string `Winner frozen balance: ${winnerWalletResult.frozen_balance.toString()} -> ${winnerNewFrozenBalance.toString()}`);
        log:printInfo(string `Admin balance: ${adminWalletResult.available_balance.toString()} -> ${adminNewBalance.toString()}`);

        // 5. Reduce winner's frozen balance (payment deducted)
        var unfreezeWinnerResult = dbClient->execute(`
            UPDATE user_wallets
            SET frozen_balance = frozen_balance - ${amount},
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ${winnerId}
            AND wallet_type = 'buyer'
        `);

        if unfreezeWinnerResult is error {
            log:printError("Failed to reduce winner frozen balance", unfreezeWinnerResult);
            return unfreezeWinnerResult;
        }

        log:printInfo(string `Successfully reduced winner frozen balance by ${amount.toString()}`);

        // 6. Add to admin shared wallet available balance
        var addToAdminResult = dbClient->execute(`
            UPDATE user_wallets
            SET available_balance = available_balance + ${amount},
                updated_at = CURRENT_TIMESTAMP
            WHERE wallet_type = 'admin_shared'
            AND is_shared = TRUE
        `);

        if addToAdminResult is error {
            log:printError("Failed to add amount to admin wallet", addToAdminResult);
            return addToAdminResult;
        }

        log:printInfo(string `Successfully added ${amount.toString()} to admin shared wallet`);

        // 7. Create transaction record for winner (payment deduction from frozen balance)
        var winnerTransactionResult = dbClient->execute(`
            INSERT INTO wallet_transactions (
                wallet_id, user_id, type, amount, status, description,
                auction_id, related_user_id, balance_before, balance_after, processed_at
            ) VALUES (
                ${winnerWalletResult.wallet_id}::uuid,
                ${winnerId},
                'auction_payment',
                ${amount},
                'completed',
                'Auction payment - Frozen balance deducted for winning bid',
                ${auctionId}::uuid,
                ${supplierId},
                ${winnerWalletResult.frozen_balance},
                ${winnerNewFrozenBalance},
                CURRENT_TIMESTAMP
            )
        `);

        if winnerTransactionResult is error {
            log:printWarn("Failed to create winner transaction record", winnerTransactionResult);
        } else {
            log:printInfo("Created winner transaction record");
        }

        // 8. Create transaction record for admin wallet (payment received)
        var adminTransactionResult = dbClient->execute(`
            INSERT INTO wallet_transactions (
                wallet_id, user_id, type, amount, status, description,
                auction_id, related_user_id, balance_before, balance_after, processed_at
            ) VALUES (
                ${adminWalletResult.wallet_id}::uuid,
                NULL,
                'auction_payment',
                ${amount},
                'completed',
                'Auction payment received from winner (buyer)',
                ${auctionId}::uuid,
                ${winnerId},
                ${adminWalletResult.available_balance},
                ${adminNewBalance},
                CURRENT_TIMESTAMP
            )
        `);

        if adminTransactionResult is error {
            log:printWarn("Failed to create admin transaction record", adminTransactionResult);
        } else {
            log:printInfo("Created admin transaction record");
        }

        // 9. Mark winner's bid freeze as inactive
        var updateFreezeResult = dbClient->execute(`
            UPDATE bid_freezes
            SET is_active = false,
                released_at = CURRENT_TIMESTAMP
            WHERE user_id = ${winnerId}
            AND auction_id = ${auctionId}::uuid
            AND is_active = true
        `);

        if updateFreezeResult is error {
            log:printWarn("Failed to update bid freeze record", updateFreezeResult);
        } else {
            log:printInfo("Marked bid freeze as inactive");
        }

        log:printInfo(string `✅ Winner payment completed: ${amount.toString()} transferred from user ${winnerId} frozen balance to admin shared wallet`);
        return;
    }

    # Refund all losing bidders
    #
    # + auctionId - The auction ID
    # + winnerId - The winner's user ID (to exclude)
    # + return - Error if refund fails
    function refundLosingBidders(string auctionId, int winnerId) returns error? {
        var dbClient = check database_config:getDbClient();

        stream<record {
            int user_id;
            string wallet_id;
            decimal frozen_amount;
            decimal available_balance;
            decimal frozen_balance;
        }, error?> loserBidsStream = dbClient->query(`
            SELECT DISTINCT
                bf.user_id,
                uw.wallet_id::text as wallet_id,
                bf.frozen_amount,
                uw.available_balance,
                uw.frozen_balance
            FROM bid_freezes bf
            JOIN user_wallets uw ON bf.user_id = uw.user_id AND uw.wallet_type = 'buyer'
            WHERE bf.auction_id = ${auctionId}::uuid
            AND bf.is_active = true
            AND bf.user_id != ${winnerId}
        `);

        check loserBidsStream.forEach(function(record {
                    int user_id;
                    string wallet_id;
                    decimal frozen_amount;
                    decimal available_balance;
                    decimal frozen_balance;
                } loserBid) {
            // Calculate new balances
            decimal newAvailable = loserBid.available_balance + loserBid.frozen_amount;
            decimal newFrozen = loserBid.frozen_balance - loserBid.frozen_amount;

            // Refund losing bidder (unfreeze to available)
            var refundResult = dbClient->execute(`
                UPDATE user_wallets
                SET available_balance = available_balance + ${loserBid.frozen_amount},
                    frozen_balance = frozen_balance - ${loserBid.frozen_amount},
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ${loserBid.user_id}
                AND wallet_type = 'buyer'
            `);

            if refundResult is error {
                log:printError(string `Failed to refund bidder ${loserBid.user_id}`, refundResult);
                return;
            }

            log:printInfo(string `Refunded ${loserBid.frozen_amount.toString()} to user ${loserBid.user_id} (frozen -> available)`);

            // Create refund transaction
            var refundTransactionResult = dbClient->execute(`
                INSERT INTO wallet_transactions (
                    wallet_id, user_id, type, amount, status, description,
                    auction_id, balance_before, balance_after, processed_at
                ) VALUES (
                    ${loserBid.wallet_id}::uuid,
                    ${loserBid.user_id},
                    'bid_refund',
                    ${loserBid.frozen_amount},
                    'completed',
                    'Refund for losing bid - auction ended',
                    ${auctionId}::uuid,
                    ${loserBid.frozen_balance},
                    ${newFrozen},
                    CURRENT_TIMESTAMP
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
                AND auction_id = ${auctionId}::uuid
                AND is_active = true
            `);

            if releaseFreezeResult is error {
                log:printWarn(string `Failed to release freeze for ${loserBid.user_id}`, releaseFreezeResult);
            }
        });

        return;
    }

    # Refund all bidders (when auction ends with no winner)
    #
    # + auctionId - The auction ID
    # + return - Error if refund fails
    function refundAllBidders(string auctionId) returns error? {
        var dbClient = check database_config:getDbClient();

        stream<record {
            int user_id;
            string wallet_id;
            decimal frozen_amount;
            decimal available_balance;
            decimal frozen_balance;
        }, error?> allBidsStream = dbClient->query(`
            SELECT DISTINCT
                bf.user_id,
                uw.wallet_id::text as wallet_id,
                bf.frozen_amount,
                uw.available_balance,
                uw.frozen_balance
            FROM bid_freezes bf
            JOIN user_wallets uw ON bf.user_id = uw.user_id AND uw.wallet_type = 'buyer'
            WHERE bf.auction_id = ${auctionId}::uuid
            AND bf.is_active = true
        `);

        check allBidsStream.forEach(function(record {
                    int user_id;
                    string wallet_id;
                    decimal frozen_amount;
                    decimal available_balance;
                    decimal frozen_balance;
                } bid) {
            // Calculate new balances
            decimal newAvailable = bid.available_balance + bid.frozen_amount;
            decimal newFrozen = bid.frozen_balance - bid.frozen_amount;

            // Refund all bidders (unfreeze to available)
            var refundResult = dbClient->execute(`
                UPDATE user_wallets
                SET available_balance = available_balance + ${bid.frozen_amount},
                    frozen_balance = frozen_balance - ${bid.frozen_amount},
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ${bid.user_id}
                AND wallet_type = 'buyer'
            `);

            if refundResult is error {
                log:printError(string `Failed to refund bidder ${bid.user_id}`, refundResult);
                return;
            }

            log:printInfo(string `Refunded ${bid.frozen_amount.toString()} to user ${bid.user_id} (no winner - frozen -> available)`);

            // Create refund transaction
            var refundTransactionResult = dbClient->execute(`
                INSERT INTO wallet_transactions (
                    wallet_id, user_id, type, amount, status, description,
                    auction_id, balance_before, balance_after, processed_at
                ) VALUES (
                    ${bid.wallet_id}::uuid,
                    ${bid.user_id},
                    'bid_refund',
                    ${bid.frozen_amount},
                    'completed',
                    'Refund - auction ended without winner',
                    ${auctionId}::uuid,
                    ${bid.frozen_balance},
                    ${newFrozen},
                    CURRENT_TIMESTAMP
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
                AND auction_id = ${auctionId}::uuid
                AND is_active = true
            `);

            if releaseFreezeResult is error {
                log:printWarn(string `Failed to release freeze for ${bid.user_id}`, releaseFreezeResult);
            }
        });

        return;
    }
}
