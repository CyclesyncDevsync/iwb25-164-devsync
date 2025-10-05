import ballerina/sql;
import ballerina/time;
import ballerina/uuid;
import ballerinax/postgresql;

// Delivery Status Enum
public enum DeliveryStatus {
    PENDING = "pending",
    PICKUP_SCHEDULED = "pickup_scheduled",
    PICKED_UP = "picked_up",
    IN_TRANSIT = "in_transit",
    OUT_FOR_DELIVERY = "out_for_delivery",
    DELIVERED = "delivered",
    FAILED = "failed",
    RETURNED = "returned"
}

// Delivery Tracking Record
public type DeliveryTracking record {|
    string id;
    string orderId;
    DeliveryStatus status;
    string? currentLocation;
    time:Utc? estimatedDeliveryDate;
    time:Utc? actualDeliveryDate;
    string? driverName;
    string? driverPhone;
    string? vehicleNumber;
    string? notes;
    DeliveryUpdate[] updates;
    time:Utc createdAt;
    time:Utc updatedAt;
|};

// Delivery Update Record
public type DeliveryUpdate record {|
    string id;
    string deliveryId;
    DeliveryStatus status;
    string location;
    time:Utc timestamp;
    string description;
    string updatedBy;
    decimal? latitude;
    decimal? longitude;
|};

// Create Delivery Request
public type CreateDeliveryRequest record {|
    string orderId;
    string? driverName;
    string? driverPhone;
    string? vehicleNumber;
    string? estimatedDeliveryDate;
    string? notes;
|};

// Update Delivery Status Request
public type UpdateDeliveryStatusRequest record {|
    DeliveryStatus status;
    string location;
    string description;
    string updatedBy;
    decimal? latitude;
    decimal? longitude;
    string? notes;
|};

