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
// The auction module will auto-register its services
import Cyclesync.auction as _;

// The wallet module will auto-register its services
import Cyclesync.wallet as _;

// The agent_assignment module will auto-register its services
import Cyclesync.agent_assignment as _;
// The notifications module will auto-register its services
import Cyclesync.notifications as _;


import ballerina/http;
import ballerina/log;
import ballerina/sql;
// Database configuration (import from local file)
import ballerinax/postgresql;
import Cyclesync.database_config;

configurable int port = 8080;

listener http:Listener httpListener = new (port);

public listener http:Listener server = httpListener;

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

    // Test token endpoint for development
    resource function post test/token() returns json {
        // Generate a test JWT token for development
        // WARNING: This is for development only - remove in production!
        return {
            "status": "success",
            "token": "test-token-for-development",
            "message": "This is a test token for development only",
            "user": {
                "id": "test-admin-id",
                "email": "admin@cyclesync.com",
                "role": "admin",
                "firstName": "Test",
                "lastName": "Admin"
            }
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

// Test endpoints for development
@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000", "http://localhost:3001"],
        allowCredentials: true,
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        maxAge: 84600
    }
}
service /api/test on server {
    // Get material submissions without auth (DEVELOPMENT ONLY)
    resource function get material\-submissions(string? delivery_method = (), string? status = ()) returns json|http:Response {
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

        // Get real data from database
        postgresql:Client clientInstance = clientResult;
        
        sql:ParameterizedQuery query = `
            SELECT 
                ms.*,
                COALESCE(u.first_name || ' ' || u.last_name, 'Unknown Supplier') as supplier_name,
                u.email as supplier_email,
                u.asgardeo_id as user_asgardeo_id
            FROM material_submissions ms
            LEFT JOIN users u ON ms.supplier_id = u.asgardeo_id
            ORDER BY ms.created_at DESC
        `;
        stream<record {}, sql:Error?> resultStream = clientInstance->query(query);
        
        json[] submissions = [];
        error? conversionResult = from var row in resultStream
            do {
                submissions.push(row.toJson());
            };
        
        if (conversionResult is error) {
            return {
                "status": "error",
                "message": "Failed to fetch submissions",
                "error": conversionResult.message()
            };
        }

        // Debug log to help troubleshoot
        if (submissions.length() > 0) {
            json firstSubmission = submissions[0];
            json|error supplierId = firstSubmission.supplier_id;
            json|error supplierName = firstSubmission.supplier_name;
            
            if (supplierId is json) {
                log:printInfo("First submission supplier_id: " + supplierId.toString());
            }
            if (supplierName is json) {
                log:printInfo("First submission supplier_name: " + supplierName.toString());
            }
        }

        return {
            "status": "success",
            "count": submissions.length(),
            "data": submissions
        };
    }

    // Test endpoint to get all users from database
    resource function get users() returns json|http:Response {
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
        
        sql:ParameterizedQuery query = `SELECT * FROM users ORDER BY created_at DESC`;
        stream<record {}, sql:Error?> resultStream = clientInstance->query(query);
        
        json[] users = [];
        error? conversionResult = from var row in resultStream
            do {
                users.push(row.toJson());
            };
        
        if (conversionResult is error) {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Query failed",
                "message": conversionResult.message()
            });
            return response;
        }
        
        return {
            "status": "success",
            "count": users.length(),
            "data": users
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

    // Material verification endpoints

    // Get all material submissions
    resource function get material\-submissions(http:Request request, 
        string? delivery_method = (), string? status = ()) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = validateAuth(request, "admin");
        if (authCheck is http:Response) {
            return authCheck;
        }

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

        // Build parameterized query based on filters
        sql:ParameterizedQuery sqlQuery;
        
        if (delivery_method != () && status != ()) {
            sqlQuery = `
                SELECT 
                    ms.id,
                    ms.transaction_id,
                    ms.workflow_id,
                    ms.supplier_id,
                    ms.title,
                    ms.description,
                    ms.category,
                    ms.sub_category,
                    ms.quantity,
                    ms.unit,
                    ms.condition,
                    ms.expected_price,
                    ms.minimum_price,
                    ms.negotiable,
                    ms.delivery_method,
                    ms.location_address,
                    ms.location_city,
                    ms.location_district,
                    ms.location_province,
                    ms.location_postal_code,
                    ms.location_latitude,
                    ms.location_longitude,
                    ms.selected_warehouse_name,
                    ms.selected_warehouse_address,
                    ms.selected_warehouse_phone,
                    ms.material_type,
                    ms.material_color,
                    ms.material_brand,
                    ms.material_model,
                    ms.manufacturing_year,
                    ms.dimension_length,
                    ms.dimension_width,
                    ms.dimension_height,
                    ms.dimension_weight,
                    ms.tags,
                    ms.photos,
                    ms.submission_status,
                    ms.created_at,
                    ms.updated_at,
                    u.name as supplier_name,
                    u.email as supplier_email,
                    aa.agent_id,
                    agent.name as agent_name
                FROM material_submissions ms
                LEFT JOIN users u ON ms.supplier_id = u.id
                LEFT JOIN agent_assignments aa ON ms.workflow_id = aa.workflow_id
                LEFT JOIN users agent ON aa.agent_id = agent.id
                WHERE ms.delivery_method = ${delivery_method} AND ms.submission_status = ${status}
                ORDER BY ms.created_at DESC LIMIT 100
            `;
        } else if (delivery_method != ()) {
            sqlQuery = `
                SELECT 
                    ms.id,
                    ms.transaction_id,
                    ms.workflow_id,
                    ms.supplier_id,
                    ms.title,
                    ms.description,
                    ms.category,
                    ms.sub_category,
                    ms.quantity,
                    ms.unit,
                    ms.condition,
                    ms.expected_price,
                    ms.minimum_price,
                    ms.negotiable,
                    ms.delivery_method,
                    ms.location_address,
                    ms.location_city,
                    ms.location_district,
                    ms.location_province,
                    ms.location_postal_code,
                    ms.location_latitude,
                    ms.location_longitude,
                    ms.selected_warehouse_name,
                    ms.selected_warehouse_address,
                    ms.selected_warehouse_phone,
                    ms.material_type,
                    ms.material_color,
                    ms.material_brand,
                    ms.material_model,
                    ms.manufacturing_year,
                    ms.dimension_length,
                    ms.dimension_width,
                    ms.dimension_height,
                    ms.dimension_weight,
                    ms.tags,
                    ms.photos,
                    ms.submission_status,
                    ms.created_at,
                    ms.updated_at,
                    u.name as supplier_name,
                    u.email as supplier_email,
                    aa.agent_id,
                    agent.name as agent_name
                FROM material_submissions ms
                LEFT JOIN users u ON ms.supplier_id = u.id
                LEFT JOIN agent_assignments aa ON ms.workflow_id = aa.workflow_id
                LEFT JOIN users agent ON aa.agent_id = agent.id
                WHERE ms.delivery_method = ${delivery_method}
                ORDER BY ms.created_at DESC LIMIT 100
            `;
        } else if (status != ()) {
            sqlQuery = `
                SELECT 
                    ms.id,
                    ms.transaction_id,
                    ms.workflow_id,
                    ms.supplier_id,
                    ms.title,
                    ms.description,
                    ms.category,
                    ms.sub_category,
                    ms.quantity,
                    ms.unit,
                    ms.condition,
                    ms.expected_price,
                    ms.minimum_price,
                    ms.negotiable,
                    ms.delivery_method,
                    ms.location_address,
                    ms.location_city,
                    ms.location_district,
                    ms.location_province,
                    ms.location_postal_code,
                    ms.location_latitude,
                    ms.location_longitude,
                    ms.selected_warehouse_name,
                    ms.selected_warehouse_address,
                    ms.selected_warehouse_phone,
                    ms.material_type,
                    ms.material_color,
                    ms.material_brand,
                    ms.material_model,
                    ms.manufacturing_year,
                    ms.dimension_length,
                    ms.dimension_width,
                    ms.dimension_height,
                    ms.dimension_weight,
                    ms.tags,
                    ms.photos,
                    ms.submission_status,
                    ms.created_at,
                    ms.updated_at,
                    u.name as supplier_name,
                    u.email as supplier_email,
                    aa.agent_id,
                    agent.name as agent_name
                FROM material_submissions ms
                LEFT JOIN users u ON ms.supplier_id = u.id
                LEFT JOIN agent_assignments aa ON ms.workflow_id = aa.workflow_id
                LEFT JOIN users agent ON aa.agent_id = agent.id
                WHERE ms.submission_status = ${status}
                ORDER BY ms.created_at DESC LIMIT 100
            `;
        } else {
            sqlQuery = `
                SELECT 
                    ms.id,
                    ms.transaction_id,
                    ms.workflow_id,
                    ms.supplier_id,
                    ms.title,
                    ms.description,
                    ms.category,
                    ms.sub_category,
                    ms.quantity,
                    ms.unit,
                    ms.condition,
                    ms.expected_price,
                    ms.minimum_price,
                    ms.negotiable,
                    ms.delivery_method,
                    ms.location_address,
                    ms.location_city,
                    ms.location_district,
                    ms.location_province,
                    ms.location_postal_code,
                    ms.location_latitude,
                    ms.location_longitude,
                    ms.selected_warehouse_name,
                    ms.selected_warehouse_address,
                    ms.selected_warehouse_phone,
                    ms.material_type,
                    ms.material_color,
                    ms.material_brand,
                    ms.material_model,
                    ms.manufacturing_year,
                    ms.dimension_length,
                    ms.dimension_width,
                    ms.dimension_height,
                    ms.dimension_weight,
                    ms.tags,
                    ms.photos,
                    ms.submission_status,
                    ms.created_at,
                    ms.updated_at,
                    u.name as supplier_name,
                    u.email as supplier_email,
                    aa.agent_id,
                    agent.name as agent_name
                FROM material_submissions ms
                LEFT JOIN users u ON ms.supplier_id = u.id
                LEFT JOIN agent_assignments aa ON ms.workflow_id = aa.workflow_id
                LEFT JOIN users agent ON aa.agent_id = agent.id
                ORDER BY ms.created_at DESC LIMIT 100
            `;
        }
        
        stream<record {}, sql:Error?> queryResult = clientInstance->query(sqlQuery);

        json[] submissions = [];
        error? conversionResult = from var row in queryResult
            do {
                map<json> submission = {
                    "id": <json>row["id"],
                    "transaction_id": <json>row["transaction_id"],
                    "workflow_id": <json>row["workflow_id"],
                    "supplier_id": <json>row["supplier_id"],
                    "supplier_name": <json>(row["supplier_name"] ?: "Unknown Supplier"),
                    "title": <json>row["title"],
                    "description": <json>(row["description"] ?: ""),
                    "category": <json>row["category"],
                    "sub_category": <json>(row["sub_category"] ?: ""),
                    "quantity": <json>row["quantity"],
                    "unit": <json>row["unit"],
                    "condition": <json>row["condition"],
                    "expected_price": <json>(row["expected_price"] ?: 0),
                    "minimum_price": <json>(row["minimum_price"] ?: 0),
                    "negotiable": <json>row["negotiable"],
                    "delivery_method": <json>row["delivery_method"],
                    "submission_status": <json>row["submission_status"],
                    "created_at": <json>row["created_at"],
                    "updated_at": <json>(row["updated_at"] ?: ""),
                    "material_specifications": {
                        "material_type": <json>(row["material_type"] ?: ""),
                        "color": <json>row["material_color"],
                        "brand": <json>row["material_brand"],
                        "model": <json>row["material_model"],
                        "manufacturing_year": <json>row["manufacturing_year"]
                    },
                    "tags": <json>(row["tags"] ?: []),
                    "photos": <json>(row["photos"] ?: [])
                };

                // Add location details if it's an agent visit
                if (row["delivery_method"] == "agent_visit") {
                    json locationData = {
                        "address": <json>(row["location_address"] ?: ""),
                        "city": <json>(row["location_city"] ?: ""),
                        "district": <json>(row["location_district"] ?: ""),
                        "province": <json>(row["location_province"] ?: ""),
                        "postal_code": <json>(row["location_postal_code"] ?: ""),
                        "latitude": <json>row["location_latitude"],
                        "longitude": <json>row["location_longitude"]
                    };
                    submission["location"] = locationData;
                }

                // Add warehouse details if it's a drop-off
                if (row["delivery_method"] == "drop_off") {
                    json warehouseData = {
                        "name": <json>(row["selected_warehouse_name"] ?: ""),
                        "address": <json>(row["selected_warehouse_address"] ?: ""),
                        "phone": <json>(row["selected_warehouse_phone"] ?: "")
                    };
                    submission["warehouse"] = warehouseData;
                }

                // Add assigned agent details if available
                if (row["agent_id"] != ()) {
                    json agentData = {
                        "id": <json>row["agent_id"],
                        "name": <json>(row["agent_name"] ?: "Unknown Agent")
                    };
                    submission["assigned_agent"] = agentData;
                }

                submissions.push(submission);
            };

        if (conversionResult is error) {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Data conversion failed",
                "message": conversionResult.message()
            });
            return response;
        }

        return {
            "status": "success",
            "data": submissions
        };
    }

    // Get material verification statistics
    resource function get material\-submissions/stats(http:Request request) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = validateAuth(request, "admin");
        if (authCheck is http:Response) {
            return authCheck;
        }

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

        // Get total submissions count
        sql:ParameterizedQuery totalQuery = `SELECT COUNT(*) as total FROM material_submissions`;
        record {int total;}|sql:Error totalResult = clientInstance->queryRow(totalQuery);
        int totalSubmissions = 0;
        if (totalResult is record {int total;}) {
            totalSubmissions = totalResult.total;
        }

        // Get agent visits count
        sql:ParameterizedQuery agentVisitsQuery = `SELECT COUNT(*) as count FROM material_submissions WHERE delivery_method = 'agent_visit'`;
        record {int count;}|sql:Error agentVisitsResult = clientInstance->queryRow(agentVisitsQuery);
        int agentVisits = 0;
        if (agentVisitsResult is record {int count;}) {
            agentVisits = agentVisitsResult.count;
        }

        // Get drop-offs count
        sql:ParameterizedQuery dropOffsQuery = `SELECT COUNT(*) as count FROM material_submissions WHERE delivery_method = 'drop_off'`;
        record {int count;}|sql:Error dropOffsResult = clientInstance->queryRow(dropOffsQuery);
        int dropOffs = 0;
        if (dropOffsResult is record {int count;}) {
            dropOffs = dropOffsResult.count;
        }

        // Get pending verifications count
        sql:ParameterizedQuery pendingQuery = `SELECT COUNT(*) as count FROM material_submissions WHERE submission_status = 'pending_verification' OR submission_status = 'submitted'`;
        record {int count;}|sql:Error pendingResult = clientInstance->queryRow(pendingQuery);
        int pendingVerifications = 0;
        if (pendingResult is record {int count;}) {
            pendingVerifications = pendingResult.count;
        }

        return {
            "status": "success",
            "data": {
                "totalSubmissions": totalSubmissions,
                "agentVisits": agentVisits,
                "dropOffs": dropOffs,
                "pendingVerifications": pendingVerifications
            }
        };
    }

    // Get warehouse statistics
    resource function get warehouses/stats(http:Request request) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = validateAuth(request, "admin");
        if (authCheck is http:Response) {
            return authCheck;
        }

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

        // Get warehouse statistics from actual data
        sql:ParameterizedQuery warehouseQuery = `SELECT 
            selected_warehouse_name as name,
            selected_warehouse_address as address,
            COUNT(*) as drop_off_count
        FROM material_submissions
        WHERE delivery_method = 'drop_off' 
            AND selected_warehouse_name IS NOT NULL
            AND selected_warehouse_name != ''
        GROUP BY selected_warehouse_name, selected_warehouse_address
        ORDER BY drop_off_count DESC`;
        
        stream<record {}, sql:Error?> warehouseResult = clientInstance->query(warehouseQuery);

        json[] warehouseStats = [];
        
        error? conversionResult = from var row in warehouseResult
            do {
                string warehouseName = <string>row["name"];
                string warehouseAddress = <string>row["address"];
                int dropOffCount = <int>row["drop_off_count"];
                
                // Generate coordinates based on warehouse name (for demo purposes)
                decimal latitude = 6.9271;
                decimal longitude = 79.8612;
                
                if (warehouseName.includes("Kandy") || warehouseName.includes("Eastern")) {
                    latitude = 7.2906;
                    longitude = 80.6337;
                } else if (warehouseName.includes("Galle") || warehouseName.includes("Southern")) {
                    latitude = 6.0535;
                    longitude = 80.2210;
                }
                
                json warehouseStat = {
                    "id": "wh-" + warehouseStats.length().toString(),
                    "name": warehouseName,
                    "address": warehouseAddress,
                    "latitude": latitude,
                    "longitude": longitude,
                    "dropOffRequests": dropOffCount
                };
                
                warehouseStats.push(warehouseStat);
            };

        // If no warehouses found in database, return default ones
        if (warehouseStats.length() == 0) {
            warehouseStats = [
                {
                    "id": "wh-1",
                    "name": "Central Warehouse",
                    "address": "Colombo District Center",
                    "latitude": 6.9271,
                    "longitude": 79.8612,
                    "dropOffRequests": 0
                },
                {
                    "id": "wh-2", 
                    "name": "Eastern Warehouse",
                    "address": "Kandy Distribution Center",
                    "latitude": 7.2906,
                    "longitude": 80.6337,
                    "dropOffRequests": 0
                },
                {
                    "id": "wh-3",
                    "name": "Southern Warehouse", 
                    "address": "Galle Collection Point",
                    "latitude": 6.0535,
                    "longitude": 80.2210,
                    "dropOffRequests": 0
                }
            ];
        } else {
                warehouseStats = [
                    {
                        "id": "wh-1",
                        "name": "Central Warehouse",
                        "address": "Colombo District Center",
                        "latitude": 6.9271,
                        "longitude": 79.8612,
                        "dropOffRequests": 0
                    },
                    {
                        "id": "wh-2", 
                        "name": "Eastern Warehouse",
                        "address": "Kandy Distribution Center",
                        "latitude": 7.2906,
                        "longitude": 80.6337,
                        "dropOffRequests": 0
                    },
                    {
                        "id": "wh-3",
                        "name": "Southern Warehouse", 
                        "address": "Galle Collection Point",
                        "latitude": 6.0535,
                        "longitude": 80.2210,
                        "dropOffRequests": 0
                    }
                ];
            }

        return {
            "status": "success",
            "data": warehouseStats
        };
    }

    // Assign agent to submission
    resource function post material\-submissions/[string submissionId]/assign\-agent(
        http:Request request) returns json|http:Response {
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

        json agentId = "auto-assigned-agent";
        if (payload is map<json>) {
            agentId = payload["agentId"] ?: "auto-assigned-agent";
        }
        
        return {
            "status": "success",
            "message": "Agent assigned successfully",
            "data": {
                "submissionId": submissionId,
                "agentId": agentId
            }
        };
    }

    // Verify material submission
    resource function post material\-submissions/[string submissionId]/verify(
        http:Request request) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = validateAuth(request, "admin");
        if (authCheck is http:Response) {
            return authCheck;
        }

        return {
            "status": "success",
            "message": "Material submission verified successfully",
            "data": {
                "submissionId": submissionId,
                "status": "verified"
            }
        };
    }

    // Test endpoint to get all material submissions from database
    resource function get test/material\-submissions() returns json|http:Response {
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
        
        sql:ParameterizedQuery query = `
            SELECT 
                ms.*,
                u.first_name || ' ' || u.last_name as supplier_name,
                u.email as supplier_email,
                u.role as supplier_role,
                u.status as supplier_status,
                u.asgardeo_id as user_asgardeo_id
            FROM material_submissions ms
            LEFT JOIN users u ON ms.supplier_id = u.asgardeo_id
            ORDER BY ms.created_at DESC
        `;
        stream<record {}, sql:Error?> resultStream = clientInstance->query(query);
        
        json[] submissions = [];
        error? conversionResult = from var row in resultStream
            do {
                submissions.push(row.toJson());
            };
        
        if (conversionResult is error) {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Query failed",
                "message": conversionResult.message()
            });
            return response;
        }
        
        // Debug log to check the data
        if (submissions.length() > 0) {
            log:printInfo("First submission data: " + submissions[0].toString());
            
            // Check if user exists
            json firstSubmission = submissions[0];
            json|error supplierIdJson = firstSubmission.supplier_id;
            if (supplierIdJson is json) {
                string supplierId = supplierIdJson.toString();
                sql:ParameterizedQuery userCheckQuery = `SELECT asgardeo_id, first_name, last_name FROM users WHERE asgardeo_id = ${supplierId}`;
                record {}|error userResult = clientInstance->queryRow(userCheckQuery);
                if (userResult is record {}) {
                    log:printInfo("User found for supplier_id " + supplierId + ": " + userResult.toString());
                } else {
                    log:printInfo("No user found for supplier_id: " + supplierId);
                }
            }
        }
        
        return {
            "status": "success",
            "count": submissions.length(),
            "data": submissions
        };
    }
}

