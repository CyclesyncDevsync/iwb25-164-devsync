import ballerina/http;

// Local auth types for the controller
public type AuthResult record {|
    boolean isValid;
    AuthContext? context;
    string? errorMessage;
|};

public type AuthContext record {|
    string userId;
    string username;
    string email;
    string[] roles;
    string[] groups?;
    string token;
    int exp;
|};

// Simple auth validation function
function validateUserAuth(http:Request request) returns AuthResult|http:Response {
    string|error authHeader = request.getHeader("Authorization");
    
    if (authHeader is error) {
        http:Response response = new;
        response.statusCode = 401;
        response.setJsonPayload({
            "error": "Unauthorized",
            "message": "Missing Authorization header"
        });
        return response;
    }

    if (!authHeader.startsWith("Bearer ")) {
        http:Response response = new;
        response.statusCode = 401;
        response.setJsonPayload({
            "error": "Unauthorized", 
            "message": "Invalid Authorization header format"
        });
        return response;
    }

    string token = authHeader.substring(7);
    
    // Simple token validation - in production, validate with proper JWT validation
    if (token.length() < 10) {
        http:Response response = new;
        response.statusCode = 401;
        response.setJsonPayload({
            "error": "Unauthorized",
            "message": "Invalid token"
        });
        return response;
    }

    // Create mock auth context - in production, decode JWT
    AuthContext authContext = {
        userId: "user-123",
        username: "demo_user",
        email: "user@example.com",
        roles: ["user"],
        groups: [],
        token: token,
        exp: 1723300000 // Mock expiry
    };

    return {
        isValid: true,
        context: authContext,
        errorMessage: ()
    };
}

// User Controller - handles user-related endpoints
public isolated service class UserController {

    public function init() returns error? {
        // Controller initialization
    }

    // Get current user profile
    public function getUserProfile(http:Request request) returns json|http:Response {
        AuthResult|http:Response authCheck = validateUserAuth(request);
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
                "roles": authContext.roles,
                "groups": authContext.groups ?: []
            }
        };
    }

    // Update user profile (basic fields)
    public function updateUserProfile(http:Request request) returns json|http:Response {
        AuthResult|http:Response authCheck = validateUserAuth(request);
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

        // Here you would typically update the user profile in your database
        // For demo purposes, we'll just return the updated data
        return {
            "status": "success",
            "message": "Profile updated successfully",
            "data": payload
        };
    }

    // Get user's roles and permissions
    public function getUserPermissions(http:Request request) returns json|http:Response {
        AuthResult|http:Response authCheck = validateUserAuth(request);
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
                "groups": authContext.groups ?: [],
                "permissions": [
                    "read:profile",
                    "update:profile", 
                    "read:dashboard"
                ]
            }
        };
    }

    // User logout (invalidate token)
    public function logoutUser(http:Request request) returns json|http:Response {
        AuthResult|http:Response authCheck = validateUserAuth(request);
        if (authCheck is http:Response) {
            return authCheck;
        }

        // Here you would typically invalidate the token in your cache/database
        // For this demo, we'll just return success
        return {
            "status": "success",
            "message": "Logged out successfully"
        };
    }

    // Get user dashboard data (user-specific)
    public function getUserDashboard(http:Request request) returns json|http:Response {
        AuthResult|http:Response authCheck = validateUserAuth(request);
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

        // Return user-specific dashboard data
        return {
            "status": "success",
            "data": {
                "welcome": "Welcome " + authContext.username,
                "userId": authContext.userId,
                "lastLogin": "2025-08-10T10:00:00Z", // This would come from your database
                "notifications": [
                    {
                        "id": "1",
                        "message": "Welcome to Cyclesync!",
                        "type": "info",
                        "timestamp": "2025-08-10T09:00:00Z",
                        "read": false
                    },
                    {
                        "id": "2",
                        "message": "Your profile was updated",
                        "type": "success", 
                        "timestamp": "2025-08-09T15:30:00Z",
                        "read": true
                    }
                ],
                "recentActivity": [
                    {
                        "id": "1",
                        "action": "Profile Update",
                        "timestamp": "2025-08-09T15:30:00Z",
                        "description": "Updated email address"
                    },
                    {
                        "id": "2", 
                        "action": "Login",
                        "timestamp": "2025-08-10T10:00:00Z",
                        "description": "Logged in from Chrome browser"
                    }
                ],
                "stats": {
                    "loginCount": 42,
                    "profileCompleteness": 85,
                    "lastActiveDate": "2025-08-10T10:00:00Z"
                }
            }
        };
    }

    // Update user preferences
    public function updateUserPreferences(http:Request request) returns json|http:Response {
        AuthResult|http:Response authCheck = validateUserAuth(request);
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

        // Here you would typically update user preferences in your database
        return {
            "status": "success",
            "message": "Preferences updated successfully",
            "data": {
                "preferences": payload
            }
        };
    }

    // Get user notifications
    public function getUserNotifications(http:Request request) returns json|http:Response {
        AuthResult|http:Response authCheck = validateUserAuth(request);
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

        json[] notifications = [
            {
                "id": "1",
                "title": "Welcome to Cyclesync",
                "message": "Welcome to Cyclesync! Complete your profile to get started.",
                "type": "info",
                "timestamp": "2025-08-10T09:00:00Z",
                "read": false
            },
            {
                "id": "2",
                "title": "Profile Updated",
                "message": "Your profile information has been successfully updated.",
                "type": "success",
                "timestamp": "2025-08-09T15:30:00Z", 
                "read": true
            },
            {
                "id": "3",
                "title": "Security Alert",
                "message": "New login detected from a different device.",
                "type": "warning",
                "timestamp": "2025-08-09T10:15:00Z",
                "read": false
            }
        ];

        return {
            "status": "success",
            "data": {
                "notifications": notifications,
                "total": notifications.length(),
                "unreadCount": 2
            }
        };
    }
}
