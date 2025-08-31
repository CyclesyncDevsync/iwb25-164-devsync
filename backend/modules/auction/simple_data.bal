// Simple auction data insertion without time complexity

import Cyclesync.database_config;

import ballerina/log;
import ballerina/sql;
import ballerina/uuid;

# Insert simplified auction data
public function insertSimpleAuctionDataDirect() returns error? {
    var dbClient = check database_config:getDbClient();

    log:printInfo("Inserting simple auction data directly");

    // Create dummy users first
    sql:ExecutionResult|error userResult = dbClient->execute(`
        INSERT INTO users (asgardeo_id, email, first_name, last_name, role, status)
        VALUES 
            ('test-supplier-1', 'supplier1@test.com', 'Test', 'Supplier1', 'supplier', 'approved'),
            ('test-buyer-1', 'buyer1@test.com', 'Test', 'Buyer1', 'buyer', 'approved')
        ON CONFLICT (asgardeo_id) DO NOTHING
    `);

    if userResult is error {
        log:printWarn("Failed to create test users", userResult);
    }

    // Get user IDs
    record {int supplier_id; int buyer_id;}|error userIds = dbClient->queryRow(`
        SELECT 
            (SELECT id FROM users WHERE role = 'supplier' LIMIT 1) as supplier_id,
            (SELECT id FROM users WHERE role = 'buyer' LIMIT 1) as buyer_id
    `);

    if userIds is error {
        log:printError("Failed to get user IDs", userIds);
        return userIds;
    }

    // Direct SQL insert with simpler approach
    string[] auctionIds = [];
    string[] materialIds = [];

    // Create 3 simple auctions
    foreach int i in 0 ..< 3 {
        string auctionId = uuid:createType1AsString();
        string materialId = uuid:createType1AsString();

        auctionIds.push(auctionId);
        materialIds.push(materialId);

        string title = string `Test Material ${i + 1}`;
        string description = string `High quality recyclable material ${i + 1}`;
        decimal startingPrice = 1000.0 + (i * 500.0);

        sql:ExecutionResult|error result = dbClient->execute(`
            INSERT INTO auctions (
                auction_id, material_id, supplier_id, title, description, 
                category, quantity, unit, starting_price, current_price,
                bid_increment, auction_type, status, 
                start_time, end_time, duration_days, location, created_at, updated_at
            ) VALUES (
                ${auctionId}::uuid, 
                ${materialId}::uuid, 
                ${userIds.supplier_id}, 
                ${title}, 
                ${description},
                'Materials', 
                100.0, 
                'kg', 
                ${startingPrice}, 
                ${startingPrice},
                500.0, 
                'standard', 
                'active',
                NOW(),
                NOW() + INTERVAL '7 days',
                7,
                ${"Test Location " + (i + 1).toString()},
                NOW(),
                NOW()
            )
        `);

        if result is error {
            log:printWarn(string `Failed to insert auction ${i}`, result);
        } else {
            log:printInfo(string `Successfully inserted auction ${i}: ${title}`);
        }
    }

    log:printInfo("Simple auction data insertion completed");
    return;
}
