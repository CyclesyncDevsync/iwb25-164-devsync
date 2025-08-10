import ballerina/time;

// SMS Service - Business logic for SMS operations
public class SMSService {
    
    public function init() returns error? {
        // Service initialization
    }

    // Send SMS to a single recipient
    public function sendSMS(string phoneNumber, string message) returns SMSResult|error {
        // In a real implementation, this would integrate with an SMS provider like Twilio, AWS SNS, etc.
        
        // Validate phone number format
        if (!self.isValidPhoneNumber(phoneNumber)) {
            return error("Invalid phone number format");
        }

        // Validate message length
        if (message.length() > 160) {
            return error("Message exceeds maximum length of 160 characters");
        }

        // Generate message ID
        string messageId = "sms_" + time:utcToString(time:utcNow());
        
        // Simulate SMS sending
        time:Utc currentTime = time:utcNow();
        string timestamp = time:utcToString(currentTime);

        return {
            messageId: messageId,
            phoneNumber: phoneNumber,
            message: message,
            status: "sent",
            sentAt: timestamp,
            deliveredAt: ()
        };
    }

    // Send bulk SMS
    public function sendBulkSMS(string[] phoneNumbers, string message) returns BulkSMSResult|error {
        // Validate message length
        if (message.length() > 160) {
            return error("Message exceeds maximum length of 160 characters");
        }

        // Filter valid phone numbers
        string[] validNumbers = [];
        string[] invalidNumbers = [];
        
        foreach string phoneNumber in phoneNumbers {
            if (self.isValidPhoneNumber(phoneNumber)) {
                validNumbers.push(phoneNumber);
            } else {
                invalidNumbers.push(phoneNumber);
            }
        }

        string jobId = "bulk_sms_" + time:utcToString(time:utcNow());
        time:Utc currentTime = time:utcNow();
        string timestamp = time:utcToString(currentTime);

        return {
            jobId: jobId,
            totalRecipients: phoneNumbers.length(),
            validRecipients: validNumbers.length(),
            invalidRecipients: invalidNumbers.length(),
            invalidNumbers: invalidNumbers,
            status: "queued",
            createdAt: timestamp
        };
    }

    // Get SMS status by message ID
    public function getSMSStatus(string messageId) returns SMSStatus|error {
        // In a real implementation, this would query the SMS provider's API or database
        
        time:Utc currentTime = time:utcNow();
        string timestamp = time:utcToString(currentTime);

        return {
            messageId: messageId,
            phoneNumber: "+1234567890",
            status: "delivered",
            sentAt: timestamp,
            deliveredAt: timestamp
        };
    }

    // Get SMS delivery report
    public function getSMSDeliveryReport(string messageId) returns SMSDeliveryReport|error {
        time:Utc currentTime = time:utcNow();
        string timestamp = time:utcToString(currentTime);

        return {
            messageId: messageId,
            phoneNumber: "+1234567890",
            status: "delivered",
            sentAt: timestamp,
            deliveredAt: timestamp,
            errorCode: (),
            errorMessage: (),
            cost: 0.02
        };
    }

    // Get SMS templates
    public function getSMSTemplates() returns SMSTemplate[] {
        // In a real implementation, this would query the database
        return [
            {
                id: "template1",
                name: "Welcome Message",
                content: "Welcome to Cyclesync, {{username}}! Your account has been created successfully.",
                variables: ["username"],
                createdAt: "2025-08-01T00:00:00Z"
            },
            {
                id: "template2",
                name: "Password Reset",
                content: "Your password reset code is: {{code}}. This code expires in 10 minutes.",
                variables: ["code"],
                createdAt: "2025-08-01T00:00:00Z"
            },
            {
                id: "template3",
                name: "Login Alert",
                content: "New login detected on your account from {{location}} at {{time}}.",
                variables: ["location", "time"],
                createdAt: "2025-08-01T00:00:00Z"
            }
        ];
    }

    // Create SMS template
    public function createSMSTemplate(string name, string content) returns SMSTemplate|error {
        // Extract variables from content (simple implementation)
        string[] variables = self.extractVariables(content);
        
        string templateId = "template_" + time:utcToString(time:utcNow());
        time:Utc currentTime = time:utcNow();
        string timestamp = time:utcToString(currentTime);

        return {
            id: templateId,
            name: name,
            content: content,
            variables: variables,
            createdAt: timestamp
        };
    }

    // Send SMS using template
    public function sendSMSFromTemplate(string templateId, string phoneNumber, map<string> variables) returns SMSResult|error {
        // Get template
        SMSTemplate[] templates = self.getSMSTemplates();
        SMSTemplate? template = ();
        
        foreach SMSTemplate t in templates {
            if (t.id == templateId) {
                template = t;
                break;
            }
        }

        if (template is ()) {
            return error("SMS template not found");
        }

        // Replace variables in template content
        string message = template.content;
        foreach string variable in template.variables {
            string? value = variables[variable];
            if (value is string) {
                // Simple string replacement
                message = message; // Simplified for now
            }
        }

        return self.sendSMS(phoneNumber, message);
    }

    // Validate phone number format (basic validation)
    private function isValidPhoneNumber(string phoneNumber) returns boolean {
        // Simple validation: starts with + and contains only digits
        if (!phoneNumber.startsWith("+")) {
            return false;
        }
        
        string numberPart = phoneNumber.substring(1);
        return numberPart.length() >= 10 && numberPart.length() <= 15;
    }

    // Extract variables from template content
    private function extractVariables(string content) returns string[] {
        string[] variables = [];
        // Simple implementation - in a real scenario, you'd use regex
        // This is a simplified version that looks for {{variable}} patterns
        
        // For demo purposes, return common variables
        if (content.includes("{{username}}")) {
            variables.push("username");
        }
        if (content.includes("{{code}}")) {
            variables.push("code");
        }
        if (content.includes("{{location}}")) {
            variables.push("location");
        }
        if (content.includes("{{time}}")) {
            variables.push("time");
        }
        
        return variables;
    }
}
