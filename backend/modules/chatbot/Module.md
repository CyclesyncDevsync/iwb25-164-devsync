# CircularSync Intelligent Chatbot Module

## Overview
The CircularSync Chatbot module provides an AI-powered conversational interface for users to interact with the platform. Built with Ballerina and integrated with Google's Gemini AI, it offers real-time assistance for quality assessments, demand predictions, bidding recommendations, and general platform queries.

## Features

### Core Capabilities
- **Natural Language Processing**: Powered by Google Gemini AI for understanding user queries
- **Real-time Communication**: WebSocket-based for instant messaging
- **Context-Aware Responses**: Maintains conversation history and user context
- **Multi-Intent Recognition**: Handles various query types (quality, demand, bidding, etc.)
- **Business Logic Integration**: Seamlessly connects with existing CircularSync APIs

### Supported Intents
1. **Quality Assessment Queries**
   - Check quality scores
   - Understand rejection reasons
   - Get quality improvement tips
   - View agent performance

2. **Demand Prediction Insights**
   - Get demand forecasts
   - Understand market trends
   - View seasonal patterns
   - Analyze price predictions

3. **Bidding Assistance**
   - Get bidding recommendations
   - Understand optimal timing
   - View competition analysis
   - Calculate win probability

4. **Transaction Support**
   - Track shipments
   - Schedule pickups
   - View transaction history
   - Check compliance status

5. **General Assistance**
   - Platform navigation help
   - FAQ responses
   - Account management
   - Technical support

## API Reference

### WebSocket Endpoint
```
ws://localhost:8083/chat
```

### Message Format
```json
{
    "type": "user_message",
    "content": "What's the quality score for waste batch #12345?",
    "userId": "user123",
    "sessionId": "session456",
    "timestamp": "2025-01-11T10:00:00Z"
}
```

### Response Format
```json
{
    "type": "bot_response",
    "content": "The quality score for waste batch #12345 is 85/100 (Good).",
    "intent": "quality_check",
    "confidence": 0.95,
    "actions": [
        {
            "type": "show_details",
            "data": {
                "batchId": "12345",
                "score": 85,
                "grade": "Good"
            }
        }
    ],
    "suggestions": [
        "View detailed quality report",
        "Check improvement recommendations",
        "Compare with similar batches"
    ],
    "timestamp": "2025-01-11T10:00:01Z"
}
```

## Configuration

### Required Environment Variables
```toml
# Gemini AI Configuration
[chatbot.gemini]
apiKey = "YOUR_GEMINI_API_KEY"
model = "gemini-pro"
temperature = 0.7
maxTokens = 2048

# Redis Configuration (for session management)
[chatbot.redis]
host = "localhost"
port = 6379
password = ""
database = 1

# Service URLs
[chatbot.services]
qualityApiUrl = "http://localhost:8082"
demandApiUrl = "http://localhost:8081"
mainApiUrl = "http://localhost:8080"

# WebSocket Configuration
[chatbot.websocket]
port = 8083
maxConnections = 1000
pingInterval = 30
timeout = 300
```

## Architecture

### Components
1. **WebSocket Service**: Handles real-time connections
2. **AI Connector**: Integrates with Gemini AI
3. **Intent Processor**: Recognizes user intents
4. **Conversation Manager**: Maintains chat state
5. **Response Generator**: Formats intelligent responses
6. **Business Logic Connector**: Integrates with CircularSync APIs

### Data Flow
1. User sends message via WebSocket
2. Message is processed for intent recognition
3. Context is retrieved from Redis
4. Gemini AI generates understanding
5. Business APIs are called if needed
6. Response is formatted and sent back
7. Context is updated and stored

## Usage Examples

### Basic Quality Check
```
User: "What's the quality of plastic waste from yesterday?"
Bot: "I found 3 plastic waste batches from yesterday. The average quality score is 82/100 (Good). Would you like to see individual batch details?"
```

### Demand Prediction Query
```
User: "Should I bid on metal waste this week?"
Bot: "Based on our demand prediction, metal waste demand is expected to increase by 15% this week. The optimal bidding window is Tuesday-Wednesday. Current market competition is moderate. Would you like specific bidding recommendations?"
```

### Complex Multi-Turn Conversation
```
User: "I need help with a rejected batch"
Bot: "I can help you with the rejected batch. Could you provide the batch ID or describe what type of waste it was?"
User: "It's batch #78901, paper waste"
Bot: "I found batch #78901. It was rejected due to high contamination level (35%). The main issues were: 1) Plastic contamination 2) Moisture content above threshold. Would you like tips on improving paper waste quality?"
```

## Performance Metrics

- Average response time: < 500ms
- Intent recognition accuracy: > 90%
- Concurrent connections: Up to 1000
- Message throughput: 10,000 messages/minute
- Context retention: 24 hours

## Security

- Authentication via WSO2 Identity Server
- Rate limiting: 100 messages per minute per user
- Input sanitization and validation
- Encrypted WebSocket connections (WSS in production)
- Session timeout after 30 minutes of inactivity

## Monitoring

The chatbot module includes comprehensive logging and metrics:
- Connection statistics
- Intent recognition metrics
- Response time tracking
- Error rate monitoring
- User satisfaction scoring

## Future Enhancements

1. **Voice Support**: Speech-to-text and text-to-speech
2. **Multi-language**: Support for additional languages
3. **Proactive Messaging**: Alert notifications and reminders
4. **Human Handoff**: Escalation to support agents
5. **Advanced Analytics**: Conversation insights and trends