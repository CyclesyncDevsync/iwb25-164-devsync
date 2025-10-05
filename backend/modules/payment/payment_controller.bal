import ballerina/http;
import ballerina/log;
import ballerina/time;
import Cyclesync.auth;

# Payment API Controller
# Handles payment-related HTTP endpoints
@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000", "https://localhost:3000"],
        allowCredentials: true,
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
}
service /api/payment on new http:Listener(8098) {

    private auth:AuthMiddleware authMiddleware = new ();

    # Create a payment intent
    # + request - HTTP request with payment details
    # + return - Payment intent response or error
    resource function post 'create\-intent(http:Request request) returns json|http:Response {
        log:printInfo("Received create payment intent request");
        
        // Authenticate user
        auth:AuthContext|http:Unauthorized authResult = self.authMiddleware.authenticate(request);
        if authResult is http:Unauthorized {
            return createErrorResponse(401, "Unauthorized", "Authentication failed");
        }
        
        auth:AuthContext userContext = authResult;
        
        // Parse request body
        json|error payload = request.getJsonPayload();
        if payload is error {
            log:printError("Invalid request payload", 'error = payload);
            return createErrorResponse(400, "Invalid request", "Invalid JSON payload");
        }
        
        // Extract amount
        json|error amountJson = trap payload.amount;
        if amountJson is error || amountJson is () {
            log:printError("Invalid amount - missing or invalid");
            return createErrorResponse(400, "Invalid amount", "Amount is required");
        }
        
        decimal|error amount = trap <decimal>amountJson;
        if amount is error {
            log:printError("Invalid amount - cannot convert to decimal", 'error = amount);
            return createErrorResponse(400, "Invalid amount", "Amount must be a valid number");
        }
        
        // Validate amount
        if amount <= 0.0d {
            return createErrorResponse(400, "Invalid amount", "Amount must be greater than 0");
        }
        
        // Get currency (default to USD)
        string currency = "usd";
        json|error currencyJson = trap payload.currency;
        if currencyJson is string {
            currency = currencyJson.toLowerAscii();
        }
        
        // Validate maximum amount based on currency
        // Stripe limit for LKR: 999,999.99
        if currency == "lkr" && amount > 999999.0d {
            return createErrorResponse(400, "Invalid amount", "Amount must not exceed 999,999.99 LKR");
        }
        
        // Convert amount to smallest currency unit
        // LKR (Sri Lankan Rupee) uses cents (1 LKR = 100 cents)
        // USD also uses cents
        int amountInSmallestUnit = <int>(amount * 100);
        
        log:printInfo(string `Creating payment intent for user ${userContext.userId}: ${amount} ${currency} (${amountInSmallestUnit} smallest units)`);
        
        // Create payment intent
        string|error clientSecret = createPaymentIntent(amountInSmallestUnit, currency);
        if clientSecret is error {
            log:printError("Failed to create payment intent", 'error = clientSecret);
            return createErrorResponse(500, "Payment error", clientSecret.message());
        }
        
        // Return success response with proper structure
        log:printInfo(string `Payment intent created for user ${userContext.userId}`);
        return createSuccessResponse({
            "id": "", // Stripe will generate this
            "client_secret": clientSecret,
            "status": "requires_payment_method",
            "amount": amountInSmallestUnit,
            "currency": currency,
            "description": "",
            "metadata": {},
            "created": ""
        });
    }

    # Confirm a payment
    # + request - HTTP request with payment confirmation details
    # + return - Payment confirmation response or error
    resource function post confirm(http:Request request) returns json|http:Response {
        log:printInfo("Received payment confirmation request");
        
        // Authenticate user
        auth:AuthContext|http:Unauthorized authResult = self.authMiddleware.authenticate(request);
        if authResult is http:Unauthorized {
            return createErrorResponse(401, "Unauthorized", "Authentication failed");
        }
        
        auth:AuthContext userContext = authResult;
        
        // Parse request body
        json|error payload = request.getJsonPayload();
        if payload is error {
            log:printError("Invalid request payload", 'error = payload);
            return createErrorResponse(400, "Invalid request", "Invalid JSON payload");
        }
        
        // Extract payment intent ID
        json|error paymentIntentIdJson = trap payload.paymentIntentId;
        if paymentIntentIdJson is error || paymentIntentIdJson is () {
            return createErrorResponse(400, "Invalid request", "Payment intent ID is required");
        }
        
        string|error paymentIntentId = trap <string>paymentIntentIdJson;
        if paymentIntentId is error {
            return createErrorResponse(400, "Invalid request", "Payment intent ID must be a string");
        }
        
        // Get payment intent details
        json|error paymentIntent = getPaymentIntent(paymentIntentId);
        if paymentIntent is error {
            log:printError("Failed to retrieve payment intent", 'error = paymentIntent);
            return createErrorResponse(500, "Payment error", paymentIntent.message());
        }
        
        // Extract payment details
        json|error statusJson = trap paymentIntent.status;
        json|error amountJson = trap paymentIntent.amount;
        json|error currencyJson = trap paymentIntent.currency;
        
        string paymentStatus = statusJson is string ? statusJson : "unknown";
        int amountInCents = amountJson is int ? amountJson : 0;
        string currency = currencyJson is string ? currencyJson : "usd";
        
        // Check if payment succeeded
        if paymentStatus == "succeeded" {
            // Convert amount from cents to main currency unit
            decimal amountInMainUnit = <decimal>amountInCents / 100.0d;
            
            log:printInfo(string `Payment succeeded for user ${userContext.userId}: ${amountInMainUnit} ${currency}`);
            
            // Update wallet balance by calling wallet recharge endpoint
            http:Client|error walletClientResult = new ("http://localhost:8097");
            if walletClientResult is error {
                log:printError("Failed to create wallet client", 'error = walletClientResult);
                return createErrorResponse(500, "Wallet update error", "Failed to connect to wallet service");
            }
            
            http:Client walletClient = walletClientResult;
            
            // Get authorization header from request
            string|http:HeaderNotFoundError authHeader = request.getHeader("Authorization");
            if authHeader is http:HeaderNotFoundError {
                return createErrorResponse(401, "Unauthorized", "Authorization header missing");
            }
            
            // Call wallet recharge endpoint
            json|error walletResponse = walletClient->post("/api/wallet/recharge", {
                "amount": amountInMainUnit
            }, {
                "Authorization": authHeader,
                "Content-Type": "application/json"
            });
            
            if walletResponse is error {
                log:printError("Wallet recharge failed", 'error = walletResponse);
                return createErrorResponse(500, "Wallet update error", "Failed to update wallet balance");
            }
            
            log:printInfo(string `Wallet updated successfully for user ${userContext.userId}`);
            
            // Return success with wallet updated flag
            json responseData = {
                "status": paymentStatus,
                "paymentIntentId": paymentIntentId,
                "amount": amountInCents,
                "currency": currency,
                "walletUpdated": true
            };
            
            return createSuccessResponse(responseData);
        }
        
        // Payment not yet succeeded
        json responseData = {
            "status": paymentStatus,
            "paymentIntentId": paymentIntentId,
            "amount": amountInCents,
            "currency": currency,
            "walletUpdated": false
        };
        
        log:printInfo(string `Payment confirmed for user ${userContext.userId}`);
        return createSuccessResponse(responseData);
    }

    # Health check endpoint
    # + return - Health status
    resource function get health() returns json {
        time:Utc currentTime = time:utcNow();
        return {
            "status": "healthy",
            "service": "payment",
            "timestamp": currentTime[0]
        };
    }
}

# Create an error response
# + statusCode - HTTP status code
# + 'error - Error type
# + message - Error message
# + return - HTTP response with error details
function createErrorResponse(int statusCode, string 'error, string message) returns http:Response {
    http:Response response = new;
    response.statusCode = statusCode;
    response.setJsonPayload({
        "status": "error",
        "error": 'error,
        "message": message
    });
    return response;
}

# Create a success response
# + data - Response data
# + return - HTTP response with success status
function createSuccessResponse(json data) returns json {
    return {
        "status": "success",
        "data": data
    };
}
