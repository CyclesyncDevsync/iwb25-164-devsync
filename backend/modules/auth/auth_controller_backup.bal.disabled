// Copyright (c) 2025 CircularSync
// Authentication API Controller

import ballerina/http;
import ballerina/jwt;
import ballerina/log;

# Auth API service  
service /api/auth on new http:Listener(8092) {

    private final AuthMiddleware authMiddleware;

    public function init() {
        self.authMiddleware = new AuthMiddleware();
        log:printInfo("Auth API controller initialized");
    }

    # Check if user exists without creating them
    #
    # + request - HTTP request with Authorization header
    # + return - User existence status
    resource function post checkUser(http:Request request) returns json|http:BadRequest|http:Unauthorized {
        // Get authorization header
        string|error authHeader = request.getHeader("Authorization");
        if authHeader is error {
            return <http:Unauthorized>{
                body: {
                    code: 401,
                    message: "Authorization header required"
                }
            };
        }

        if !authHeader.startsWith("Bearer ") {
            return <http:Unauthorized>{
                body: {
                    code: 401,
                    message: "Invalid authorization header format"
                }
            };
        }

        string idToken = authHeader.substring(7); // Remove "Bearer " prefix

        // Decode JWT without verification to get user info
        [jwt:Header, jwt:Payload]|jwt:Error result = jwt:decode(idToken);
        if result is jwt:Error {
            return <http:Unauthorized>{
                body: {
                    code: 401,
                    message: "Invalid token format"
                }
            };
        }

        jwt:Payload payload = result[1];
        string? sub = payload.sub;
        string? email = payload["email"] is string ? <string>payload["email"] : ();

        if sub is () || email is () {
            return <http:BadRequest>{
                body: {
                    code: 400,
                    message: "Missing required user information in token"
                }
            };
        }

        // Check if user exists by Asgardeo ID
        User|error user = getUserByAsgardeoId(sub);
        if user is User {
            return {
                code: 200,
                message: "User exists",
                userExists: true,
                user: {
                    id: user.id,
                    asgardeoId: user.asgardeoId,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    status: user.status
                }
            };
        }

        // Check if user exists by email
        User|error userByEmail = getUserByEmail(email);
        if userByEmail is User {
            return {
                code: 200,
                message: "User exists with different Asgardeo ID",
                userExists: true,
                user: {
                    id: userByEmail.id,
                    asgardeoId: userByEmail.asgardeoId,
                    email: userByEmail.email,
                    firstName: userByEmail.firstName,
                    lastName: userByEmail.lastName,
                    role: userByEmail.role,
                    status: userByEmail.status
                }
            };
        }

        return {
            code: 404,
            message: "User not found",
            userExists: false
        };
    }

    # Validate token and get user info
    #
    # + request - HTTP request with Authorization header
    # + return - User context or error response
    resource function post validate(http:Request request) returns json|http:BadRequest|http:Unauthorized {
        AuthContext|http:Unauthorized authResult = self.authMiddleware.authenticate(request);

        if authResult is http:Unauthorized {
            return authResult;
        }

        return {
            code: 200,
            message: "Token validated successfully",
            user: {
                id: authResult.userId,
                asgardeoId: authResult.asgardeoId,
                email: authResult.email,
                firstName: authResult.firstName,
                lastName: authResult.lastName,
                role: authResult.role,
                status: authResult.status,
                dashboardRoute: getDashboardRoute(authResult.role)
            }
        };
    }

    # Get current user profile
    #
    # + request - HTTP request with Authorization header
    # + return - User profile or error response
    resource function get me(http:Request request) returns json|http:Unauthorized {
        AuthContext|http:Unauthorized authResult = self.authMiddleware.authenticate(request);

        if authResult is http:Unauthorized {
            return authResult;
        }

        // Get full user details from database
        User|error user = getUserByAsgardeoId(authResult.asgardeoId);

        if user is error {
            return <json>{
                code: 404,
                message: "User not found",
                details: user.message()
            };
        }

        return {
            code: 200,
            message: "User profile retrieved successfully",
            user: user
        };
    }

    # Register new user (for buyers and suppliers)
    #
    # + request - HTTP request with user details
    # + return - Created user or error response
    resource function post register(http:Request request) returns json|http:BadRequest|http:Unauthorized {
        AuthContext|http:Unauthorized authResult = self.authMiddleware.authenticate(request);

        if authResult is http:Unauthorized {
            return authResult;
        }

        // Get registration details from request body first
        json|error payload = request.getJsonPayload();
        if payload is error {
            return <http:BadRequest>{
                body: {
                    code: 400,
                    message: "Invalid request body",
                    details: "JSON payload required"
                }
            };
        }

        // Extract role from payload (should be buyer or supplier)
        json|error roleField = payload.role;
        if roleField is error {
            return <http:BadRequest>{
                body: {
                    code: 400,
                    message: "Role field missing"
                }
            };
        }
        string|error roleStr = roleField.toString();
        if roleStr is error {
            return <http:BadRequest>{
                body: {
                    code: 400,
                    message: "Role is required",
                    details: "Valid roles: buyer, supplier"
                }
            };
        }

        UserRole role;
        if roleStr == "buyer" {
            role = BUYER;
        } else if roleStr == "supplier" {
            role = SUPPLIER;
        } else {
            return <http:BadRequest>{
                body: {
                    code: 400,
                    message: "Invalid role for registration",
                    details: "Only buyers and suppliers can self-register"
                }
            };
        }

        // Check if user is already registered
        User|error existingUser = getUserByAsgardeoId(authResult.asgardeoId);
        if existingUser is User {
            // If user exists, update their role instead of throwing error
            UpdateUserRequest updateReq = {role: role};
            User|error updatedUser = updateUser(existingUser.id, updateReq, existingUser.id);

            if updatedUser is error {
                return <json>{
                    code: 500,
                    message: "Failed to update user role",
                    details: updatedUser.message()
                };
            }

            return <json>{
                code: 409,
                message: "User role updated successfully",
                user: updatedUser
            };
        }

        // Create user
        CreateUserRequest newUserReq = {
            asgardeoId: authResult.asgardeoId,
            email: authResult.email,
            firstName: authResult.firstName,
            lastName: authResult.lastName,
            role: role
        };

        User|error createdUser = createUser(newUserReq);
        if createdUser is error {
            return <json>{
                code: 500,
                message: "Failed to create user",
                details: createdUser.message()
            };
        }

        return {
            code: 201,
            message: "User registered successfully. You can now access your dashboard.",
            user: createdUser
        };
    }
}

