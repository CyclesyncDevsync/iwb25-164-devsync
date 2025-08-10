import ballerina/http;
import ballerina/time;
import hp/Cyclesync.auth;
import hp/Cyclesync.user;
import hp/Cyclesync.admin;
import hp/Cyclesync.sms;
import hp/Cyclesync.common;

configurable int serverPort = 8080;
listener http:Listener httpListener = check new(serverPort);

// Initialize controllers
final user:UserController userController = check new();
final admin:AdminController adminController = check new();
final sms:SMSController smsController = check new();

// Health check endpoint
service / on httpListener {
    resource function get health() returns json {
        return {
            "status": "success",
            "message": "Cyclesync API is running",
            "data": {
                "version": common:APP_VERSION,
                "timestamp": time:utcToString(time:utcNow()),
                "status": "healthy"
            }
        };
    }
}

// User endpoints
service /api/user on httpListener {

    // Get current user profile
    resource function get profile(http:Request request) returns json|http:Response {
        return userController.getUserProfile(request);
    }

    // Update user profile
    resource function put profile(http:Request request) returns json|http:Response {
        return userController.updateUserProfile(request);
    }

    // Get user permissions
    resource function get permissions(http:Request request) returns json|http:Response {
        return userController.getUserPermissions(request);
    }

    // User logout
    resource function post logout(http:Request request) returns json|http:Response {
        return userController.logoutUser(request);
    }

    // Get user dashboard
    resource function get dashboard(http:Request request) returns json|http:Response {
        return userController.getUserDashboard(request);
    }

    // Update user preferences
    resource function put preferences(http:Request request) returns json|http:Response {
        return userController.updateUserPreferences(request);
    }

    // Get user notifications
    resource function get notifications(http:Request request) returns json|http:Response {
        return userController.getUserNotifications(request);
    }
}

// Admin endpoints
service /api/admin on httpListener {

    // Get all users
    resource function get users(http:Request request) returns json|http:Response {
        return adminController.getAllUsers(request);
    }

    // Get user by ID
    resource function get users/[string userId](http:Request request) returns json|http:Response {
        return adminController.getUserById(request, userId);
    }

    // Create new user
    resource function post users(http:Request request) returns json|http:Response {
        return adminController.createUser(request);
    }

    // Update user
    resource function put users/[string userId](http:Request request) returns json|http:Response {
        return adminController.updateUser(request, userId);
    }

    // Delete user
    resource function delete users/[string userId](http:Request request) returns json|http:Response {
        return adminController.deleteUser(request, userId);
    }

    // Get system statistics
    resource function get stats(http:Request request) returns json|http:Response {
        return adminController.getSystemStats(request);
    }

    // Get audit logs
    resource function get audit(http:Request request) returns json|http:Response {
        return adminController.getAuditLogs(request);
    }

    // Update user roles
    resource function put users/[string userId]/roles(http:Request request) returns json|http:Response {
        return adminController.updateUserRoles(request, userId);
    }
}

// SMS endpoints
service /api/sms on httpListener {

    // Send SMS
    resource function post send(http:Request request) returns json|http:Response {
        return smsController.sendSMS(request);
    }

    // Send bulk SMS
    resource function post 'bulk(http:Request request) returns json|http:Response {
        return smsController.sendBulkSMS(request);
    }

    // Get SMS status
    resource function get status/[string messageId](http:Request request) returns json|http:Response {
        return smsController.getSMSStatus(request, messageId);
    }

    // Get SMS templates
    resource function get templates(http:Request request) returns json|http:Response {
        return smsController.getSMSTemplates(request);
    }

    // Create SMS template
    resource function post templates(http:Request request) returns json|http:Response {
        return smsController.createSMSTemplate(request);
    }
}
