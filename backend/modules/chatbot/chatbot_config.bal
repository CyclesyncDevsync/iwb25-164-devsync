// Copyright (c) 2025 CircularSync
// Chatbot Module - Configuration

# Gemini API Configuration
configurable string geminiApiKey = ?;
configurable string geminiModel = "gemini-pro";

# WebSocket Configuration
configurable int websocketPort = 8083;
configurable int sessionTimeout = 1800;
configurable int maxConnections = 1000;
configurable int rateLimit = 100;

# Service URLs
configurable string qualityApiUrl = "http://localhost:8082";
configurable string demandApiUrl = "http://localhost:8081";
configurable string mainApiUrl = "http://localhost:8080";

# Redis Configuration (for future use)
configurable string redisHost = "localhost";
configurable int redisPort = 6379;
configurable string redisPassword = "";
configurable int redisDatabase = 1;