// Copyright (c) 2025 CircularSync
// Chatbot Module - Conversation Manager

import ballerina/log;
import ballerina/time;
import ballerina/uuid;
import ballerina/lang.value;

# Manages conversation state and context
public isolated class ConversationManager {
    private final RedisConnector redis;
    private final int sessionTimeout;
    private final int maxHistorySize;
    private final string sessionPrefix = "session:";
    private final string contextPrefix = "context:";
    private final string historyPrefix = "history:";
    
    # Initialize conversation manager
    # + sessionTimeout - Session timeout in seconds (default: 1800 = 30 minutes)
    # + maxHistorySize - Maximum conversation history size (default: 50)
    public isolated function init(int sessionTimeout = 1800, int maxHistorySize = 50) returns error? {
        self.sessionTimeout = sessionTimeout;
        self.maxHistorySize = maxHistorySize;
        
        // Initialize Redis connection
        self.redis = check new(redisHost, redisPort, redisPassword, redisDatabase);
        
        // Test connection
        boolean connected = check self.redis.ping();
        if !connected {
            return error("Failed to connect to Redis");
        }
        
        log:printInfo("ConversationManager initialized with Redis backend");
    }
    
    # Create new session
    # + userId - User ID
    # + metadata - Session metadata
    # + return - Session ID or error
    public isolated function createSession(string userId, map<string>? metadata = ()) returns string|error {
        string sessionId = uuid:createType4AsString();
        
        Session session = {
            id: sessionId,
            userId: userId,
            context: {
                sessionId: sessionId,
                userId: userId,
                history: [],
                currentIntent: (),
                preferences: {
                    language: "en",
                    verbosity: NORMAL,
                    enableNotifications: true,
                    interestedWasteTypes: [],
                    location: ()
                },
                variables: {},
                lastActivity: time:utcNow(),
                startTime: time:utcNow()
            },
            status: ACTIVE,
            created: time:utcNow(),
            lastUpdated: time:utcNow(),
            expiresAt: time:utcAddSeconds(time:utcNow(), <time:Seconds>self.sessionTimeout)
        };
        
        // Store session in Redis
        string sessionKey = self.sessionPrefix + sessionId;
        string sessionJson = session.toJsonString();
        _ = check self.redis.set(sessionKey, sessionJson, self.sessionTimeout);
        
        // Store context separately for easier updates
        string contextKey = self.contextPrefix + sessionId;
        string contextJson = session.context.toJsonString();
        _ = check self.redis.set(contextKey, contextJson, self.sessionTimeout);
        
        log:printInfo(string `Created new session: ${sessionId} for user: ${userId}`);
        
        return sessionId;
    }
    
    # Get session
    # + sessionId - Session ID
    # + return - Session or error
    public isolated function getSession(string sessionId) returns Session|error {
        string sessionKey = self.sessionPrefix + sessionId;
        string? sessionJson = check self.redis.get(sessionKey);
        
        if sessionJson is () {
            return error(string `Session not found: ${sessionId}`);
        }
        
        json sessionData = check value:fromJsonString(sessionJson);
        Session session = check sessionData.cloneWithType(Session);
        
        // Check if session expired
        if time:utcDiffSeconds(session.expiresAt, time:utcNow()) < <time:Seconds>0 {
            _ = check self.redis.del(sessionKey);
            _ = check self.redis.del(self.contextPrefix + sessionId);
            _ = check self.redis.del(self.historyPrefix + sessionId);
            return error(string `Session expired: ${sessionId}`);
        }
        
        return session;
    }
    
    # Update session context
    # + sessionId - Session ID
    # + context - Updated context
    # + return - Error if any
    public isolated function updateContext(string sessionId, ConversationContext context) returns error? {
        Session session = check self.getSession(sessionId);
        
        session.context = context;
        session.lastUpdated = time:utcNow();
        session.expiresAt = time:utcAddSeconds(time:utcNow(), <time:Seconds>self.sessionTimeout);
        
        // Trim history if needed
        if session.context.history.length() > self.maxHistorySize {
            session.context.history = session.context.history.slice(
                session.context.history.length() - self.maxHistorySize
            );
        }
        
        // Update session in Redis
        string sessionKey = self.sessionPrefix + sessionId;
        string sessionJson = session.toJsonString();
        _ = check self.redis.set(sessionKey, sessionJson, self.sessionTimeout);
        
        // Update context
        string contextKey = self.contextPrefix + sessionId;
        string contextJson = session.context.toJsonString();
        _ = check self.redis.set(contextKey, contextJson, self.sessionTimeout);
    }
    
    # Add message to history
    # + sessionId - Session ID
    # + message - Chat message
    # + return - Error if any
    public isolated function addMessage(string sessionId, ChatMessage message) returns error? {
        Session session = check self.getSession(sessionId);
        
        session.context.history.push(message);
        session.context.lastActivity = time:utcNow();
        
        check self.updateContext(sessionId, session.context);
    }
    
    # Update current intent
    # + sessionId - Session ID
    # + intent - Recognized intent
    # + return - Error if any
    public isolated function updateIntent(string sessionId, Intent intent) returns error? {
        Session session = check self.getSession(sessionId);
        
        session.context.currentIntent = intent;
        
        check self.updateContext(sessionId, session.context);
    }
    
    # Update context variables
    # + sessionId - Session ID
    # + variables - Variables to update
    # + return - Error if any
    public isolated function updateVariables(string sessionId, map<json> variables) returns error? {
        Session session = check self.getSession(sessionId);
        
        foreach var [key, value] in variables.entries() {
            session.context.variables[key] = value;
        }
        
        check self.updateContext(sessionId, session.context);
    }
    
    # Get conversation context
    # + sessionId - Session ID
    # + return - Conversation context or error
    public isolated function getContext(string sessionId) returns ConversationContext|error {
        // Try to get from Redis first
        string contextKey = self.contextPrefix + sessionId;
        string? contextJson = check self.redis.get(contextKey);
        
        if contextJson is string {
            json contextData = check value:fromJsonString(contextJson);
            return check contextData.cloneWithType(ConversationContext);
        }
        
        // Fallback to full session
        Session session = check self.getSession(sessionId);
        return session.context;
    }
    
    # Update user preferences
    # + sessionId - Session ID
    # + preferences - Updated preferences
    # + return - Error if any
    public isolated function updatePreferences(string sessionId, UserPreferences preferences) returns error? {
        Session session = check self.getSession(sessionId);
        
        session.context.preferences = preferences;
        
        check self.updateContext(sessionId, session.context);
    }
    
    # Get recent messages
    # + sessionId - Session ID
    # + count - Number of messages to retrieve
    # + return - Recent messages or error
    public isolated function getRecentMessages(string sessionId, int count = 10) returns ChatMessage[]|error {
        Session session = check self.getSession(sessionId);
        
        int historyLength = session.context.history.length();
        if historyLength == 0 {
            return [];
        }
        
        int startIndex = historyLength > count ? historyLength - count : 0;
        return session.context.history.slice(startIndex);
    }
    
    # Check if session is active
    # + sessionId - Session ID
    # + return - True if active, false otherwise
    public isolated function isSessionActive(string sessionId) returns boolean {
        Session|error session = self.getSession(sessionId);
        if session is error {
            return false;
        }
        
        return session.status == ACTIVE;
    }
    
    # Close session
    # + sessionId - Session ID
    # + return - Error if any
    public isolated function closeSession(string sessionId) returns error? {
        Session session = check self.getSession(sessionId);
        
        session.status = CLOSED;
        session.lastUpdated = time:utcNow();
        
        // Update in Redis
        string sessionKey = self.sessionPrefix + sessionId;
        string sessionJson = session.toJsonString();
        _ = check self.redis.set(sessionKey, sessionJson, 300); // Keep closed sessions for 5 minutes
        
        log:printInfo(string `Closed session: ${sessionId}`);
    }
    
    # Get user's active sessions
    # + userId - User ID
    # + return - List of active session IDs
    public isolated function getUserSessions(string userId) returns string[] {
        // TODO: Implement with Redis SCAN command
        // For now, return empty array
        return [];
    }
    
    # Clean expired sessions
    # + return - Number of cleaned sessions
    public isolated function cleanExpiredSessions() returns int {
        // Redis handles expiration automatically with TTL
        return 0;
    }
    
    # Get session analytics
    # + sessionId - Session ID
    # + return - Analytics data or error
    public isolated function getSessionAnalytics(string sessionId) returns ChatAnalytics|error {
        Session session = check self.getSession(sessionId);
        
        map<int> intentCounts = {};
        int totalMessages = 0;
        float totalResponseTime = 0.0;
        
        foreach var message in session.context.history {
            if message.'type == "user_message" {
                totalMessages += 1;
            }
        }
        
        // Calculate intent distribution
        if session.context.currentIntent is Intent {
            Intent currentIntent = <Intent>session.context.currentIntent;
            string intentKey = currentIntent.category;
            int currentCount = (intentCounts[intentKey] is int) ? <int>intentCounts[intentKey] : 0;
            intentCounts[intentKey] = currentCount + 1;
        }
        
        ChatAnalytics analytics = {
            totalMessages: totalMessages,
            avgResponseTime: totalMessages > 0 ? totalResponseTime / <float>totalMessages : 0.0,
            intentCounts: intentCounts,
            satisfaction: 0.0, // To be implemented with feedback
            errorRate: 0.0 // To be calculated based on errors
        };
        
        return analytics;
    }
    
    # Save conversation feedback
    # + sessionId - Session ID
    # + rating - User rating (1-5)
    # + feedback - Optional text feedback
    # + return - Error if any
    public isolated function saveFeedback(string sessionId, int rating, string? feedback = ()) returns error? {
        Session session = check self.getSession(sessionId);
        
        session.context.variables["feedbackRating"] = rating;
        if feedback is string {
            session.context.variables["feedbackText"] = feedback;
        }
        session.context.variables["feedbackTime"] = time:utcNow();
        
        check self.updateContext(sessionId, session.context);
        
        log:printInfo(string `Feedback saved for session ${sessionId}: Rating ${rating}`);
    }
}