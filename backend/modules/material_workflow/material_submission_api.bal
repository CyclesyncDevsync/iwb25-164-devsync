import ballerina/http;
import ballerina/sql;
import ballerina/time;
import ballerinax/postgresql;

# API endpoints for material submission management
public service class MaterialSubmissionAPI {
    private final postgresql:Client dbClient;

    function init(postgresql:Client dbClient) {
        self.dbClient = dbClient;
    }

    # Get all material submissions with optional filters
    # + deliveryMethod - Filter by delivery method (agent_visit or drop_off)
    # + status - Filter by submission status
    # + return - Array of material submissions or error
    isolated resource function get submissions(
        string? deliveryMethod = (),
        string? status = ()
    ) returns MaterialSubmissionResponse[]|http:BadRequest|error {
        
        string baseQuery = string `
            SELECT 
                ms.id,
                ms.transaction_id,
                ms.workflow_id,
                ms.supplier_id,
                ms.title,
                ms.description,
                ms.category,
                ms.sub_category,
                ms.quantity,
                ms.unit,
                ms.condition,
                ms.expected_price,
                ms.minimum_price,
                ms.negotiable,
                ms.delivery_method,
                ms.location_address,
                ms.location_city,
                ms.location_district,
                ms.location_province,
                ms.location_postal_code,
                ms.location_latitude,
                ms.location_longitude,
                ms.selected_warehouse_name,
                ms.selected_warehouse_address,
                ms.selected_warehouse_phone,
                ms.material_type,
                ms.material_color,
                ms.material_brand,
                ms.material_model,
                ms.manufacturing_year,
                ms.dimension_length,
                ms.dimension_width,
                ms.dimension_height,
                ms.dimension_weight,
                ms.tags,
                ms.photos,
                ms.submission_status,
                ms.created_at,
                ms.updated_at,
                COALESCE(u.first_name || ' ' || u.last_name, 'Unknown Supplier') as supplier_name,
                u.email as supplier_email,
                aa.agent_id,
                COALESCE(agent.first_name || ' ' || agent.last_name, 'Unknown Agent') as agent_name
            FROM material_submissions ms
            LEFT JOIN users u ON ms.supplier_id = u.asgardeo_id
            LEFT JOIN agent_assignments aa ON ms.id = aa.material_id
            LEFT JOIN users agent ON aa.agent_id = agent.asgardeo_id
            WHERE 1=1
        `;

        string whereClause = "";
        if deliveryMethod is string {
            whereClause += string ` AND ms.delivery_method = '${deliveryMethod}'`;
        }
        if status is string {
            whereClause += string ` AND ms.submission_status = '${status}'`;
        }

        string finalQuery = baseQuery + whereClause + " ORDER BY ms.created_at DESC LIMIT 100";

        sql:ParameterizedQuery query = `${finalQuery}`;
        stream<MaterialSubmissionRecord, sql:Error?> materialStream = self.dbClient->query(query);
        
        MaterialSubmissionResponse[] submissions = [];
        check from MaterialSubmissionRecord submission in materialStream
            do {
                MaterialSubmissionResponse response = {
                    id: submission.id,
                    transaction_id: submission.transaction_id,
                    workflow_id: submission.workflow_id,
                    supplier_id: submission.supplier_id,
                    supplier_name: submission.supplier_name ?: "Unknown Supplier",
                    supplier_email: submission.supplier_email ?: "",
                    title: submission.title,
                    description: submission.description ?: "",
                    category: submission.category,
                    sub_category: submission.sub_category ?: "",
                    quantity: submission.quantity,
                    unit: submission.unit,
                    condition: submission.condition,
                    expected_price: submission.expected_price ?: 0,
                    minimum_price: submission.minimum_price ?: 0,
                    negotiable: submission.negotiable,
                    delivery_method: submission.delivery_method,
                    submission_status: submission.submission_status,
                    created_at: submission.created_at.toString(),
                    updated_at: submission.updated_at is () ? "" : submission.updated_at.toString(),
                    material_specifications: {
                        material_type: submission.material_type ?: "",
                        color: submission.material_color,
                        brand: submission.material_brand,
                        model: submission.material_model,
                        manufacturing_year: submission.manufacturing_year
                    },
                    dimensions: submission.dimension_length is decimal ? {
                        length: submission.dimension_length,
                        width: submission.dimension_width,
                        height: submission.dimension_height,
                        weight: submission.dimension_weight
                    } : (),
                    tags: submission.tags is json ? <json[]>submission.tags : [],
                    photos: submission.photos is json ? <json[]>submission.photos : []
                };

                // Add location details if it's an agent visit
                if submission.delivery_method == "agent_visit" {
                    response.location = {
                        address: submission.location_address ?: "",
                        city: submission.location_city ?: "",
                        district: submission.location_district ?: "",
                        province: submission.location_province ?: "",
                        postal_code: submission.location_postal_code ?: "",
                        latitude: submission.location_latitude,
                        longitude: submission.location_longitude
                    };
                }

                // Add warehouse details if it's a drop-off
                if submission.delivery_method == "drop_off" {
                    response.warehouse = {
                        name: submission.selected_warehouse_name ?: "",
                        address: submission.selected_warehouse_address ?: "",
                        phone: submission.selected_warehouse_phone ?: ""
                    };
                }

                // Add assigned agent details if available
                if submission.agent_id is string {
                    response.assigned_agent = {
                        id: submission.agent_id ?: "",
                        name: submission.agent_name ?: "Unknown Agent"
                    };
                }

                submissions.push(response);
            };

        return submissions;
    }

    # Get submission statistics
    # + return - Statistics object or error
    isolated resource function get stats() returns SubmissionStats|error {
        
        // Get total submissions count
        sql:ParameterizedQuery totalQuery = `
            SELECT COUNT(*) as total FROM material_submissions
        `;
        int total = check self.dbClient->queryRow(totalQuery);

        // Get agent visits count
        sql:ParameterizedQuery agentVisitsQuery = `
            SELECT COUNT(*) as count FROM material_submissions 
            WHERE delivery_method = 'agent_visit'
        `;
        int agentVisits = check self.dbClient->queryRow(agentVisitsQuery);

        // Get drop-offs count
        sql:ParameterizedQuery dropOffsQuery = `
            SELECT COUNT(*) as count FROM material_submissions 
            WHERE delivery_method = 'drop_off'
        `;
        int dropOffs = check self.dbClient->queryRow(dropOffsQuery);

        // Get pending verifications count
        sql:ParameterizedQuery pendingQuery = `
            SELECT COUNT(*) as count FROM material_submissions 
            WHERE submission_status = 'pending_verification'
        `;
        int pendingVerifications = check self.dbClient->queryRow(pendingQuery);

        return {
            totalSubmissions: total,
            agentVisits: agentVisits,
            dropOffs: dropOffs,
            pendingVerifications: pendingVerifications
        };
    }

    # Assign an agent to a submission
    # + workflowId - The workflow ID of the submission
    # + agentId - The agent ID to assign
    # + return - Success message or error
    isolated resource function post assign\-agent(string workflowId, string agentId) 
        returns http:Ok|http:BadRequest|error {
        
        // Check if submission exists
        sql:ParameterizedQuery checkQuery = `
            SELECT COUNT(*) as count FROM material_submissions 
            WHERE workflow_id = ${workflowId}
        `;
        int submissionCount = check self.dbClient->queryRow(checkQuery);
        
        if submissionCount == 0 {
            return <http:BadRequest>{
                body: {
                    message: "Submission not found"
                }
            };
        }

        // Insert or update agent assignment
        sql:ParameterizedQuery assignmentQuery = `
            INSERT INTO agent_assignments (workflow_id, agent_id, assigned_at, status)
            VALUES (${workflowId}, ${agentId}, ${time:utcNow()}, 'assigned')
            ON CONFLICT (workflow_id) 
            DO UPDATE SET 
                agent_id = ${agentId},
                assigned_at = ${time:utcNow()},
                status = 'assigned'
        `;
        
        _ = check self.dbClient->execute(assignmentQuery);
        
        return <http:Ok>{
            body: {
                message: "Agent assigned successfully"
            }
        };
    }

    # Get warehouse statistics
    # + return - Array of warehouse statistics or error
    isolated resource function get warehouses/stats() returns WarehouseStats[]|error {
        
        sql:ParameterizedQuery warehouseQuery = `
            SELECT 
                selected_warehouse_name as name,
                selected_warehouse_address as address,
                COUNT(*) as drop_off_count
            FROM material_submissions
            WHERE delivery_method = 'drop_off' 
                AND selected_warehouse_name IS NOT NULL
            GROUP BY selected_warehouse_name, selected_warehouse_address
        `;
        
        stream<record {|string name; string address; int drop_off_count;|}, sql:Error?> warehouseStream = 
            self.dbClient->query(warehouseQuery);
        
        WarehouseStats[] stats = [];
        check from var warehouse in warehouseStream
            do {
                stats.push({
                    name: warehouse.name,
                    address: warehouse.address,
                    dropOffRequests: warehouse.drop_off_count
                });
            };
        
        return stats;
    }

    # Update submission status when agent is assigned
    # + submissionId - The ID of the submission
    # + payload - Update payload containing agent assignment details
    # + return - Success message or error
    isolated resource function put submissions/[string submissionId]/status(SubmissionStatusUpdate payload) 
        returns http:Ok|http:BadRequest|http:NotFound|error {
        
        // Check if submission exists
        sql:ParameterizedQuery checkQuery = `
            SELECT id, workflow_id FROM material_submissions 
            WHERE id = ${submissionId}
        `;
        
        stream<record {|string id; string workflow_id;|}, sql:Error?> resultStream = self.dbClient->query(checkQuery);
        record {|record {|string id; string workflow_id;|} value;|}? result = check resultStream.next();
        check resultStream.close();
        
        record {|string id; string workflow_id;|}? submission = result is () ? () : result.value;
        
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
                        additional_details = ${additionalDetails},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${submissionId}`;
            } else if verificationDate is time:Utc {
                updateQuery = `UPDATE material_submissions 
                    SET submission_status = ${payload.submission_status},
                        agent_assigned = true,
                        agent_id = ${agentId},
                        verification_date = ${verificationDate},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${submissionId}`;
            } else if additionalDetails is string {
                updateQuery = `UPDATE material_submissions 
                    SET submission_status = ${payload.submission_status},
                        agent_assigned = true,
                        agent_id = ${agentId},
                        additional_details = ${additionalDetails},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${submissionId}`;
            } else {
                updateQuery = `UPDATE material_submissions 
                    SET submission_status = ${payload.submission_status},
                        agent_assigned = true,
                        agent_id = ${agentId},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${submissionId}`;
            }
        } else {
            // Update status only
            if verificationDate is time:Utc && additionalDetails is string {
                updateQuery = `UPDATE material_submissions 
                    SET submission_status = ${payload.submission_status},
                        verification_date = ${verificationDate},
                        additional_details = ${additionalDetails},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${submissionId}`;
            } else if verificationDate is time:Utc {
                updateQuery = `UPDATE material_submissions 
                    SET submission_status = ${payload.submission_status},
                        verification_date = ${verificationDate},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${submissionId}`;
            } else if additionalDetails is string {
                updateQuery = `UPDATE material_submissions 
                    SET submission_status = ${payload.submission_status},
                        additional_details = ${additionalDetails},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${submissionId}`;
            } else {
                updateQuery = `UPDATE material_submissions 
                    SET submission_status = ${payload.submission_status},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${submissionId}`;
            }
        }
        
        sql:ExecutionResult updateResult = check self.dbClient->execute(updateQuery);
        
        if updateResult.affectedRowCount == 0 {
            return <http:BadRequest>{
                body: {
                    message: "Failed to update submission"
                }
            };
        }

        // If agent is assigned, also update the agent_assignments table
        if payload.submission_status == "assigned" && agentId is string && submission is record {|string id; string workflow_id;|} {
            sql:ParameterizedQuery assignmentQuery = `
                INSERT INTO agent_assignments (
                    workflow_id, 
                    material_id,
                    agent_id, 
                    assigned_at, 
                    status
                )
                VALUES (
                    ${submission.workflow_id},
                    ${submissionId},
                    ${agentId}, 
                    ${time:utcNow()}, 
                    'assigned'
                )
                ON CONFLICT (workflow_id) 
                DO UPDATE SET 
                    agent_id = ${agentId},
                    assigned_at = ${time:utcNow()},
                    status = 'assigned'
            `;
            
            _ = check self.dbClient->execute(assignmentQuery);
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

# Type definitions for API responses
type MaterialSubmissionRecord record {|
    string id;
    string transaction_id;
    string workflow_id;
    string supplier_id;
    string? supplier_name;
    string? supplier_email;
    string title;
    string? description;
    string category;
    string? sub_category;
    decimal quantity;
    string unit;
    string condition;
    decimal? expected_price;
    decimal? minimum_price;
    boolean negotiable;
    string delivery_method;
    string submission_status;
    time:Utc created_at;
    time:Utc? updated_at;
    
    // Location fields
    string? location_address;
    string? location_city;
    string? location_district;
    string? location_province;
    string? location_postal_code;
    decimal? location_latitude;
    decimal? location_longitude;
    
    // Warehouse fields
    string? selected_warehouse_name;
    string? selected_warehouse_address;
    string? selected_warehouse_phone;
    
    // Material specifications
    string? material_type;
    string? material_color;
    string? material_brand;
    string? material_model;
    int? manufacturing_year;
    
    // Dimensions
    decimal? dimension_length;
    decimal? dimension_width;
    decimal? dimension_height;
    decimal? dimension_weight;
    
    // JSON fields
    json? tags;
    json? photos;
    
    // Agent assignment
    string? agent_id;
    string? agent_name;
|};

public type MaterialSubmissionResponse record {|
    string id;
    string transaction_id;
    string workflow_id;
    string supplier_id;
    string supplier_name;
    string supplier_email;
    string title;
    string description;
    string category;
    string sub_category;
    decimal quantity;
    string unit;
    string condition;
    decimal expected_price;
    decimal minimum_price;
    boolean negotiable;
    string delivery_method;
    string submission_status;
    string created_at;
    string updated_at;
    
    MaterialSpecificationsResponse material_specifications;
    DimensionsResponse? dimensions = ();
    LocationResponse? location = ();
    WarehouseResponse? warehouse = ();
    AssignedAgentResponse? assigned_agent = ();
    
    json[] tags;
    json[] photos;
|};

public type MaterialSpecificationsResponse record {|
    string material_type;
    string? color;
    string? brand;
    string? model;
    int? manufacturing_year;
|};

type DimensionsResponse record {|
    decimal? length;
    decimal? width;
    decimal? height;
    decimal? weight;
|};

type LocationResponse record {|
    string address;
    string city;
    string district;
    string province;
    string postal_code;
    decimal? latitude;
    decimal? longitude;
|};

type WarehouseResponse record {|
    string name;
    string address;
    string phone;
|};

type AssignedAgentResponse record {|
    string id;
    string name;
|};

public type SubmissionStats record {|
    int totalSubmissions;
    int agentVisits;
    int dropOffs;
    int pendingVerifications;
|};

public type WarehouseStats record {|
    string name;
    string address;
    int dropOffRequests;
|};