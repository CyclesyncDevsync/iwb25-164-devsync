import ballerina/test;
import hp/Cyclesync.sms;

// Test SMS Service
@test:Config {}
function testSMSServiceInit() returns error? {
    sms:SMSService|error smsService = new();
    test:assertTrue(smsService is sms:SMSService, "SMS service should be initialized");
}

@test:Config {}
function testSendSMSValid() returns error? {
    sms:SMSService|error smsServiceResult = new();
    test:assertTrue(smsServiceResult is sms:SMSService, "SMS service should be initialized");
    
    if (smsServiceResult is sms:SMSService) {
        sms:SMSService smsService = smsServiceResult;
        string phoneNumber = "+1234567890";
        string message = "Test SMS message";
        
        sms:SMSResult|error result = smsService.sendSMS(phoneNumber, message);
        test:assertTrue(result is sms:SMSResult, "Should return SMS result for valid input");
        
        if (result is sms:SMSResult) {
            test:assertEquals(result.phoneNumber, phoneNumber, "Phone number should match");
            test:assertEquals(result.message, message, "Message should match");
            test:assertEquals(result.status, "sent", "Status should be 'sent'");
            test:assertTrue(result.messageId.length() > 0, "Message ID should not be empty");
        }
    }
}

@test:Config {}
function testSendSMSInvalidPhoneNumber() returns error? {
    sms:SMSService smsService = new();
    string invalidPhoneNumber = "123"; // Invalid format
    string message = "Test SMS message";
    
    sms:SMSResult|error result = smsService.sendSMS(invalidPhoneNumber, message);
    test:assertTrue(result is error, "Should return error for invalid phone number");
}

@test:Config {}
function testSendSMSLongMessage() returns error? {
    sms:SMSService|error smsServiceResult = new();
    test:assertTrue(smsServiceResult is sms:SMSService, "SMS service should be initialized");
    
    if (smsServiceResult is sms:SMSService) {
        sms:SMSService smsService = smsServiceResult;
        string phoneNumber = "+1234567890";
        string longMessage = "A";
        int i = 0;
        while (i < 199) {
            longMessage = longMessage + "A";
            i = i + 1;
        }
        
        sms:SMSResult|error result = smsService.sendSMS(phoneNumber, longMessage);
        test:assertTrue(result is error, "Should return error for message exceeding length limit");
    }
}

@test:Config {}
function testSendBulkSMS() returns error? {
    sms:SMSService smsService = new();
    string[] phoneNumbers = ["+1234567890", "+1234567891", "+1234567892"];
    string message = "Bulk SMS test message";
    
    sms:BulkSMSResult|error result = smsService.sendBulkSMS(phoneNumbers, message);
    test:assertTrue(result is sms:BulkSMSResult, "Should return bulk SMS result");
    
    if (result is sms:BulkSMSResult) {
        test:assertEquals(result.totalRecipients, phoneNumbers.length(), "Total recipients should match");
        test:assertEquals(result.validRecipients, phoneNumbers.length(), "All recipients should be valid");
        test:assertEquals(result.status, "queued", "Status should be 'queued'");
    }
}

@test:Config {}
function testSendBulkSMSWithInvalidNumbers() returns error? {
    sms:SMSService smsService = new();
    string[] phoneNumbers = ["+1234567890", "invalid", "+1234567892"];
    string message = "Bulk SMS test message";
    
    sms:BulkSMSResult|error result = smsService.sendBulkSMS(phoneNumbers, message);
    test:assertTrue(result is sms:BulkSMSResult, "Should return bulk SMS result");
    
    if (result is sms:BulkSMSResult) {
        test:assertEquals(result.totalRecipients, phoneNumbers.length(), "Total recipients should match");
        test:assertEquals(result.validRecipients, 2, "Two recipients should be valid");
        test:assertEquals(result.invalidRecipients, 1, "One recipient should be invalid");
        test:assertEquals(result.invalidNumbers.length(), 1, "Should have one invalid number");
    }
}

@test:Config {}
function testGetSMSStatus() returns error? {
    sms:SMSService smsService = new();
    string messageId = "test-message-123";
    
    sms:SMSStatus|error result = smsService.getSMSStatus(messageId);
    test:assertTrue(result is sms:SMSStatus, "Should return SMS status");
    
    if (result is sms:SMSStatus) {
        test:assertEquals(result.messageId, messageId, "Message ID should match");
        test:assertTrue(result.status.length() > 0, "Status should not be empty");
        test:assertTrue(result.phoneNumber.startsWith("+"), "Phone number should be valid format");
    }
}

@test:Config {}
function testGetSMSTemplates() {
    sms:SMSService smsService = new();
    
    sms:SMSTemplate[] templates = smsService.getSMSTemplates();
    test:assertTrue(templates.length() > 0, "Should return at least one template");
    
    foreach sms:SMSTemplate template in templates {
        test:assertTrue(template.id.length() > 0, "Template ID should not be empty");
        test:assertTrue(template.name.length() > 0, "Template name should not be empty");
        test:assertTrue(template.content.length() > 0, "Template content should not be empty");
    }
}

@test:Config {}
function testCreateSMSTemplate() returns error? {
    sms:SMSService smsService = new();
    string templateName = "Test Template";
    string templateContent = "Hello {{username}}, welcome to our service!";
    
    sms:SMSTemplate|error result = smsService.createSMSTemplate(templateName, templateContent);
    test:assertTrue(result is sms:SMSTemplate, "Should return created template");
    
    if (result is sms:SMSTemplate) {
        test:assertEquals(result.name, templateName, "Template name should match");
        test:assertEquals(result.content, templateContent, "Template content should match");
        test:assertTrue(result.id.length() > 0, "Template ID should not be empty");
        test:assertTrue(result.variables.length() > 0, "Should extract variables from content");
    }
}

@test:Config {}
function testSendSMSFromTemplate() returns error? {
    sms:SMSService smsService = new();
    string templateId = "template1"; // Using existing template from getSMSTemplates
    string phoneNumber = "+1234567890";
    map<string> variables = {
        "username": "John Doe"
    };
    
    sms:SMSResult|error result = smsService.sendSMSFromTemplate(templateId, phoneNumber, variables);
    test:assertTrue(result is sms:SMSResult, "Should return SMS result for template-based SMS");
    
    if (result is sms:SMSResult) {
        test:assertEquals(result.phoneNumber, phoneNumber, "Phone number should match");
        test:assertTrue(result.message.includes("John Doe"), "Message should contain replaced variable");
    }
}

// Test SMS Controller
@test:Config {}
function testSMSControllerInit() returns error? {
    sms:SMSController smsController = new();
    test:assertTrue(smsController is sms:SMSController, "SMS controller should be initialized");
}