# Admin user management service
service /api/admin/users on new http:Listener(8093) {

    private final AuthMiddleware authMiddleware;

    public function init() {
        self.authMiddleware = new AuthMiddleware();
        log:printInfo("Admin user management API initialized");
    }

    # Get all users (admin only)
    #
    # + request - HTTP request with Authorization header
    # + limitParam - Number of users to return
    # + offsetParam - Offset for pagination
    # + role - Filter by role
    # + status - Filter by status
    # + return - List of users or error response
    resource function get .(http:Request request, int limitParam = 50, int offsetParam = 0, string? role = (), string? status = ()) returns json|http:Unauthorized|http:Forbidden {
        AuthContext|http:Unauthorized authResult = self.authMiddleware.authenticate(request);

        if authResult is http:Unauthorized {
            return authResult;
        }

        // Check admin permissions
        ()|http:Forbidden authCheck = self.authMiddleware.authorizeRole(authResult, ADMIN);
        if authCheck is http:Forbidden {
            return authCheck;
        }

        UserRole? roleFilter = ();
        if role is string {
            if role == "super_admin" {
                roleFilter = SUPER_ADMIN;
            }
            else if role == "admin" {
                roleFilter = ADMIN;
            }
            else if role == "agent" {
                roleFilter = AGENT;
            }
            else if role == "supplier" {
                roleFilter = SUPPLIER;
            }
            else if role == "buyer" {
                roleFilter = BUYER;
            }
        }

        RegistrationStatus? statusFilter = ();
        if status is string {
            if status == "pending" {
                statusFilter = PENDING;
            }
            else if status == "approved" {
                statusFilter = APPROVED;
            }
            else if status == "rejected" {
                statusFilter = REJECTED;
            }
        }

        User[]|error users = getAllUsers(limitParam, offsetParam, roleFilter, statusFilter);

        if users is error {
            return <json>{
                code: 500,
                message: "Failed to retrieve users",
                details: users.message()
            };
        }

        return {
            code: 200,
            message: "Users retrieved successfully",
            users: users,
            total: users.length()
        };
    }

    # Update user (admin only)
    #
    # + request - HTTP request with update data
    # + userId - User ID to update
    # + return - Updated user or error response
    resource function put [int userId](http:Request request) returns json|http:BadRequest|http:Unauthorized|http:Forbidden {
        AuthContext|http:Unauthorized authResult = self.authMiddleware.authenticate(request);

        if authResult is http:Unauthorized {
            return authResult;
        }

        // Check admin permissions
        ()|http:Forbidden authCheck = self.authMiddleware.authorizeRole(authResult, ADMIN);
        if authCheck is http:Forbidden {
            return authCheck;
        }

        json|error payload = request.getJsonPayload();
        if payload is error {
            return <http:BadRequest>{
                body: {
                    code: 400,
                    message: "Invalid request body"
                }
            };
        }

        UpdateUserRequest updateReq = {};

        // Extract fields from payload
        json|error firstNameField = payload.firstName;
        if firstNameField is string {
            updateReq.firstName = firstNameField;
        }

        json|error lastNameField = payload.lastName;
        if lastNameField is string {
            updateReq.lastName = lastNameField;
        }

        json|error roleField = payload.role;
        if roleField is string {
            string roleStr = roleField;
            if roleStr == "super_admin" {
                updateReq.role = SUPER_ADMIN;
            }
            else if roleStr == "admin" {
                updateReq.role = ADMIN;
            }
            else if roleStr == "agent" {
                updateReq.role = AGENT;
            }
            else if roleStr == "supplier" {
                updateReq.role = SUPPLIER;
            }
            else if roleStr == "buyer" {
                updateReq.role = BUYER;
            }
        }

        json|error statusField = payload.status;
        if statusField is string {
            string statusStr = statusField;
            if statusStr == "pending" {
                updateReq.status = PENDING;
            }
            else if statusStr == "approved" {
                updateReq.status = APPROVED;
            }
            else if statusStr == "rejected" {
                updateReq.status = REJECTED;
            }
        }

        json|error rejectionReasonField = payload.rejectionReason;
        if rejectionReasonField is string {
            updateReq.rejectionReason = rejectionReasonField;
        }

        User|error updatedUser = updateUser(userId, updateReq, authResult.userId);

        if updatedUser is error {
            return <json>{
                code: 500,
                message: "Failed to update user",
                details: updatedUser.message()
            };
        }

        return {
            code: 200,
            message: "User updated successfully",
            user: updatedUser
        };
    }

    # Delete user (admin only)
    #
    # + request - HTTP request with Authorization header
    # + userId - User ID to delete
    # + return - Success message or error response
    resource function delete [int userId](http:Request request) returns json|http:Unauthorized|http:Forbidden {
        AuthContext|http:Unauthorized authResult = self.authMiddleware.authenticate(request);

        if authResult is http:Unauthorized {
            return authResult;
        }

        // Check admin permissions
        ()|http:Forbidden authCheck = self.authMiddleware.authorizeRole(authResult, ADMIN);
        if authCheck is http:Forbidden {
            return authCheck;
        }

        error? deleteResult = deleteUser(userId);

        if deleteResult is error {
            return <json>{
                code: 500,
                message: "Failed to delete user",
                details: deleteResult.message()
            };
        }

        return {
            code: 200,
            message: "User deleted successfully"
        };
    }
}
