import ballerina/http;
import ballerina/log;

// Stripe API configuration
configurable string stripeSecretKey = ?;
const string STRIPE_API_BASE = "https://api.stripe.com/v1";

// HTTP client for Stripe API
final http:Client stripeClient = check new (STRIPE_API_BASE, {
    auth: {
        token: stripeSecretKey
    }
});

# Create a payment intent
# + amount - Amount in cents
# + currency - Currency code (default: usd)
# + return - Payment intent client secret or error
public function createPaymentIntent(int amount, string currency = "usd") returns string|error {
    log:printInfo(string `Creating payment intent for amount: ${amount} ${currency}`);
    
    // Create form data for Stripe API
    string payload = string `amount=${amount}&currency=${currency}&automatic_payment_methods[enabled]=true`;
    
    http:Response response = check stripeClient->post("/payment_intents", payload, {
        "Content-Type": "application/x-www-form-urlencoded"
    });
    
    if response.statusCode != 200 {
        json|error errorPayload = response.getJsonPayload();
        if errorPayload is json {
            log:printError("Stripe API error", response = errorPayload);
            return error(string `Stripe API error: ${errorPayload.toJsonString()}`);
        }
        return error("Stripe API error: Unable to parse error response");
    }
    
    json jsonResponse = check response.getJsonPayload();
    json|error clientSecretJson = jsonResponse.client_secret;
    if clientSecretJson is string {
        log:printInfo("Payment intent created successfully");
        return clientSecretJson;
    }
    return error("Failed to extract client secret from response");
}

# Retrieve payment intent details
# + paymentIntentId - Payment intent ID
# + return - Payment intent details or error
public function getPaymentIntent(string paymentIntentId) returns json|error {
    log:printInfo(string `Retrieving payment intent: ${paymentIntentId}`);
    
    http:Response response = check stripeClient->get(string `/payment_intents/${paymentIntentId}`);
    
    if response.statusCode != 200 {
        json|error errorPayload = response.getJsonPayload();
        if errorPayload is json {
            log:printError("Failed to retrieve payment intent", response = errorPayload);
            return error(string `Failed to retrieve payment intent: ${errorPayload.toJsonString()}`);
        }
        return error("Failed to retrieve payment intent: Unable to parse error response");
    }
    
    json jsonResponse = check response.getJsonPayload();
    return jsonResponse;
}

# Confirm a payment intent
# + paymentIntentId - Payment intent ID
# + paymentMethodId - Payment method ID
# + return - Payment intent details or error
public function confirmPaymentIntent(string paymentIntentId, string paymentMethodId) returns json|error {
    log:printInfo(string `Confirming payment intent: ${paymentIntentId}`);
    
    string payload = string `payment_method=${paymentMethodId}`;
    
    http:Response response = check stripeClient->post(
        string `/payment_intents/${paymentIntentId}/confirm`,
        payload,
        {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    );
    
    if response.statusCode != 200 {
        json|error errorPayload = response.getJsonPayload();
        if errorPayload is json {
            log:printError("Failed to confirm payment intent", response = errorPayload);
            return error(string `Failed to confirm payment intent: ${errorPayload.toJsonString()}`);
        }
        return error("Failed to confirm payment intent: Unable to parse error response");
    }
    
    json jsonResponse = check response.getJsonPayload();
    return jsonResponse;
}
