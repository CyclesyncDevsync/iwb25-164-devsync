// Copyright (c) 2025 CircularSync
// Chatbot Module - Intent Processor

import ballerina/log;
import ballerina/lang.regexp;

# Processes and recognizes user intents
public isolated class IntentProcessor {
    private final GeminiConnector aiConnector;
    private final map<string[]> intentKeywords;
    private final map<string> intentPatterns;
    
    # Initialize intent processor
    # + aiConnector - Gemini AI connector
    public isolated function init(GeminiConnector aiConnector) returns error? {
        self.aiConnector = aiConnector;
        
        // Initialize intent keywords for fallback matching
        self.intentKeywords = {
            "QUALITY_CHECK": ["quality", "score", "assessment", "grade", "condition", "reject", "approve", "contamination"],
            "DEMAND_PREDICTION": ["demand", "forecast", "prediction", "trend", "market", "future", "expect"],
            "BIDDING_ADVICE": ["bid", "price", "cost", "offer", "competitive", "win", "strategy"],
            "TRANSACTION_TRACKING": ["track", "status", "order", "shipment", "delivery", "pickup", "transaction"],
            "SCHEDULING": ["schedule", "book", "appointment", "pickup", "collection", "arrange"],
            "GENERAL_FAQ": ["how", "what", "why", "when", "help", "explain", "tell"],
            "GREETING": ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
            "GOODBYE": ["bye", "goodbye", "see you", "thanks", "thank you", "exit", "quit"]
        };
        
        // Initialize regex patterns for entity extraction
        self.intentPatterns = {
            "batchId": "\\#\\d+",
            "wasteType": "(plastic|paper|metal|glass|organic|hazardous)",
            "quantity": "\\d+\\s*(kg|ton|tons|liters|l)",
            "date": "(today|tomorrow|yesterday|\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})",
            "price": "\\$?\\d+(\\.\\d{2})?",
            "percentage": "\\d+(\\.\\d+)?\\%"
        };
    }
    
    # Process user message and recognize intent
    # + message - User message
    # + context - Conversation context
    # + return - Recognized intent or error
    public isolated function processIntent(string message, ConversationContext context) returns Intent|error {
        // First try AI-based intent recognition
        Intent|error aiIntent = self.aiConnector.recognizeIntent(message);
        
        if aiIntent is Intent && aiIntent.confidence > 0.7 {
            // High confidence AI result
            log:printDebug(string `AI recognized intent: ${aiIntent.category} with confidence ${aiIntent.confidence}`);
            
            // Enhance with pattern-based entity extraction
            map<string> entities = check self.extractEntities(message, aiIntent.category);
            aiIntent.entities = self.mergeEntities(aiIntent.entities, entities);
            
            return aiIntent;
        }
        
        // Fallback to keyword-based matching
        log:printDebug("Using keyword-based intent matching");
        return self.keywordBasedIntentRecognition(message, context);
    }
    
    # Keyword-based intent recognition (fallback)
    # + message - User message
    # + context - Conversation context
    # + return - Recognized intent
    isolated function keywordBasedIntentRecognition(string message, ConversationContext context) returns Intent|error {
        string lowerMessage = message.toLowerAscii();
        map<float> intentScores = {};
        
        // Score each intent based on keyword matches
        lock {
            foreach var [intent, keywords] in self.intentKeywords.entries() {
                float score = 0.0;
                foreach var keyword in keywords {
                    if lowerMessage.includes(keyword) {
                        score += 1.0;
                    }
                }
                intentScores[intent] = score;
            }
        }
        
        // Consider context from previous intent
        if context.currentIntent is Intent {
            Intent currentIntent = <Intent>context.currentIntent;
            string previousIntent = currentIntent.category;
            float currentScore = (intentScores[previousIntent] is float) ? <float>intentScores[previousIntent] : 0.0;
            intentScores[previousIntent] = currentScore + 0.5; // Boost score for continuity
        }
        
        // Find highest scoring intent
        string bestIntent = "UNKNOWN";
        float bestScore = 0.0;
        
        foreach var [intent, score] in intentScores.entries() {
            if score > bestScore {
                bestIntent = intent;
                bestScore = score;
            }
        }
        
        // Calculate confidence based on score
        float rawConfidence = bestScore > 0.0 ? bestScore / 5.0 : 0.0;
        float confidence = rawConfidence > 1.0 ? 1.0 : (rawConfidence < 0.0 ? 0.0 : rawConfidence);
        
        // Extract entities
        map<string> entities = check self.extractEntities(message, check self.stringToIntentType(bestIntent));
        
        Intent intent = {
            category: check self.stringToIntentType(bestIntent),
            confidence: confidence,
            entities: entities,
            query: message
        };
        
        return intent;
    }
    
    # Extract entities from message
    # + message - User message
    # + intentType - Intent type
    # + return - Extracted entities
    public isolated function extractEntities(string message, IntentType intentType) returns map<string>|error {
        map<string> entities = {};
        
        // Extract batch IDs
        regexp:RegExp batchIdPattern = re `#\d+`;
        regexp:Span? batchIdMatch = batchIdPattern.find(message);
        if batchIdMatch is regexp:Span {
            entities["batchId"] = batchIdMatch.substring();
        }
        
        // Extract waste types
        regexp:RegExp wasteTypePattern = re `(plastic|paper|metal|glass|organic|hazardous)`;
        regexp:Span? wasteTypeMatch = wasteTypePattern.find(message.toLowerAscii());
        if wasteTypeMatch is regexp:Span {
            entities["wasteType"] = wasteTypeMatch.substring();
        }
        
        // Extract quantities
        regexp:RegExp quantityPattern = re `\d+\s*(kg|ton|tons|liters|l)`;
        regexp:Span? quantityMatch = quantityPattern.find(message);
        if quantityMatch is regexp:Span {
            entities["quantity"] = quantityMatch.substring();
        }
        
        // Extract dates
        regexp:RegExp datePattern = re `(today|tomorrow|yesterday|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})`;
        regexp:Span? dateMatch = datePattern.find(message.toLowerAscii());
        if dateMatch is regexp:Span {
            entities["date"] = dateMatch.substring();
        }
        
        // Extract prices
        regexp:RegExp pricePattern = re `\$?\d+(\.\d{2})?`;
        regexp:Span? priceMatch = pricePattern.find(message);
        if priceMatch is regexp:Span {
            entities["price"] = priceMatch.substring();
        }
        
        // Extract percentages
        regexp:RegExp percentagePattern = re `\d+(\.\d+)?%`;
        regexp:Span? percentageMatch = percentagePattern.find(message);
        if percentageMatch is regexp:Span {
            entities["percentage"] = percentageMatch.substring();
        }
        
        // Intent-specific entity extraction
        match intentType {
            QUALITY_CHECK => {
                // Look for quality-related terms
                if message.toLowerAscii().includes("reject") {
                    entities["status"] = "rejected";
                } else if message.toLowerAscii().includes("approv") {
                    entities["status"] = "approved";
                }
            }
            DEMAND_PREDICTION => {
                // Look for time periods
                if message.toLowerAscii().includes("week") {
                    entities["period"] = "week";
                } else if message.toLowerAscii().includes("month") {
                    entities["period"] = "month";
                } else if message.toLowerAscii().includes("quarter") {
                    entities["period"] = "quarter";
                }
            }
            BIDDING_ADVICE => {
                // Look for urgency indicators
                if message.toLowerAscii().includes("urgent") || message.toLowerAscii().includes("asap") {
                    entities["urgency"] = "high";
                }
            }
        }
        
        return entities;
    }
    
    # Validate and enhance intent
    # + intent - Initial intent
    # + context - Conversation context
    # + return - Enhanced intent
    public isolated function enhanceIntent(Intent intent, ConversationContext context) returns Intent {
        // If intent confidence is low, try to infer from context
        if intent.confidence < 0.5 && context.currentIntent is Intent {
            // Check if this might be a follow-up question
            Intent previousIntent = <Intent>context.currentIntent;
            
            // Inherit some context from previous intent
            foreach var [key, value] in previousIntent.entities.entries() {
                if !intent.entities.hasKey(key) {
                    intent.entities[key] = value;
                }
            }
            
            // Boost confidence slightly for contextual continuity
            float boostedConfidence = intent.confidence + 0.2;
            intent.confidence = boostedConfidence > 1.0 ? 1.0 : (boostedConfidence < 0.0 ? 0.0 : boostedConfidence);
        }
        
        return intent;
    }
    
    # Check if intent requires authentication
    # + intentType - Intent type
    # + return - True if authentication required
    public isolated function requiresAuth(IntentType intentType) returns boolean {
        match intentType {
            TRANSACTION_TRACKING|SCHEDULING|BIDDING_ADVICE => {
                return true;
            }
            _ => {
                return false;
            }
        }
    }
    
    # Get required data for intent
    # + intent - Recognized intent
    # + return - List of required data fields
    public isolated function getRequiredData(Intent intent) returns string[] {
        match intent.category {
            QUALITY_CHECK => {
                return ["batchId|wasteType"];
            }
            DEMAND_PREDICTION => {
                return ["wasteType", "location"];
            }
            BIDDING_ADVICE => {
                return ["wasteType", "quantity"];
            }
            TRANSACTION_TRACKING => {
                return ["transactionId|orderId"];
            }
            SCHEDULING => {
                return ["wasteType", "quantity", "date"];
            }
            _ => {
                return [];
            }
        }
    }
    
    # Check if intent has required data
    # + intent - Intent to check
    # + return - True if all required data present
    public isolated function hasRequiredData(Intent intent) returns boolean {
        string[] required = self.getRequiredData(intent);
        
        foreach var requiredField in required {
            if requiredField.includes("|") {
                // Either/or requirement
                regexp:RegExp pipePattern = re `\|`;
                string[] options = pipePattern.split(requiredField);
                boolean found = false;
                foreach var option in options {
                    if intent.entities.hasKey(option) {
                        found = true;
                        break;
                    }
                }
                if !found {
                    return false;
                }
            } else {
                // Required field
                if !intent.entities.hasKey(requiredField) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    # Get missing data fields
    # + intent - Intent to check
    # + return - List of missing fields
    public isolated function getMissingData(Intent intent) returns string[] {
        string[] required = self.getRequiredData(intent);
        string[] missing = [];
        
        foreach var requiredField in required {
            if requiredField.includes("|") {
                // Either/or requirement
                regexp:RegExp pipePattern = re `\|`;
                string[] options = pipePattern.split(requiredField);
                boolean found = false;
                foreach var option in options {
                    if intent.entities.hasKey(option) {
                        found = true;
                        break;
                    }
                }
                if !found {
                    missing.push(requiredField);
                }
            } else {
                // Required field
                if !intent.entities.hasKey(requiredField) {
                    missing.push(requiredField);
                }
            }
        }
        
        return missing;
    }
    
    # Merge entity maps
    # + primary - Primary entity map
    # + secondary - Secondary entity map
    # + return - Merged entity map
    isolated function mergeEntities(map<string> primary, map<string> secondary) returns map<string> {
        map<string> merged = primary.clone();
        
        foreach var [key, value] in secondary.entries() {
            if !merged.hasKey(key) {
                merged[key] = value;
            }
        }
        
        return merged;
    }
    
    # Convert string to IntentType
    # + intentStr - Intent string
    # + return - IntentType or error
    isolated function stringToIntentType(string intentStr) returns IntentType|error {
        match intentStr {
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
}