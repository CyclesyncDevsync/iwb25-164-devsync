// Copyright (c) 2025 CircularSync
// Material Workflow Helper Functions

import ballerina/log;
import ballerina/sql;
import ballerinax/postgresql;

# Extract location data from material submission
# + materialData - The material data JSON
# + deliveryMethod - The delivery method (agent_visit or drop_off)
# + return - Location data tuple
public isolated function extractLocationData(json materialData, string deliveryMethod) returns [string?, string?, string?, string?, string?, decimal?, decimal?, string?, string?, string?]|error {
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
        selectedWarehouseName = "Colombo Collection Center"; // Default for now
        selectedWarehouseAddress = "123 Main Street, Colombo 03";
        selectedWarehousePhone = "+94 11 234 5678";
    }
    
    return [locationAddress, locationCity, locationDistrict, locationProvince, locationPostalCode, 
            locationLatitude, locationLongitude, selectedWarehouseName, selectedWarehouseAddress, selectedWarehousePhone];
}

# Insert material submission into database
# + dbClient - Database client
# + workflowId - Workflow ID
# + transactionId - Transaction ID
# + submission - Submission data
# + locationData - Location data tuple
# + quantityValue - Quantity value
# + specs - Specifications JSON
# + return - Success or error
public isolated function insertMaterialSubmission(postgresql:Client dbClient, string workflowId, string transactionId, 
                                                json submission, [string?, string?, string?, string?, string?, decimal?, decimal?, string?, string?, string?] locationData,
                                                decimal quantityValue, json specs) returns error? {
    // Extract data from submission
    json userData = check submission.userData;
    json materialData = check submission.materialData;
    
    string supplierIdStr = check userData.supplierId.ensureType(string);
    string categoryValue = check materialData.category.ensureType(string);
    string descriptionValue = check materialData.description.ensureType(string);
    string conditionValue = check materialData.condition.ensureType(string);
    string deliveryMethod = check materialData.deliveryMethod.ensureType(string);
    
    // Extract location data
    var [locationAddress, locationCity, locationDistrict, locationProvince, locationPostalCode, 
         locationLatitude, locationLongitude, selectedWarehouseName, selectedWarehouseAddress, selectedWarehousePhone] = locationData;
    
    // Insert into material_submissions table
    sql:ParameterizedQuery insertQuery = `
        INSERT INTO material_submissions (
            workflow_id, transaction_id, supplier_id, supplier_name, supplier_email, supplier_phone,
            material_category, material_description, material_condition, quantity, unit,
            delivery_method, agent_visit_requested, warehouse_drop_off,
            location_address, location_city, location_district, location_province, location_postal_code,
            location_latitude, location_longitude,
            selected_warehouse_name, selected_warehouse_address, selected_warehouse_phone,
            specifications, status, ai_quality_score, ai_quality_analysis, created_at, updated_at
        ) VALUES (
            ${workflowId}, ${transactionId}, ${supplierIdStr}, 
            ${userData.name.toString()}, ${userData.email.toString()}, ${userData.phone.toString()},
            ${categoryValue}, ${descriptionValue}, ${conditionValue}, ${quantityValue}, 'kg',
            ${deliveryMethod}, ${deliveryMethod == "agent_visit"}, ${deliveryMethod == "drop_off"},
            ${locationAddress}, ${locationCity}, ${locationDistrict}, ${locationProvince}, ${locationPostalCode},
            ${locationLatitude}, ${locationLongitude},
            ${selectedWarehouseName}, ${selectedWarehouseAddress}, ${selectedWarehousePhone},
            ${specs.toJsonString()}, 'pending', 0.0, '{}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
    `;
    
    _ = check dbClient->execute(insertQuery);
    log:printInfo(string `Material submission saved to database with workflow ID: ${workflowId}`);
}

# Create workflow entry in database
# + dbClient - Database client
# + workflowId - Workflow ID
# + supplierIdStr - Supplier ID
# + return - Success or error
public isolated function createWorkflowEntry(postgresql:Client dbClient, string workflowId, string supplierIdStr) returns error? {
    sql:ParameterizedQuery workflowQuery = `
        INSERT INTO material_workflows (
            workflow_id, supplier_id, current_stage, status, created_at, updated_at
        ) VALUES (
            ${workflowId}, ${supplierIdStr}, 'submission', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
    `;
    
    _ = check dbClient->execute(workflowQuery);
    log:printInfo(string `Workflow entry created with ID: ${workflowId}`);
}

# Create workflow history entry
# + dbClient - Database client
# + workflowId - Workflow ID
# + supplierIdStr - Supplier ID
# + return - Success or error
public isolated function createWorkflowHistory(postgresql:Client dbClient, string workflowId, string supplierIdStr) returns error? {
    sql:ParameterizedQuery historyQuery = `
        INSERT INTO workflow_history (
            workflow_id, stage, action, actor_id, actor_type, details, created_at
        ) VALUES (
            ${workflowId}, 'submission', 'material_submitted', ${supplierIdStr}, 'supplier',
            '{"status": "Material submission received"}', CURRENT_TIMESTAMP
        )
    `;
    
    _ = check dbClient->execute(historyQuery);
    log:printInfo("Workflow history entry created");
}