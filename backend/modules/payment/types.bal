# Payment intent request
public type PaymentIntentRequest record {|
    decimal amount;
    string currency?;
|};

# Payment intent response
public type PaymentIntentResponse record {|
    string clientSecret;
    string paymentIntentId;
|};

# Payment confirmation request
public type ConfirmPaymentRequest record {|
    string paymentIntentId;
    string paymentMethodId;
|};

# Payment status
public type PaymentStatus record {|
    string status;
    string paymentIntentId;
    decimal amount;
    string currency;
|};

# Error response
public type ErrorResponse record {|
    string message;
    string 'error;
|};
