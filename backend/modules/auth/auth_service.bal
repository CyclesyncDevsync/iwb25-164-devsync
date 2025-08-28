// Copyright (c) 2025 CircularSync
// Authentication Service - Asgardeo Integration

import ballerina/jwt;
import ballerina/log;
import ballerina/sql;
import ballerinax/postgresql;
import Cyclesync.database;

// Asgardeo configuration
configurable string asgardeoBaseUrl = ?;
configurable string asgardeoClientId = ?;
configurable string asgardeoClientSecret = ?;

# Validate Asgardeo ID Token and extract user info
#
# + idToken - Asgardeo ID token
# + return - Auth result with user context or error
public function validateIdToken(string idToken) returns AuthResult {
    log:printInfo("Validating Asgardeo ID token");
    
    // Decode JWT without verification for now (Asgardeo handles verification)
    [jwt:Header, jwt:Payload]|jwt:Error result = jwt:decode(idToken);
    
    if result is jwt:Error {
        log:printError("Failed to decode ID token", result);
        return {
            isValid: false,
            context: (),
            errorMessage: "Invalid token format"
        };
    }
    
    jwt:Payload payload = result[1];
    
    
    // Extract user information from payload
    string? sub = payload.sub;
    string? email = payload["email"] is string ? <string>payload["email"] : ();
    string? givenName = payload["given_name"] is string ? <string>payload["given_name"] : ();
    string? familyName = payload["family_name"] is string ? <string>payload["family_name"] : ();
    
    if sub is () || email is () {
        return {
            isValid: false,
            context: (),
            errorMessage: "Missing required user information in token"
        };
    }
    
    // Get or create user in database
    User|error user = getUserByAsgardeoId(sub);
    
    if user is error {
        log:printInfo(string `User not found, creating new user for ${email}`);
        
        // Create new user with approved status (auto-approval)
        CreateUserRequest newUserReq = {
            asgardeoId: sub,
            email: email,
            firstName: givenName ?: "Unknown",
            lastName: familyName ?: "User",
            role: BUYER // Default role for new registrations
        };
        
        User|error createdUser = createUser(newUserReq);
        if createdUser is error {
            return {
                isValid: false,
                context: (),
                errorMessage: "Failed to create user account"
            };
        }
        user = createdUser;
    }
    
    // User should be valid here since we handled the error case above
    if user is error {
        return {
            isValid: false,
            context: (),
            errorMessage: "User validation failed"
        };
    }
    
    // Check if user is approved
    if user.status != APPROVED {
        return {
            isValid: false,
            context: (),
            errorMessage: string `Account ${user.status}. Please contact administrator.`
        };
    }
    
    return {
        isValid: true,
        context: {
            userId: user.id,
            asgardeoId: user.asgardeoId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: user.status,
            token: idToken
        },
        errorMessage: ()
    };
}

# Get user by Asgardeo ID
#
# + asgardeoId - Asgardeo user ID
# + return - User record or error if not found
public function getUserByAsgardeoId(string asgardeoId) returns User|error {
    postgresql:Client dbClient = check database:getDatabaseClient();
    
    sql:ParameterizedQuery query = `
        SELECT id, asgardeo_id, email, first_name, last_name, role, status, 
               created_at, updated_at, approved_by, rejected_by, rejection_reason
        FROM users 
        WHERE asgardeo_id = ${asgardeoId}
    `;
    
    User|error result = dbClient->queryRow(query);
    return result;
}

# Create new user
#
# + userReq - User creation request
# + return - Created user or error
public function createUser(CreateUserRequest userReq) returns User|error {
    postgresql:Client dbClient = check database:getDatabaseClient();
    
    // Check if email already exists
    sql:ParameterizedQuery emailCheckQuery = `
        SELECT COUNT(*) as count FROM users WHERE email = ${userReq.email}
    `;
    
    int|error emailCount = dbClient->queryRow(emailCheckQuery);
    if emailCount is error || emailCount > 0 {
        return error("User with this email already exists");
    }
    
    // Insert new user with auto-approval
    sql:ParameterizedQuery insertQuery = `
        INSERT INTO users (asgardeo_id, email, first_name, last_name, role, status, created_at, updated_at)
        VALUES (${userReq.asgardeoId}, ${userReq.email}, ${userReq.firstName}, ${userReq.lastName}, 
                ${userReq.role}, ${APPROVED}, NOW(), NOW())
        RETURNING id, asgardeo_id, email, first_name, last_name, role, status, 
                  created_at, updated_at, approved_by, rejected_by, rejection_reason
    `;
    
    User|error result = dbClient->queryRow(insertQuery);
    
    if result is User {
        log:printInfo(string `Created new user: ${result.email} with role ${result.role} (auto-approved)`);
    }
    
    return result;
}

