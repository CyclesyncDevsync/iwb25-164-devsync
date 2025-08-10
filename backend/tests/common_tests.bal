import ballerina/test;
import hp/Cyclesync.common;

// Test Common Utilities
@test:Config {}
function testCreateSuccessResponse() {
    string message = "Operation successful";
    map<string> data = {"result": "success"};
    
    common:ApiResponse response = common:createSuccessResponse(message, data);
    
    test:assertEquals(response.status, "success", "Status should be 'success'");
    test:assertEquals(response.message, message, "Message should match");
    test:assertTrue(response.data is map<string>, "Data should be present");
    test:assertTrue(response.'error is (), "Error should be null");
}

@test:Config {}
function testCreateErrorResponse() {
    string message = "Operation failed";
    string code = "VALIDATION_ERROR";
    string details = "Field validation failed";
    
    common:ApiResponse response = common:createErrorResponse(message, code, details);
    
    test:assertEquals(response.status, "error", "Status should be 'error'");
    test:assertEquals(response.message, message, "Message should match");
    test:assertTrue(response.data is (), "Data should be null");
    test:assertTrue(response.'error is common:ErrorDetails, "Error should be present");
    
    if (response.'error is common:ErrorDetails) {
        common:ErrorDetails errorDetails = <common:ErrorDetails>response.'error;
        test:assertEquals(errorDetails.code, code, "Error code should match");
        test:assertEquals(errorDetails.message, message, "Error message should match");
        test:assertEquals(errorDetails.details, details, "Error details should match");
    }
}

@test:Config {}
function testCreatePaginatedResponse() {
    string[] items = ["item1", "item2", "item3"];
    int total = 25;
    int page = 2;
    int pageSize = 10;
    
    common:PaginatedResponse response = common:createPaginatedResponse(items, total, page, pageSize);
    
    test:assertEquals(response.items.length(), items.length(), "Items length should match");
    test:assertEquals(response.total, total, "Total should match");
    test:assertEquals(response.page, page, "Page should match");
    test:assertEquals(response.pageSize, pageSize, "Page size should match");
    test:assertEquals(response.totalPages, 3, "Total pages should be calculated correctly");
}

@test:Config {}
function testValidateEmail() {
    // Valid email
    common:ValidationResult validResult = common:validateEmail("test@example.com");
    test:assertTrue(validResult.isValid, "Valid email should pass validation");
    test:assertTrue(validResult.errors is (), "Valid email should have no errors");
    
    // Invalid email
    common:ValidationResult invalidResult = common:validateEmail("invalid-email");
    test:assertFalse(invalidResult.isValid, "Invalid email should fail validation");
    test:assertTrue(invalidResult.errors is common:ValidationError[], "Invalid email should have errors");
}

@test:Config {}
function testValidatePhoneNumber() {
    // Valid phone number
    common:ValidationResult validResult = common:validatePhoneNumber("+1234567890");
    test:assertTrue(validResult.isValid, "Valid phone number should pass validation");
    
    // Invalid phone number (no + prefix)
    common:ValidationResult invalidResult1 = common:validatePhoneNumber("1234567890");
    test:assertFalse(invalidResult1.isValid, "Phone number without + should fail validation");
    
    // Invalid phone number (too short)
    common:ValidationResult invalidResult2 = common:validatePhoneNumber("+123");
    test:assertFalse(invalidResult2.isValid, "Short phone number should fail validation");
}

@test:Config {}
function testValidateRequired() {
    // Valid value
    common:ValidationResult validResult = common:validateRequired("username", "testuser");
    test:assertTrue(validResult.isValid, "Non-empty value should pass validation");
    
    // Null value
    common:ValidationResult nullResult = common:validateRequired("username", ());
    test:assertFalse(nullResult.isValid, "Null value should fail validation");
    
    // Empty string
    common:ValidationResult emptyResult = common:validateRequired("username", "");
    test:assertFalse(emptyResult.isValid, "Empty string should fail validation");
}

@test:Config {}
function testValidateLength() {
    string field = "password";
    int minLength = 8;
    int maxLength = 20;
    
    // Valid length
    common:ValidationResult validResult = common:validateLength(field, "validpassword", minLength, maxLength);
    test:assertTrue(validResult.isValid, "Valid length should pass validation");
    
    // Too short
    common:ValidationResult shortResult = common:validateLength(field, "short", minLength, maxLength);
    test:assertFalse(shortResult.isValid, "Too short value should fail validation");
    
    // Too long
    string longString = "a";
    int i = 0;
    while (i < 24) {
        longString = longString + "a";
        i = i + 1;
    }
    common:ValidationResult longResult = common:validateLength("password", longString, minLength, maxLength);
    test:assertFalse(longResult.isValid, "Too long value should fail validation");
}

@test:Config {}
function testSanitizeString() {
    string input = "<script>alert('xss')</script>";
    string sanitized = common:sanitizeString(input);
    
    test:assertFalse(sanitized.includes("<script>"), "Should remove script tags");
    test:assertTrue(sanitized.includes("&lt;"), "Should escape < character");
    test:assertTrue(sanitized.includes("&gt;"), "Should escape > character");
}

@test:Config {}
function testGenerateId() {
    string id1 = common:generateId();
    string id2 = common:generateId("user");
    
    test:assertTrue(id1.length() > 0, "Generated ID should not be empty");
    test:assertTrue(id2.startsWith("user_"), "Prefixed ID should start with prefix");
    test:assertNotEquals(id1, id2, "Generated IDs should be unique");
}

@test:Config {}
function testRemoveDuplicates() {
    string[] input = ["a", "b", "a", "c", "b", "d"];
    string[] unique = common:removeDuplicates(input);
    
    test:assertEquals(unique.length(), 4, "Should remove duplicates");
    test:assertTrue(unique.indexOf("a") != (), "Should contain 'a'");
    test:assertTrue(unique.indexOf("b") != (), "Should contain 'b'");
    test:assertTrue(unique.indexOf("c") != (), "Should contain 'c'");
    test:assertTrue(unique.indexOf("d") != (), "Should contain 'd'");
}

@test:Config {}
function testPaginate() {
    anydata[] items = ["item1", "item2", "item3", "item4", "item5"];
    
    // First page
    anydata[] page1 = common:paginate(items, 1, 2);
    test:assertEquals(page1.length(), 2, "First page should have 2 items");
    test:assertEquals(page1[0], "item1", "First item should be correct");
    
    // Second page
    anydata[] page2 = common:paginate(items, 2, 2);
    test:assertEquals(page2.length(), 2, "Second page should have 2 items");
    test:assertEquals(page2[0], "item3", "First item of second page should be correct");
    
    // Last page (partial)
    anydata[] page3 = common:paginate(items, 3, 2);
    test:assertEquals(page3.length(), 1, "Last page should have 1 item");
    test:assertEquals(page3[0], "item5", "Last item should be correct");
    
    // Out of bounds
    anydata[] page4 = common:paginate(items, 4, 2);
    test:assertEquals(page4.length(), 0, "Out of bounds page should be empty");
}

@test:Config {}
function testMaskSensitiveData() {
    string sensitiveData = "1234567890";
    string masked = common:maskSensitiveData(sensitiveData, 4);
    
    test:assertTrue(masked.startsWith("1234"), "Should show first 4 characters");
    test:assertTrue(masked.endsWith("******"), "Should mask remaining characters");
}

@test:Config {}
function testMaskEmail() {
    string email = "test@example.com";
    string masked = common:maskEmail(email);
    
    test:assertTrue(masked.startsWith("te"), "Should show first 2 characters");
    test:assertTrue(masked.includes("@example.com"), "Should keep domain intact");
    test:assertTrue(masked.includes("*"), "Should mask part of local part");
}
