import ballerina/http;
import ballerina/log;
import ballerinax/postgresql;

# Enhanced Agent Assignment API Service with Notifications
configurable int agentApiPort = 8091;
configurable string dbHost = ?;
configurable string dbName = ?;
configurable string dbUser = ?;
configurable string dbPassword = ?;
configurable int dbPort = ?;

# Initialize database client
final postgresql:Client dbClient = check new (
    host = dbHost,
    database = dbName,
    username = dbUser,
    password = dbPassword,
    port = dbPort,
    options = {
        ssl: {
            mode: postgresql:REQUIRE
        }
    }
);

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["*"],
        allowCredentials: false,
        maxAge: 86400
    }
}
service /api/agent on new http:Listener(agentApiPort) {
    private final AgentAssignmentServiceEnhanced agentService;
    
    function init() {
        self.agentService = new(dbClient);
    }
    
    # Assign an agent to a supplier's material with notification
    # + request - Assignment request with supplier and material details
    # + return - Assignment details including chat room
    resource function post assignment\-with\-notification(@http:Payload AssignmentRequestEnhanced request) 
            returns AssignmentResponse|http:InternalServerError {
        do {
            AgentAssignment assignment = check self.agentService.assignAgentWithNotification(
                request.materialLocation,
                request.supplierId,
                request.supplierName,
                request.materialId,
                request.materialDetails,
                request.urgency
            );
            
            log:printInfo(string `Agent ${assignment.agent.agentId} assigned to supplier ${request.supplierId} for material ${request.materialId}`);
            
            return {
                success: true,
                assignment: assignment,
                mapUrl: self.generateMapUrl(request.materialLocation, assignment.agent.coordinates),
                message: "Agent assigned successfully. Notification sent."
            };
        } on fail error e {
            log:printError("Failed to assign agent", e);
            return <http:InternalServerError>{body: {message: "Failed to assign agent"}};
        }
    }
    
    # Legacy assignment endpoint (without notification)
    resource function post assignment(@http:Payload AssignmentRequest request) 
            returns LegacyAssignmentResponse|http:InternalServerError {
        do {
            Agent agent = check self.agentService.assignAgent(
                request.materialLocation,
                request.urgency
            );
            
            return {
                success: true,
                agent: agent,
                mapUrl: self.generateMapUrl(request.materialLocation, agent.coordinates)
            };
        } on fail error e {
            log:printError("Failed to assign agent", e);
            return {body: {message: "Failed to assign agent"}};
        }
    }
    
    # Initialize chat between agent and supplier
    # + agentId - The agent ID
    # + supplierId - The supplier ID
    # + return - Chat room details
    resource function post [string agentId]/chat/[string supplierId]/initialize(@http:Query string? materialId = ()) 
            returns ChatInitResponse|http:InternalServerError {
        do {
            // Check if chat room already exists
            string roomId = string `agent-${agentId}-supplier-${supplierId}${materialId is string ? "-" + materialId : ""}`;
            
            // Create initial system message
            string initialMessage = "Chat initialized. Agent can now communicate with supplier about material verification.";
            
            return {
                success: true,
                chatRoomId: roomId,
                websocketUrl: string `/ws/chat/${roomId}`,
                message: initialMessage
            };
        } on fail error e {
            log:printError("Failed to initialize chat", e);
            return {body: {message: "Failed to initialize chat"}};
        }
    }
    
    # Get agent's active assignments
    # + agentId - The agent ID
    # + return - List of active assignments
    resource function get [string agentId]/assignments() returns AssignmentsResponse|http:InternalServerError {
        do {
            // This would query the database for active assignments
            return {
                success: true,
                assignments: [],
                totalCount: 0
            };
        } on fail error e {
            log:printError("Failed to get assignments", e);
            return {body: {message: "Failed to retrieve assignments"}};
        }
    }
    
    # Get agent tracking information
    resource function get tracking/[string agentId]() returns TrackingResponse|http:InternalServerError {
        do {
            AgentTracking tracking = check self.agentService.getAgentTracking(agentId);
            
            return {
                success: true,
                tracking: tracking
            };
        } on fail error e {
            log:printError("Failed to get tracking info", e);
            return {body: {message: "Failed to get tracking information"}};
        }
    }
    
    # Update agent location
    resource function post location/[string agentId](@http:Payload Location location) 
            returns UpdateResponse|http:InternalServerError {
        do {
            boolean updated = check self.agentService.updateAgentLocation(agentId, location);
            
            return {
                success: updated,
                message: updated ? "Location updated successfully" : "Failed to update location"
            };
        } on fail error e {
            log:printError("Failed to update location", e);
            return {body: {message: "Failed to update location"}};
        }
    }
    
    # Get nearby agents
    resource function get nearby(@http:Query decimal lat, @http:Query decimal lng, @http:Query decimal radius = 25) 
            returns NearbyAgentsResponse|http:InternalServerError {
        do {
            Location centerLocation = {
                latitude: lat,
                longitude: lng
            };
            
            Agent[] agents = check self.agentService.getNearbyAgents(centerLocation, radius);
            
            return {
                success: true,
                agents: agents,
                center: centerLocation,
                radius: radius
            };
        } on fail error e {
            log:printError("Failed to get nearby agents", e);
            return {body: {message: "Failed to get nearby agents"}};
        }
    }
    
    # Generate Google Maps URL for route visualization
    private function generateMapUrl(Location origin, Location destination) returns string {
        return string `https://www.google.com/maps/dir/${origin.latitude},${origin.longitude}/${destination.latitude},${destination.longitude}`;
    }
}

# Request/Response Types

type AssignmentRequest record {|
    Location materialLocation;
    string urgency = "medium";
    string materialId;
    string? notes;
|};

type AssignmentRequestEnhanced record {|
    Location materialLocation;
    string supplierId;
    string supplierName;
    string materialId;
    json materialDetails;
    string urgency = "medium";
    string? notes;
|};

type AssignmentResponse record {|
    boolean success;
    AgentAssignment assignment;
    string mapUrl;
    string message;
|};

type LegacyAssignmentResponse record {|
    boolean success;
    Agent agent;
    string mapUrl;
|};

type ChatInitResponse record {|
    boolean success;
    string chatRoomId;
    string websocketUrl;
    string message;
|};

type AssignmentsResponse record {|
    boolean success;
    json[] assignments;
    int totalCount;
|};

type TrackingResponse record {|
    boolean success;
    AgentTracking tracking;
|};

type UpdateResponse record {|
    boolean success;
    string message;
|};

type NearbyAgentsResponse record {|
    boolean success;
    Agent[] agents;
    Location center;
    decimal radius;
|};