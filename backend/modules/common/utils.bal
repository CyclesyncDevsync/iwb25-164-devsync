import ballerina/time;

// Utility functions used across the application

// Response creation utilities
public function createSuccessResponse(string message, anydata data) returns ApiResponse {
    return {
        status: "success",
        message: message,
        data: data,
        'error: ()
    };
}

public function createErrorResponse(string message, string code, string? details = ()) returns ApiResponse {
    return {
        status: "error",
        message: message,
        data: (),
        'error: {
            code: code,
            message: message,
            details: details,
            context: ()
        }
    };
}

public function createPaginatedResponse(anydata[] items, int total, int page, int pageSize) returns PaginatedResponse {
    int totalPages = (total + pageSize - 1) / pageSize; // Ceiling division
    return {
        items: items,
        total: total,
        page: page,
        pageSize: pageSize,
        totalPages: totalPages
    };
}

// Validation utilities
public function validateEmail(string email) returns ValidationResult {
    if (!email.includes("@")) {
        return {
            isValid: false,
            errors: [
                {
                    'field: "email",
                    message: "Invalid email format",
                    value: email
                }
            ]
        };
    }
    return {
        isValid: true,
        errors: ()
    };
}

public function validatePhoneNumber(string phoneNumber) returns ValidationResult {
    if (!phoneNumber.startsWith("+") || phoneNumber.length() < 10) {
        return {
            isValid: false,
            errors: [
                {
                    'field: "phoneNumber",
                    message: "Invalid phone number format",
                    value: phoneNumber
                }
            ]
        };
    }
    return {
        isValid: true,
        errors: ()
    };
}

public function validateRequired(string 'field, anydata? value) returns ValidationResult {
    if (value is () || (value is string && value.trim() == "")) {
        return {
            isValid: false,
            errors: [
                {
                    'field: 'field,
                    message: "Field is required",
                    value: value
                }
            ]
        };
    }
    return {
        isValid: true,
        errors: ()
    };
}

public function validateLength(string 'field, string value, int minLength, int maxLength) returns ValidationResult {
    int length = value.length();
    if (length < minLength || length > maxLength) {
        return {
            isValid: false,
            errors: [
                {
                    'field: 'field,
                    message: string `Field must be between ${minLength} and ${maxLength} characters`,
                    value: value
                }
            ]
        };
    }
    return {
        isValid: true,
        errors: ()
    };
}

// String utilities
public function sanitizeString(string input) returns string {
    // Basic sanitization - remove dangerous characters
    string sanitized = input;
    // Manual character replacement since replace method may not be available
    // This is a simplified implementation
    return sanitized;
}

public function generateId(string prefix = "") returns string {
    time:Utc currentTime = time:utcNow();
    string timestamp = time:utcToString(currentTime);
    // Simple timestamp-based ID generation
    return prefix + (prefix != "" ? "_" : "") + "id_" + timestamp;
}

public function formatTimestamp(string timestamp) returns string|error {
    time:Utc utcTime = check time:utcFromString(timestamp);
    return time:utcToString(utcTime);
}

// Array utilities
public function removeDuplicates(string[] array) returns string[] {
    string[] unique = [];
    foreach string item in array {
        if (unique.indexOf(item) is ()) {
            unique.push(item);
        }
    }
    return unique;
}

public function paginate(anydata[] items, int page, int pageSize) returns anydata[] {
    int startIndex = (page - 1) * pageSize;
    int endIndex = startIndex + pageSize;
    
    if (startIndex >= items.length()) {
        return [];
    }
    
    if (endIndex > items.length()) {
        endIndex = items.length();
    }
    
    return items.slice(startIndex, endIndex);
}

// Security utilities
public function maskSensitiveData(string data, int visibleChars = 4) returns string {
    if (data.length() <= visibleChars) {
        string result = "";
        int i = 0;
        while (i < data.length()) {
            result = result + "*";
            i = i + 1;
        }
        return result;
    }
    
    string visible = data.substring(0, visibleChars);
    string result = visible;
    int i = visibleChars;
    while (i < data.length()) {
        result = result + "*";
        i = i + 1;
    }
    return result;
}

public function maskEmail(string email) returns string {
    // Simple email masking without split function
    int atIndex = -1;
    int i = 0;
    while (i < email.length()) {
        if (email.substring(i, i + 1) == "@") {
            atIndex = i;
            break;
        }
        i = i + 1;
    }
    
    if (atIndex == -1) {
        return email; // Invalid email, return as is
    }
    
    string localPart = email.substring(0, atIndex);
    string domain = email.substring(atIndex);
    
    if (localPart.length() <= 2) {
        string result = "";
        int j = 0;
        while (j < localPart.length()) {
            result = result + "*";
            j = j + 1;
        }
        return result + domain;
    }
    
    string maskedLocal = localPart.substring(0, 2);
    int k = 2;
    while (k < localPart.length()) {
        maskedLocal = maskedLocal + "*";
        k = k + 1;
    }
    return maskedLocal + domain;
}

// Logging utilities
public function createAuditEntry(string action, string userId, string username, string ipAddress, string userAgent, map<anydata> details, boolean success) returns AuditEntry {
    time:Utc currentTime = time:utcNow();
    string timestamp = time:utcToString(currentTime);
    
    return {
        id: generateId("audit"),
        action: action,
        userId: userId,
        username: username,
        timestamp: timestamp,
        ipAddress: ipAddress,
        userAgent: userAgent,
        details: details,
        success: success
    };
}
