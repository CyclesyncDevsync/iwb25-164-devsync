// Copyright (c) 2025 CircularSync
// Chatbot Module - Main WebSocket Service

import ballerina/websocket as ws;
import ballerina/http;
import ballerina/log;
import ballerina/time;

# Configuration for chatbot service
type ChatbotConfig record {|
    string geminiApiKey;
    string geminiModel = "gemini-pro";
    int websocketPort = 8083;
    int sessionTimeout = 1800;
    int maxConnections = 1000;
    string qualityApiUrl = "http://localhost:8082";
    string demandApiUrl = "http://localhost:8084";
    string mainApiUrl = "http://localhost:8080";
|};

# Main chatbot WebSocket service
@ws:ServiceConfig {
    idleTimeout: 300,
    maxFrameSize: 65536
}
service /chat on new ws:Listener(websocketPort) {
    
    private final ChatbotConfig config;
    private final GeminiConnector aiConnector;
    private final ConversationManager conversationManager;
    private final IntentProcessor intentProcessor;
    private final ResponseGenerator responseGenerator;
    private final map<ws:Caller> activeConnections;
    private final RedisConnector redis;
    
    # HTTP clients for business APIs
    private final http:Client qualityClient;
    private final http:Client demandClient;
    private final http:Client mainClient;
    
    function init() returns error? {
        // Load configuration from Config.toml
        self.config = {
            geminiApiKey: geminiApiKey,
            geminiModel: geminiModel,
            websocketPort: websocketPort,
            sessionTimeout: sessionTimeout,
            maxConnections: maxConnections,
            qualityApiUrl: qualityApiUrl,
            demandApiUrl: demandApiUrl,
            mainApiUrl: mainApiUrl
        };
        
        // Initialize components
        self.aiConnector = check new(self.config.geminiApiKey, self.config.geminiModel);
        self.conversationManager = check new(self.config.sessionTimeout);
        self.intentProcessor = check new(self.aiConnector);
        self.responseGenerator = check new(self.aiConnector);
        self.activeConnections = {};
        
        // Initialize Redis for rate limiting
        self.redis = check new(redisHost, redisPort, redisPassword, redisDatabase);
        
        // Initialize HTTP clients
        self.qualityClient = check new(self.config.qualityApiUrl,
            httpVersion = http:HTTP_1_1,
            timeout = 10
        );
        self.demandClient = check new(self.config.demandApiUrl,
            httpVersion = http:HTTP_1_1,
            timeout = 10
        );
        self.mainClient = check new(self.config.mainApiUrl,
            httpVersion = http:HTTP_1_1,
            timeout = 10
        );
        
        log:printInfo("Chatbot service initialized on port " + self.config.websocketPort.toString());
    }
    
    # Handle new WebSocket connection
    resource function get .() returns ws:Service|ws:Error {
        return new ChatbotWebSocketService(
            self.aiConnector,
            self.conversationManager,
            self.intentProcessor,
            self.responseGenerator,
            self.activeConnections,
            self.redis,
            self.qualityClient,
            self.demandClient,
            self.mainClient
        );
    }
}

