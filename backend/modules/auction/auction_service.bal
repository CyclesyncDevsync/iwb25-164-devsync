import ballerina/sql;
import ballerina/time;
import ballerina/uuid;
import ballerinax/postgresql;

# Auction Service for creating and managing material auctions
public isolated class AuctionService {
    private final postgresql:Client dbClient;
    
    public function init(postgresql:Client dbClient) {
        self.dbClient = dbClient;
    }
    
    # Create auction listing after agent approval
    # + request - Auction creation request
    # + return - Created auction ID or error
    public isolated function createAuction(AuctionCreationRequest request) returns string|error {
        string auctionId = uuid:createType1AsString();
        
        // Calculate auction end time
        time:Utc currentTime = time:utcNow();
        time:Seconds durationSeconds = request.durationDays * 24 * 60 * 60;
        time:Utc endTime = time:utcAddSeconds(currentTime, durationSeconds);
        
        // Begin transaction
        transaction {
            // Create auction record
            sql:ParameterizedQuery auctionQuery = `
                INSERT INTO auctions (
                    auction_id, material_id, workflow_id, supplier_id,
                    title, description, category, sub_category,
                    quantity, unit, condition_rating, quality_score,
                    starting_price, reserve_price, current_price,
                    bid_increment, auction_type, status,
                    start_time, end_time, duration_days,
                    photos, verification_details, agent_notes,
                    created_at
                ) VALUES (
                    ${auctionId}, ${request.materialId}, ${request.workflowId}, ${request.supplierId},
                    ${request.title}, ${request.description}, ${request.category}, ${request.subCategory},
                    ${request.quantity}, ${request.unit}, ${request.conditionRating}, ${request.qualityScore},
                    ${request.startingPrice}, ${request.reservePrice}, ${request.startingPrice},
                    ${request.bidIncrement}, ${request.auctionType}, 'active',
                    CURRENT_TIMESTAMP, ${endTime}, ${request.durationDays},
                    ${self.arrayToJson(request.photos)}, ${request.verificationDetails.toString()}, ${request?.agentNotes},
                    CURRENT_TIMESTAMP
                )
            `;
            
            _ = check self.dbClient->execute(auctionQuery);
            
            // Create auction metrics record
            sql:ParameterizedQuery metricsQuery = `
                INSERT INTO auction_metrics (
                    auction_id, view_count, bid_count, unique_bidders,
                    avg_bid_amount, time_to_first_bid, last_activity
                ) VALUES (
                    ${auctionId}, 0, 0, 0, 0, NULL, CURRENT_TIMESTAMP
                )
            `;
            
            _ = check self.dbClient->execute(metricsQuery);
            
            // Update workflow status
            sql:ParameterizedQuery workflowQuery = `
                UPDATE material_workflows
                SET current_stage = 'auction_active',
                    auction_listing = jsonb_build_object(
                        'auctionId', ${auctionId},
                        'listedAt', CURRENT_TIMESTAMP,
                        'endTime', ${endTime}
                    ),
                    updated_at = CURRENT_TIMESTAMP
                WHERE workflow_id = ${request.workflowId}
            `;
            
            _ = check self.dbClient->execute(workflowQuery);
            
            // Create notification for supplier
            sql:ParameterizedQuery notificationQuery = `
                INSERT INTO notifications (
                    notification_id, user_id, type, title, message,
                    action_url, status, created_at
                ) VALUES (
                    ${uuid:createType1AsString()}, ${request.supplierId}, 'auction_listed',
                    'Your material is now listed for auction',
                    'Your ${request.title} has been approved and is now available for bidding.',
                    '/auction/${auctionId}', 'unread', CURRENT_TIMESTAMP
                )
            `;
            
            _ = check self.dbClient->execute(notificationQuery);
            
            check commit;
        } on fail error e {
            return e;
        }
        
        return auctionId;
    }
    
    # Place a bid on an auction
    # + bid - Bid details
    # + return - Bid result or error
    public isolated function placeBid(BidRequest bid) returns BidResult|error {
        // Validate auction status and bid amount
        AuctionDetails auction = check self.getAuctionDetails(bid.auctionId);
        
        if auction.status != "active" {
            return error("Auction is not active");
        }
        
        if bid.bidAmount <= auction.current_price {
            return error(string `Bid amount must be greater than current price: ${auction.current_price}`);
        }
        
        if bid.bidAmount < auction.current_price + auction.bid_increment {
            return error(string `Minimum bid increment is ${auction.bid_increment}`);
        }
        
        string bidId = uuid:createType1AsString();
        
        transaction {
            // Create bid record
            sql:ParameterizedQuery bidQuery = `
                INSERT INTO bids (
                    bid_id, auction_id, bidder_id, bid_amount,
                    max_bid_amount, bid_type, is_auto_bid,
                    ip_address, user_agent, created_at
                ) VALUES (
                    ${bidId}, ${bid.auctionId}, ${bid.bidderId}, ${bid.bidAmount},
                    ${bid?.maxBidAmount}, ${bid.bidType}, ${bid.isAutoBid},
                    ${bid?.ipAddress}, ${bid?.userAgent}, CURRENT_TIMESTAMP
                )
            `;
            
            _ = check self.dbClient->execute(bidQuery);
            
            // Update auction current price and bid count
            sql:ParameterizedQuery updateAuctionQuery = `
                UPDATE auctions
                SET current_price = ${bid.bidAmount},
                    highest_bidder_id = ${bid.bidderId},
                    last_bid_time = CURRENT_TIMESTAMP,
                    bid_count = bid_count + 1
                WHERE auction_id = ${bid.auctionId}
            `;
            
            _ = check self.dbClient->execute(updateAuctionQuery);
            
            // Update auction metrics
            sql:ParameterizedQuery updateMetricsQuery = `
                UPDATE auction_metrics
                SET bid_count = bid_count + 1,
                    unique_bidders = (
                        SELECT COUNT(DISTINCT bidder_id)
                        FROM bids
                        WHERE auction_id = ${bid.auctionId}
                    ),
                    avg_bid_amount = (
                        SELECT AVG(bid_amount)
                        FROM bids
                        WHERE auction_id = ${bid.auctionId}
                    ),
                    time_to_first_bid = COALESCE(
                        time_to_first_bid,
                        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - (SELECT start_time FROM auctions WHERE auction_id = ${bid.auctionId})))
                    ),
                    last_activity = CURRENT_TIMESTAMP
                WHERE auction_id = ${bid.auctionId}
            `;
            
            _ = check self.dbClient->execute(updateMetricsQuery);
            
            // Notify previous highest bidder if exists
            if auction.highest_bidder_id is string && auction.highest_bidder_id != bid.bidderId {
                sql:ParameterizedQuery outbidNotificationQuery = `
                    INSERT INTO notifications (
                        notification_id, user_id, type, title, message,
                        action_url, status, created_at
                    ) VALUES (
                        ${uuid:createType1AsString()}, ${auction.highest_bidder_id}, 'outbid',
                        'You have been outbid',
                        'Someone has placed a higher bid on ${auction.title}',
                        '/auction/${bid.auctionId}', 'unread', CURRENT_TIMESTAMP
                    )
                `;
                
                _ = check self.dbClient->execute(outbidNotificationQuery);
            }
            
            check commit;
        } on fail error e {
            return e;
        }
        
        return {
            bidId: bidId,
            success: true,
            currentPrice: bid.bidAmount,
            nextMinimumBid: bid.bidAmount + auction.bid_increment,
            message: "Bid placed successfully",
            isHighestBidder: true
        };
    }
    
    # Get auction details
    # + auctionId - Auction ID
    # + return - Auction details or error
    public isolated function getAuctionDetails(string auctionId) returns AuctionDetails|error {
        sql:ParameterizedQuery query = `
            SELECT 
                a.*,
                m.verified_quantity,
                m.agent_visit_cost,
                u.name as supplier_name,
                u.phone as supplier_phone,
                am.view_count,
                am.bid_count,
                am.unique_bidders
            FROM auctions a
            JOIN material_workflows m ON a.workflow_id = m.workflow_id
            JOIN users u ON a.supplier_id = u.user_id
            JOIN auction_metrics am ON a.auction_id = am.auction_id
            WHERE a.auction_id = ${auctionId}
        `;
        
        return check self.dbClient->queryRow(query);
    }
    
    # Get active auctions with filters
    # + filters - Search filters
    # + return - List of auctions
    public isolated function getActiveAuctions(AuctionFilters filters) returns AuctionSummary[]|error {
        sql:ParameterizedQuery baseQuery = `
            SELECT 
                a.auction_id,
                a.title,
                a.category,
                a.sub_category,
                a.quantity,
                a.unit,
                a.current_price,
                a.bid_count,
                a.end_time,
                a.photos[1] as main_photo,
                a.quality_score,
                am.view_count
            FROM auctions a
            JOIN auction_metrics am ON a.auction_id = am.auction_id
            WHERE a.status = 'active'
        `;
        
        // Simplified query for now - filters can be added later when needed
        sql:ParameterizedQuery fullQuery = `SELECT 
            a.auction_id,
            a.title,
            a.category,
            a.sub_category,
            a.quantity,
            a.unit,
            a.current_price,
            a.bid_count,
            a.end_time,
            a.photos[1] as main_photo,
            a.quality_score,
            am.view_count
        FROM auctions a
        JOIN auction_metrics am ON a.auction_id = am.auction_id
        WHERE a.status = 'active'
        ORDER BY a.end_time ASC
        LIMIT 20`;
        
        stream<AuctionSummary, sql:Error?> auctionStream = self.dbClient->query(fullQuery);
        AuctionSummary[] auctions = [];
        
        check from AuctionSummary auction in auctionStream
            do {
                auctions.push(auction);
            };
        
        return auctions;
    }
    
    # Complete auction when time expires
    # + auctionId - Auction ID
    # + return - Completion result or error
    public isolated function completeAuction(string auctionId) returns AuctionCompletionResult|error {
        AuctionDetails auction = check self.getAuctionDetails(auctionId);
        
        if auction.status != "active" {
            return error("Auction is not active");
        }
        
        // Determine if reserve price was met
        boolean reserveMet = auction.current_price >= auction.reserve_price;
        string finalStatus = reserveMet ? "completed" : "reserve_not_met";
        
        transaction {
            
            // Update auction status
            sql:ParameterizedQuery updateAuctionQuery = `
                UPDATE auctions
                SET status = ${finalStatus},
                    completed_at = CURRENT_TIMESTAMP,
                    final_price = ${auction.current_price},
                    reserve_met = ${reserveMet}
                WHERE auction_id = ${auctionId}
            `;
            
            _ = check self.dbClient->execute(updateAuctionQuery);
            
            if reserveMet && auction.highest_bidder_id is string {
                // Create transaction record
                sql:ParameterizedQuery transactionQuery = `
                    INSERT INTO transactions (
                        transaction_id, auction_id, buyer_id, supplier_id,
                        material_id, amount, agent_fee, platform_fee,
                        supplier_amount, status, created_at
                    ) VALUES (
                        ${uuid:createType1AsString()}, ${auctionId}, ${auction.highest_bidder_id},
                        ${auction.supplier_id}, ${auction.material_id}, ${auction.current_price},
                        ${auction.agent_visit_cost}, ${<decimal>(auction.current_price * 0.05)},
                        ${<decimal>(auction.current_price - auction.agent_visit_cost - auction.current_price * 0.05)},
                        'pending_payment', CURRENT_TIMESTAMP
                    )
                `;
                
                _ = check self.dbClient->execute(transactionQuery);
                
                // Update workflow status
                sql:ParameterizedQuery workflowQuery = `
                    UPDATE material_workflows
                    SET current_stage = 'auction_completed',
                        auction_result = jsonb_build_object(
                            'completedAt', CURRENT_TIMESTAMP,
                            'finalPrice', ${auction.current_price},
                            'buyerId', ${auction.highest_bidder_id}
                        ),
                        updated_at = CURRENT_TIMESTAMP
                    WHERE workflow_id = ${auction.workflow_id}
                `;
                
                _ = check self.dbClient->execute(workflowQuery);
                
                // Notify winner
                sql:ParameterizedQuery winnerNotificationQuery = `
                    INSERT INTO notifications (
                        notification_id, user_id, type, title, message,
                        action_url, status, created_at
                    ) VALUES (
                        ${uuid:createType1AsString()}, ${auction.highest_bidder_id}, 'auction_won',
                        'Congratulations! You won the auction',
                        'You have won the auction for ${auction.title}. Please complete payment to proceed.',
                        '/auction/${auctionId}/checkout', 'unread', CURRENT_TIMESTAMP
                    )
                `;
                
                _ = check self.dbClient->execute(winnerNotificationQuery);
            }
            
            // Notify supplier
            sql:ParameterizedQuery supplierNotificationQuery = `
                INSERT INTO notifications (
                    notification_id, user_id, type, title, message,
                    action_url, status, created_at
                ) VALUES (
                    ${uuid:createType1AsString()}, ${auction.supplier_id}, 
                    ${reserveMet ? "auction_completed" : "reserve_not_met"},
                    ${reserveMet ? "Auction completed successfully" : "Auction ended - Reserve not met"},
                    ${reserveMet ? 
                        string `Your ${auction.title} sold for LKR ${auction.current_price}` : 
                        string `Your ${auction.title} did not meet the reserve price`},
                    '/auction/${auctionId}/summary', 'unread', CURRENT_TIMESTAMP
                )
            `;
            
            _ = check self.dbClient->execute(supplierNotificationQuery);
            
            check commit;
        } on fail error e {
            return e;
        }
        
        return {
            auctionId: auctionId,
            status: reserveMet ? "completed" : "reserve_not_met",
            finalPrice: auction.current_price,
            winnerId: auction.highest_bidder_id,
            reserveMet: reserveMet
        };
    }
    
    # Convert string array to JSON
    private isolated function arrayToJson(string[] arr) returns string {
        string result = "[";
        foreach int i in 0 ..< arr.length() {
            result = result + "\"" + arr[i] + "\"";
            if i < arr.length() - 1 {
                result = result + ",";
            }
        }
        result = result + "]";
        return result;
    }
}

