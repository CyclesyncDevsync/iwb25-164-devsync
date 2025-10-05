import ballerina/http;
import ballerina/sql;
import ballerinax/postgresql;
import ballerina/log;
import ballerina/random;
import ballerina/time;
import Cyclesync.database_config;

// Service listener
listener http:Listener schedulingListener = new (8089);

// Type definitions
public type PickupScheduleRequest record {|
    string assignmentId;
    string materialId;
    string agentId;
    string supplierId;
    string pickupDate;
    string pickupTimeSlot;
    string contactPerson;
    string contactPhone;
    string? alternatePhone;
    string pickupAddress;
    string? landmark;
    string? accessInstructions;
    decimal? estimatedWeight;
    boolean packagingAvailable = false;
    string? specialRequirements;
|};

public type DropoffScheduleRequest record {|
    string assignmentId;
    string materialId;
    string supplierId;
    string dropoffDate;
    string dropoffTimeSlot;
    string warehouseName;
    string warehouseAddress;
    string? warehousePhone;
    string transportMethod;
    string? vehicleType;
    string? vehicleNumber;
    string? driverName;
    string? driverPhone;
    string? estimatedArrivalTime;
    decimal? estimatedWeight;
    string? specialInstructions;
|};

// Main scheduling service
@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000", "http://192.168.80.1:3000", "https://cyclesync.com"],
        allowCredentials: true,
        allowHeaders: ["Authorization", "Content-Type"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
}
service /api/scheduling on schedulingListener {
    
    function init() returns error? {
        log:printInfo("Scheduling Service initialized successfully on port 8089");
    }
    
    // Health check endpoint
    resource function get health() returns json {
        return {
            "status": "healthy",
            "service": "scheduling",
            "port": 8089,
            "timestamp": check time:utcToString(time:utcNow())
        };
    }
    
    // Schedule a pickup (agent visit)
    resource function post pickup(@http:Payload json jsonPayload) 
            returns http:Ok|http:BadRequest|http:InternalServerError {
        
        do {
            log:printInfo(string `Received pickup request: ${jsonPayload.toString()}`);
            
            // Parse required fields
            string assignmentId = check jsonPayload.assignmentId.ensureType(string);
            string materialId = check jsonPayload.materialId.ensureType(string);
            string agentId = check jsonPayload.agentId.ensureType(string);
            string supplierId = check jsonPayload.supplierId.ensureType(string);
            string pickupDate = check jsonPayload.pickupDate.ensureType(string);
            string pickupTimeSlot = check jsonPayload.pickupTimeSlot.ensureType(string);
            string contactPerson = check jsonPayload.contactPerson.ensureType(string);
            string contactPhone = check jsonPayload.contactPhone.ensureType(string);
            string pickupAddress = check jsonPayload.pickupAddress.ensureType(string);
            boolean packagingAvailable = check jsonPayload.packagingAvailable.ensureType(boolean);
            
            // Optional fields
            string? alternatePhone = jsonPayload.alternatePhone is () ? () : check jsonPayload.alternatePhone.ensureType(string);
            string? landmark = jsonPayload.landmark is () ? () : check jsonPayload.landmark.ensureType(string);
            string? accessInstructions = jsonPayload.accessInstructions is () ? () : check jsonPayload.accessInstructions.ensureType(string);
            string? specialRequirements = jsonPayload.specialRequirements is () ? () : check jsonPayload.specialRequirements.ensureType(string);
            
            // Handle estimatedWeight - convert empty string to null
            decimal? estimatedWeight = ();
            var weightValue = jsonPayload.estimatedWeight;
            if (weightValue is string && weightValue != "") {
                estimatedWeight = check decimal:fromString(weightValue);
            } else if (weightValue is decimal) {
                estimatedWeight = weightValue;
            }
            
            postgresql:Client dbClient = check database_config:getDbClient();
            
            // Generate confirmation code
            string confirmationCode = check generateConfirmationCode();
            
            // Insert pickup schedule
            sql:ParameterizedQuery insertQuery = `
                INSERT INTO scheduled_pickups (
                    assignment_id, material_id, agent_id, supplier_id,
                    pickup_date, pickup_time_slot, 
                    contact_person, contact_phone, alternate_phone,
                    pickup_address, landmark, access_instructions,
                    estimated_weight, packaging_available, special_requirements,
                    confirmation_code, status
                ) VALUES (
                    ${assignmentId}, ${materialId}::integer, 
                    ${agentId}, ${supplierId},
                    ${pickupDate}::date, ${pickupTimeSlot},
                    ${contactPerson}, ${contactPhone}, ${alternatePhone},
                    ${pickupAddress}, ${landmark}, ${accessInstructions},
                    ${estimatedWeight}, ${packagingAvailable}, ${specialRequirements},
                    ${confirmationCode}, 'scheduled'
                )
                RETURNING id
            `;
            
            int scheduleId = check dbClient->queryRow(insertQuery);
            
            log:printInfo(string `Pickup scheduled successfully. ID: ${scheduleId}, Code: ${confirmationCode}`);
            
            return <http:Ok>{
                body: {
                    "message": "Pickup scheduled successfully",
                    "scheduleId": scheduleId,
                    "confirmationCode": confirmationCode,
                    "pickupDate": pickupDate,
                    "timeSlot": pickupTimeSlot
                }
            };
            
        } on fail error e {
            log:printError("Failed to schedule pickup", e);
            return <http:InternalServerError>{
                body: {
                    "error": "Failed to schedule pickup",
                    "message": e.message()
                }
            };
        }
    }
    
    // Schedule a dropoff
    resource function post dropoff(@http:Payload json jsonPayload) 
            returns http:Ok|http:BadRequest|http:InternalServerError {
        
        do {
            log:printInfo(string `Received dropoff request: ${jsonPayload.toString()}`);
            
            // Parse the JSON payload manually to handle empty strings
            string assignmentId = check jsonPayload.assignmentId.ensureType(string);
            string materialId = check jsonPayload.materialId.ensureType(string);
            string supplierId = check jsonPayload.supplierId.ensureType(string);
            string dropoffDate = check jsonPayload.dropoffDate.ensureType(string);
            string dropoffTimeSlot = check jsonPayload.dropoffTimeSlot.ensureType(string);
            string warehouseName = check jsonPayload.warehouseName.ensureType(string);
            string warehouseAddress = check jsonPayload.warehouseAddress.ensureType(string);
            string transportMethod = check jsonPayload.transportMethod.ensureType(string);
            
            // Optional fields
            string? warehousePhone = jsonPayload.warehousePhone is () ? () : check jsonPayload.warehousePhone.ensureType(string);
            string? vehicleType = jsonPayload.vehicleType is () ? () : check jsonPayload.vehicleType.ensureType(string);
            string? vehicleNumber = jsonPayload.vehicleNumber is () ? () : check jsonPayload.vehicleNumber.ensureType(string);
            string? driverName = jsonPayload.driverName is () ? () : check jsonPayload.driverName.ensureType(string);
            string? driverPhone = jsonPayload.driverPhone is () ? () : check jsonPayload.driverPhone.ensureType(string);
            string? estimatedArrivalTime = jsonPayload.estimatedArrivalTime is () ? () : check jsonPayload.estimatedArrivalTime.ensureType(string);
            string? specialInstructions = jsonPayload.specialInstructions is () ? () : check jsonPayload.specialInstructions.ensureType(string);
            
            // Handle estimatedWeight - convert empty string to null
            decimal? estimatedWeight = ();
            var weightValue = jsonPayload.estimatedWeight;
            if (weightValue is string && weightValue != "") {
                estimatedWeight = check decimal:fromString(weightValue);
            } else if (weightValue is decimal) {
                estimatedWeight = weightValue;
            }
            
            // Validate required fields
            if (assignmentId == "" || materialId == "" || supplierId == "") {
                return <http:BadRequest>{
                    body: {
                        "error": "Missing required fields",
                        "message": "assignmentId, materialId, and supplierId are required"
                    }
                };
            }
            
            postgresql:Client dbClient = check database_config:getDbClient();
            
            // Generate confirmation code
            string confirmationCode = check generateConfirmationCode();
            
            // Process estimated arrival time
            string? processedArrivalTime = ();
            if estimatedArrivalTime is string && estimatedArrivalTime != "" {
                processedArrivalTime = estimatedArrivalTime + ":00";
            }
            
            // Insert dropoff schedule
            sql:ParameterizedQuery insertQuery = `
                INSERT INTO scheduled_dropoffs (
                    assignment_id, material_id, supplier_id,
                    dropoff_date, dropoff_time_slot,
                    warehouse_name, warehouse_address, warehouse_phone,
                    transport_method, vehicle_type, vehicle_number,
                    driver_name, driver_phone, estimated_arrival_time,
                    estimated_weight, special_instructions,
                    confirmation_code, status
                ) VALUES (
                    ${assignmentId}, ${materialId}::integer, ${supplierId},
                    ${dropoffDate}::date, ${dropoffTimeSlot},
                    ${warehouseName}, ${warehouseAddress}, ${warehousePhone},
                    ${transportMethod}, ${vehicleType}, ${vehicleNumber},
                    ${driverName}, ${driverPhone}, 
                    ${processedArrivalTime}::time,
                    ${estimatedWeight}, ${specialInstructions},
                    ${confirmationCode}, 'scheduled'
                )
                RETURNING id
            `;
            
            int scheduleId = check dbClient->queryRow(insertQuery);
            
            log:printInfo(string `Dropoff scheduled successfully. ID: ${scheduleId}, Code: ${confirmationCode}`);
            
            return <http:Ok>{
                body: {
                    "message": "Drop-off scheduled successfully",
                    "scheduleId": scheduleId,
                    "confirmationCode": confirmationCode,
                    "dropoffDate": dropoffDate,
                    "timeSlot": dropoffTimeSlot,
                    "warehouse": warehouseName
                }
            };
            
        } on fail error e {
            log:printError("Failed to schedule dropoff", e);
            return <http:InternalServerError>{
                body: {
                    "error": "Failed to schedule dropoff",
                    "message": e.message()
                }
            };
        }
    }
    
    // Get scheduled pickups for an agent
    resource function get pickups/agent/[string agentId]() 
            returns json|http:InternalServerError {
        
        do {
            postgresql:Client dbClient = check database_config:getDbClient();
            
            sql:ParameterizedQuery query = `
                SELECT 
                    sp.*,
                    ms.title as material_title,
                    ms.quantity as material_quantity,
                    ms.unit as material_unit,
                    u.first_name || ' ' || u.last_name as supplier_name
                FROM scheduled_pickups sp
                JOIN material_submissions ms ON sp.material_id = ms.id
                LEFT JOIN users u ON sp.supplier_id = u.asgardeo_id
                WHERE sp.agent_id = ${agentId}
                AND sp.status = 'scheduled'
                ORDER BY sp.pickup_date, sp.pickup_time_slot
            `;
            
            stream<record {}, sql:Error?> resultStream = dbClient->query(query);
            record {}[] pickups = [];
            
            check from record {} pickup in resultStream
                do {
                    pickups.push(pickup);
                };
            
            check resultStream.close();
            
            json[] pickupsJson = [];
            foreach record {} pickup in pickups {
                pickupsJson.push(<json>pickup);
            }
            
            return <json> {
                "agentId": agentId,
                "pickups": pickupsJson,
                "count": pickups.length()
            };
            
        } on fail error e {
            log:printError("Failed to get agent pickups", e);
            return <http:InternalServerError>{
                body: {
                    "error": "Failed to retrieve pickups",
                    "message": e.message()
                }
            };
        }
    }
    
    // Get scheduled dropoffs for a supplier
    resource function get dropoffs/supplier/[string supplierId]() 
            returns json|http:InternalServerError {
        
        do {
            postgresql:Client dbClient = check database_config:getDbClient();
            
            sql:ParameterizedQuery query = `
                SELECT 
                    sd.*,
                    ms.title as material_title,
                    ms.quantity as material_quantity,
                    ms.unit as material_unit
                FROM scheduled_dropoffs sd
                JOIN material_submissions ms ON sd.material_id = ms.id
                WHERE sd.supplier_id = ${supplierId}
                AND sd.status = 'scheduled'
                ORDER BY sd.dropoff_date, sd.dropoff_time_slot
            `;
            
            stream<record {}, sql:Error?> resultStream = dbClient->query(query);
            record {}[] dropoffs = [];
            
            check from record {} dropoff in resultStream
                do {
                    dropoffs.push(dropoff);
                };
            
            check resultStream.close();
            
            json[] dropoffsJson = [];
            foreach record {} dropoff in dropoffs {
                dropoffsJson.push(<json>dropoff);
            }
            
            return <json> {
                "supplierId": supplierId,
                "dropoffs": dropoffsJson,
                "count": dropoffs.length()
            };
            
        } on fail error e {
            log:printError("Failed to get supplier dropoffs", e);
            return <http:InternalServerError>{
                body: {
                    "error": "Failed to retrieve dropoffs",
                    "message": e.message()
                }
            };
        }
    }
    
    // Update schedule status
    resource function put [string scheduleType]/[string scheduleId]/status(@http:Payload json payload) 
            returns http:Ok|http:BadRequest|http:InternalServerError {
        
        do {
            string newStatus = check payload.status.ensureType(string);
            postgresql:Client dbClient = check database_config:getDbClient();
            
            sql:ParameterizedQuery updateQuery;
            
            if (scheduleType == "pickup") {
                updateQuery = `
                    UPDATE scheduled_pickups 
                    SET status = ${newStatus}, 
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${scheduleId}::int
                `;
            } else {
                updateQuery = `
                    UPDATE scheduled_dropoffs 
                    SET status = ${newStatus}, 
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${scheduleId}::int
                `;
            }
            
            sql:ExecutionResult result = check dbClient->execute(updateQuery);
            
            if result.affectedRowCount == 0 {
                return <http:BadRequest>{
                    body: {
                        "error": "Schedule not found"
                    }
                };
            }
            
            return <http:Ok>{
                body: {
                    "message": "Status updated successfully",
                    "scheduleId": scheduleId,
                    "newStatus": newStatus
                }
            };
            
        } on fail error e {
            log:printError("Failed to update schedule status", e);
            return <http:InternalServerError>{
                body: {
                    "error": "Failed to update status",
                    "message": e.message()
                }
            };
        }
    }
}

// Generate a random confirmation code
isolated function generateConfirmationCode() returns string|error {
    int code = check random:createIntInRange(100000, 999999);
    return string `PK${code}`;
}