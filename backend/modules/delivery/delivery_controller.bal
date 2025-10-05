import ballerina/http;
import ballerina/log;
import ballerina/time;
import ballerinax/postgresql;
import Cyclesync.database_config;

// Get database client helper function
function getDbClient() returns postgresql:Client|error {
    return database_config:getDbClient();
}

// HTTP Service for Delivery Management
@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000"],
        allowCredentials: true,
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    }
}
service /delivery on new http:Listener(9091) {

    // Create a new delivery tracking record
    resource function post create(CreateDeliveryRequest request) returns DeliveryTracking|http:InternalServerError|http:BadRequest {
        postgresql:Client|error dbClient = getDbClient();
        if dbClient is error {
            log:printError("Database connection error", 'error = dbClient);
            return <http:InternalServerError>{
                body: {
                    message: "Database connection failed",
                    'error: dbClient.message()
                }
            };
        }

        DeliveryService|error deliveryService = new DeliveryService(dbClient);
        if deliveryService is error {
            log:printError("Failed to initialize delivery service", 'error = deliveryService);
            return <http:InternalServerError>{
                body: {
                    message: "Service initialization failed",
                    'error: deliveryService.message()
                }
            };
        }

        DeliveryTracking|error result = deliveryService.createDelivery(request);

        if result is error {
            log:printError("Error creating delivery", 'error = result);
            return <http:InternalServerError>{
                body: {
                    message: "Failed to create delivery tracking",
                    'error: result.message()
                }
            };
        }

        return result;
    }

    // Get delivery by order ID
    resource function get [string orderId]() returns DeliveryTracking|http:NotFound|http:InternalServerError {
        postgresql:Client|error dbClient = getDbClient();
        if dbClient is error {
            log:printError("Database connection error", 'error = dbClient);
            return <http:InternalServerError>{
                body: {
                    message: "Database connection failed",
                    'error: dbClient.message()
                }
            };
        }

        DeliveryService|error deliveryService = new DeliveryService(dbClient);
        if deliveryService is error {
            log:printError("Failed to initialize delivery service", 'error = deliveryService);
            return <http:InternalServerError>{
                body: {
                    message: "Service initialization failed",
                    'error: deliveryService.message()
                }
            };
        }

        DeliveryTracking|error result = deliveryService.getDeliveryByOrderId(orderId);

        if result is error {
            log:printError("Error fetching delivery", orderId = orderId, 'error = result);
            if result.message().includes("not found") {
                return <http:NotFound>{
                    body: {
                        message: "Delivery tracking not found",
                        orderId: orderId
                    }
                };
            }
            return <http:InternalServerError>{
                body: {
                    message: "Failed to fetch delivery tracking",
                    'error: result.message()
                }
            };
        }

        return result;
    }

    // Update delivery status
    resource function patch [string orderId]/status(UpdateDeliveryStatusRequest request) returns DeliveryTracking|http:NotFound|http:InternalServerError {
        postgresql:Client|error dbClient = getDbClient();
        if dbClient is error {
            log:printError("Database connection error", 'error = dbClient);
            return <http:InternalServerError>{
                body: {
                    message: "Database connection failed",
                    'error: dbClient.message()
                }
            };
        }

        DeliveryService|error deliveryService = new DeliveryService(dbClient);
        if deliveryService is error {
            log:printError("Failed to initialize delivery service", 'error = deliveryService);
            return <http:InternalServerError>{
                body: {
                    message: "Service initialization failed",
                    'error: deliveryService.message()
                }
            };
        }

        DeliveryTracking|error result = deliveryService.updateDeliveryStatus(orderId, request);

        if result is error {
            log:printError("Error updating delivery status", orderId = orderId, 'error = result);
            if result.message().includes("not found") {
                return <http:NotFound>{
                    body: {
                        message: "Delivery tracking not found",
                        orderId: orderId
                    }
                };
            }
            return <http:InternalServerError>{
                body: {
                    message: "Failed to update delivery status",
                    'error: result.message()
                }
            };
        }

        return result;
    }

    // Get all deliveries for a supplier
    resource function get supplier/[string supplierId]() returns DeliveryTracking[]|http:InternalServerError {
        postgresql:Client|error dbClient = getDbClient();
        if dbClient is error {
            log:printError("Database connection error", 'error = dbClient);
            return <http:InternalServerError>{
                body: {
                    message: "Database connection failed",
                    'error: dbClient.message()
                }
            };
        }

        DeliveryService|error deliveryService = new DeliveryService(dbClient);
        if deliveryService is error {
            log:printError("Failed to initialize delivery service", 'error = deliveryService);
            return <http:InternalServerError>{
                body: {
                    message: "Service initialization failed",
                    'error: deliveryService.message()
                }
            };
        }

        DeliveryTracking[]|error result = deliveryService.getSupplierDeliveries(supplierId);

        if result is error {
            log:printError("Error fetching supplier deliveries", supplierId = supplierId, 'error = result);
            return <http:InternalServerError>{
                body: {
                    message: "Failed to fetch deliveries",
                    'error: result.message()
                }
            };
        }

        return result;
    }

    // Health check endpoint
    resource function get health() returns json {
        return {
            status: "UP",
            'service: "Delivery Management",
            timestamp: time:utcNow()
        };
    }
}
