import ballerina/http;
import hp/Cyclesync.auth;

// Admin Controller - handles admin-only endpoints
public isolated service class AdminController {

    public function init() returns error? {
        // Controller initialization
    }

    // Get all users (admin only)
    public function getAllUsers(http:Request request) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = auth:validateAuth(request, "admin");
        if (authCheck is http:Response) {
            return authCheck;
        }

        // Here you would typically fetch users from your database
        // For demo purposes, we'll return mock data
        json[] users = [
            {
                "id": "user1",
                "username": "john.doe",
                "email": "john.doe@example.com",
                "firstName": "John",
                "lastName": "Doe",
                "roles": ["user"],
                "status": "active",
                "lastLogin": "2025-08-10T09:30:00Z"
            },
            {
                "id": "user2",
                "username": "jane.admin",
                "email": "jane.admin@example.com", 
                "firstName": "Jane",
                "lastName": "Admin",
                "roles": ["admin", "user"],
                "status": "active",
                "lastLogin": "2025-08-10T08:15:00Z"
            }
        ];

        return {
            "status": "success",
            "data": {
                "users": users,
                "total": users.length(),
                "page": 1,
                "pageSize": 10
            }
        };
    }

    // Get specific user by ID (admin only)
    public function getUserById(http:Request request, string userId) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = auth:validateAuth(request, "admin");
        if (authCheck is http:Response) {
            return authCheck;
        }

        // Here you would typically fetch the user from your database
        // For demo purposes, we'll return mock data
        json user = {
            "id": userId,
            "username": "user.example",
            "email": "user@example.com",
            "firstName": "Example",
            "lastName": "User",
            "roles": ["user"],
            "status": "active",
            "createdAt": "2025-08-01T00:00:00Z",
            "lastLogin": "2025-08-10T09:30:00Z",
            "loginCount": 42
        };

        return {
            "status": "success",
            "data": user
        };
    }

    // Create new user (admin only)
    public function createUser(http:Request request) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = auth:validateAuth(request, "admin");
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

        // Here you would typically create the user in your database
        // For demo purposes, we'll just return the created user data
        string username = "unknown";
        string email = "unknown";
        
        json|error usernameResult = payload.username;
        if (usernameResult is string) {
            username = usernameResult;
        }
        
        json|error emailResult = payload.email;
        if (emailResult is string) {
            email = emailResult;
        }
        
        json newUser = {
            "id": "new-user-id",
            "username": username,
            "email": email,
            "roles": ["user"],
            "status": "active"
        };
        
        return {
            "status": "success",
            "message": "User created successfully",
            "data": newUser
        };
    }

    // Update user (admin only)
    public function updateUser(http:Request request, string userId) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = auth:validateAuth(request, "admin");
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

        // Here you would typically update the user in your database
        return {
            "status": "success",
            "message": "User updated successfully",
            "data": {
                "id": userId,
                "updatedFields": payload
            }
        };
    }

    // Delete user (admin only)
    public function deleteUser(http:Request request, string userId) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = auth:validateAuth(request, "admin");
        if (authCheck is http:Response) {
            return authCheck;
        }

        // Here you would typically soft delete the user in your database
        return {
            "status": "success",
            "message": "User deleted successfully",
            "data": {
                "id": userId,
                "deletedAt": "2025-08-10T10:00:00Z"
            }
        };
    }

    // Get system statistics (admin only)
    public function getSystemStats(http:Request request) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = auth:validateAuth(request, "admin");
        if (authCheck is http:Response) {
            return authCheck;
        }

        // Here you would typically fetch real statistics from your database
        return {
            "status": "success",
            "data": {
                "totalUsers": 156,
                "activeUsers": 142,
                "inactiveUsers": 14,
                "adminUsers": 5,
                "totalLogins": 1432,
                "loginsToday": 23,
                "systemHealth": "healthy",
                "uptime": "15 days, 3 hours, 45 minutes"
            }
        };
    }

    // Get audit logs (admin only)
    public function getAuditLogs(http:Request request) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = auth:validateAuth(request, "admin");
        if (authCheck is http:Response) {
            return authCheck;
        }

        // Here you would typically fetch audit logs from your database
        json[] auditLogs = [
            {
                "id": "audit1",
                "action": "USER_LOGIN",
                "userId": "user1",
                "username": "john.doe",
                "timestamp": "2025-08-10T09:30:00Z",
                "ipAddress": "192.168.1.100",
                "userAgent": "Mozilla/5.0...",
                "success": true
            },
            {
                "id": "audit2", 
                "action": "USER_CREATED",
                "userId": "admin1",
                "username": "jane.admin",
                "timestamp": "2025-08-10T08:15:00Z",
                "details": {
                    "targetUserId": "user2",
                    "targetUsername": "new.user"
                },
                "success": true
            }
        ];

        return {
            "status": "success",
            "data": {
                "logs": auditLogs,
                "total": auditLogs.length(),
                "page": 1,
                "pageSize": 10
            }
        };
    }

    // Update user roles (admin only)
    public function updateUserRoles(http:Request request, string userId) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = auth:validateAuth(request, "admin");
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

        // Here you would typically update the user's roles in your database
        json roles = [];
        json|error rolesResult = payload.roles;
        if (rolesResult is json) {
            roles = rolesResult;
        }
        
        json rolesData = {
            "userId": userId,
            "newRoles": roles
        };
        
        return {
            "status": "success",
            "message": "User roles updated successfully",
            "data": rolesData
        };
    }
}
