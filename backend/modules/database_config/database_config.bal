import ballerinax/postgresql;
import ballerina/log;

// Database configuration
configurable string dbHost = ?;
configurable int dbPort = 5432;
configurable string dbUsername = ?;
configurable string dbPassword = ?;
configurable string dbName = ?;
configurable int dbConnectionPool = 10;
configurable boolean dbSsl = true;

// Database client instance
postgresql:Client? dbClient = ();

// Initialize database connection
public function initDatabaseConnection() returns error? {
    // Create PostgreSQL connection configuration
    postgresql:Options connectionOptions = {
        ssl: {
            mode: dbSsl ? postgresql:REQUIRE : postgresql:DISABLE
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

    dbClient = newClient;
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

// Get database client
public function getDbClient() returns postgresql:Client|error {
    postgresql:Client? clientInstance = dbClient;
    if (clientInstance is postgresql:Client) {
        return clientInstance;
    } else {
        return error("Database connection not initialized. Call initDatabaseConnection() first.");
    }
}

// Close database connection
public function closeDatabaseConnection() returns error? {
    postgresql:Client? clientInstance = dbClient;
    if (clientInstance is postgresql:Client) {
        check clientInstance.close();
        dbClient = ();
        log:printInfo("Database connection closed");
    }
    return;
}

// Health check function
public function isDatabaseConnected() returns boolean {
    postgresql:Client? clientInstance = dbClient;
    if (clientInstance is postgresql:Client) {
        // Try a simple query to test connection
        int|error result = clientInstance->queryRow(`SELECT 1 as health_check`);
        return result is int;
    }
    return false;
}