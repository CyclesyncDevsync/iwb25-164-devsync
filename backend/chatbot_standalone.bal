// Copyright (c) 2025 CircularSync
// Chatbot Service Main Entry Point

import ballerina/log;

public function main() returns error? {
    log:printInfo("Starting CircularSync Chatbot Service...");
    
    // The chatbot service will start automatically with WebSocket on port 8083
    // Health check endpoint on port 8084
    
    log:printInfo("Chatbot Service is running:");
    log:printInfo("- WebSocket endpoint: ws://localhost:8083/chat");
    log:printInfo("- Health check: http://localhost:8084/health");
    log:printInfo("- Connect with: ws://localhost:8083/chat?userId=<your-user-id>");
}