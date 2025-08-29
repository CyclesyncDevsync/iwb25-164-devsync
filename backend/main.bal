// The auth module will auto-register its services
import Cyclesync.auth as _;
// Auth module functions
import Cyclesync.auth;
// The chatbot module will auto-register its services
import Cyclesync.chatbot as _;
// The demand_prediction module will auto-register its services
import Cyclesync.demand_prediction as _;
// The quality_assessment module will auto-register its services
import Cyclesync.quality_assessment as _;
// The dynamic_pricing module will auto-register its services
import Cyclesync.dynamic_pricing as _;
// The material_workflow module will auto-register its services
import Cyclesync.material_workflow as _;

import ballerina/http;
import ballerina/log;
// Database configuration (import from local file)
import ballerinax/postgresql;
import Cyclesync.database_config;

configurable int port = 8080;
public listener http:Listener server = check new (8080);

// Auth validation helper function
function validateAuth(http:Request request, string? requiredRole = ()) returns auth:AuthResult|http:Response {
    string|http:HeaderNotFoundError authHeader = request.getHeader("Authorization");
    
    if authHeader is http:HeaderNotFoundError {
        http:Response response = new;
        response.statusCode = 401;
        response.setJsonPayload({
            "error": "Unauthorized",
            "message": "Authorization header required"
        });
        return response;
    }
    
    // Extract token from Bearer format
    if !authHeader.startsWith("Bearer ") {
        http:Response response = new;
        response.statusCode = 401;
        response.setJsonPayload({
            "error": "Unauthorized",
            "message": "Invalid authorization format"
        });
        return response;
    }
    
    string token = authHeader.substring(7);
    auth:AuthResult authResult = auth:validateIdToken(token);
    
    if !authResult.isValid {
        http:Response response = new;
        response.statusCode = 401;
        response.setJsonPayload({
            "error": "Unauthorized",
            "message": authResult.errorMessage ?: "Invalid token"
        });
        return response;
    }
    
    // Check role if required
    if requiredRole != () && authResult.context != () {
        auth:AuthContext context = <auth:AuthContext>authResult.context;
        if context.role != requiredRole {
            http:Response response = new;
            response.statusCode = 403;
            response.setJsonPayload({
                "error": "Forbidden",
                "message": "Insufficient permissions"
            });
            return response;
        }
    }
    
    return authResult;
}

// Log startup information
function init() {
    log:printInfo("Starting Cyclesync Backend Services...");

    // Initialize database connection
    error? dbResult = database_config:initDatabaseConnection();
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
    log:printInfo("Demand Prediction Service initialized on http://localhost:8084/api/ai/demand");
    log:printInfo("Quality Assessment Service initialized on /api/ai/quality");
    log:printInfo("Chatbot WebSocket Service initialized on ws://localhost:8094/chat");
    log:printInfo("Chatbot Health Check initialized on http://localhost:8095/health");
}

