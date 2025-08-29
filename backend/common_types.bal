// Common types used across the application

public type ErrorResponse record {|
    int code;
    string message;
    string details?;
|};

public type SuccessResponse record {|
    int code;
    string message;
    anydata data?;
|};
