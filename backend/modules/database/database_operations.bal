// Copyright (c) 2025 CircularSync
// Database Operations and Utilities

import ballerinax/postgresql;
import ballerina/uuid;
import ballerina/sql;

# Execute database test operations
#
# + return - Test results as JSON or error if operations fail
public function executeTestOperations() returns json|error {
    postgresql:Client dbClient = check getDatabaseClient();
    
    json[] results = [];

    // Test 1: Create a test table
    var createTableResult = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS test_users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    if (createTableResult is error) {
        results.push({
            "test": "Create Table",
            "status": "FAILED",
            "error": createTableResult.message()
        });
    } else {
        results.push({
            "test": "Create Table",
            "status": "PASSED",
            "message": "test_users table created successfully"
        });
    }

    // Test 2: Insert test data
    var insertResult = dbClient->execute(`
        INSERT INTO test_users (name, email) 
        VALUES ('John Doe', 'john@cyclesync.com'), 
               ('Jane Smith', 'jane@cyclesync.com')
        ON CONFLICT (email) DO NOTHING
    `);

    if (insertResult is error) {
        results.push({
            "test": "Insert Data",
            "status": "FAILED",
            "error": insertResult.message()
        });
    } else {
        results.push({
            "test": "Insert Data",
            "status": "PASSED",
            "message": "Test users inserted successfully"
        });
    }

    // Test 3: Read data  
    int|error countResult = dbClient->queryRow(`SELECT COUNT(*) as count FROM test_users`);
    
    if (countResult is error) {
        results.push({
            "test": "Read Data",
            "status": "FAILED",
            "error": countResult.message()
        });
    } else {
        results.push({
            "test": "Read Data",
            "status": "PASSED",
            "message": string `Found ${countResult} users in database`,
            "count": countResult
        });
    }

    // Test 4: Update data
    var updateResult = dbClient->execute(`
        UPDATE test_users 
        SET name = 'John Updated' 
        WHERE email = 'john@cyclesync.com'
    `);

    if (updateResult is error) {
        results.push({
            "test": "Update Data",
            "status": "FAILED",
            "error": updateResult.message()
        });
    } else {
        results.push({
            "test": "Update Data",
            "status": "PASSED",
            "message": "User updated successfully"
        });
    }

    // Test 5: Verify update
    int|error updatedCount = dbClient->queryRow(`SELECT COUNT(*) as count FROM test_users WHERE name LIKE 'John Updated%'`);
    
    if (updatedCount is error) {
        results.push({
            "test": "Verify Update",
            "status": "FAILED",
            "error": updatedCount.message()
        });
    } else {
        results.push({
            "test": "Verify Update", 
            "status": "PASSED",
            "message": string `Updated records: ${updatedCount}`,
            "count": updatedCount
        });
    }

    // Test 6: Verify final table state
    int|error finalCount = dbClient->queryRow(`SELECT COUNT(*) as count FROM test_users`);
    
    if (finalCount is error) {
        results.push({
            "test": "Verify Table State",
            "status": "FAILED", 
            "error": finalCount.message()
        });
    } else {
        results.push({
            "test": "Verify Table State",
            "status": "PASSED",
            "message": string `Table persisted with ${finalCount} records`,
            "count": finalCount
        });
    }

    return {
        "test_suite": "Database Operations Test",
        "timestamp": "",
        "results": results,
        "total_tests": results.length()
    };
}

# Newsletter Subscriber record type
public type NewsletterSubscriber record {|
    # Unique subscriber ID
    string id;
    # Subscriber email address
    string email;
    # Optional subscriber name
    string? name;
    # Subscription timestamp
    string subscribed_at;
    # Whether subscription is active
    boolean is_active;
    # Subscriber preferences (JSON)
    json preferences;
    # Last newsletter sent timestamp
    string? last_sent_at;
    # Token for unsubscribing
    string? unsubscribe_token;
|};

# Add newsletter subscriber
#
# + email - Subscriber email address
# + name - Optional subscriber name
# + return - Success status or error
public function addNewsletterSubscriber(string email, string? name = ()) returns json|error {
    postgresql:Client dbClient = check getDatabaseClient();
    
    string unsubscribeToken = uuid:createType4AsString();
    
    sql:ParameterizedQuery query = `INSERT INTO newsletter_subscribers (email, name, unsubscribe_token) 
        VALUES (${email}, ${name ?: ""}, ${unsubscribeToken})
        ON CONFLICT (email) DO NOTHING`;
    
    var result = dbClient->execute(query);
    
    if (result is error) {
        return error("Failed to add subscriber: " + result.message());
    }
    
    return {
        "success": true,
        "message": "Successfully subscribed to newsletter",
        "email": email
    };
}

# Get all active newsletter subscribers
#
# + return - List of active subscribers or error
public function getActiveSubscribers() returns NewsletterSubscriber[]|error {
    postgresql:Client dbClient = check getDatabaseClient();
    
    stream<NewsletterSubscriber, error?> subscriberStream = dbClient->query(`
        SELECT id, email, name, subscribed_at, is_active, preferences, last_sent_at, unsubscribe_token
        FROM newsletter_subscribers 
        WHERE is_active = true
        ORDER BY subscribed_at DESC
    `);
    
    NewsletterSubscriber[] subscribers = [];
    check from NewsletterSubscriber subscriber in subscriberStream
        do {
            subscribers.push(subscriber);
        };
    
    check subscriberStream.close();
    return subscribers;
}

# Update last sent timestamp for subscribers
#
# + subscriberIds - List of subscriber IDs to update
# + return - Success status or error
public function updateLastSentTimestamp(string[] subscriberIds) returns json|error {
    postgresql:Client dbClient = check getDatabaseClient();
    
    if (subscriberIds.length() == 0) {
        return { "success": true, "message": "No subscribers to update" };
    }
    
    int updatedCount = 0;
    
    foreach string subscriberId in subscriberIds {
        sql:ParameterizedQuery query = `UPDATE newsletter_subscribers 
            SET last_sent_at = CURRENT_TIMESTAMP 
            WHERE id = ${subscriberId}`;
        
        var result = dbClient->execute(query);
        if !(result is error) {
            updatedCount += 1;
        }
    }
    
    return {
        "success": true,
        "message": string `Updated ${updatedCount} subscribers`,
        "updated_count": updatedCount
    };
}

# Unsubscribe user by token
#
# + token - Unsubscribe token
# + return - Success status or error
public function unsubscribeByToken(string token) returns json|error {
    postgresql:Client dbClient = check getDatabaseClient();
    
    sql:ParameterizedQuery query = `UPDATE newsletter_subscribers 
        SET is_active = false 
        WHERE unsubscribe_token = ${token}`;
    
    var result = dbClient->execute(query);
    
    if (result is error) {
        return error("Failed to unsubscribe: " + result.message());
    }
    
    return {
        "success": true,
        "message": "Successfully unsubscribed from newsletter"
    };
}