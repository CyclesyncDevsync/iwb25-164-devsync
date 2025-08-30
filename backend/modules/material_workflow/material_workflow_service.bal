// Enhanced Material Workflow Service with Database Integration
// Handles the complete material lifecycle from submission to auction listing

import ballerina/http;
import ballerina/time;
import ballerina/log;
import ballerina/uuid;
import ballerinax/postgresql;
import ballerina/sql;

// Material workflow service listener
listener http:Listener workflowListener = new(8086);

// Database configuration from Config.toml
configurable string dbHost = ?;
configurable int dbPort = ?;
configurable string dbUsername = ?;
configurable string dbPassword = ?;
configurable string dbName = ?;
configurable boolean dbSsl = true;

// Database client
postgresql:Client? dbClient = ();

// Import the type from material_submission_api.bal which already has this type defined

// Main material workflow service
@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000", "http://192.168.80.1:3000", "https://cyclesync.com"],
        allowCredentials: true,
        allowHeaders: ["Authorization", "Content-Type"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
}
service /api/material/workflow on workflowListener {
    
    function init() returns error? {
        // Initialize database connection
        postgresql:Options options = {};
        if (dbSsl) {
            options = {
                ssl: {
                    mode: postgresql:REQUIRE
                }
            };
        }
        
        dbClient = check new (
            host = dbHost,
            username = dbUsername, 
            password = dbPassword,
            database = dbName,
            port = dbPort,
            options = options
        );
        
        log:printInfo("Material Workflow Service initialized successfully with database connection");
    }
    
    // Submit material for AI analysis and save to database
    resource function post submit(@http:Payload json submission) 
            returns json|http:BadRequest|http:InternalServerError {
        log:printInfo("Processing material submission with database storage");
        
        do {
            // Get database client
            if dbClient is () {
                return <http:InternalServerError>{
                    body: {
                        "error": "Database connection not initialized"
                    }
                };
            }
            
            // Generate IDs
            string workflowId = uuid:createType1AsString();
            string transactionId = "TXN_" + uuid:createType1AsString();
            
            // Get supplier ID from submission
            log:printInfo("Received submission: " + submission.toString());
            string supplierId = check submission.supplierId.ensureType(string);
            log:printInfo("Extracted supplierId: " + supplierId);
            
            // Extract material data
            json materialData = check submission.materialData;
            json[] photos = check submission.photos.ensureType();
            
            
            // Extract location data based on delivery method
            string deliveryMethod = check materialData.deliveryMethod.ensureType(string);
            
            // Prepare location fields
            string? locationAddress = null;
            string? locationCity = null;
            string? locationDistrict = null;
            string? locationProvince = null;
            string? locationPostalCode = null;
            decimal? locationLatitude = null;
            decimal? locationLongitude = null;
            string? selectedWarehouseName = null;
            string? selectedWarehouseAddress = null;
            string? selectedWarehousePhone = null;
            
            if deliveryMethod == "agent_visit" {
                // Extract user location for agent visit
                json location = check materialData.location;
                json|error addressJson = location.address;
                locationAddress = addressJson is error ? null : (addressJson is () ? null : addressJson.toString());
                json|error cityJson = location.city;
                locationCity = cityJson is error ? null : (cityJson is () ? null : cityJson.toString());
                json|error districtJson = location.district;
                locationDistrict = districtJson is error ? null : (districtJson is () ? null : districtJson.toString());
                json|error provinceJson = location.province;
                locationProvince = provinceJson is error ? null : (provinceJson is () ? null : provinceJson.toString());
                json|error postalCodeJson = location.postalCode;
                locationPostalCode = postalCodeJson is error ? null : (postalCodeJson is () ? null : postalCodeJson.toString());
                
                json|error coords = location.coordinates;
                if coords is json && coords != () {
                    json|error latJson = coords.latitude;
                    json|error lngJson = coords.longitude;
                    locationLatitude = latJson is error ? null : (latJson is () ? null : check decimal:fromString(latJson.toString()));
                    locationLongitude = lngJson is error ? null : (lngJson is () ? null : check decimal:fromString(lngJson.toString()));
                }
            } else if deliveryMethod == "drop_off" {
                // For drop-off, we might have warehouse selection info
                // This would come from the frontend selection
                selectedWarehouseName = "Colombo Collection Center"; // Default for now
                selectedWarehouseAddress = "123 Main Street, Colombo 03";
                selectedWarehousePhone = "+94 11 234 5678";
            }
            
            // Extract specifications
            json specs = check materialData.specifications;
            
            // Extract values for SQL query
            json quantityJson = check materialData.quantity;
            decimal quantityValue = check decimal:fromString(quantityJson.toString());
            json pricingData = check materialData.pricing;
            json expectedPriceJson = check pricingData.expectedPrice;
            decimal expectedPriceValue = check decimal:fromString(expectedPriceJson.toString());
            json minimumPriceJson = check pricingData.minimumPrice;
            decimal minimumPriceValue = check decimal:fromString(minimumPriceJson.toString());
            json tagsJson = check materialData.tags;
            string tagsJsonString = tagsJson.toJsonString();
            
            // Extract specs values
            json materialJson = check specs.material;
            string specMaterial = check materialJson.ensureType(string);
            json|error specColorCheck = specs.color;
            json? specColor = specColorCheck is error ? null : specColorCheck;
            json|error specBrandCheck = specs.brand;
            json? specBrand = specBrandCheck is error ? null : specBrandCheck;
            json|error specModelCheck = specs.model;
            json? specModel = specModelCheck is error ? null : specModelCheck;
            json|error specManufacturingYearCheck = specs.manufacturingYear;
            json? specManufacturingYear = specManufacturingYearCheck is error ? null : specManufacturingYearCheck;
            json|error specDimensionsCheck = specs.dimensions;
            json? specDimensions = specDimensionsCheck is error ? null : specDimensionsCheck;
            
            // Prepare SQL insert
            sql:ParameterizedQuery insertQuery = `
                INSERT INTO material_submissions (
                    transaction_id, workflow_id, supplier_id,
                    title, description, category, sub_category, 
                    quantity, unit, condition,
                    expected_price, minimum_price, negotiable,
                    delivery_method,
                    location_address, location_city, location_district, 
                    location_province, location_postal_code, 
                    location_latitude, location_longitude,
                    selected_warehouse_name, selected_warehouse_address, 
                    selected_warehouse_phone,
                    material_type, material_color, material_brand, 
                    material_model, manufacturing_year,
                    dimension_length, dimension_width, dimension_height, 
                    dimension_weight,
                    tags, photos,
                    submission_status
                ) VALUES (
                    ${transactionId}, ${workflowId}, ${supplierId},
                    ${check materialData.title.ensureType(string)}, 
                    ${check materialData.description.ensureType(string)}, 
                    ${check materialData.category.ensureType(string)}, 
                    ${check materialData.subCategory.ensureType(string)},
                    ${quantityValue}, 
                    ${check materialData.unit.ensureType(string)}, 
                    ${check materialData.condition.ensureType(string)},
                    ${expectedPriceValue}, 
                    ${minimumPriceValue}, 
                    ${check pricingData.negotiable.ensureType(boolean)},
                    ${deliveryMethod},
                    ${locationAddress}, ${locationCity}, ${locationDistrict}, 
                    ${locationProvince}, ${locationPostalCode}, 
                    ${locationLatitude}, ${locationLongitude},
                    ${selectedWarehouseName}, ${selectedWarehouseAddress}, 
                    ${selectedWarehousePhone},
                    ${specMaterial}, 
                    ${specColor is () ? null : check specColor.ensureType(string)}, 
                    ${specBrand is () ? null : check specBrand.ensureType(string)}, 
                    ${specModel is () ? null : check specModel.ensureType(string)}, 
                    ${specManufacturingYear is () ? null : check int:fromString(specManufacturingYear.toString())},
                    ${specDimensions is () ? null : (check specDimensions.length is () ? null : check decimal:fromString((check specDimensions.length).toString()))},
                    ${specDimensions is () ? null : (check specDimensions.width is () ? null : check decimal:fromString((check specDimensions.width).toString()))},
                    ${specDimensions is () ? null : (check specDimensions.height is () ? null : check decimal:fromString((check specDimensions.height).toString()))},
                    ${specDimensions is () ? null : (check specDimensions.weight is () ? null : check decimal:fromString((check specDimensions.weight).toString()))},
                    ${tagsJsonString}::jsonb,
                    ${photos.toJsonString()}::jsonb,
                    ${"submitted"}
                )`;
            
            // Execute insert
            postgresql:Client dbClientLocal = check dbClient.ensureType();
            sql:ExecutionResult result = check dbClientLocal->execute(insertQuery);
            
            log:printInfo(string `Material submission saved to database. Transaction ID: ${transactionId}`);
            
            // Return successful response
            return {
                "workflowId": workflowId,
                "transactionId": transactionId,
                "supplierId": supplierId,
                "status": "submitted",
                "message": "Material submitted successfully and saved to database",
                "deliveryMethod": deliveryMethod
            };
            
        } on fail error e {
            log:printError("Failed to process material submission", e);
            return <http:InternalServerError>{
                body: {
                    "error": "Failed to process submission",
                    "message": e.message()
                }
            };
        }
    }
    
    // Get workflow status from database
    resource function get status/[string workflowId]() 
            returns json|http:NotFound|http:InternalServerError {
        log:printInfo(string `Getting workflow status for: ${workflowId}`);
        
        do {
            if dbClient is () {
                return <http:InternalServerError>{
                    body: {
                        "error": "Database connection not initialized"
                    }
                };
            }
            
            sql:ParameterizedQuery query = `
                SELECT 
                    workflow_id, transaction_id, supplier_id,
                    title, submission_status, delivery_method,
                    created_at, updated_at
                FROM material_submissions 
                WHERE workflow_id = ${workflowId}
                LIMIT 1`;
            
            postgresql:Client dbClientLocal = check dbClient.ensureType();
            stream<record {}, error?> resultStream = dbClientLocal->query(query);
            record {}? result = check resultStream.next();
            check resultStream.close();
            
            if result is () {
                return <http:NotFound>{
                    body: {
                        "error": "Workflow not found",
                        "workflowId": workflowId
                    }
                };
            }
            
            json response = {
                "workflowId": workflowId,
                "data": <json>result,
                "message": "Workflow found successfully"
            };
            return response;
            
        } on fail error e {
            log:printError(string `Failed to get workflow status: ${e.message()}`);
            return <http:InternalServerError>{
                body: {
                    "error": "Failed to retrieve workflow status",
                    "message": e.message()
                }
            };
        }
    }
    
    // Get all submissions for a supplier (using mock supplier ID for now)
    resource function get submissions/[string supplierId]() 
            returns json|http:InternalServerError {
        do {
            if dbClient is () {
                return <http:InternalServerError>{
                    body: {
                        "error": "Database connection not initialized"
                    }
                };
            }
            
            sql:ParameterizedQuery query = `
                SELECT 
                    workflow_id, transaction_id, title, category, 
                    sub_category, quantity, unit, expected_price,
                    delivery_method, submission_status,
                    created_at
                FROM material_submissions 
                WHERE supplier_id = ${supplierId}
                ORDER BY created_at DESC`;
            
            postgresql:Client dbClientLocal = check dbClient.ensureType();
            stream<record {}, error?> resultStream = dbClientLocal->query(query);
            record {}[] submissions = [];
            
            check from record {} submission in resultStream
                do {
                    submissions.push(submission);
                };
            
            check resultStream.close();
            
            json response = {
                "supplierId": supplierId,
                "submissions": <json>submissions,
                "count": submissions.length()
            };
            return response;
            
        } on fail error e {
            log:printError("Failed to get submissions", e);
            return <http:InternalServerError>{
                body: {
                    "error": "Failed to retrieve submissions",
                    "message": e.message()
                }
            };
        }
    }
    
    // Confirm final workflow completion
    resource function post confirm(@http:Payload json confirmation) 
            returns json|http:BadRequest|http:InternalServerError {
        log:printInfo("Confirming workflow completion");
        
        do {
            string workflowId = check confirmation.workflowId;
            
            if workflowId == "" {
                return <http:BadRequest>{
                    body: {
                        "error": "Missing workflow ID",
                        "message": "Workflow ID is required for confirmation"
                    }
                };
            }
            
            if dbClient is () {
                return <http:InternalServerError>{
                    body: {
                        "error": "Database connection not initialized"
                    }
                };
            }
            
            // Update submission status
            sql:ParameterizedQuery updateQuery = `
                UPDATE material_submissions 
                SET submission_status = 'confirmed',
                    updated_at = CURRENT_TIMESTAMP
                WHERE workflow_id = ${workflowId}`;
            
            postgresql:Client dbClientLocal = check dbClient.ensureType();
            sql:ExecutionResult result = check dbClientLocal->execute(updateQuery);
            
            if result.affectedRowCount == 0 {
                return <http:BadRequest>{
                    body: {
                        "error": "Workflow not found",
                        "message": "No workflow found with the provided ID"
                    }
                };
            }
            
            log:printInfo(string `Workflow ${workflowId} confirmed successfully`);
            
            return {
                "workflowId": workflowId,
                "status": "confirmed", 
                "message": "Workflow confirmed successfully. Agent will contact you within 24-48 hours."
            };
            
        } on fail error e {
            log:printError("Failed to confirm workflow", e);
            return <http:InternalServerError>{
                body: {
                    "error": "Failed to confirm workflow",
                    "message": e.message()
                }
            };
        }
    }
    
    // Health check
    resource function get health() returns json {
        boolean dbConnected = dbClient is postgresql:Client;
        
        return {
            "status": dbConnected ? "healthy" : "unhealthy",
            "message": "Material Workflow Service status",
            "database": dbConnected ? "connected" : "disconnected",
            "timestamp": time:utcNow().toString()
        };
    }
}

