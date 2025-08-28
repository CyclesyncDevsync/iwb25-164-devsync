// Copyright (c) 2025 CircularSync
// Authentication and User Management Types

import ballerina/sql;

// User Roles Enum
public enum UserRole {
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
    AGENT = "agent",
    SUPPLIER = "supplier",
    BUYER = "buyer"
}

// User Registration Status
public enum RegistrationStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}

// User record from database
public type User record {|
    int id;
    @sql:Column {name: "asgardeo_id"}
    string asgardeoId;
    string email;
    @sql:Column {name: "first_name"}
    string firstName;
    @sql:Column {name: "last_name"}
    string lastName;
    UserRole role;
    RegistrationStatus status;
    @sql:Column {name: "created_at"}
    string createdAt;
    @sql:Column {name: "updated_at"}
    string updatedAt;
    @sql:Column {name: "approved_by"}
    string? approvedBy?;
    @sql:Column {name: "rejected_by"}
    string? rejectedBy?;
    @sql:Column {name: "rejection_reason"}
    string? rejectionReason?;
|};

// User creation request
public type CreateUserRequest record {|
    string asgardeoId;
    string email;
    string firstName;
    string lastName;
    UserRole role;
|};

// User update request
public type UpdateUserRequest record {|
    string? firstName?;
    string? lastName?;
    UserRole? role?;
    RegistrationStatus? status?;
    string? rejectionReason?;
|};

// Asgardeo ID Token payload
public type AsgardeoIdToken record {|
    string sub;
    string aud;
    string iss;
    int exp;
    int iat;
    string email;
    string given_name;
    string family_name;
    string name;
    boolean email_verified;
    string preferred_username;
    map<anydata>? realm_access?;
    map<anydata>? resource_access?;
|};

// Auth context for requests
public type AuthContext record {|
    int userId;
    string asgardeoId;
    string email;
    string firstName;
    string lastName;
    UserRole role;
    RegistrationStatus status;
    string token;
|};

// Auth result
public type AuthResult record {|
    boolean isValid;
    AuthContext? context;
    string? errorMessage;
|};

// Role permissions
public type Permission record {|
    string resourceName;
    string[] actions;
|};

// Dashboard routes mapping
public type DashboardRoute record {|
    UserRole role;
    string route;
|};

// Response types
public type ErrorResponse record {|
    int code;
    string message;
    string? details?;
|};

public type SuccessResponse record {|
    int code;
    string message;
    anydata? data?;
|};

public type UserResponse record {|
    int code;
    string message;
    User? user?;
|};

public type UsersListResponse record {|
    int code;
    string message;
    User[]? users?;
    int? total?;
|};
