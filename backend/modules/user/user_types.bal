// User-related type definitions

public type UserProfile record {|
    string userId;
    string username;
    string email;
    string? firstName;
    string? lastName;
    string[] roles;
    map<anydata>? attributes;
|};

public type UserProfileUpdate record {|
    string? username;
    string? email;
    string? firstName;
    string? lastName;
    map<anydata>? attributes;
|};

public type UserPreferences record {|
    string userId;
    string theme; // "light" | "dark"
    string language; // ISO language code
    string timezone; // IANA timezone
    NotificationPreferences notifications;
    PrivacyPreferences privacy;
|};

public type NotificationPreferences record {|
    boolean email;
    boolean push;
    boolean sms;
|};

public type PrivacyPreferences record {|
    boolean profileVisible;
    boolean allowContactFromOthers;
|};

public type UserNotification record {|
    string id;
    string title;
    string message;
    string 'type; // "info" | "success" | "warning" | "error"
    string timestamp;
    boolean read;
|};

public type UserActivity record {|
    string id;
    string action;
    string timestamp;
    string description;
|};

public type UserStats record {|
    int loginCount;
    int profileCompleteness;
    string lastActiveDate;
|};

public type UserDashboard record {|
    string welcome;
    string userId;
    string lastLogin;
    UserNotification[] notifications;
    UserActivity[] recentActivity;
    UserStats stats;
|};
