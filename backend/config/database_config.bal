import ballerinax/postgresql;
import ballerina/sql;
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
    try {
        // Create PostgreSQL connection configuration
        postgresql:Options connectionOptions = {
            ssl: {
                mode: dbSsl ? postgresql:SSL_REQUIRE : postgresql:SSL_DISABLE
            }
        };

        // Initialize the PostgreSQL client
        postgresql:Client newClient = check new (
            host = dbHost,
            username = dbUsername, 
            password = dbPassword,
            database = dbName,
            port = dbPort,
            connectionPool = {maxOpenConnections: dbConnectionPool},
            options = connectionOptions
        );

        dbClient = newClient;
        log:printInfo("Database connection established successfully");
        
        // Test connection
        sql:ExecutionResult _ = check dbClient->execute(`SELECT 1 as test`);
        log:printInfo("Database connection test successful");
        
    } catch (error e) {
        log:printError("Failed to establish database connection", e);
        return e;
    }
}

// Get database client
public function getDbClient() returns postgresql:Client|error {
    if (dbClient is postgresql:Client) {
        return dbClient;
    } else {
        return error("Database connection not initialized. Call initDatabaseConnection() first.");
    }
}

// Close database connection
public function closeDatabaseConnection() returns error? {
    if (dbClient is postgresql:Client) {
        check dbClient.close();
        dbClient = ();
        log:printInfo("Database connection closed");
    }
}

// Health check function
public function isDatabaseConnected() returns boolean {
    if (dbClient is postgresql:Client) {
        // Try a simple query to test connection
        sql:ExecutionResult|error result = dbClient->execute(`SELECT 1 as health_check`);
        return result is sql:ExecutionResult;
    }
    return false;
}