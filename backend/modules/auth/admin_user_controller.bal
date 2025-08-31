// Copyright (c) 2025 CircularSync
// Admin User Management API Controller

import ballerina/http;
import ballerina/log;
import ballerina/random;

# Admin User Management API service
@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"],
        allowCredentials: false,
        allowHeaders: ["*"],
        allowMethods: ["*"],
        maxAge: 84900
    }
}
service /api/admin/users on new http:Listener(8093) {

    private final AuthMiddleware authMiddleware;

    public function init() {
        self.authMiddleware = new AuthMiddleware();
        log:printInfo("Admin User Management API controller initialized");
    }

    # Handle CORS preflight requests
    resource function options .(http:Request request) returns http:Response {
        http:Response response = new;
        response.statusCode = 204;
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept, Origin, X-Requested-With");
        response.setHeader("Access-Control-Max-Age", "84900");
        return response;
    }

    # Helper function to add CORS headers to responses
    private function addCorsHeaders(http:Response response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept, Origin, X-Requested-With");
    }

    # Get all users with filtering and pagination (admin only)
    #
    # + request - HTTP request
    # + return - Users list or error response
    resource function get .(http:Request request) returns json|http:Response {
        // Authenticate admin user
        AuthContext|http:Unauthorized authResult = self.authMiddleware.authenticate(request);
        if authResult is http:Unauthorized {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "error": "Unauthorized",
                "message": "Authentication required"
            });
            self.addCorsHeaders(response);
            return response;
        }

        // Check if user has admin role
        if authResult.role != SUPER_ADMIN && authResult.role != ADMIN {
            http:Response response = new;
            response.statusCode = 403;
            response.setJsonPayload({
                "error": "Forbidden",
                "message": "Admin access required"
            });
            self.addCorsHeaders(response);
            return response;
        }

        // Parse query parameters
        map<string[]> queryParams = request.getQueryParams();
        string? roleParam = queryParams.hasKey("role") ? queryParams.get("role")[0] : ();
        string? statusParam = queryParams.hasKey("status") ? queryParams.get("status")[0] : ();
        string? limitParam = queryParams.hasKey("limit") ? queryParams.get("limit")[0] : ();
        string? offsetParam = queryParams.hasKey("offset") ? queryParams.get("offset")[0] : ();

        // Convert parameters
        UserRole? roleFilter = roleParam is string ? <UserRole>roleParam : ();
        RegistrationStatus? statusFilter = statusParam is string ? <RegistrationStatus>statusParam : ();
        int|error limitResult = limitParam is string ? int:fromString(limitParam) : 50;
        int limitValue = limitResult is int ? limitResult : 50;
        int|error offsetResult = offsetParam is string ? int:fromString(offsetParam) : 0;
        int offsetValue = offsetResult is int ? offsetResult : 0;

        // Get users from database
        User[]|error users = getAllUsers(limitValue, offsetValue, roleFilter, statusFilter);
        if users is error {
            log:printError("Failed to get users", users);
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Database Error",
                "message": "Failed to retrieve users"
            });
            return response;
        }

        // Convert to JSON response format
        json[] userList = [];
        foreach User user in users {
            userList.push({
                "id": user.id,
                "asgardeoId": user.asgardeoId,
                "email": user.email,
                "firstName": user.firstName,
                "lastName": user.lastName,
                "name": string `${user.firstName} ${user.lastName}`,
                "role": user.role,
                "status": user.status,
                "createdAt": user.createdAt,
                "updatedAt": user.updatedAt,
                "approvedBy": user?.approvedBy,
                "rejectedBy": user?.rejectedBy,
                "rejectionReason": user?.rejectionReason
            });
        }

        // Create response with CORS headers
        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            "status": "success",
            "data": {
                "users": userList,
                "total": userList.length(),
                "limit": limitValue,
                "offset": offsetValue
            }
        });
        self.addCorsHeaders(response);
        return response;
    }

    # Get specific user by ID (admin only)
    #
    # + request - HTTP request
    # + userId - User ID
    # + return - User details or error response
    resource function get [int userId](http:Request request) returns json|http:Response {
        // Authenticate admin user
        AuthContext|http:Unauthorized authResult = self.authMiddleware.authenticate(request);
        if authResult is http:Unauthorized {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "error": "Unauthorized",
                "message": "Authentication required"
            });
            return response;
        }

        // Check if user has admin role
        if authResult.role != SUPER_ADMIN && authResult.role != ADMIN {
            http:Response response = new;
            response.statusCode = 403;
            response.setJsonPayload({
                "error": "Forbidden",
                "message": "Admin access required"
            });
            return response;
        }

        // Get user from database
        User|error user = getUserById(userId);
        if user is error {
            log:printError("Failed to get user", user);
            http:Response response = new;
            response.statusCode = 404;
            response.setJsonPayload({
                "error": "Not Found",
                "message": "User not found"
            });
            return response;
        }

        return {
            "status": "success",
            "data": {
                "id": user.id,
                "asgardeoId": user.asgardeoId,
                "email": user.email,
                "firstName": user.firstName,
                "lastName": user.lastName,
                "name": string `${user.firstName} ${user.lastName}`,
                "role": user.role,
                "status": user.status,
                "createdAt": user.createdAt,
                "updatedAt": user.updatedAt,
                "approvedBy": user?.approvedBy,
                "rejectedBy": user?.rejectedBy,
                "rejectionReason": user?.rejectionReason
            }
        };
    }

    # Update user (admin only)
    #
    # + request - HTTP request with update data
    # + userId - User ID to update
    # + return - Updated user or error response
    resource function put [int userId](http:Request request) returns json|http:Response {
        // Authenticate admin user
        AuthContext|http:Unauthorized authResult = self.authMiddleware.authenticate(request);
        if authResult is http:Unauthorized {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "error": "Unauthorized",
                "message": "Authentication required"
            });
            return response;
        }

        // Check if user has admin role
        if authResult.role != SUPER_ADMIN && authResult.role != ADMIN {
            http:Response response = new;
            response.statusCode = 403;
            response.setJsonPayload({
                "error": "Forbidden",
                "message": "Admin access required"
            });
            return response;
        }

        // Parse request body
        json|error payload = request.getJsonPayload();
        if payload is error {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                "error": "Bad Request",
                "message": "Invalid JSON payload"
            });
            return response;
        }

        // Extract update fields
        UpdateUserRequest updateReq = {};

        json|error firstNameResult = payload.firstName;
        if firstNameResult is json && firstNameResult is string {
            updateReq.firstName = firstNameResult;
        }
        json|error lastNameResult = payload.lastName;
        if lastNameResult is json && lastNameResult is string {
            updateReq.lastName = lastNameResult;
        }
        json|error roleResult = payload.role;
        if roleResult is json && roleResult is string {
            updateReq.role = <UserRole>roleResult;
        }
        json|error statusResult = payload.status;
        if statusResult is json && statusResult is string {
            updateReq.status = <RegistrationStatus>statusResult;
        }
        json|error rejectionReasonResult = payload.rejectionReason;
        if rejectionReasonResult is json && rejectionReasonResult is string {
            updateReq.rejectionReason = rejectionReasonResult;
        }

        // Update user
        User|error updatedUser = updateUser(userId, updateReq, authResult.userId);
        if updatedUser is error {
            log:printError("Failed to update user", updatedUser);
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Database Error",
                "message": "Failed to update user"
            });
            return response;
        }

        return {
            "status": "success",
            "message": "User updated successfully",
            "data": {
                "id": updatedUser.id,
                "asgardeoId": updatedUser.asgardeoId,
                "email": updatedUser.email,
                "firstName": updatedUser.firstName,
                "lastName": updatedUser.lastName,
                "name": string `${updatedUser.firstName} ${updatedUser.lastName}`,
                "role": updatedUser.role,
                "status": updatedUser.status,
                "createdAt": updatedUser.createdAt,
                "updatedAt": updatedUser.updatedAt,
                "approvedBy": updatedUser?.approvedBy,
                "rejectedBy": updatedUser?.rejectedBy,
                "rejectionReason": updatedUser?.rejectionReason
            }
        };
    }

    # Delete user (admin only)
    #
    # + request - HTTP request
    # + userId - User ID to delete
    # + return - Success response or error
    resource function delete [int userId](http:Request request) returns json|http:Response {
        // Authenticate admin user
        AuthContext|http:Unauthorized authResult = self.authMiddleware.authenticate(request);
        if authResult is http:Unauthorized {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "error": "Unauthorized",
                "message": "Authentication required"
            });
            return response;
        }

        // Check if user has admin role
        if authResult.role != SUPER_ADMIN && authResult.role != ADMIN {
            http:Response response = new;
            response.statusCode = 403;
            response.setJsonPayload({
                "error": "Forbidden",
                "message": "Admin access required"
            });
            return response;
        }

        // Delete user
        error? deleteResult = deleteUser(userId);
        if deleteResult is error {
            log:printError("Failed to delete user", deleteResult);
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Database Error",
                "message": "Failed to delete user"
            });
            return response;
        }

        return {
            "status": "success",
            "message": "User deleted successfully"
        };
    }

    # Create new user (admin only)
    #
    # + request - HTTP request with user data
    # + return - Created user or error response
    resource function post .(http:Request request) returns json|http:Response {
        // Authenticate admin user
        AuthContext|http:Unauthorized authResult = self.authMiddleware.authenticate(request);
        if authResult is http:Unauthorized {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "error": "Unauthorized",
                "message": "Authentication required"
            });
            return response;
        }

        // Check if user has admin role
        if authResult.role != SUPER_ADMIN && authResult.role != ADMIN {
            http:Response response = new;
            response.statusCode = 403;
            response.setJsonPayload({
                "error": "Forbidden",
                "message": "Admin access required"
            });
            return response;
        }

        // Parse request body
        json|error payload = request.getJsonPayload();
        if payload is error {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                "error": "Bad Request",
                "message": "Invalid JSON payload"
            });
            return response;
        }

        // Validate required fields
        json|error emailResult = payload.email;
        string? email = emailResult is json && emailResult is string ? emailResult : ();
        json|error firstNameResult = payload.firstName;
        string? firstName = firstNameResult is json && firstNameResult is string ? firstNameResult : ();
        json|error lastNameResult = payload.lastName;
        string? lastName = lastNameResult is json && lastNameResult is string ? lastNameResult : ();
        json|error roleResult = payload.role;
        string? role = roleResult is json && roleResult is string ? roleResult : ();
        json|error asgardeoIdResult = payload.asgardeoId;
        int|error randomResult = random:createIntInRange(100000, 999999);
        string asgardeoId = asgardeoIdResult is json && asgardeoIdResult is string ? asgardeoIdResult : ("temp-" + (randomResult is int ? randomResult.toString() : "123456"));

        if email is () || firstName is () || lastName is () || role is () {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                "error": "Bad Request",
                "message": "Missing required fields: email, firstName, lastName, role"
            });
            return response;
        }

        // Create user request
        CreateUserRequest createReq = {
            asgardeoId: asgardeoId,
            email: email is string ? email : "",
            firstName: firstName is string ? firstName : "",
            lastName: lastName is string ? lastName : "",
            role: <UserRole>(role is string ? role : "")
        };

        // Create user
        User|error createdUser = createUser(createReq);
        if createdUser is error {
            log:printError("Failed to create user", createdUser);
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Database Error",
                "message": "Failed to create user"
            });
            return response;
        }

        return {
            "status": "success",
            "message": "User created successfully",
            "data": {
                "id": createdUser.id,
                "asgardeoId": createdUser.asgardeoId,
                "email": createdUser.email,
                "firstName": createdUser.firstName,
                "lastName": createdUser.lastName,
                "name": string `${createdUser.firstName} ${createdUser.lastName}`,
                "role": createdUser.role,
                "status": createdUser.status,
                "createdAt": createdUser.createdAt,
                "updatedAt": createdUser.updatedAt
            }
        };
    }
}
