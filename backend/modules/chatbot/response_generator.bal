
// Copyright (c) 2025 CircularSync
// Chatbot Module - Response Generator

import ballerina/time;
import ballerina/uuid;

# Generates intelligent responses based on intent and data
public class ResponseGenerator {
    private final GeminiConnector aiConnector;
    private final KnowledgeBase knowledgeBase;
    private final map<map<string>> responseTemplates;

    # Initialize response generator
    # + aiConnector - Gemini AI connector
    # + knowledgeBase - Platform knowledge base
    public function init(GeminiConnector aiConnector, KnowledgeBase knowledgeBase) returns error? {
        self.aiConnector = aiConnector;
        self.knowledgeBase = knowledgeBase;
        
        // Initialize response templates for quick responses
        self.responseTemplates = {
            "GREETING": {
                "default": "Hello! I'm CircularSync Assistant. How can I help you today?",
                "morning": "Good morning! How can I assist you with your waste management needs today?",
                "afternoon": "Good afternoon! What can I help you with?",
                "evening": "Good evening! How may I assist you?"
            },
            "GOODBYE": {
                "default": "Thank you for using CircularSync! Have a great day!",
                "withHelp": "Glad I could help! Feel free to return anytime you need assistance."
            },
            "ERROR": {
                "default": "I apologize, but I encountered an error processing your request. Please try again.",
                "missingData": "I need more information to help you with that. Could you please provide {missing}?",
                "unauthorized": "You need to be logged in to access this information.",
                "notFound": "I couldn't find any information matching your request."
            },
            "CLARIFICATION": {
                "intent": "I'm not entirely sure what you're asking. Are you looking for information about {options}?",
                "entity": "Could you please specify which {entity} you're referring to?"
            }
        };
    }
    
    # Generate response based on intent and data
    # + intent - Recognized intent
    # + businessData - Business data from APIs
    # + context - Conversation context
    # + return - Generated response or error
    public function generateResponse(Intent intent, json businessData, ConversationContext context)
            returns ChatbotResponse|error {
        
        time:Utc startTime = time:utcNow();
        
        // Check for simple responses first
        ChatbotResponse? simpleResponse = self.handleSimpleIntent(intent, context);
        if simpleResponse is ChatbotResponse {
            return simpleResponse;
        }
        
        // Generate AI-powered response for complex intents
        string content = check self.generateAIResponse(intent, businessData, context);
        
        // Generate suggestions based on intent
        string[] suggestions = self.generateSuggestions(intent, businessData);
        
        // Create actions if applicable
        SuggestedAction[] actions = self.generateActions(intent, businessData);
        
        // Calculate processing time
        int processingTime = <int>time:utcDiffSeconds(time:utcNow(), startTime) * 1000;
        
        ChatbotResponse response = {
            'type: "bot_response",
            content: content,
            intent: intent,
            actions: actions,
            suggestions: suggestions,
            metadata: {
                processingTime: processingTime,
                dataSources: self.getDataSources(intent),
                confidence: intent.confidence,
                responseId: uuid:createType4AsString()
            },
            timestamp: time:utcNow()
        };
        
        return response;
    }
    
    # Handle simple intents with template responses
    # + intent - Recognized intent
    # + context - Conversation context
    # + return - Simple response or nil
    isolated function handleSimpleIntent(Intent intent, ConversationContext context) returns ChatbotResponse? {
        match intent.category {
            GREETING => {
                string timeOfDay = self.getTimeOfDay();
                string template;
                lock {
                    map<string> greetings = self.responseTemplates.get("GREETING");
                    template = (greetings[timeOfDay] is string) ? <string>greetings[timeOfDay] : greetings.get("default");
                }
                
                return {
                    'type: "bot_response",
                    content: template,
                    intent: intent,
                    suggestions: [
                        "Check quality scores",
                        "View demand predictions",
                        "Get bidding advice",
                        "Track orders"
                    ],
                    timestamp: time:utcNow()
                };
            }
            GOODBYE => {
                json|error wasHelpfulJson = context.variables["wasHelpful"];
                boolean wasHelpful = (wasHelpfulJson is boolean) ? <boolean>wasHelpfulJson : false;
                string template;
                lock {
                    map<string> goodbyes = self.responseTemplates.get("GOODBYE");
                    template = wasHelpful ? 
                        goodbyes.get("withHelp") :
                        goodbyes.get("default");
                }
                
                return {
                    'type: "bot_response",
                    content: template,
                    intent: intent,
                    timestamp: time:utcNow()
                };
            }
        }
        
        return ();
    }
    
