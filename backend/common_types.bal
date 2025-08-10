// Common types used across the application

public type AuthContext record {|
    string userId;
    string username;
    string email;
    string[] roles;
    string[] groups?;
    string token;
    int exp;
|};

public type AuthResult record {|
    boolean isValid;
    AuthContext? context;
    string? errorMessage;
|};

public type User record {|
    string id;
    string username;
    string email;
    string firstName?;
    string lastName?;
    string[] roles;
    string[] groups?;
    map<anydata> attributes?;
|};

public enum UserRole {
    ADMIN = "admin",
    USER = "user"
}

public type TokenIntrospectionResponse record {|
    boolean active;
    string? scope;
    string? client_id;
    string? username;
    string? token_type;
    int? exp;
    int? iat;
    string? sub;
    string? aud;
    string? iss;
    string[]? roles?;
    string[]? groups?;
|};

public type JWTPayload record {|
    string sub;
    string aud;
    string iss;
    int exp;
    int iat;
    string? username;
    string? email;
    string? given_name;
    string? family_name;
    string[]? roles;
    string[]? groups;
    map<anydata>? realm_access?;
    map<anydata>? resource_access?;
|};

public type ErrorResponse record {|
    int code;
    string message;
    string details?;
|};

public type SuccessResponse record {|
    int code;
    string message;
    anydata data?;
|};
