// Application constants

// Application information
public const string APP_NAME = "Cyclesync";
public const string APP_VERSION = "0.1.0";
public const string API_VERSION = "v1";

// HTTP Status Codes
public const int HTTP_OK = 200;
public const int HTTP_CREATED = 201;
public const int HTTP_NO_CONTENT = 204;
public const int HTTP_BAD_REQUEST = 400;
public const int HTTP_UNAUTHORIZED = 401;
public const int HTTP_FORBIDDEN = 403;
public const int HTTP_NOT_FOUND = 404;
public const int HTTP_CONFLICT = 409;
public const int HTTP_INTERNAL_SERVER_ERROR = 500;

// Error Codes
public const string ERROR_INVALID_REQUEST = "INVALID_REQUEST";
public const string ERROR_UNAUTHORIZED = "UNAUTHORIZED";
public const string ERROR_FORBIDDEN = "FORBIDDEN";
public const string ERROR_NOT_FOUND = "NOT_FOUND";
public const string ERROR_CONFLICT = "CONFLICT";
public const string ERROR_VALIDATION_FAILED = "VALIDATION_FAILED";
public const string ERROR_INTERNAL_SERVER = "INTERNAL_SERVER_ERROR";

// User Roles
public const string ROLE_ADMIN = "admin";
public const string ROLE_USER = "user";

// Permissions
public const string PERMISSION_READ_USERS = "read:users";
public const string PERMISSION_WRITE_USERS = "write:users";
public const string PERMISSION_DELETE_USERS = "delete:users";
public const string PERMISSION_READ_ADMIN = "read:admin";
public const string PERMISSION_WRITE_ADMIN = "write:admin";
public const string PERMISSION_SEND_SMS = "send:sms";
public const string PERMISSION_READ_SMS = "read:sms";

// Validation Limits
public const int MAX_USERNAME_LENGTH = 50;
public const int MIN_USERNAME_LENGTH = 3;
public const int MAX_PASSWORD_LENGTH = 128;
public const int MIN_PASSWORD_LENGTH = 8;
public const int MAX_EMAIL_LENGTH = 254;
public const int MAX_SMS_LENGTH = 160;
public const int MAX_PHONE_NUMBER_LENGTH = 15;
public const int MIN_PHONE_NUMBER_LENGTH = 10;

// Pagination
public const int DEFAULT_PAGE_SIZE = 10;
public const int MAX_PAGE_SIZE = 100;
public const int MIN_PAGE_SIZE = 1;

// Cache Configuration
public const int DEFAULT_CACHE_CAPACITY = 1000;
public const float DEFAULT_CACHE_EVICTION_FACTOR = 0.25;
public const int DEFAULT_CACHE_MAX_AGE = 3600; // 1 hour in seconds

// Token Configuration
public const int DEFAULT_TOKEN_EXPIRY = 3600; // 1 hour in seconds
public const int REFRESH_TOKEN_EXPIRY = 86400; // 24 hours in seconds

// SMS Configuration
public const int SMS_DAILY_LIMIT = 1000;
public const int BULK_SMS_BATCH_SIZE = 100;

// Audit Actions
public const string AUDIT_USER_LOGIN = "USER_LOGIN";
public const string AUDIT_USER_LOGOUT = "USER_LOGOUT";
public const string AUDIT_USER_CREATED = "USER_CREATED";
public const string AUDIT_USER_UPDATED = "USER_UPDATED";
public const string AUDIT_USER_DELETED = "USER_DELETED";
public const string AUDIT_ROLE_CHANGED = "ROLE_CHANGED";
public const string AUDIT_SMS_SENT = "SMS_SENT";
public const string AUDIT_BULK_SMS_SENT = "BULK_SMS_SENT";

// Health Check
public const string HEALTH_HEALTHY = "healthy";
public const string HEALTH_UNHEALTHY = "unhealthy";
public const string HEALTH_DEGRADED = "degraded";

// Date/Time Formats
public const string DATE_FORMAT_ISO = "yyyy-MM-dd";
public const string DATETIME_FORMAT_ISO = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX";
public const string TIME_FORMAT_ISO = "HH:mm:ss";

// Headers
public const string HEADER_AUTHORIZATION = "Authorization";
public const string HEADER_CONTENT_TYPE = "Content-Type";
public const string HEADER_USER_AGENT = "User-Agent";
public const string HEADER_X_FORWARDED_FOR = "X-Forwarded-For";
public const string HEADER_X_REAL_IP = "X-Real-IP";

// Content Types
public const string CONTENT_TYPE_JSON = "application/json";
public const string CONTENT_TYPE_FORM = "application/x-www-form-urlencoded";
public const string CONTENT_TYPE_TEXT = "text/plain";

// Environment
public const string ENV_DEVELOPMENT = "development";
public const string ENV_STAGING = "staging";
public const string ENV_PRODUCTION = "production";

// Default Values
public const string DEFAULT_TIMEZONE = "UTC";
public const string DEFAULT_LANGUAGE = "en";
public const string DEFAULT_THEME = "light";
