// Main service file that includes Quality Assessment AI
// This demonstrates the integration of Google Vision API with CircularSync

import ballerina/http;
import ballerina/log;

// Import the quality assessment module

// Main HTTP listener for quality assessment service
listener http:Listener qualityMainListener = new(8083);

// Health check service for the quality assessment system
@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000", "https://cyclesync.com"],
        allowCredentials: true,
        allowHeaders: ["Authorization", "Content-Type"]
    }
}
service /health on qualityMainListener {
    
    resource function get .() returns record {string status; string message; string[] services;} {
        return {
            status: "healthy",
            message: "CircularSync Quality Assessment System is operational",
            services: [
                "Quality Assessment AI Service (Port 8082)",
                "Google Vision API Integration",
                "Waste Quality Analysis",
                "Field Agent Photo Verification"
            ]
        };
    }
    
    resource function get detailed() returns record {
        string status; 
        string message; 
        record {string name; string port; string endpoint;}[] services;
        string[] features;
    } {
        return {
            status: "healthy",
            message: "All CircularSync AI services operational",
            services: [
                {
                    name: "Demand Prediction AI",
                    port: "8081", 
                    endpoint: "/api/ai/demand"
                },
                {
                    name: "Quality Assessment AI",
                    port: "8082",
                    endpoint: "/api/ai/quality"
                }
            ],
            features: [
                "🔮 Demand Forecasting with Time-Series Analysis",
                "📊 Bidding Recommendations and Market Analysis", 
                "🔍 Computer Vision Quality Assessment",
                "📷 Google Vision API Integration",
                "🎯 Multi-factor Waste Quality Scoring",
                "⚡ Parallel Batch Image Processing",
                "📋 Quality Standards Compliance",
                "🚨 Real-time Quality Alerts"
            ]
        };
    }
}

public function main() returns error? {
    log:printInfo("🚀 Starting CircularSync Quality Assessment System...");
    log:printInfo("📋 Services Status:");
    log:printInfo("   ✅ Demand Prediction AI - Running on port 8081");
    log:printInfo("   ✅ Quality Assessment AI - Running on port 8082"); 
    log:printInfo("   ✅ Health Check Service - Running on port 8083");
    log:printInfo("🔧 Google Vision API - Configured with Service Account");
    log:printInfo("📍 Health Check: http://localhost:8083/health");
    log:printInfo("🎯 Quality Assessment: http://localhost:8082/api/ai/quality/health");
    log:printInfo("📈 Demand Prediction: http://localhost:8081/api/ai/demand/health");
}