# Update user
#
# + userId - User ID to update
# + updateReq - Update request
# + adminId - ID of admin making the update
# + return - Updated user or error
public function updateUser(int userId, UpdateUserRequest updateReq, int? adminId = ()) returns User|error {
    postgresql:Client dbClient = check database:getDatabaseClient();
    
    sql:ParameterizedQuery updateQuery;
    
    if updateReq?.firstName is string && updateReq?.lastName is string && updateReq?.role is UserRole && updateReq?.status is RegistrationStatus {
        updateQuery = `
            UPDATE users SET 
                first_name = ${updateReq?.firstName},
                last_name = ${updateReq?.lastName},
                role = ${updateReq?.role},
                status = ${updateReq?.status},
                updated_at = NOW()
            WHERE id = ${userId}
            RETURNING id, asgardeo_id, email, first_name, last_name, role, status,
                      created_at, updated_at, approved_by, rejected_by, rejection_reason
        `;
    } else if updateReq?.status is RegistrationStatus {
        updateQuery = `
            UPDATE users SET 
                status = ${updateReq?.status},
                updated_at = NOW()
            WHERE id = ${userId}
            RETURNING id, asgardeo_id, email, first_name, last_name, role, status,
                      created_at, updated_at, approved_by, rejected_by, rejection_reason
        `;
    } else if updateReq?.role is UserRole {
        updateQuery = `
            UPDATE users SET 
                role = ${updateReq?.role},
                updated_at = NOW()
            WHERE id = ${userId}
            RETURNING id, asgardeo_id, email, first_name, last_name, role, status,
                      created_at, updated_at, approved_by, rejected_by, rejection_reason
        `;
    } else {
        return error("No valid fields to update");
    }
    
    User|error result = dbClient->queryRow(updateQuery);
    
    if result is User {
        log:printInfo(string `Updated user ${userId}: ${result.email}`);
    }
    
    return result;
}

# Get all users with pagination
#
# + limit - Number of users to return
# + offset - Offset for pagination
# + role - Filter by role (optional)
# + status - Filter by status (optional)
# + return - List of users or error
public function getAllUsers(int limitVal = 50, int offsetVal = 0, UserRole? role = (), RegistrationStatus? status = ()) returns User[]|error {
    postgresql:Client dbClient = check database:getDatabaseClient();
    
    sql:ParameterizedQuery query;
    
    if role is UserRole && status is RegistrationStatus {
        query = `
            SELECT id, asgardeo_id, email, first_name, last_name, role, status,
                   created_at, updated_at, approved_by, rejected_by, rejection_reason
            FROM users 
            WHERE role = ${role} AND status = ${status}
            ORDER BY created_at DESC
            LIMIT ${limitVal} OFFSET ${offsetVal}
        `;
    } else if role is UserRole {
        query = `
            SELECT id, asgardeo_id, email, first_name, last_name, role, status,
                   created_at, updated_at, approved_by, rejected_by, rejection_reason
            FROM users 
            WHERE role = ${role}
            ORDER BY created_at DESC
            LIMIT ${limitVal} OFFSET ${offsetVal}
        `;
    } else if status is RegistrationStatus {
        query = `
            SELECT id, asgardeo_id, email, first_name, last_name, role, status,
                   created_at, updated_at, approved_by, rejected_by, rejection_reason
            FROM users 
            WHERE status = ${status}
            ORDER BY created_at DESC
            LIMIT ${limitVal} OFFSET ${offsetVal}
        `;
    } else {
        query = `
            SELECT id, asgardeo_id, email, first_name, last_name, role, status,
                   created_at, updated_at, approved_by, rejected_by, rejection_reason
            FROM users 
            ORDER BY created_at DESC
            LIMIT ${limitVal} OFFSET ${offsetVal}
        `;
    }
    
    stream<User, sql:Error?> resultStream = dbClient->query(query);
    User[] users = [];
    
    check resultStream.forEach(function(User user) {
        users.push(user);
    });
    
    return users;
}

# Delete user
#
# + userId - User ID to delete
# + return - Success or error
public function deleteUser(int userId) returns error? {
    postgresql:Client dbClient = check database:getDatabaseClient();
    
    sql:ParameterizedQuery deleteQuery = `
        DELETE FROM users WHERE id = ${userId}
    `;
    
    sql:ExecutionResult|error result = dbClient->execute(deleteQuery);
    
    if result is error {
        return result;
    }
    
    if result.affectedRowCount == 0 {
        return error("User not found");
    }
    
    log:printInfo(string `Deleted user ${userId}`);
    return;
}

# Check if user has permission for action
#
# + userRole - User's role
# + resourceName - Resource being accessed
# + action - Action being performed
# + return - True if permitted
public function hasPermission(UserRole userRole, string resourceName, string action) returns boolean {
    // Define role-based permissions
    match userRole {
        SUPER_ADMIN => {
            return true; // Super admin has all permissions
        }
        ADMIN => {
            // Admin can do everything except manage other admins
            if resourceName == "users" && action == "create_admin" {
                return false;
            }
            return true;
        }
        AGENT => {
            // Agents can manage buyers and suppliers
            return resourceName == "buyers" || resourceName == "suppliers" || resourceName == "auctions";
        }
        SUPPLIER => {
            // Suppliers can only manage their own data
            return resourceName == "profile" || resourceName == "materials" || resourceName == "auctions";
        }
        BUYER => {
            // Buyers can only manage their own data and participate in auctions
            return resourceName == "profile" || resourceName == "auctions" || resourceName == "orders";
        }
    }
    return false; // Default case
}

# Get dashboard route for user role
#
# + role - User role
# + return - Dashboard route
public function getDashboardRoute(UserRole role) returns string {
    match role {
        SUPER_ADMIN => { return "/admin"; }
        ADMIN => { return "/admin"; }
        AGENT => { return "/agent"; }
        SUPPLIER => { return "/supplier"; }
        BUYER => { return "/buyer"; }
    }
    return "/"; // Default case
}