    # Generate AI-powered response
    # + intent - Recognized intent
    # + businessData - Business data
    # + context - Conversation context
    # + return - Generated response content
    function generateAIResponse(Intent intent, json businessData, ConversationContext context)
            returns string|error {

        // For GENERAL_FAQ, first check knowledge base
        if intent.category == GENERAL_FAQ {
            string? kbAnswer = self.knowledgeBase.searchFAQ(intent.query);
            if kbAnswer is string {
                // Found direct answer in knowledge base
                return kbAnswer;
            }

            // Check if question is platform-related
            if !self.isPlatformRelatedQuery(intent.query) {
                // Politely decline non-platform questions
                return "I am CircularSync Assistant. I can only help with questions about the CircularSync platform, such as:\n\n• How the platform works\n• Waste types we accept\n• Quality assessment process\n• Pricing and fees\n• How to register and get started\n• Auctions and bidding\n• Payment and wallet system\n\nPlease ask me about our platform features and services!";
            }

            // If no direct match but platform-related, get platform overview for AI context
            string platformContext = self.knowledgeBase.getPlatformOverview();

            // Generate AI response with platform context
            string|error aiResponse = self.aiConnector.generateResponse(intent, {"platformInfo": platformContext}, context);

            if aiResponse is error {
                if aiResponse.message().startsWith("RATE_LIMIT") {
                    // Return general FAQ fallback
                    return self.generateFallbackResponse(intent, businessData);
                }
                return aiResponse;
            }

            return self.postProcessResponse(aiResponse, intent, context);
        }

        // For other intents, use standard AI response flow
        string|error aiResponse = self.aiConnector.generateResponse(intent, businessData, context);

        if aiResponse is error {
            // Check if it's a rate limit error
            if aiResponse.message().startsWith("RATE_LIMIT") {
                return self.generateFallbackResponse(intent, businessData);
            }
            // For other errors, throw them
            return aiResponse;
        }

        // Post-process the response
        string response = self.postProcessResponse(aiResponse, intent, context);

        return response;
    }

    # Check if query is platform-related
    # + query - User query
    # + return - True if platform-related
    isolated function isPlatformRelatedQuery(string query) returns boolean {
        string lowerQuery = query.toLowerAscii();

        // Platform-related keywords
        string[] platformKeywords = [
            "circular", "platform", "waste", "material", "quality", "assess",
            "demand", "predict", "bid", "auction", "price", "pricing", "fee",
            "payment", "wallet", "supplier", "buyer", "agent", "register",
            "signup", "list", "submit", "buy", "sell", "track", "order",
            "schedule", "pickup", "delivery", "plastic", "paper", "metal",
            "glass", "organic", "hazardous", "recycle", "circular economy",
            "marketplace", "transaction", "commission", "verification",
            "quality score", "google vision", "ai", "feature", "dashboard",
            "notification", "chat", "support", "help", "contact", "role",
            "admin", "field agent", "escrow", "shipping", "logistics"
        ];

        // Check if query contains any platform keywords
        foreach string keyword in platformKeywords {
            if lowerQuery.includes(keyword) {
                return true;
            }
        }

        // If no keywords match, it's not platform-related
        return false;
    }
    
    # Generate quick reply suggestions
    # + intent - Current intent
    # + businessData - Business data
    # + return - List of suggestions
    isolated function generateSuggestions(Intent intent, json businessData) returns string[] {
        string[] suggestions = [];
        
        match intent.category {
            QUALITY_CHECK => {
                suggestions = [
                    "View detailed quality report",
                    "Check rejection reasons",
                    "Compare with other batches",
                    "Get improvement tips"
                ];
            }
            DEMAND_PREDICTION => {
                suggestions = [
                    "View detailed forecast",
                    "Check seasonal patterns",
                    "See market trends",
                    "Get bidding recommendations"
                ];
            }
            BIDDING_ADVICE => {
                suggestions = [
                    "View competition analysis",
                    "Check optimal timing",
                    "Calculate win probability",
                    "See price history"
                ];
            }
            TRANSACTION_TRACKING => {
                suggestions = [
                    "View shipment details",
                    "Check delivery status",
                    "Contact support",
                    "Download invoice"
                ];
            }
            SCHEDULING => {
                suggestions = [
                    "View available slots",
                    "Change appointment",
                    "Cancel booking",
                    "Add to calendar"
                ];
            }
            _ => {
                suggestions = [
                    "Ask another question",
                    "View help topics",
                    "Contact support"
                ];
            }
        }
        
        return suggestions;
    }
    
