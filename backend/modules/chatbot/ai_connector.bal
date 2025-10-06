// Copyright (c) 2025 CircularSync
// Chatbot Module - Gemini AI Connector

import ballerina/http;
import ballerina/log;
import ballerina/cache;

# Gemini AI connector for natural language processing
public isolated class GeminiConnector {
    private final string apiKey;
    private final string model;
    private final http:Client geminiClient;
    private final cache:Cache responseCache;
    
    # Initialize Gemini connector
    # + apiKey - Gemini API key
    # + model - Model to use (default: gemini-pro)
    public isolated function init(string apiKey, string model = "gemini-pro") returns error? {
        self.apiKey = apiKey;
        self.model = model;
        
        // Initialize HTTP client for Gemini API
        self.geminiClient = check new("https://generativelanguage.googleapis.com/v1beta",
            httpVersion = http:HTTP_1_1,
            timeout = 30,
            retryConfig = {
                count: 3,
                interval: 2
            }
        );
        
        // Initialize response cache (5 minutes TTL)
        self.responseCache = new({
            capacity: 1000,
            evictionPolicy: cache:LRU,
            defaultMaxAge: 300
        });
    }
    
    # Process user message and generate response
    # + message - User message
    # + context - Conversation context
    # + return - AI-generated response or error
    public isolated function processMessage(string message, ConversationContext context) returns string|error {
        // Check cache first
        string cacheKey = self.generateCacheKey(message, context);
        any|error cached = self.responseCache.get(cacheKey);
        if cached is string {
            log:printDebug("Cache hit for message: " + message);
            return cached;
        }
        
        // Build conversation history for context
        GeminiMessage[] messages = self.buildMessageHistory(context);
        
        // Add current user message
        messages.push({
            role: "user",
            content: message
        });
        
        // Create request
        GeminiRequest request = {
            model: self.model,
            messages: messages,
            temperature: 0.7,
            maxTokens: 1024,
            topP: 0.9
        };
        
        // Call Gemini API
        string response = check self.callGeminiAPI(request);
        
        // Cache the response
        check self.responseCache.put(cacheKey, response);
        
        return response;
    }
    
    # Recognize intent from user message
    # + message - User message
    # + return - Recognized intent or error
    public isolated function recognizeIntent(string message) returns Intent|error {
        string prompt = string `
            Analyze the following user message and identify the intent.
            
            User message: "${message}"
            
            Possible intents:
            - QUALITY_CHECK: Questions about waste quality, scores, or assessments
            - DEMAND_PREDICTION: Questions about demand forecasts, market trends
            - BIDDING_ADVICE: Questions about bidding, pricing, or competition
            - TRANSACTION_TRACKING: Questions about orders, shipments, or status
            - SCHEDULING: Requests to schedule pickups or deliveries
            - GENERAL_FAQ: General questions about the platform
            - GREETING: Greetings or conversation starters
            - GOODBYE: Farewells or conversation endings
            - UNKNOWN: Cannot determine intent
            
            Respond in JSON format:
            {
                "intent": "INTENT_NAME",
                "confidence": 0.95,
                "entities": {
                    "key": "value"
                }
            }
        `;
        
        GeminiRequest request = {
            model: self.model,
            messages: [
                {
                    role: "system",
                    content: "You are an intent recognition system. Always respond in valid JSON format."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.3,
            maxTokens: 256
        };
        
        string jsonResponse = check self.callGeminiAPI(request);
        
        // Parse JSON response
        json intentJson = check jsonResponse.fromJsonString();
        
        // Extract entities
        map<string> entities = {};
        json|error entitiesJson = intentJson.entities;
        if entitiesJson is json {
            map<json> entityMap = check entitiesJson.ensureType();
            foreach var [key, value] in entityMap.entries() {
                entities[key] = value.toString();
            }
        }
        
        Intent intent = {
            category: check self.parseIntentType(check intentJson.intent),
            confidence: check (check intentJson.confidence).ensureType(float),
            entities: entities,
            query: message
        };
        
        return intent;
    }
    
    # Generate contextual response
    # + intent - Recognized intent
    # + businessData - Relevant business data
    # + context - Conversation context
    # + return - Generated response or error
    public isolated function generateResponse(Intent intent, json businessData, ConversationContext context) returns string|error {
        string systemPrompt = self.getSystemPrompt();
        string dataContext = businessData.toString();
        
        string prompt = string `
            Intent: ${intent.category}
            User Query: ${intent.query}
            Business Data: ${dataContext}
            
            Generate a helpful, conversational response based on the above information.
            Keep the response concise and friendly.
        `;
        
        GeminiMessage[] messages = self.buildMessageHistory(context);
        messages.push({
            role: "system",
            content: systemPrompt
        });
        messages.push({
            role: "user",
            content: prompt
        });
        
        GeminiRequest request = {
            model: self.model,
            messages: messages,
            temperature: 0.7,
            maxTokens: 512
        };
        
        return self.callGeminiAPI(request);
    }
    
    # Private function to call Gemini API
    isolated function callGeminiAPI(GeminiRequest request) returns string|error {
        // Prepare API endpoint
        string endpoint = string `/models/${self.model}:generateContent?key=${self.apiKey}`;
        
        // Transform request to Gemini format
        json geminiRequest = {
            "contents": check self.transformToGeminiFormat(request.messages),
            "generationConfig": {
                "temperature": request.temperature,
                "topP": request.topP,
                "maxOutputTokens": request.maxTokens
            }
        };
        
        // Make API call
        http:Response response = check self.geminiClient->post(endpoint, geminiRequest);
        
        if response.statusCode == 429 {
            // Rate limit exceeded - return a helpful message
            log:printWarn("Gemini API rate limit exceeded");
            return error("RATE_LIMIT: I'm currently experiencing high demand. Please try again in a moment.");
        } else if response.statusCode != 200 {
            json errorBody = check response.getJsonPayload();
            log:printError(string `Gemini API error: ${errorBody.toString()}`);
            return error(string `Gemini API error: ${errorBody.toString()}`);
        }
        
        json responseJson = check response.getJsonPayload();
        
        // Extract generated text
        json|error candidates = responseJson.candidates;
        if candidates is json[] && candidates.length() > 0 {
            json|error content = candidates[0].content;
            if content is json {
                json|error parts = content.parts;
                if parts is json[] && parts.length() > 0 {
                    json|error text = parts[0].text;
                    if text is json {
                        return text.toString();
                    }
                }
            }
        }
        
        return error("Failed to extract response from Gemini API");
    }
    
    # Transform messages to Gemini format
    isolated function transformToGeminiFormat(GeminiMessage[] messages) returns json[]|error {
        json[] contents = [];
        
        foreach var message in messages {
            // Skip system messages as Gemini doesn't support them
            if message.role == "system" {
                continue;
            }
            
            string role = message.role;
            if role == "assistant" {
                role = "model";
            }
            
            json content = {
                "role": role,
                "parts": [
                    {
                        "text": message.content
                    }
                ]
            };
            contents.push(content);
        }
        
        return contents;
    }
    
    # Build message history from context
    isolated function buildMessageHistory(ConversationContext context) returns GeminiMessage[] {
        GeminiMessage[] messages = [];
        
        // Gemini doesn't support system messages, so we skip it
        
        // Add recent conversation history (last 10 messages)
        int startIndex = context.history.length() > 10 ? context.history.length() - 10 : 0;
        foreach int i in startIndex ... context.history.length() - 1 {
            ChatMessage msg = context.history[i];
            messages.push({
                role: msg.'type == "user_message" ? "user" : "model",  // Changed "assistant" to "model"
                content: msg.content
            });
        }
        
        return messages;
    }
    
    # Get system prompt for CircularSync context
    isolated function getSystemPrompt() returns string {
        return "You are CircularSync Assistant, an AI-powered chatbot for CircularSync platform ONLY.\n\n" +
               "STRICT RULES:\n" +
               "• ONLY answer questions about CircularSync platform\n" +
               "• For non-platform questions, politely decline and redirect to CircularSync topics\n" +
               "• Use provided platformInfo for accurate, grounded responses\n" +
               "• Never invent or hallucinate platform features\n" +
               "• Be concise and professional\n\n" +
               "PLATFORM OVERVIEW:\n" +
               "CircularSync is a circular economy platform connecting waste producers (suppliers) with waste consumers (buyers) for sustainable waste management.\n\n" +
               "CORE FEATURES:\n" +
               "• AI-powered quality assessment (Google Vision API)\n" +
               "• Demand prediction and market analysis\n" +
               "• Live auctions with real-time bidding\n" +
               "• Dynamic pricing based on quality and demand\n" +
               "• Integrated wallet system for secure payments\n" +
               "• Agent verification system\n\n" +
               "WASTE TYPES:\n" +
               "1. Plastic (PET bottles, HDPE containers, films)\n" +
               "2. Paper (Cardboard, newspapers, office paper)\n" +
               "3. Metal (Aluminum, steel, copper, brass)\n" +
               "4. Glass (Bottles, jars, flat glass)\n" +
               "5. Organic (Food waste, agricultural residue)\n" +
               "6. Hazardous (E-waste, batteries, chemicals)\n\n" +
               "USER ROLES:\n" +
               "• Suppliers: Submit and sell waste materials\n" +
               "• Buyers: Purchase recyclable materials\n" +
               "• Agents: Verify and assess quality\n" +
               "• Admins: Manage platform operations\n\n" +
               "PRICING:\n" +
               "• Suppliers: 5% commission on sales\n" +
               "• Buyers: No additional fees\n" +
               "• Dynamic pricing based on quality and market demand\n\n" +
               "RESPONSE GUIDELINES:\n" +
               "• Use platformInfo when provided for accurate answers\n" +
               "• Keep responses concise (2-3 sentences max)\n" +
               "• If uncertain, direct to support@circularsync.com\n" +
               "• For non-platform questions, respond: 'I can only help with CircularSync platform questions'\n" +
               "• Keep responses under 200 words unless detailed explanation needed";
    }
    
    # Generate cache key
    isolated function generateCacheKey(string message, ConversationContext context) returns string {
        // Simple cache key based on message and recent context
        string contextKey = context.currentIntent is () ? "no-intent" : (<Intent>context.currentIntent).category;
        return string `${message.toLowerAscii()}_${contextKey}_${context.userId}`;
    }
    
    # Parse intent type from string
    isolated function parseIntentType(json intentStr) returns IntentType|error {
        string intent = intentStr.toString();
        match intent {
            "QUALITY_CHECK" => { return QUALITY_CHECK; }
            "DEMAND_PREDICTION" => { return DEMAND_PREDICTION; }
            "BIDDING_ADVICE" => { return BIDDING_ADVICE; }
            "TRANSACTION_TRACKING" => { return TRANSACTION_TRACKING; }
            "SCHEDULING" => { return SCHEDULING; }
            "GENERAL_FAQ" => { return GENERAL_FAQ; }
            "GREETING" => { return GREETING; }
            "GOODBYE" => { return GOODBYE; }
            _ => { return UNKNOWN; }
        }
    }
    
    # Extract entities from message
    # + message - User message
    # + intentType - Intent type
    # + return - Extracted entities
    public isolated function extractEntities(string message, IntentType intentType) returns map<string>|error {
        string prompt = string `
            Extract relevant entities from the following message based on the intent type.
            
            Message: "${message}"
            Intent: ${intentType}
            
            Extract entities such as:
            - Batch IDs (e.g., #12345)
            - Waste types (plastic, paper, metal, glass, organic)
            - Locations
            - Dates and times
            - Quantities
            - Price ranges
            
            Respond in JSON format with extracted entities.
        `;
        
        GeminiRequest request = {
            model: self.model,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.3,
            maxTokens: 256
        };
        
        string jsonResponse = check self.callGeminiAPI(request);
        json entities = check jsonResponse.fromJsonString();
        
        map<string> entityMap = {};
        if entities is map<json> {
            foreach var [key, value] in entities.entries() {
                entityMap[key] = value.toString();
            }
        }
        
        return entityMap;
    }
}