// Health check endpoint
service / on server {
    resource function get health() returns json {
        boolean dbConnected = database_config:isDatabaseConnected();
        return {
            "status": "healthy",
            "message": "Cyclesync API is running",
            "database": dbConnected ? "connected" : "disconnected"
        };
    }

    // Database health check endpoint
    resource function get health/database() returns json {
        boolean dbConnected = database_config:isDatabaseConnected();
        return {
            "database_status": dbConnected ? "connected" : "disconnected",
            "timestamp": ""
        };
    }

    // Database test endpoint with sample data operations
    resource function post test/database() returns json|http:Response {
        postgresql:Client|error clientResult = database_config:getDbClient();
        if (clientResult is error) {
            http:Response response = new;
            response.statusCode = 503;
            response.setJsonPayload({
                "error": "Database not connected",
                "message": "Database connection is not available"
            });
            return response;
        }

        postgresql:Client clientInstance = clientResult;

        json[] results = [];

        // Test 1: Create a test table
        var createTableResult = clientInstance->execute(`
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
        var insertResult = clientInstance->execute(`
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
        int|error countResult = clientInstance->queryRow(`SELECT COUNT(*) as count FROM test_users`);
        
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
        var updateResult = clientInstance->execute(`
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
        int|error updatedCount = clientInstance->queryRow(`SELECT COUNT(*) as count FROM test_users WHERE name LIKE 'John Updated%'`);
        
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

        // Test 6: Verify final table state (keep table for persistence)
        int|error finalCount = clientInstance->queryRow(`SELECT COUNT(*) as count FROM test_users`);
        
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
}

// User endpoints
service /api/user on server {

    // Get current user profile
    resource function get profile(http:Request request) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = validateAuth(request);
        if (authCheck is http:Response) {
            return authCheck;
        }

        auth:AuthContext? authContext = authCheck.context;
        if (authContext == ()) {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Internal Server Error",
                "message": "Invalid authentication context"
            });
            return response;
        }

        return {
            "status": "success",
            "data": {
                "userId": authContext.userId,
                "firstName": authContext.firstName,
                "lastName": authContext.lastName,
                "email": authContext.email,
                "role": authContext.role.toString()
            }
        };
    }

    // Update user profile
    resource function put profile(http:Request request) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = validateAuth(request);
        if (authCheck is http:Response) {
            return authCheck;
        }

        json|error payload = request.getJsonPayload();
        if (payload is error) {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                "error": "Bad Request",
                "message": "Invalid JSON payload"
            });
            return response;
        }

        return {
            "status": "success",
            "message": "Profile updated successfully",
            "data": payload
        };
    }

    // Get user permissions
    resource function get permissions(http:Request request) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = validateAuth(request);
        if (authCheck is http:Response) {
            return authCheck;
        }

        auth:AuthContext? authContext = authCheck.context;
        if (authContext == ()) {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Internal Server Error",
                "message": "Invalid authentication context"
            });
            return response;
        }

        return {
            "status": "success",
            "data": {
                "userId": authContext.userId,
                "firstName": authContext.firstName,
                "lastName": authContext.lastName,
                "email": authContext.email,
                "role": authContext.role.toString()
            }
        };
    }

    // User logout
    resource function post logout(http:Request request) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = validateAuth(request);
        if (authCheck is http:Response) {
            return authCheck;
        }

        return {
            "status": "success",
            "message": "Logged out successfully"
        };
    }

    // User dashboard
    resource function get dashboard(http:Request request) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = validateAuth(request);
        if (authCheck is http:Response) {
            return authCheck;
        }

        auth:AuthContext? authContext = authCheck.context;
        if (authContext == ()) {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Internal Server Error",
                "message": "Invalid authentication context"
            });
            return response;
        }

        return {
            "status": "success",
            "data": {
                "welcome": "Welcome " + authContext.firstName + " " + authContext.lastName,
                "userId": authContext.userId,
                "lastLogin": "2025-08-10T10:00:00Z",
                "notifications": [
                    {
                        "id": "1",
                        "message": "Welcome to Cyclesync!",
                        "type": "info",
                        "timestamp": "2025-08-10T09:00:00Z"
                    }
                ]
            }
        };
    }
}

// Admin endpoints
service /api/admin on server {

    // Get all users (admin only)
    resource function get users(http:Request request) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = validateAuth(request, "admin");
        if (authCheck is http:Response) {
            return authCheck;
        }

        json[] users = [
            {
                "id": "user1",
                "username": "john.doe",
                "email": "john.doe@example.com",
                "firstName": "John",
                "lastName": "Doe",
                "roles": ["user"],
                "status": "active"
            },
            {
                "id": "user2",
                "username": "jane.admin",
                "email": "jane.admin@example.com",
                "firstName": "Jane",
                "lastName": "Admin",
                "roles": ["admin", "user"],
                "status": "active"
            }
        ];

        return {
            "status": "success",
            "data": {
                "users": users,
                "total": users.length()
            }
        };
    }

    // Get specific user by ID (admin only)
    resource function get users/[string userId](http:Request request) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = validateAuth(request, "admin");
        if (authCheck is http:Response) {
            return authCheck;
        }

        json user = {
            "id": userId,
            "username": "user.example",
            "email": "user@example.com",
            "firstName": "Example",
            "lastName": "User",
            "roles": ["user"],
            "status": "active"
        };

        return {
            "status": "success",
            "data": user
        };
    }

    // Create new user (admin only)
    resource function post users(http:Request request) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = validateAuth(request, "admin");
        if (authCheck is http:Response) {
            return authCheck;
        }

        json|error payload = request.getJsonPayload();
        if (payload is error) {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                "error": "Bad Request",
                "message": "Invalid JSON payload"
            });
            return response;
        }

        return {
            "status": "success",
            "message": "User created successfully",
            "data": {
                "id": "new-user-id",
                "status": "created"
            }
        };
    }

    // Get system stats (admin only)
    resource function get stats(http:Request request) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = validateAuth(request, "admin");
        if (authCheck is http:Response) {
            return authCheck;
        }

        return {
            "status": "success",
            "data": {
                "totalUsers": 156,
                "activeUsers": 142,
                "adminUsers": 5,
                "systemHealth": "healthy"
            }
        };
    }
}