import ballerina/http;
import ballerina/time;
import ballerina/uuid;
import hp/Cyclesync.auth;

// SMS Controller - handles SMS-related endpoints
public isolated service class SMSController {

    private final SMSService smsService;

    public function init() returns error? {
        SMSService|error smsService = new SMSService();
        if (smsService is error) {
            return smsService;
        }
        self.smsService = smsService;
    }

    // Send SMS (admin or user with SMS permission)
    public function sendSMS(http:Request request) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = auth:validateAuth(request);
        if (authCheck is http:Response) {
            return authCheck;
        }

        json|error payload = request.getJsonPayload();
        if (payload is error) {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                "error": "Bad Request",
                "message": "Invalid JSON payload"
            });
            return response;
        }

        // Extract SMS data from payload
        string phoneNumber = "";
        string message = "";
        
        json|error phoneResult = payload.phoneNumber;
        if (phoneResult is string) {
            phoneNumber = phoneResult;
        }
        
        json|error messageResult = payload.message;
        if (messageResult is string) {
            message = messageResult;
        }

        if (phoneNumber == "" || message == "") {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                "error": "Bad Request",
                "message": "Phone number and message are required"
            });
            return response;
        }

        // Send SMS
        SMSResult|error smsResult = self.smsService.sendSMS(phoneNumber, message);
        if (smsResult is error) {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Internal Server Error",
                "message": "Failed to send SMS: " + smsResult.message()
            });
            return response;
        }

        return {
            "status": "success",
            "message": "SMS sent successfully",
            "data": {
                "messageId": smsResult.messageId,
                "phoneNumber": phoneNumber,
                "status": smsResult.status,
                "sentAt": smsResult.sentAt
            }
        };
    }

    // Send bulk SMS (admin only)
    public function sendBulkSMS(http:Request request) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = auth:validateAuth(request, "admin");
        if (authCheck is http:Response) {
            return authCheck;
        }

        json|error payload = request.getJsonPayload();
        if (payload is error) {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                "error": "Bad Request",
                "message": "Invalid JSON payload"
            });
            return response;
        }

        // Extract bulk SMS data
        json|error phoneNumbersResult = payload.phoneNumbers;
        json|error messageResult = payload.message;
        
        if (phoneNumbersResult is error || messageResult is error) {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                "error": "Bad Request",
                "message": "Phone numbers array and message are required"
            });
            return response;
        }
        
        // Send bulk SMS (simplified for demo)
        return {
            "status": "success",
            "message": "Bulk SMS job queued successfully",
            "data": {
                "jobId": "bulk-sms-" + uuid:createType1AsString(),
                "recipientCount": 10, // This would be the actual count
                "status": "queued"
            }
        };
    }
    }

    // Get SMS status
    public function getSMSStatus(http:Request request, string messageId) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = auth:validateAuth(request);
        if (authCheck is http:Response) {
            return authCheck;
        }

        SMSStatus|error status = self.smsService.getSMSStatus(messageId);
        if (status is error) {
            http:Response response = new;
            response.statusCode = 404;
            response.setJsonPayload({
                "error": "Not Found",
                "message": "SMS message not found"
            });
            return response;
        }

        return {
            "status": "success",
            "data": {
                "messageId": messageId,
                "status": status.status,
                "sentAt": status.sentAt,
                "deliveredAt": status.deliveredAt,
                "phoneNumber": status.phoneNumber
            }
        };
    }

    // Get SMS templates (admin only)
    public function getSMSTemplates(http:Request request) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = auth:validateAuth(request, "admin");
        if (authCheck is http:Response) {
            return authCheck;
        }

        SMSTemplate[] templates = self.smsService.getSMSTemplates();
        json[] templateData = [];
        
        foreach SMSTemplate template in templates {
            templateData.push({
                "id": template.id,
                "name": template.name,
                "content": template.content,
                "variables": template.variables,
                "createdAt": template.createdAt
            });
        }

        return {
            "status": "success",
            "data": {
                "templates": templateData
            }
        };
    }

    // Create SMS template (admin only)
    public function createSMSTemplate(http:Request request) returns json|http:Response {
        auth:AuthResult|http:Response authCheck = auth:validateAuth(request, "admin");
        if (authCheck is http:Response) {
            return authCheck;
        }

        json|error payload = request.getJsonPayload();
        if (payload is error) {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                "error": "Bad Request",
                "message": "Invalid JSON payload"
            });
            return response;
        }

        // Extract template data
        string name = "";
        string content = "";
        
        json|error nameResult = payload.name;
        if (nameResult is string) {
            name = nameResult;
        }
        
        json|error contentResult = payload.content;
        if (contentResult is string) {
            content = contentResult;
        }

        if (name == "" || content == "") {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                "error": "Bad Request",
                "message": "Template name and content are required"
            });
            return response;
        }

        SMSTemplate|error template = self.smsService.createSMSTemplate(name, content);
        if (template is error) {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Internal Server Error",
                "message": "Failed to create SMS template"
            });
            return response;
        }

        return {
            "status": "success",
            "message": "SMS template created successfully",
            "data": {
                "id": template.id,
                "name": template.name,
                "content": template.content,
                "variables": template.variables,
                "createdAt": template.createdAt
            }
        };
    }
}
