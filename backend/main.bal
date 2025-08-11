import ballerina/http;
import ballerina/log;
// The demand_prediction module will auto-register its services
import Cyclesync.demand_prediction as _;
// The quality_assessment module will auto-register its services
import Cyclesync.quality_assessment as _;

configurable int port = 8080;
listener http:Listener server = new(port);

// Initialize auth middleware
final AuthMiddleware authMiddleware = new AuthMiddleware();

// Log startup information
function init() {
    log:printInfo("Starting Cyclesync Backend Services...");
    log:printInfo(string `Main API Server starting on port ${port}`);
    log:printInfo("Demand Prediction Service initialized on /api/ai/demand");
    log:printInfo("Quality Assessment Service initialized on /api/ai/quality");
}

// Health check endpoint
service / on server {
    resource function get health() returns json {
        return { "status": "healthy", "message": "Cyclesync API is running" };
    }
}

// User endpoints
service /api/user on server {

    // Get current user profile
    resource function get profile(http:Request request) returns json|http:Response {
        AuthResult|http:Response authCheck = validateAuth(request);
        if (authCheck is http:Response) {
            return authCheck;
        }

        AuthContext? authContext = authCheck.context;
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
                "username": authContext.username,
                "email": authContext.email,
                "roles": authContext.roles
            }
        };
    }

    // Update user profile
    resource function put profile(http:Request request) returns json|http:Response {
        AuthResult|http:Response authCheck = validateAuth(request);
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
        AuthResult|http:Response authCheck = validateAuth(request);
        if (authCheck is http:Response) {
            return authCheck;
        }

        AuthContext? authContext = authCheck.context;
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
                "username": authContext.username,
                "roles": authContext.roles,
                "groups": authContext.groups
            }
        };
    }

    // User logout
    resource function post logout(http:Request request) returns json|http:Response {
        AuthResult|http:Response authCheck = validateAuth(request);
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
        AuthResult|http:Response authCheck = validateAuth(request);
        if (authCheck is http:Response) {
            return authCheck;
        }

        AuthContext? authContext = authCheck.context;
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
                "welcome": "Welcome " + authContext.username,
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
        AuthResult|http:Response authCheck = validateAuth(request, "admin");
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
        AuthResult|http:Response authCheck = validateAuth(request, "admin");
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
        AuthResult|http:Response authCheck = validateAuth(request, "admin");
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
        AuthResult|http:Response authCheck = validateAuth(request, "admin");
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

