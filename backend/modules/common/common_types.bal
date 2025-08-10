// Common types used across the application

public type ApiResponse record {|
    string status; // "success" | "error"
    string message;
    anydata? data;
    ErrorDetails? 'error;
|};

public type ErrorDetails record {|
    string code;
    string message;
    string? details;
    map<anydata>? context;
|};

public type SuccessResponse record {|
    string status;
    string message;
    anydata data;
|};

public type ErrorResponse record {|
    string status;
    string message;
    ErrorDetails 'error;
|};

public type PaginatedResponse record {|
    anydata[] items;
    int total;
    int page;
    int pageSize;
    int totalPages;
|};

public type ValidationError record {|
    string 'field;
    string message;
    anydata? value;
|};

public type ValidationResult record {|
    boolean isValid;
    ValidationError[]? errors;
|};

// Common enums
public enum Status {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",
    SUSPENDED = "suspended"
}

public enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE"
}

// Configuration types
public type DatabaseConfig record {|
    string host;
    int port;
    string database;
    string username;
    string password;
    int maxConnections;
|};

public type CacheConfig record {|
    int capacity;
    float evictionFactor;
    int defaultMaxAge;
|};

public type LoggingConfig record {|
    string level; // "DEBUG" | "INFO" | "WARN" | "ERROR"
    boolean enableConsole;
    boolean enableFile;
    string? logFile;
|};

// Audit trail types
public type AuditEntry record {|
    string id;
    string action;
    string userId;
    string username;
    string timestamp;
    string ipAddress;
    string userAgent;
    map<anydata> details;
    boolean success;
|};

// Health check types
public type HealthStatus record {|
    string status; // "healthy" | "unhealthy" | "degraded"
    string timestamp;
    map<ServiceHealth> services;
|};

public type ServiceHealth record {|
    string status;
    string? message;
    int responseTime; // in milliseconds
|};