# Types for auction service
public type AuctionCreationRequest record {|
    string materialId;
    string workflowId;
    string supplierId;
    string title;
    string description;
    string category;
    string subCategory;
    decimal quantity;
    string unit;
    int conditionRating;
    int qualityScore;
    decimal startingPrice;
    decimal reservePrice;
    decimal bidIncrement;
    string auctionType = "standard"; // standard, dutch, sealed
    int durationDays;
    string[] photos;
    json verificationDetails;
    string? agentNotes?;
|};

public type BidRequest record {|
    string auctionId;
    string bidderId;
    decimal bidAmount;
    decimal? maxBidAmount?; // For automatic bidding
    string bidType = "manual"; // manual, auto
    boolean isAutoBid = false;
    string? ipAddress?;
    string? userAgent?;
|};

public type BidResult record {|
    string bidId;
    boolean success;
    decimal currentPrice;
    decimal nextMinimumBid;
    string message;
    boolean isHighestBidder;
|};

public type AuctionDetails record {|
    string auction_id;
    string material_id;
    string workflow_id;
    string supplier_id;
    string supplier_name;
    string supplier_phone;
    string title;
    string description;
    string category;
    string sub_category;
    decimal quantity;
    string unit;
    int condition_rating;
    int quality_score;
    decimal starting_price;
    decimal reserve_price;
    decimal current_price;
    decimal bid_increment;
    string auction_type;
    string status;
    time:Civil start_time;
    time:Civil end_time;
    int duration_days;
    string[] photos;
    json verification_details;
    string? agent_notes;
    string? highest_bidder_id;
    time:Civil? last_bid_time;
    int bid_count;
    decimal verified_quantity;
    decimal agent_visit_cost;
    int view_count;
    int unique_bidders;
|};

public type AuctionSummary record {|
    string auction_id;
    string title;
    string category;
    string sub_category;
    decimal quantity;
    string unit;
    decimal current_price;
    int bid_count;
    time:Civil end_time;
    string main_photo;
    int quality_score;
    int view_count;
|};

public type AuctionFilters record {|
    string? category?;
    decimal? minPrice?;
    decimal? maxPrice?;
    string? sortBy?;
    string? sortOrder?;
    int? 'limit?;
    int? offset?;
|};

public type AuctionCompletionResult record {|
    string auctionId;
    string status;
    decimal finalPrice;
    string? winnerId;
    boolean reserveMet;
|};