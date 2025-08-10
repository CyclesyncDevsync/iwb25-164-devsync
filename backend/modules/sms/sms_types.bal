// SMS-related type definitions

public type SMSResult record {|
    string messageId;
    string phoneNumber;
    string message;
    string status; // "sent" | "delivered" | "failed" | "pending"
    string sentAt;
    string? deliveredAt;
|};

public type SMSStatus record {|
    string messageId;
    string phoneNumber;
    string status; // "sent" | "delivered" | "failed" | "pending"
    string sentAt;
    string? deliveredAt;
|};

public type SMSDeliveryReport record {|
    string messageId;
    string phoneNumber;
    string status;
    string sentAt;
    string? deliveredAt;
    string? errorCode;
    string? errorMessage;
    float cost; // Cost in dollars
|};

public type BulkSMSResult record {|
    string jobId;
    int totalRecipients;
    int validRecipients;
    int invalidRecipients;
    string[] invalidNumbers;
    string status; // "queued" | "processing" | "completed" | "failed"
    string createdAt;
|};

public type BulkSMSStatus record {|
    string jobId;
    int totalRecipients;
    int sentCount;
    int deliveredCount;
    int failedCount;
    string status;
    string createdAt;
    string? completedAt;
|};

public type SMSTemplate record {|
    string id;
    string name;
    string content;
    string[] variables;
    string createdAt;
|};

public type CreateSMSTemplateRequest record {|
    string name;
    string content;
    string[]? variables;
|};

public type SendSMSRequest record {|
    string phoneNumber;
    string message;
|};

public type SendBulkSMSRequest record {|
    string[] phoneNumbers;
    string message;
|};

public type SendSMSFromTemplateRequest record {|
    string templateId;
    string phoneNumber;
    map<string> variables;
|};

public type SMSProvider record {|
    string name;
    string endpoint;
    string apiKey;
    boolean enabled;
|};

public type SMSConfiguration record {|
    SMSProvider defaultProvider;
    int maxMessageLength;
    int dailyLimit;
    boolean enableDeliveryReports;
|};
