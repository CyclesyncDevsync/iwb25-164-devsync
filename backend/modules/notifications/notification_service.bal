import ballerina/sql;
import ballerina/time;
import ballerina/uuid;
import ballerinax/postgresql;

# Notification Service for managing user notifications
public isolated class NotificationService {
    private final postgresql:Client dbClient;
    
    public function init(postgresql:Client dbClient) {
        self.dbClient = dbClient;
    }
    
    # Create a new notification
    # + notification - The notification to create
    # + return - The created notification ID or error
    public isolated function createNotification(NotificationRequest notification) returns string|error {
        string notificationId = uuid:createType1AsString();
        
        string dataJsonStr = notification.data.toJsonString();
        sql:ParameterizedQuery query = `
            INSERT INTO notifications (
                notification_id, user_id, notification_type, 
                title, message, data, expires_at
            ) VALUES (
                ${notificationId}, ${notification.userId}, ${notification.notificationType},
                ${notification.title}, ${notification.message}, 
                ${dataJsonStr}::jsonb, ${notification.expiresAt}
            )
        `;
        
        _ = check self.dbClient->execute(query);
        return notificationId;
    }
    
    # Create agent assignment notification
    # + agentId - The agent ID
    # + supplierId - The supplier ID
    # + supplierName - The supplier name
    # + materialId - The material ID
    # + materialDetails - Additional material details
    # + return - The notification ID or error
    public isolated function createAgentAssignmentNotification(
        string agentId, 
        string supplierId,
        string supplierName,
        string materialId,
        json materialDetails
    ) returns string|error {
        
        NotificationRequest notification = {
            userId: agentId,
            notificationType: "AGENT_ASSIGNED_TO_SUPPLIER",
            title: "New Assignment: Verify Material",
            message: string `You have been assigned to verify materials from ${supplierName}`,
            data: {
                "supplierId": supplierId,
                "supplierName": supplierName,
                "materialId": materialId,
                "materialDetails": materialDetails,
                "assignmentTime": time:utcToString(time:utcNow())
            }
        };
        
        return self.createNotification(notification);
    }
    
    # Get user notifications
    # + userId - The user ID
    # + includeRead - Include read notifications
    # + limit - Maximum number of notifications to return
    # + return - List of notifications or error
    public isolated function getUserNotifications(
        string userId, 
        boolean includeRead = false, 
        int maxResults = 50
    ) returns Notification[]|error {
        
        sql:ParameterizedQuery query;
        if (includeRead) {
            query = `
                SELECT * FROM notifications 
                WHERE user_id = ${userId}
                AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
                ORDER BY created_at DESC
                LIMIT ${maxResults}
            `;
        } else {
            query = `
                SELECT * FROM notifications 
                WHERE user_id = ${userId} 
                AND read_status = false
                AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
                ORDER BY created_at DESC
                LIMIT ${maxResults}
            `;
        }
        
        stream<NotificationRecord, sql:Error?> notificationStream = self.dbClient->query(query);
        
        Notification[] notifications = [];
        check from NotificationRecord dbRecord in notificationStream
            do {
                notifications.push({
                    notificationId: dbRecord.notification_id,
                    userId: dbRecord.user_id,
                    notificationType: dbRecord.notification_type,
                    title: dbRecord.title,
                    message: dbRecord.message,
                    data: dbRecord.data,
                    readStatus: dbRecord.read_status,
                    createdAt: dbRecord.created_at,
                    readAt: dbRecord.read_at,
                    expiresAt: dbRecord.expires_at
                });
            };
        
        return notifications;
    }
    
    # Mark notification as read
    # + notificationId - The notification ID
    # + userId - The user ID (for verification)
    # + return - Success or error
    public isolated function markAsRead(string notificationId, string userId) returns boolean|error {
        sql:ParameterizedQuery query = `
            UPDATE notifications 
            SET read_status = true, read_at = CURRENT_TIMESTAMP
            WHERE notification_id = ${notificationId} 
            AND user_id = ${userId}
        `;
        
        sql:ExecutionResult result = check self.dbClient->execute(query);
        return result.affectedRowCount > 0;
    }
    
    # Mark all notifications as read for a user
    # + userId - The user ID
    # + return - Number of notifications marked as read or error
    public isolated function markAllAsRead(string userId) returns int|error {
        sql:ParameterizedQuery query = `
            UPDATE notifications 
            SET read_status = true, read_at = CURRENT_TIMESTAMP
            WHERE user_id = ${userId} 
            AND read_status = false
        `;
        
        sql:ExecutionResult result = check self.dbClient->execute(query);
        return result.affectedRowCount ?: 0;
    }
    
    # Get unread notification count
    # + userId - The user ID
    # + return - Count of unread notifications or error
    public isolated function getUnreadCount(string userId) returns int|error {
        sql:ParameterizedQuery query = `
            SELECT COUNT(*) as count 
            FROM notifications 
            WHERE user_id = ${userId} 
            AND read_status = false
            AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
        `;
        
        record {| int count; |} result = check self.dbClient->queryRow(query);
        return result.count;
    }
}

# Notification request type
public type NotificationRequest record {|
    string userId;
    string notificationType;
    string title;
    string message;
    json data = {};
    time:Utc? expiresAt = ();
|};

# Notification type
public type Notification record {|
    string notificationId;
    string userId;
    string notificationType;
    string title;
    string message;
    json data;
    boolean readStatus;
    time:Civil createdAt;
    time:Civil? readAt;
    time:Civil? expiresAt;
|};

# Database notification record
type NotificationRecord record {|
    int id?;
    string notification_id;
    string user_id;
    string notification_type;
    string title;
    string message;
    json data;
    boolean read_status;
    time:Civil created_at;
    time:Civil? read_at;
    time:Civil? expires_at;
|};