// Material Submission API Service
@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000", "http://192.168.80.1:3000", "https://cyclesync.com"],
        allowCredentials: true,
        allowHeaders: ["Authorization", "Content-Type"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
}
service /api/material\-submissions on workflowListener {
    
    # Update submission status when agent is assigned
    # + submissionId - The ID of the submission
    # + payload - Update payload containing agent assignment details
    # + return - Success message or error
    resource function put [string submissionId]/status(@http:Payload SubmissionStatusUpdate payload) 
        returns http:Ok|http:BadRequest|http:NotFound|error {
        
        postgresql:Client? dbClientLocal = dbClient;
        if dbClientLocal is () {
            return error("Database client not initialized");
        }
        
        // Convert submissionId to integer
        int submissionIdInt = check int:fromString(submissionId);
        
        // Check if submission exists
        sql:ParameterizedQuery checkQuery = `
            SELECT id, workflow_id FROM material_submissions 
            WHERE id = ${submissionIdInt}
        `;
        
        stream<record {|int id; string workflow_id;|}, sql:Error?> resultStream = dbClientLocal->query(checkQuery);
        record {|record {|int id; string workflow_id;|} value;|}? result = check resultStream.next();
        check resultStream.close();
        
        record {|int id; string workflow_id;|}? submission = result is () ? () : result.value;
        
        if submission is () {
            return <http:NotFound>{
                body: {
                    message: "Submission not found"
                }
            };
        }

        // Validate status transition
        string? agentId = payload?.agent_id;
        time:Utc? verificationDate = payload?.verification_date;
        string? additionalDetails = payload?.additional_details;
        
        if payload.submission_status == "assigned" && agentId is () {
            return <http:BadRequest>{
                body: {
                    message: "Agent ID is required when status is 'assigned'"
                }
            };
        }

        // Build parameterized update query
        sql:ParameterizedQuery updateQuery;
        
        if payload.submission_status == "assigned" && agentId is string {
            // Update with agent assignment
            if verificationDate is time:Utc && additionalDetails is string {
                updateQuery = `UPDATE material_submissions 
                    SET submission_status = ${payload.submission_status},
                        agent_assigned = true,
                        agent_id = ${agentId},
                        verification_date = ${verificationDate},
                        additional_details = ${additionalDetails}::jsonb,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${submissionIdInt}`;
            } else if verificationDate is time:Utc {
                updateQuery = `UPDATE material_submissions 
                    SET submission_status = ${payload.submission_status},
                        agent_assigned = true,
                        agent_id = ${agentId},
                        verification_date = ${verificationDate},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${submissionIdInt}`;
            } else if additionalDetails is string {
                updateQuery = `UPDATE material_submissions 
                    SET submission_status = ${payload.submission_status},
                        agent_assigned = true,
                        agent_id = ${agentId},
                        additional_details = ${additionalDetails}::jsonb,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${submissionIdInt}`;
            } else {
                updateQuery = `UPDATE material_submissions 
                    SET submission_status = ${payload.submission_status},
                        agent_assigned = true,
                        agent_id = ${agentId},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${submissionIdInt}`;
            }
        } else {
            // Update status only
            if verificationDate is time:Utc && additionalDetails is string {
                updateQuery = `UPDATE material_submissions 
                    SET submission_status = ${payload.submission_status},
                        verification_date = ${verificationDate},
                        additional_details = ${additionalDetails}::jsonb,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${submissionIdInt}`;
            } else if verificationDate is time:Utc {
                updateQuery = `UPDATE material_submissions 
                    SET submission_status = ${payload.submission_status},
                        verification_date = ${verificationDate},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${submissionIdInt}`;
            } else if additionalDetails is string {
                updateQuery = `UPDATE material_submissions 
                    SET submission_status = ${payload.submission_status},
                        additional_details = ${additionalDetails}::jsonb,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${submissionIdInt}`;
            } else {
                updateQuery = `UPDATE material_submissions 
                    SET submission_status = ${payload.submission_status},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${submissionIdInt}`;
            }
        }
        
        sql:ExecutionResult updateResult = check dbClientLocal->execute(updateQuery);
        
        if updateResult.affectedRowCount == 0 {
            return <http:BadRequest>{
                body: {
                    message: "Failed to update submission"
                }
            };
        }

        // If agent is assigned, also update the agent_assignments table
        if payload.submission_status == "assigned" && agentId is string && submission is record {|int id; string workflow_id;|} {
            // Get supplier_id from the submission
            sql:ParameterizedQuery supplierQuery = `
                SELECT supplier_id FROM material_submissions 
                WHERE id = ${submissionIdInt}
            `;
            string supplierId = check dbClientLocal->queryRow(supplierQuery);
            
            // Generate assignment ID
            string assignmentId = uuid:createType1AsString();
            
            // First check if assignment already exists
            sql:ParameterizedQuery checkExistingQuery = `
                SELECT assignment_id FROM agent_assignments 
                WHERE agent_id = ${agentId} 
                AND supplier_id = ${supplierId} 
                AND material_id = ${submissionIdInt}::text
            `;
            
            stream<record {|string assignment_id;|}, sql:Error?> existingStream = dbClientLocal->query(checkExistingQuery);
            record {|record {|string assignment_id;|} value;|}? existing = check existingStream.next();
            check existingStream.close();
            
            if existing is () {
                // No existing assignment, insert new one
                sql:ParameterizedQuery assignmentQuery = `
                    INSERT INTO agent_assignments (
                        assignment_id,
                        agent_id,
                        supplier_id,
                        material_id,
                        status,
                        created_at
                    )
                    VALUES (
                        ${assignmentId},
                        ${agentId},
                        ${supplierId},
                        ${submissionIdInt}::text,
                        'pending',
                        CURRENT_TIMESTAMP
                    )
                `;
                
                _ = check dbClientLocal->execute(assignmentQuery);
            } else {
                // Update existing assignment
                sql:ParameterizedQuery updateAssignmentQuery = `
                    UPDATE agent_assignments 
                    SET status = 'pending',
                        updated_at = CURRENT_TIMESTAMP
                    WHERE agent_id = ${agentId} 
                    AND supplier_id = ${supplierId} 
                    AND material_id = ${submissionIdInt}::text
                `;
                
                _ = check dbClientLocal->execute(updateAssignmentQuery);
            }
        }
        
        return <http:Ok>{
            body: {
                message: "Submission status updated successfully",
                submission_id: submissionId,
                status: payload.submission_status
            }
        };
    }
}