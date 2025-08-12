// Copyright (c) 2025 CircularSync
// Chatbot Module - Type Definitions

import ballerina/time;

# Represents a chat message from user or bot
public type ChatMessage record {|
    # Message type (user_message, bot_response)
    string 'type;
    # Message content
    string content;
    # User ID
    string userId?;
    # Session ID
    string sessionId;
    # Timestamp
    time:Utc timestamp?;
    # Additional metadata
    map<json> metadata?;
|};

# Represents user intent recognized from message
public type Intent record {|
    # Intent category
    IntentType category;
    # Confidence score (0-1)
    float confidence;
    # Extracted entities
    map<string> entities;
    # Original user query
    string query;
|};

# Intent categories
public enum IntentType {
    QUALITY_CHECK,
    DEMAND_PREDICTION,
    BIDDING_ADVICE,
    TRANSACTION_TRACKING,
    SCHEDULING,
    GENERAL_FAQ,
    GREETING,
    GOODBYE,
    UNKNOWN
}

# Conversation context maintained across messages
public type ConversationContext record {|
    # Session ID
    string sessionId;
    # User ID
    string userId;
    # Conversation history
    ChatMessage[] history;
    # Current intent
    Intent? currentIntent;
    # User preferences
    UserPreferences preferences;
    # Context variables
    map<json> variables;
    # Last activity timestamp
    time:Utc lastActivity;
    # Session start time
    time:Utc startTime;
|};

# User preferences and settings
public type UserPreferences record {|
    # Preferred language
    string language = "en";
    # Response verbosity
    VerbosityLevel verbosity = NORMAL;
    # Notification preferences
    boolean enableNotifications = true;
    # Preferred waste types
    string[] interestedWasteTypes = [];
    # Location
    string? location;
|};

public enum VerbosityLevel {
    BRIEF,
    NORMAL,
    DETAILED
}

# Chatbot response structure
public type ChatbotResponse record {|
    # Response type
    string 'type = "bot_response";
    # Main response content
    string content;
    # Detected intent
    Intent? intent;
    # Suggested actions
    SuggestedAction[] actions?;
    # Quick reply suggestions
    string[] suggestions?;
    # Response metadata
    ResponseMetadata metadata?;
    # Timestamp
    time:Utc timestamp;
|};

# Suggested action for rich responses
public type SuggestedAction record {|
    # Action type
    ActionType 'type;
    # Display label
    string label;
    # Action data
    map<json> data;
    # Action URL if applicable
    string? url;
|};

public enum ActionType {
    SHOW_DETAILS,
    NAVIGATE,
    CALL_API,
    SHOW_CHART,
    DOWNLOAD_REPORT,
    SCHEDULE_CALLBACK
}

# Response metadata
public type ResponseMetadata record {|
    # Processing time in ms
    int processingTime;
    # Data sources used
    string[] dataSources;
    # Confidence score
    float confidence;
    # Response ID
    string responseId;
|};

# Gemini AI request structure
public type GeminiRequest record {|
    # Model to use
    string model = "gemini-pro";
    # Prompt/messages
    GeminiMessage[] messages;
    # Temperature (0-1)
    float temperature = 0.7;
    # Max tokens
    int maxTokens = 2048;
    # Top P
    float topP = 0.9;
|};

# Gemini message structure
public type GeminiMessage record {|
    # Role (user, assistant, system)
    string role;
    # Message content
    string content;
|};

# Gemini response structure
public type GeminiResponse record {|
    # Generated text
    string text;
    # Finish reason
    string finishReason;
    # Usage statistics
    GeminiUsage usage;
|};

# Gemini usage statistics
public type GeminiUsage record {|
    # Prompt tokens
    int promptTokens;
    # Completion tokens
    int completionTokens;
    # Total tokens
    int totalTokens;
|};

# WebSocket connection info
public type ConnectionInfo record {|
    # Connection ID
    string connectionId;
    # User ID
    string userId;
    # Session ID
    string sessionId;
    # Connection time
    time:Utc connectedAt;
    # Last ping time
    time:Utc lastPing?;
    # Connection metadata
    map<string> metadata;
|};

# Chat analytics data
public type ChatAnalytics record {|
    # Total messages
    int totalMessages;
    # Average response time
    float avgResponseTime;
    # Intent distribution
    map<int> intentCounts;
    # User satisfaction
    float satisfaction;
    # Error rate
    float errorRate;
|};

# Error response
public type ChatError record {|
    # Error code
    string code;
    # Error message
    string message;
    # Error details
    map<json>? details;
    # Timestamp
    time:Utc timestamp;
|};

# Business data integration types
public type QualityCheckRequest record {|
    # Batch ID or waste type
    string identifier;
    # Date range
    DateRange? dateRange;
    # Location filter
    string? location;
|};

public type DemandPredictionRequest record {|
    # Waste type
    string wasteType;
    # Location
    string location;
    # Forecast period
    ForecastPeriod period;
|};

public type DateRange record {|
    # Start date
    time:Date startDate;
    # End date
    time:Date endDate;
|};

public enum ForecastPeriod {
    WEEK,
    MONTH,
    QUARTER
}

# Session management types
public type Session record {|
    # Session ID
    string id;
    # User ID
    string userId;
    # Conversation context
    ConversationContext context;
    # Session status
    SessionStatus status;
    # Created timestamp
    time:Utc created;
    # Last updated
    time:Utc lastUpdated;
    # Expiry time
    time:Utc expiresAt;
|};

public enum SessionStatus {
    ACTIVE,
    IDLE,
    EXPIRED,
    CLOSED
}

# Rate limiting
public type RateLimitInfo record {|
    # User ID
    string userId;
    # Current count
    int messageCount;
    # Window start time
    time:Utc windowStart;
    # Rate limit
    int rateLimit;
    # Remaining
    int remaining;
|};

# System prompt configuration
public type SystemPromptConfig record {|
    # Base system prompt
    string basePrompt;
    # Context injections
    map<string> contextInjections;
    # Example conversations
    ExampleConversation[] examples;
|};

# Example conversation for few-shot learning
public type ExampleConversation record {|
    # User input
    string userInput;
    # Expected response
    string expectedResponse;
    # Intent category
    IntentType intent;
|};