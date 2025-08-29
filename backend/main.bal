
// The auth module will auto-register its services
import Cyclesync.auth as _;
// Auth module functions
import Cyclesync.auth;
// The chatbot module will auto-register its services
import Cyclesync.chatbot as _;
// Database module for connection management
import Cyclesync.database;
// The demand_prediction module will auto-register its services
import Cyclesync.demand_prediction as _;
// The quality_assessment module will auto-register its services
import Cyclesync.quality_assessment as _;
// The dynamic_pricing module will auto-register its services
import Cyclesync.dynamic_pricing as _;

import ballerina/http;
import ballerina/log;


configurable int port = 8080;
public listener http:Listener server = check new (8080);

// Log startup information
function init() {
    log:printInfo("Starting Cyclesync Backend Services...");

    // Initialize database connection
    error? dbResult = database:initializeDatabase();
    if (dbResult is error) {
        log:printError("Failed to initialize database connection", dbResult);
    } else {
        log:printInfo("Database connection initialized successfully");

        // Initialize authentication schema
        error? authResult = auth:initializeAuthSchema();
        if (authResult is error) {
            log:printError("Failed to initialize auth schema", authResult);
        } else {
            log:printInfo("Authentication schema initialized successfully");
        }
    }

    log:printInfo(string `Main API Server starting on port ${port}`);
    log:printInfo("Demand Prediction Service initialized on /api/ai/demand");
    log:printInfo("Quality Assessment Service initialized on /api/ai/quality");
    log:printInfo("Chatbot WebSocket Service initialized on ws://localhost:8083/chat");
    log:printInfo("Chatbot Health Check initialized on http://localhost:8084/health");
}

// Health check endpoint
service / on server {
    resource function get health() returns json {
        boolean dbConnected = database:isDatabaseConnected();
        return {
            "status": "healthy",
            "message": "Cyclesync API is running",
            "database": dbConnected ? "connected" : "disconnected"
        };
    }

    // Database health check endpoint
    resource function get health/database() returns json {
        boolean dbConnected = database:isDatabaseConnected();
        return {
            "database_status": dbConnected ? "connected" : "disconnected",
            "timestamp": ""
        };
    }

    // Database test endpoint with sample data operations
    resource function post test/database() returns json|http:Response {
        json|error testResult = database:executeTestOperations();

        if (testResult is error) {
            http:Response response = new;
            response.statusCode = 503;
            response.setJsonPayload({
                "error": "Database test failed",
                "message": testResult.message()
            });
            return response;
        }

        return testResult;
    }
}


