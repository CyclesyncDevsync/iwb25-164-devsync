import ballerina/http;
import ballerina/log;
import ballerina/time;
import ballerinax/postgresql;

# Notification API Configuration
configurable int notificationPort = 9102;

# Database configuration - use the same values as other modules
string dbHost = "ep-calm-hill-adjqwl68-pooler.c-2.us-east-1.aws.neon.tech";
string dbName = "cyclesync";
string dbUsername = "neondb_owner";
string dbPassword = "npg_RCFiD1hUXpT5";
int dbPort = 5432;

# Initialize database client
final postgresql:Client dbClient = check new (
    host = dbHost,
    database = dbName,
    username = dbUsername,
    password = dbPassword,
    port = dbPort,
    options = {
        ssl: {
            mode: postgresql:REQUIRE
        },
        connectTimeout: 10
    }
);

# Initialize notification service
final NotificationService notificationService = new (dbClient);

# Notification API Service
@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["*"],
        allowCredentials: false,
        maxAge: 86400
    }
}
service /api/notifications on new http:Listener(notificationPort) {
    
    # Get notifications for a user
    # + userId - The user ID from query parameter
    # + includeRead - Include read notifications (optional)
    # + limit - Maximum number of notifications (optional)
    # + return - List of notifications or error
    resource function get .(@http:Query string userId, 
                           @http:Query boolean includeRead = false,
                           @http:Query int maxResults = 50) returns Notification[]|http:InternalServerError {
        do {
            return check notificationService.getUserNotifications(userId, includeRead, maxResults);
        } on fail error e {
            log:printError("Failed to get notifications", e);
            return {body: {message: "Failed to retrieve notifications"}};
        }
    }
    
    # Get unread notification count
    # + userId - The user ID from query parameter
    # + return - Count object or error
    resource function get count(@http:Query string userId) returns NotificationCount|http:InternalServerError {
        do {
            int count = check notificationService.getUnreadCount(userId);
            return {count: count};
        } on fail error e {
            log:printError("Failed to get notification count", e);
            return {body: {message: "Failed to retrieve notification count"}};
        }
    }
    
    # Create a new notification (for testing purposes)
    # + return - Created notification ID or error
    resource function post .(@http:Payload NotificationRequest notification) 
            returns NotificationCreatedResponse|http:InternalServerError {
        do {
            string notificationId = check notificationService.createNotification(notification);
            return {
                notificationId: notificationId,
                message: "Notification created successfully"
            };
        } on fail error e {
            log:printError("Failed to create notification", e);
            return {body: {message: "Failed to create notification"}};
        }
    }
    
    # Mark notification as read
    # + notificationId - The notification ID
    # + return - Success response or error
    resource function put [string notificationId]/read(@http:Query string userId) 
            returns SuccessResponse|http:InternalServerError|http:NotFound {
        do {
            boolean updated = check notificationService.markAsRead(notificationId, userId);
            if (updated) {
                return {message: "Notification marked as read"};
            } else {
                return <http:NotFound>{body: {message: "Notification not found"}};
            }
        } on fail error e {
            log:printError("Failed to mark notification as read", e);
            return <http:InternalServerError>{body: {message: "Failed to update notification"}};
        }
    }
    
    # Mark all notifications as read for a user
    # + userId - The user ID from query parameter
    # + return - Success response with count or error
    resource function put read\-all(@http:Query string userId) 
            returns MarkAllReadResponse|http:InternalServerError {
        do {
            int count = check notificationService.markAllAsRead(userId);
            return {
                message: "All notifications marked as read",
                count: count
            };
        } on fail error e {
            log:printError("Failed to mark all notifications as read", e);
            return {body: {message: "Failed to update notifications"}};
        }
    }
    
    # Health check endpoint
    resource function get health() returns HealthResponse {
        return {
            status: "healthy",
            'service: "notification-service",
            timestamp: time:utcToString(time:utcNow())
        };
    }
}

# Response types
type NotificationCount record {|
    int count;
|};

type NotificationCreatedResponse record {|
    string notificationId;
    string message;
|};

type SuccessResponse record {|
    string message;
|};

type MarkAllReadResponse record {|
    string message;
    int count;
|};

type HealthResponse record {|
    string status;
    string 'service;
    string timestamp;
|};