// Agent endpoints  
service /api/agent on server {
    # Get agent assignments with material submission details
    # + agentId - The agent ID
    # + return - Agent assignments with full material details
    resource function get [string agentId]/assignments(http:Request request) returns json|http:Response {
        // Validate auth
        auth:AuthResult|http:Response authCheck = validateAuth(request);
        if (authCheck is http:Response) {
            return authCheck;
        }

        auth:AuthContext? authContext = authCheck.context;
        if (authContext == ()) {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Internal server error", 
                "message": "Auth context is missing"
            });
            return response;
        }

        postgresql:Client|error clientResult = database_config:getDbClient();
        if (clientResult is error) {
            http:Response response = new;
            response.statusCode = 503;
            response.setJsonPayload({
                "error": "Database connection failed",
                "message": clientResult.message()
            });
            return response;
        }

        postgresql:Client clientInstance = clientResult;

        // Query to get material submissions assigned to this agent
        sql:ParameterizedQuery query = `
            SELECT 
                ms.id::text as assignment_id,
                ms.agent_id,
                ms.supplier_id,
                ms.id::text as material_id,
                ms.submission_status as assignment_status,
                ms.created_at as assigned_at,
                ms.created_at as started_at,
                ms.updated_at as completed_at,
                ms.additional_details as notes,
                ms.expected_price as estimated_cost,
                ms.id as submission_id,
                ms.transaction_id,
                ms.workflow_id,
                ms.title,
                ms.description,
                ms.category,
                ms.sub_category,
                ms.quantity,
                ms.unit,
                ms.condition,
                ms.expected_price,
                ms.minimum_price,
                ms.negotiable,
                ms.delivery_method,
                ms.location_address,
                ms.location_city,
                ms.location_district,
                ms.location_province,
                ms.location_postal_code,
                ms.location_latitude,
                ms.location_longitude,
                ms.selected_warehouse_name,
                ms.selected_warehouse_address,
                ms.selected_warehouse_phone,
                ms.material_type,
                ms.material_color,
                ms.material_brand,
                ms.material_model,
                ms.manufacturing_year,
                ms.dimension_length,
                ms.dimension_width,
                ms.dimension_height,
                ms.dimension_weight,
                ms.tags,
                ms.photos,
                ms.submission_status,
                ms.created_at,
                ms.updated_at,
                COALESCE(u.first_name || ' ' || u.last_name, 'Unknown Supplier') as supplier_name,
                u.email as supplier_email,
                'medium' as urgency
            FROM material_submissions ms
            LEFT JOIN users u ON ms.supplier_id = u.asgardeo_id
            WHERE ms.agent_id = ${agentId} 
            AND ms.agent_assigned = true
            AND ms.submission_status = 'assigned'
            ORDER BY ms.created_at DESC
        `;

        stream<record {}, sql:Error?> resultStream = clientInstance->query(query);
        
        json[] assignments = [];
        error? conversionResult = from var row in resultStream
            do {
                map<json> assignment = {
                    "assignment_id": <json>row["assignment_id"],
                    "material_id": <json>row["material_id"], 
                    "supplier_id": <json>row["supplier_id"],
                    "supplier_name": <json>row["supplier_name"],
                    "supplier_email": <json>row["supplier_email"],
                    "transaction_id": <json>row["transaction_id"],
                    "workflow_id": <json>row["workflow_id"],
                    "submission_id": <json>row["submission_id"],
                    "title": <json>row["title"],
                    "description": <json>row["description"],
                    "category": <json>row["category"],
                    "sub_category": <json>row["sub_category"],
                    "quantity": <json>row["quantity"],
                    "unit": <json>row["unit"],
                    "condition": <json>row["condition"],
                    "expected_price": <json>row["expected_price"],
                    "minimum_price": <json>row["minimum_price"],
                    "negotiable": <json>row["negotiable"],
                    "delivery_method": <json>row["delivery_method"],
                    "location_address": <json>row["location_address"],
                    "location_city": <json>row["location_city"],
                    "location_district": <json>row["location_district"],
                    "location_province": <json>row["location_province"],
                    "location_postal_code": <json>row["location_postal_code"],
                    "location_latitude": <json>row["location_latitude"],
                    "location_longitude": <json>row["location_longitude"],
                    "selected_warehouse_name": <json>row["selected_warehouse_name"],
                    "selected_warehouse_address": <json>row["selected_warehouse_address"],
                    "selected_warehouse_phone": <json>row["selected_warehouse_phone"],
                    "material_type": <json>row["material_type"],
                    "material_color": <json>row["material_color"],
                    "material_brand": <json>row["material_brand"],
                    "material_model": <json>row["material_model"],
                    "manufacturing_year": <json>row["manufacturing_year"],
                    "dimension_length": <json>row["dimension_length"],
                    "dimension_width": <json>row["dimension_width"],
                    "dimension_height": <json>row["dimension_height"],
                    "dimension_weight": <json>row["dimension_weight"],
                    "tags": <json>row["tags"],
                    "photos": <json>row["photos"],
                    "submission_status": <json>row["submission_status"],
                    "created_at": <json>row["created_at"],
                    "updated_at": <json>row["updated_at"],
                    "assigned_at": <json>row["assigned_at"],
                    "started_at": <json>row["started_at"],
                    "completed_at": <json>row["completed_at"],
                    "urgency": <json>row["urgency"],
                    "notes": <json>row["notes"],
                    "estimated_cost": <json>row["estimated_cost"],
                    "assignment_status": <json>row["assignment_status"],
                    "agent_id": <json>row["agent_id"],
                    "verification_date": <json>row["verification_date"]
                };
                assignments.push(assignment);
            };
        
        if (conversionResult is error) {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Query failed",
                "message": conversionResult.message()
            });
            return response;
        }
        
        return {
            "success": true,
            "assignments": assignments,
            "count": assignments.length()
        };
    }
}