// Delivery Service
public isolated class DeliveryService {
    private final postgresql:Client dbClient;

    public isolated function init(postgresql:Client dbClient) returns error? {
        self.dbClient = dbClient;
    }

    // Create a new delivery tracking record
    public isolated function createDelivery(CreateDeliveryRequest request) returns DeliveryTracking|error {
        string deliveryId = uuid:createType1AsString();
        time:Utc now = time:utcNow();

        // Parse estimated delivery date if provided
        time:Utc? estimatedDate = ();
        string? dateStr = request.estimatedDeliveryDate;
        if dateStr is string {
            estimatedDate = check time:utcFromString(dateStr);
        }

        sql:ParameterizedQuery insertQuery = `
            INSERT INTO delivery_tracking (
                id, order_id, status, current_location, estimated_delivery_date,
                driver_name, driver_phone, vehicle_number, notes, created_at, updated_at
            ) VALUES (
                ${deliveryId}, ${request.orderId}, ${PENDING}, ${()}, ${estimatedDate},
                ${request.driverName}, ${request.driverPhone}, ${request.vehicleNumber},
                ${request.notes}, ${now}, ${now}
            )
        `;

        _ = check self.dbClient->execute(insertQuery);

        // Create initial delivery update
        _ = check self.addDeliveryUpdate(deliveryId, {
            status: PENDING,
            location: "Order placed",
            description: "Delivery tracking initiated",
            updatedBy: "system",
            latitude: (),
            longitude: (),
            notes: ()
        });

        return check self.getDeliveryByOrderId(request.orderId);
    }

    // Get delivery by order ID
    public isolated function getDeliveryByOrderId(string orderId) returns DeliveryTracking|error {
        sql:ParameterizedQuery query = `
            SELECT id, order_id, status, current_location, estimated_delivery_date,
                   actual_delivery_date, driver_name, driver_phone, vehicle_number,
                   notes, created_at, updated_at
            FROM delivery_tracking
            WHERE order_id = ${orderId}
        `;

        record {|
            string id;
            string order_id;
            string status;
            string? current_location;
            time:Utc? estimated_delivery_date;
            time:Utc? actual_delivery_date;
            string? driver_name;
            string? driver_phone;
            string? vehicle_number;
            string? notes;
            time:Utc created_at;
            time:Utc updated_at;
        |}? result = check self.dbClient->queryRow(query);

        if result is () {
            return error("Delivery tracking not found for order: " + orderId);
        }

        // Get delivery updates
        DeliveryUpdate[] updates = check self.getDeliveryUpdates(result.id);

        return {
            id: result.id,
            orderId: result.order_id,
            status: <DeliveryStatus>result.status,
            currentLocation: result.current_location,
            estimatedDeliveryDate: result.estimated_delivery_date,
            actualDeliveryDate: result.actual_delivery_date,
            driverName: result.driver_name,
            driverPhone: result.driver_phone,
            vehicleNumber: result.vehicle_number,
            notes: result.notes,
            updates: updates,
            createdAt: result.created_at,
            updatedAt: result.updated_at
        };
    }

    // Get delivery updates for a delivery
    isolated function getDeliveryUpdates(string deliveryId) returns DeliveryUpdate[]|error {
        sql:ParameterizedQuery query = `
            SELECT id, delivery_id, status, location, timestamp, description,
                   updated_by, latitude, longitude
            FROM delivery_updates
            WHERE delivery_id = ${deliveryId}
            ORDER BY timestamp DESC
        `;

        stream<record {|
            string id;
            string delivery_id;
            string status;
            string location;
            time:Utc timestamp;
            string description;
            string updated_by;
            decimal? latitude;
            decimal? longitude;
        |}, sql:Error?> resultStream = self.dbClient->query(query);

        DeliveryUpdate[] updates = [];
        check from var update in resultStream
            do {
                updates.push({
                    id: update.id,
                    deliveryId: update.delivery_id,
                    status: <DeliveryStatus>update.status,
                    location: update.location,
                    timestamp: update.timestamp,
                    description: update.description,
                    updatedBy: update.updated_by,
                    latitude: update.latitude,
                    longitude: update.longitude
                });
            };

        check resultStream.close();
        return updates;
    }

    // Update delivery status
    public isolated function updateDeliveryStatus(string orderId, UpdateDeliveryStatusRequest request) returns DeliveryTracking|error {
        // Get existing delivery
        DeliveryTracking existingDelivery = check self.getDeliveryByOrderId(orderId);

        time:Utc now = time:utcNow();
        time:Utc? actualDeliveryDate = ();

        // Set actual delivery date if status is DELIVERED
        if request.status == DELIVERED {
            actualDeliveryDate = now;
        }

        // Update delivery tracking record
        sql:ParameterizedQuery updateQuery = `
            UPDATE delivery_tracking
            SET status = ${request.status},
                current_location = ${request.location},
                actual_delivery_date = ${actualDeliveryDate},
                notes = ${request.notes ?: existingDelivery.notes},
                updated_at = ${now}
            WHERE order_id = ${orderId}
        `;

        _ = check self.dbClient->execute(updateQuery);

        // Add delivery update
        _ = check self.addDeliveryUpdate(existingDelivery.id, request);

        return check self.getDeliveryByOrderId(orderId);
    }

    // Add a delivery update
    isolated function addDeliveryUpdate(string deliveryId, UpdateDeliveryStatusRequest request) returns error? {
        string updateId = uuid:createType1AsString();
        time:Utc now = time:utcNow();

        sql:ParameterizedQuery insertQuery = `
            INSERT INTO delivery_updates (
                id, delivery_id, status, location, timestamp, description,
                updated_by, latitude, longitude
            ) VALUES (
                ${updateId}, ${deliveryId}, ${request.status}, ${request.location},
                ${now}, ${request.description}, ${request.updatedBy},
                ${request.latitude}, ${request.longitude}
            )
        `;

        _ = check self.dbClient->execute(insertQuery);
    }

    // Get all deliveries for a supplier
    public isolated function getSupplierDeliveries(string supplierId) returns DeliveryTracking[]|error {
        sql:ParameterizedQuery query = `
            SELECT dt.id, dt.order_id, dt.status, dt.current_location, dt.estimated_delivery_date,
                   dt.actual_delivery_date, dt.driver_name, dt.driver_phone, dt.vehicle_number,
                   dt.notes, dt.created_at, dt.updated_at
            FROM delivery_tracking dt
            INNER JOIN orders o ON dt.order_id = o.id
            WHERE o.supplier_id = ${supplierId}
            ORDER BY dt.created_at DESC
        `;

        stream<record {|
            string id;
            string order_id;
            string status;
            string? current_location;
            time:Utc? estimated_delivery_date;
            time:Utc? actual_delivery_date;
            string? driver_name;
            string? driver_phone;
            string? vehicle_number;
            string? notes;
            time:Utc created_at;
            time:Utc updated_at;
        |}, sql:Error?> resultStream = self.dbClient->query(query);

        DeliveryTracking[] deliveries = [];
        check from var delivery in resultStream
            do {
                DeliveryUpdate[] updates = check self.getDeliveryUpdates(delivery.id);
                deliveries.push({
                    id: delivery.id,
                    orderId: delivery.order_id,
                    status: <DeliveryStatus>delivery.status,
                    currentLocation: delivery.current_location,
                    estimatedDeliveryDate: delivery.estimated_delivery_date,
                    actualDeliveryDate: delivery.actual_delivery_date,
                    driverName: delivery.driver_name,
                    driverPhone: delivery.driver_phone,
                    vehicleNumber: delivery.vehicle_number,
                    notes: delivery.notes,
                    updates: updates,
                    createdAt: delivery.created_at,
                    updatedAt: delivery.updated_at
                });
            };

        check resultStream.close();
        return deliveries;
    }
}
