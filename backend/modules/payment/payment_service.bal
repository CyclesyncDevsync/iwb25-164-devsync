import ballerina/http;
import ballerina/log;
import ballerina/url;

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

# Create a Stripe Checkout Session
# + amount - Amount in cents
# + currency - Currency code
# + successUrl - Success redirect URL
# + cancelUrl - Cancel redirect URL
# + return - Checkout session URL or error
public function createCheckoutSession(int amount, string currency, string successUrl, string cancelUrl) returns string|error {
    log:printInfo(string `Creating checkout session for amount: ${amount} ${currency}`);
    
    // Append session_id parameter to success URL if not already present
    string finalSuccessUrl = successUrl;
    if !successUrl.includes("session_id") {
        string separator = successUrl.includes("?") ? "&" : "?";
        // Stripe will replace {CHECKOUT_SESSION_ID} with the actual session ID
        finalSuccessUrl = string `${successUrl}${separator}session_id={CHECKOUT_SESSION_ID}`;
    }
    
    // URL encode the URLs and product name for form data
    string encodedSuccessUrl = check url:encode(finalSuccessUrl, "UTF-8");
    string encodedCancelUrl = check url:encode(cancelUrl, "UTF-8");
    string encodedProductName = check url:encode("Wallet Recharge", "UTF-8");
    
    // Create form data for Stripe Checkout Session API
    string payload = string `mode=payment&success_url=${encodedSuccessUrl}&cancel_url=${encodedCancelUrl}&line_items[0][price_data][currency]=${currency}&line_items[0][price_data][product_data][name]=${encodedProductName}&line_items[0][price_data][unit_amount]=${amount}&line_items[0][quantity]=1`;
    
    http:Response response = check stripeClient->post("/checkout/sessions", payload, {
        "Content-Type": "application/x-www-form-urlencoded"
    });
    
    if response.statusCode != 200 && response.statusCode != 303 {
        json|error errorPayload = response.getJsonPayload();
        if errorPayload is json {
            log:printError("Stripe Checkout API error", response = errorPayload);
            return error(string `Stripe Checkout API error: ${errorPayload.toJsonString()}`);
        }
        return error("Stripe Checkout API error: Unable to parse error response");
    }
    
    json jsonResponse = check response.getJsonPayload();
    json|error checkoutUrlJson = jsonResponse.url;
    if checkoutUrlJson is string {
        log:printInfo("Checkout session created successfully");
        return checkoutUrlJson;
    }
    return error("Failed to extract checkout URL from response");
}

# Retrieve checkout session details
# + sessionId - Checkout session ID
# + return - Checkout session details or error
public function getCheckoutSession(string sessionId) returns json|error {
    log:printInfo(string `Retrieving checkout session: ${sessionId}`);
    
    http:Response response = check stripeClient->get(string `/checkout/sessions/${sessionId}`);
    
    if response.statusCode != 200 {
        json|error errorPayload = response.getJsonPayload();
        if errorPayload is json {
            log:printError("Failed to retrieve checkout session", response = errorPayload);
            return error(string `Failed to retrieve checkout session: ${errorPayload.toJsonString()}`);
        }
        return error("Failed to retrieve checkout session: Unable to parse error response");
    }
    
    json jsonResponse = check response.getJsonPayload();
    return jsonResponse;
}