    # Generate suggested actions
    # + intent - Current intent
    # + businessData - Business data
    # + return - List of actions
    isolated function generateActions(Intent intent, json businessData) returns SuggestedAction[] {
        SuggestedAction[] actions = [];
        
        match intent.category {
            QUALITY_CHECK => {
                if businessData != () {
                    actions.push({
                        'type: SHOW_DETAILS,
                        label: "View Full Report",
                        data: {"reportType": "quality", "data": businessData},
                        url: ()
                    });
                }
            }
            DEMAND_PREDICTION => {
                if businessData != () {
                    actions.push({
                        'type: SHOW_CHART,
                        label: "View Forecast Chart",
                        data: {"chartType": "forecast", "data": businessData},
                        url: ()
                    });
                }
            }
            BIDDING_ADVICE => {
                actions.push({
                    'type: NAVIGATE,
                    label: "Go to Bidding Page",
                    data: {},
                    url: "/bidding"
                });
            }
            TRANSACTION_TRACKING => {
                json|error trackingId = businessData.trackingId;
                if trackingId is json {
                    actions.push({
                        'type: NAVIGATE,
                        label: "Track Shipment",
                        data: {"trackingId": trackingId},
                        url: string `/tracking/${trackingId.toString()}`
                    });
                }
            }
            SCHEDULING => {
                actions.push({
                    'type: SCHEDULE_CALLBACK,
                    label: "Schedule Now",
                    data: {"intent": "schedule"},
                    url: "/schedule"
                });
            }
        }
        
        return actions;
    }
    
    # Format business data for AI consumption
    # + intent - Current intent
    # + businessData - Raw business data
    # + return - Formatted data string
    isolated function formatBusinessData(Intent intent, json businessData) returns string {
        if businessData == () {
            return "No data available";
        }
        
        string formatted = "";
        
        match intent.category {
            QUALITY_CHECK => {
                formatted = string `Quality Assessment Data: ${businessData.toString()}`;
            }
            DEMAND_PREDICTION => {
                formatted = string `Demand Forecast Data: ${businessData.toString()}`;
            }
            _ => {
                formatted = businessData.toString();
            }
        }
        
        return formatted;
    }
    
    # Post-process AI response
    # + response - Raw AI response
    # + intent - Current intent
    # + context - Conversation context
    # + return - Processed response
    isolated function postProcessResponse(string response, Intent intent, ConversationContext context) returns string {
        // Add user name if available
        json|error userNameJson = context.variables["userName"];
        if userNameJson is json {
            string userName = userNameJson.toString();
            if !response.includes(userName) {
                // Only add name to certain types of responses
                match intent.category {
                    GREETING => {
                        string newResponse = response;
                        int? exclamationIndex = response.indexOf("!");
                        if exclamationIndex is int && exclamationIndex > 0 {
                            newResponse = response.substring(0, exclamationIndex) + string `, ${userName}!` + response.substring(exclamationIndex + 1);
                        }
                        return newResponse;
                    }
                }
            }
        }
        
        // Ensure response isn't too long
        string processedResponse = response;
        if processedResponse.length() > 500 {
            // Find a good breaking point
            int? breakPoint = processedResponse.indexOf(". ", 400);
            if breakPoint is int && breakPoint > 0 && breakPoint < 500 {
                processedResponse = processedResponse.substring(0, breakPoint + 1);
            } else {
                processedResponse = processedResponse.substring(0, 497) + "...";
            }
        }
        
        return processedResponse;
    }
    
    # Generate error response
    # + errorType - Type of error
    # + details - Error details
    # + return - Error response
    public isolated function generateErrorResponse(string errorType, map<string>? details = ()) returns ChatbotResponse {
        string content;
        lock {
            map<string> errorTemplates = self.responseTemplates.get("ERROR");
            content = (errorTemplates[errorType] is string) ? <string>errorTemplates[errorType] : errorTemplates.get("default");
        }
        
        // Replace placeholders
        string finalContent = content;
        if details is map<string> {
            foreach var [key, value] in details.entries() {
                string placeholder = string `{${key}}`;
                int? index = finalContent.indexOf(placeholder);
                if index is int && index >= 0 {
                    finalContent = finalContent.substring(0, index) + value + finalContent.substring(index + placeholder.length());
                }
            }
        }
        
        return {
            'type: "bot_response",
            content: finalContent,
            intent: (),
            suggestions: ["Try again", "Get help", "Contact support"],
            timestamp: time:utcNow()
        };
    }
    
