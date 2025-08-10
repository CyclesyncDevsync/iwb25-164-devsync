// Admin-related type definitions

public type AdminUser record {|
    string userId;
    string username;
    string email;
    string? firstName;
    string? lastName;
    string[] roles;
    string status; // "active" | "inactive" | "suspended"
    string createdAt;
    string? lastLogin;
    int loginCount;
|};

public type CreateUserRequest record {|
    string username;
    string email;
    string? firstName;
    string? lastName;
    string[]? roles;
    string? password;
|};

public type UpdateUserRequest record {|
    string? username;
    string? email;
    string? firstName;
    string? lastName;
    string[]? roles;
    string? status;
|};

public type UserList record {|
    AdminUser[] users;
    int total;
    int page;
    int pageSize;
    int totalPages;
|};

public type SystemStats record {|
    int totalUsers;
    int activeUsers;
    int inactiveUsers;
    int adminUsers;
    int totalLogins;
    int loginsToday;
    string systemHealth; // "healthy" | "warning" | "critical"
    string uptime;
    float memoryUsage; // percentage
    float cpuUsage; // percentage
|};

public type AuditLog record {|
    string id;
    string action; // "USER_LOGIN" | "USER_LOGOUT" | "USER_CREATED" | "USER_UPDATED" | "USER_DELETED" | "ROLE_CHANGED"
    string userId;
    string username;
    string timestamp;
    string ipAddress;
    string userAgent;
    boolean success;
    map<anydata> details;
|};

public type AuditLogList record {|
    AuditLog[] logs;
    int total;
    int page;
    int pageSize;
    int totalPages;
|};

public type RoleUpdateRequest record {|
    string[] roles;
|};

public type AdminPermission record {|
    string permission;
    string description;
    string module;
|};
