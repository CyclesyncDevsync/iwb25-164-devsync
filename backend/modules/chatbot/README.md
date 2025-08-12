# CircularSync Chatbot Module

## Overview
AI-powered chatbot for CircularSync platform using Google Gemini AI and Ballerina WebSocket.

## Quick Start

### 1. Prerequisites
- Ballerina Swan Lake installed
- Google Gemini API key
- Redis server (optional, for production)

### 2. Configuration
1. Copy `Config.toml.template` to `Config.toml`
2. Add your Gemini API key:
```toml
GEMINI_API_KEY = "your-gemini-api-key-here"
```

### 3. Run the Chatbot
```bash
# From backend directory
bal run chatbot_main.bal
```

The chatbot will start on:
- WebSocket: `ws://localhost:8083/chat`
- Health Check: `http://localhost:8084/health`

### 4. Test the Chatbot
Open `modules/chatbot/test_client.html` in a browser and click "Connect".

## Features

### Supported Intents
- **Quality Check**: Check quality scores, rejection reasons
- **Demand Prediction**: View forecasts, market trends
- **Bidding Advice**: Get pricing recommendations
- **Transaction Tracking**: Track orders and shipments
- **Scheduling**: Book pickups and deliveries
- **General Help**: Platform information and FAQ

### Example Conversations

#### Quality Check
```
User: What's the quality score for batch #12345?
Bot: Batch #12345 has a quality score of 85/100 (Good). The assessment shows minimal contamination and good sorting accuracy.
```

#### Demand Prediction
```
User: Should I bid on metal waste this week?
Bot: Based on demand prediction, metal waste demand is expected to increase by 15% this week. The optimal bidding window is Tuesday-Wednesday.
```

#### Bidding Advice
```
User: I have 5 tons of paper waste. What price should I set?
Bot: For 5 tons of paper waste, I recommend starting at $450/ton. The market range is $420-480/ton with a 75% win probability at your price.
```

## WebSocket API

### Connection
```javascript
const ws = new WebSocket('ws://localhost:8083/chat?userId=<user-id>');
```

### Message Format
```json
{
    "type": "user_message",
    "content": "Your question here",
    "userId": "user123",
    "sessionId": "session456",
    "timestamp": "2025-01-11T10:00:00Z"
}
```

### Response Format
```json
{
    "type": "bot_response",
    "content": "Bot's response",
    "intent": {
        "category": "QUALITY_CHECK",
        "confidence": 0.95
    },
    "suggestions": ["View report", "Check other batches"],
    "actions": [{
        "type": "SHOW_DETAILS",
        "label": "View Full Report"
    }]
}
```

## Architecture

### Components
1. **WebSocket Service** (`chatbot_service.bal`) - Main service
2. **AI Connector** (`ai_connector.bal`) - Gemini integration
3. **Intent Processor** (`intent_processor.bal`) - Intent recognition
4. **Conversation Manager** (`conversation_manager.bal`) - Session management
5. **Response Generator** (`response_generator.bal`) - Response formatting

### Data Flow
1. User sends message via WebSocket
2. Intent is recognized using Gemini AI
3. Business data is fetched from APIs
4. Response is generated and sent back
5. Session context is maintained

## Development

### Adding New Intents
1. Add intent to `IntentType` enum in `types.bal`
2. Update intent keywords in `intent_processor.bal`
3. Add response logic in `response_generator.bal`
4. Implement data fetching in `chatbot_service.bal`

### Testing
```bash
# Run tests
bal test modules/chatbot

# Use test client
open modules/chatbot/test_client.html
```

## Production Deployment

### With WSO2 Choreo
1. Package the module
2. Deploy to Choreo
3. Configure environment variables
4. Enable WebSocket support

### Environment Variables
```bash
export GEMINI_API_KEY="your-key"
export QUALITY_API_URL="https://api.circularsync.com/quality"
export DEMAND_API_URL="https://api.circularsync.com/demand"
```

### Monitoring
- Health endpoint: `/health`
- Metrics: Connection count, response times, error rates
- Logs: Session activities, intent recognition, API calls

## Troubleshooting

### Connection Issues
- Check WebSocket port (8083) is not blocked
- Verify userId parameter is provided
- Check browser console for errors

### Response Issues
- Verify Gemini API key is valid
- Check business API endpoints are running
- Review logs for intent recognition errors

### Performance
- Implement Redis for session caching
- Use connection pooling for APIs
- Enable response caching for common queries