# WebSocket service implementation
service class ChatbotWebSocketService {
    *ws:Service;
    
    private final GeminiConnector aiConnector;
    private final ConversationManager conversationManager;
    private final IntentProcessor intentProcessor;
    private final ResponseGenerator responseGenerator;
    private final map<ws:Caller> activeConnections;
    private final RedisConnector redis;
    private final http:Client qualityClient;
    private final http:Client demandClient;
    private final http:Client mainClient;
    
    function init(
        GeminiConnector aiConnector,
        ConversationManager conversationManager,
        IntentProcessor intentProcessor,
        ResponseGenerator responseGenerator,
        map<ws:Caller> activeConnections,
        RedisConnector redis,
        http:Client qualityClient,
        http:Client demandClient,
        http:Client mainClient
    ) {
        self.aiConnector = aiConnector;
        self.conversationManager = conversationManager;
        self.intentProcessor = intentProcessor;
        self.responseGenerator = responseGenerator;
        self.activeConnections = activeConnections;
        self.redis = redis;
        self.qualityClient = qualityClient;
        self.demandClient = demandClient;
        self.mainClient = mainClient;
    }
    
    # Handle WebSocket connection open
    remote function onOpen(ws:Caller caller) returns error? {
        string connectionId = caller.getConnectionId();
        
        // Store connection
        self.activeConnections[connectionId] = caller;
        
        // Create session immediately with connection ID as user ID
        string sessionId = check self.conversationManager.createSession(connectionId);
        
        // Send welcome message
        check caller->writeMessage({
            'type: "connection",
            status: "connected",
            sessionId: sessionId,
            message: "Welcome to CircularSync! I can help you with quality assessments, demand predictions, bidding advice, and more. How can I assist you today?",
            timestamp: time:utcNow()
        });
        
        log:printInfo(string `New WebSocket connection: ${connectionId} with session: ${sessionId}`);
    }
    
    # Handle incoming messages
    remote function onMessage(ws:Caller caller, json message) returns error? {
        string connectionId = caller.getConnectionId();
        
        // Handle timestamp conversion
        map<json> messageMap = <map<json>>message;
        
        // Remove timestamp if it exists (we'll use server time)
        _ = messageMap.remove("timestamp");
        
        // Parse message without timestamp
        ChatMessage chatMessage = check messageMap.cloneWithType(ChatMessage);
        
        // Always use server timestamp
        chatMessage.timestamp = time:utcNow();
        
        // Check rate limit using connection ID
        if !check self.checkRateLimit(connectionId) {
            check caller->writeMessage({
                'type: "error",
                message: "Rate limit exceeded. Please try again later.",
                timestamp: time:utcNow()
            });
            return;
        }
        
        // Validate session
        ConversationContext context = check self.conversationManager.getContext(chatMessage.sessionId);
        
        // Update rate limit
        check self.updateRateLimit(connectionId);
        
        // Add message to history
        check self.conversationManager.addMessage(chatMessage.sessionId, chatMessage);
        
        // Send typing indicator
        check caller->writeMessage({
            'type: "typing",
            status: "start",
            timestamp: time:utcNow()
        });
        
        // Process message
        ChatbotResponse response = check self.processMessage(chatMessage, context);
        
        // Update conversation context
        Intent? responseIntent = response.intent;
        if responseIntent is Intent {
            check self.conversationManager.updateIntent(chatMessage.sessionId, responseIntent);
        }
        
        // Add response to history
        ChatMessage responseMessage = {
            'type: "bot_response",
            content: response.content,
            userId: connectionId,
            sessionId: chatMessage.sessionId,
            timestamp: response.timestamp
        };
        check self.conversationManager.addMessage(chatMessage.sessionId, responseMessage);
        
        // Send response
        check caller->writeMessage(response);
        
        log:printDebug(string `Processed message from ${connectionId}: ${chatMessage.content}`);
    }
    
    # Process user message
    # + message - User message
    # + context - Conversation context
    # + return - Chatbot response
    function processMessage(ChatMessage message, ConversationContext context) returns ChatbotResponse|error {
        // Recognize intent
        Intent intent = check self.intentProcessor.processIntent(message.content, context);
        intent = self.intentProcessor.enhanceIntent(intent, context);
        
        log:printDebug(string `Recognized intent: ${intent.category} with confidence ${intent.confidence}`);
        
        // Check if authentication required
        if self.intentProcessor.requiresAuth(intent.category) && !self.isAuthenticated(context) {
            return self.responseGenerator.generateErrorResponse("unauthorized");
        }
        
        // Check if we have required data
        if !self.intentProcessor.hasRequiredData(intent) {
            string[] missing = self.intentProcessor.getMissingData(intent);
            return self.responseGenerator.generateClarificationResponse("entity", missing);
        }
        
        // Fetch business data based on intent
        json businessData = check self.fetchBusinessData(intent, context);
        
        // Generate response
        ChatbotResponse response = check self.responseGenerator.generateResponse(intent, businessData, context);
        
        // Update context variables
        check self.conversationManager.updateVariables(message.sessionId, {
            "lastIntent": intent.category,
            "wasHelpful": true
        });
        
        return response;
    }
    
    # Fetch business data based on intent
    # + intent - Recognized intent
    # + context - Conversation context
    # + return - Business data
    function fetchBusinessData(Intent intent, ConversationContext context) returns json|error {
        match intent.category {
            QUALITY_CHECK => {
                return self.fetchQualityData(intent.entities);
            }
            DEMAND_PREDICTION => {
                return self.fetchDemandData(intent.entities);
            }
            BIDDING_ADVICE => {
                return self.fetchBiddingData(intent.entities);
            }
            TRANSACTION_TRACKING => {
                return self.fetchTransactionData(intent.entities);
            }
            _ => {
                return {};
            }
        }
    }
    
    # Fetch quality assessment data
    function fetchQualityData(map<string> entities) returns json|error {
        string? batchId = entities["batchId"];
        string? wasteType = entities["wasteType"];
        
        if batchId is string {
            // Get specific batch quality
            http:Response response = check self.qualityClient->get(string `/api/ai/quality/batch/${batchId}`);
            return check response.getJsonPayload();
        } else if wasteType is string {
            // Get quality by waste type
            http:Response response = check self.qualityClient->get(
                string `/api/ai/quality/history/${wasteType}/all?limit=5`
            );
            return check response.getJsonPayload();
        }
        
        return {};
    }
    
    # Fetch demand prediction data
    function fetchDemandData(map<string> entities) returns json|error {
        string? wasteType = entities["wasteType"];
        string? location = entities["location"] ?: "all";
        // string? period = entities["period"] ?: "week";
        
        if wasteType is string {
            json requestBody = {
                "wasteType": wasteType,
                "location": location,
                "historicalData": []
            };
            
            http:Response response = check self.demandClient->post("/api/ai/demand/forecast", requestBody);
            return check response.getJsonPayload();
        }
        
        return {};
    }
    
    # Fetch bidding recommendations
    function fetchBiddingData(map<string> entities) returns json|error {
        string? wasteType = entities["wasteType"];
        string? quantity = entities["quantity"];
        
        if wasteType is string {
            json requestBody = {
                "wasteType": wasteType,
                "quantity": quantity ?: "1000",
                "location": entities["location"] ?: "all",
                "urgency": entities["urgency"] ?: "normal"
            };
            
            http:Response response = check self.demandClient->post("/api/ai/demand/bidding-recommendations", requestBody);
            return check response.getJsonPayload();
        }
        
        return {};
    }
    
    # Fetch transaction data
    function fetchTransactionData(map<string> entities) returns json|error {
        string? transactionId = entities["transactionId"] ?: entities["orderId"];
        
        if transactionId is string {
            http:Response response = check self.mainClient->get(string `/api/transactions/${transactionId}`);
            return check response.getJsonPayload();
        }
        
        return {};
    }
    
    # Handle WebSocket errors
    remote function onError(ws:Caller caller, error err) returns error? {
        string connectionId = caller.getConnectionId();
        log:printError(string `WebSocket error for ${connectionId}: ${err.message()}`);
        
        check caller->writeMessage({
            'type: "error",
            message: "An error occurred. Please try again.",
            timestamp: time:utcNow()
        });
    }
    
    # Handle WebSocket close
    remote function onClose(ws:Caller caller, int statusCode, string reason) returns error? {
        string connectionId = caller.getConnectionId();
        _ = self.activeConnections.remove(connectionId);
        
        log:printInfo(string `WebSocket closed: ${connectionId}, Status: ${statusCode}, Reason: ${reason}`);
    }
    
    # Check rate limit
    function checkRateLimit(string userId) returns boolean|error {
        string key = string `rate_limit_${userId}`;
        string? countStr = check self.redis.get(key);
        
        if countStr is string {
            int count = check int:fromString(countStr);
            // 100 messages per minute limit
            if count >= rateLimit {
                return false;
            }
        }
        
        return true;
    }
    
    # Update rate limit counter
    function updateRateLimit(string userId) returns error? {
        string key = string `rate_limit_${userId}`;
        
        // Increment counter in Redis
        int newCount = check self.redis.incr(key);
        
        // Set expiration if this is the first increment
        if newCount == 1 {
            _ = check self.redis.expire(key, 60); // 1 minute window
        }
    }
    
    # Check if user is authenticated
    function isAuthenticated(ConversationContext context) returns boolean {
        // In a real implementation, this would check JWT tokens or session
        // For now, we'll assume all users are authenticated
        return true;
    }
}

# Health check endpoint
service /health on new http:Listener(8095) {
    resource function get .() returns json|error {
        // Check Redis connection
        RedisConnector healthRedis = check new(redisHost, redisPort, redisPassword, redisDatabase);
        boolean redisHealthy = check healthRedis.ping();
        _ = check healthRedis.close();
        
        return {
            status: "healthy",
            AiService: "chatbot",
            redis: redisHealthy ? "connected" : "disconnected",
            timestamp: time:utcNow()
        };
    }
}

