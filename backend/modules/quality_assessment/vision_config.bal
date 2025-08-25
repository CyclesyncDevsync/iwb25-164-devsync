// Google Vision API Configuration
// This file contains the configuration for Google Cloud Vision API authentication

import ballerinax/googleapis.vision;
import ballerina/log;
import ballerina/http;


// API Key configuration (for direct HTTP calls if needed)
configurable string googleApiKey = ?;

// Service account configuration
configurable string serviceAccountPath = "config/google-vision-service-account.json";

// Configuration function to get Vision API client
public function getVisionClient() returns vision:Client|error {
    // Since the googleapis.vision connector requires OAuth2 authentication,
    // and API key authentication isn't directly supported, we have two options:
    // 1. Use service account authentication (recommended for production)
    // 2. Use a custom HTTP client with API key (simpler but less secure)
    
    // For now, let's use a simple Bearer token approach
    // In production, you should use proper service account authentication
    
    http:BearerTokenConfig bearerConfig = {
        token: googleApiKey
    };
    
    vision:ConnectionConfig clientConfig = {
        auth: bearerConfig
    };
    
    log:printInfo("Initializing Google Vision API client");
    return new(clientConfig);
}

// Direct HTTP call to Vision API with API key
public function callVisionAPI(string base64Image) returns json|error {
    http:Client httpClient = check new("https://vision.googleapis.com");
    
    json requestBody = {
        "requests": [
            {
                "image": {
                    "content": base64Image
                },
                "features": [
                    {
                        "type": "OBJECT_LOCALIZATION",
                        "maxResults": 50
                    },
                    {
                        "type": "TEXT_DETECTION", 
                        "maxResults": 20
                    },
                    {
                        "type": "IMAGE_PROPERTIES",
                        "maxResults": 1
                    },
                    {
                        "type": "SAFE_SEARCH_DETECTION",
                        "maxResults": 1
                    }
                ]
            }
        ]
    };
    
    string url = string `/v1/images:annotate?key=${googleApiKey}`;
    
    log:printInfo(string `Calling Vision API: ${url.substring(0, 50)}...`);
    
    http:Response response = check httpClient->post(url, requestBody, {
        "Content-Type": "application/json"
    });
    
    if response.statusCode != 200 {
        string errorMsg = check response.getTextPayload();
        return error(string `Vision API error ${response.statusCode}: ${errorMsg}`);
    }
    
    json result = check response.getJsonPayload();
    log:printInfo("Vision API call successful");
    return result;
}