    # Generate clarification response
    # + clarificationType - Type of clarification needed
    # + options - Options to present
    # + return - Clarification response
    public isolated function generateClarificationResponse(string clarificationType, string[] options) 
            returns ChatbotResponse {
        
        string template;
        lock {
            map<string> clarifyTemplates = self.responseTemplates.get("CLARIFICATION");
            template = (clarifyTemplates[clarificationType] is string) ? <string>clarifyTemplates[clarificationType] : "Could you please clarify your request?";
        }
        
        string optionsStr = "";
        if options.length() > 0 {
            if options.length() == 1 {
                optionsStr = options[0];
            } else if options.length() == 2 {
                optionsStr = string `${options[0]} or ${options[1]}`;
            } else {
                string[] allButLast = options.slice(0, options.length() - 1);
                string joinedOptions = "";
                foreach int i in 0 ... allButLast.length() - 1 {
                    if i > 0 {
                        joinedOptions += ", ";
                    }
                    joinedOptions += allButLast[i];
                }
                optionsStr = joinedOptions + string `, or ${options[options.length() - 1]}`;
            }
        }
        
        string content = template;
        int? optionsIndex = content.indexOf("{options}");
        if optionsIndex is int && optionsIndex >= 0 {
            content = content.substring(0, optionsIndex) + optionsStr + content.substring(optionsIndex + 9);
        }
        
        return {
            'type: "bot_response",
            content: content,
            intent: (),
            suggestions: options,
            timestamp: time:utcNow()
        };
    }
    
    # Get time of day for greetings
    # + return - Time of day string
    isolated function getTimeOfDay() returns string {
        time:Civil now = time:utcToCivil(time:utcNow());
        int hour = now.hour;
        
        if hour < 12 {
            return "morning";
        } else if hour < 17 {
            return "afternoon";
        } else {
            return "evening";
        }
    }
    
    # Generate fallback response when AI is unavailable
    # + intent - Recognized intent
    # + businessData - Business data
    # + return - Fallback response
    isolated function generateFallbackResponse(Intent intent, json businessData) returns string {
        match intent.category {
            QUALITY_CHECK => {
                if businessData != () {
                    return "I've retrieved the quality data you requested. While I can't provide AI-powered insights right now due to high demand, the data shows the quality assessment results for your query.";
                }
                return "I can help you with quality assessments. Please specify a batch ID or waste type to check quality scores.";
            }
            DEMAND_PREDICTION => {
                if businessData != () {
                    return "Here's the demand forecast data. Although advanced AI analysis is temporarily unavailable, the historical trends and predictions are available in the data provided.";
                }
                return "I can provide demand predictions. Please specify the waste type and location for accurate forecasting.";
            }
            BIDDING_ADVICE => {
                return "For bidding recommendations, please provide the waste type and quantity. I'll help you analyze market conditions and competitive pricing.";
            }
            TRANSACTION_TRACKING => {
                if businessData != () {
                    return "I found your transaction details. The current status and tracking information are displayed above.";
                }
                return "Please provide a transaction or order ID to track your shipment status.";
            }
            SCHEDULING => {
                return "I can help you schedule waste collection. Please provide the waste type, quantity, and preferred date.";
            }
            GENERAL_FAQ => {
                return "I'm here to help! You can ask me about:\n• Quality assessments for waste batches\n• Demand predictions and market trends\n• Bidding strategies and pricing\n• Order tracking\n• Scheduling pickups\n\nWhat would you like to know?";
            }
            _ => {
                return "I'm experiencing high demand right now, but I'm still here to help! Try asking about quality checks, demand predictions, or order tracking.";
            }
        }
    }
    
    # Get data sources used for intent
    # + intent - Current intent
    # + return - List of data sources
    isolated function getDataSources(Intent intent) returns string[] {
        match intent.category {
            QUALITY_CHECK => {
                return ["quality_assessment_api", "gemini_ai"];
            }
            DEMAND_PREDICTION => {
                return ["demand_prediction_api", "gemini_ai"];
            }
            BIDDING_ADVICE => {
                return ["demand_prediction_api", "market_data", "gemini_ai"];
            }
            TRANSACTION_TRACKING => {
                return ["transaction_db", "logistics_api"];
            }
            _ => {
                return ["gemini_ai"];
            }
        }
    }
}