// Copyright (c) 2025 CircularSync
// Database Connection Management

import ballerina/log;
import ballerinax/postgresql;

// Database configuration
configurable string dbHost = ?;
configurable int dbPort = 5432;
configurable string dbUsername = ?;
configurable string dbPassword = ?;
configurable string dbName = ?;
configurable int dbConnectionPool = 10;
configurable boolean dbSsl = true;

// Global database client instance
postgresql:Client? dbClientInstance = ();

# Initialize database connection
#
# + return - Error if connection fails, () if successful
public function initializeDatabase() returns error? {
    // Create PostgreSQL connection configuration
    postgresql:Options connectionOptions = {
        ssl: {
            mode: dbSsl ? "REQUIRE" : "DISABLE"
        }
    };

    // Initialize the PostgreSQL client
    postgresql:Client|error newClient = new (
        host = dbHost,
        username = dbUsername, 
        password = dbPassword,
        database = dbName,
        port = dbPort,
        connectionPool = {maxOpenConnections: dbConnectionPool},
        options = connectionOptions
    );

    if (newClient is error) {
        log:printError("Failed to establish database connection", newClient);
        return newClient;
    }

    dbClientInstance = newClient;
    log:printInfo("Database connection established successfully");
    
    // Test connection
    int|error testResult = newClient->queryRow(`SELECT 1 as test`);
    if (testResult is error) {
        log:printError("Database connection test failed", testResult);
        return testResult;
    }
    
    log:printInfo("Database connection test successful");
    return;
}

# Get database client instance
#
# + return - Database client or error if not connected
public function getDatabaseClient() returns postgresql:Client|error {
    postgresql:Client? clientInstance = dbClientInstance;
    if (clientInstance is postgresql:Client) {
        return clientInstance;
    }
    
    // Try to initialize database if not already initialized
    error? initResult = initializeDatabase();
    if (initResult is error) {
        return error("Database not connected and initialization failed: " + initResult.message());
    }
    
    clientInstance = dbClientInstance;
    if (clientInstance is postgresql:Client) {
        return clientInstance;
    }
    
    return error("Database not connected. Call initializeDatabase() first.");
}

# Check if database is connected
#
# + return - True if connected, false otherwise
public function isDatabaseConnected() returns boolean {
    postgresql:Client? clientInstance = dbClientInstance;
    if (clientInstance is postgresql:Client) {
        // Try a simple query to test connection
        int|error result = clientInstance->queryRow(`SELECT 1 as health_check`);
        return result is int;
    }
    return false;
}

# Close database connection
#
# + return - Error if closing fails, () if successful
public function closeDatabaseConnection() returns error? {
    postgresql:Client? clientInstance = dbClientInstance;
    if (clientInstance is postgresql:Client) {
        error? result = clientInstance.close();
        dbClientInstance = ();
        if (result is error) {
            log:printError("Failed to close database connection", result);
            return result;
        }
        log:printInfo("Database connection closed successfully");
    }
    return;
}