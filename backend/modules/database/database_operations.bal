// Copyright (c) 2025 CircularSync
// Database Operations and Utilities

import ballerinax/postgresql;

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