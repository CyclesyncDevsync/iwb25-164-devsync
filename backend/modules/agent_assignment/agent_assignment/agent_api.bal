import ballerina/http;
import ballerinax/postgresql;
import ballerina/time;

// Database configuration from Config.toml
configurable string dbHost = ?;
configurable int dbPort = ?;
configurable string dbUsername = ?;
configurable string dbPassword = ?;
configurable string dbName = ?;

// Type definitions
type Location record {|
    decimal latitude;
    decimal longitude;
    string? address?;
|};

type AssignmentRequest record {|
    Location materialLocation;
    string urgency = "medium";
    string materialId;
    string? notes?;
|};

type Agent record {|
    string agentId;
    string agentName;
    string agentPhone;
    string agentEmail;
    Location coordinates;
    int currentWorkload?;
    int maxWorkload?;
    decimal rating?;
    string[] specializations?;
    decimal distanceFromMaterial?;
    time:Utc estimatedArrival?;
    decimal visitCost?;
    VisitCostDetails costBreakdown?;
    decimal assignmentScore?;
    string status;
    time:Utc assignedAt;
|};

type VisitCostDetails record {|
    decimal baseCost;
    decimal distanceCost;
    decimal timeCost;
    decimal urgencySurcharge;
    decimal totalCost;
    decimal estimatedDuration;
    decimal distanceKm;
|};

type AgentTracking record {|
    string agentId;
    string agentName;
    Location currentLocation;
    time:Civil lastLocationUpdate;
    string status;
    string? currentTaskId;
    time:Civil? eta;
    string? lastCheckpoint;
|};

type CostEstimateRequest record {|
    Location pickupLocation;
    Location deliveryLocation?;
    string urgency = "medium";
    decimal estimatedWeight?;
|};

# Agent Assignment Service - inline implementation
isolated class AgentAssignmentService {
    private final postgresql:Client dbClient;
    
    function init(postgresql:Client dbClient) {
        self.dbClient = dbClient;
    }
    
    isolated function assignAgent(Location materialLocation, string urgency = "medium") returns Agent|error {
        // For now, return a mock agent to get the API working
        return {
            agentId: "agent-001",
            agentName: "Mock Agent",
            agentPhone: "+94771234567",
            agentEmail: "agent@cyclesync.com",
            coordinates: {
                latitude: 6.9271,
                longitude: 79.8612
            },
            currentWorkload: 3,
            maxWorkload: 10,
            rating: 4.5,
            distanceFromMaterial: 5.2,
            visitCost: 1500,
            status: "assigned",
            assignedAt: time:utcNow()
        };
    }
    
    isolated function getAgentTracking(string agentId) returns AgentTracking|error {
        return {
            agentId: agentId,
            agentName: "Mock Agent",
            currentLocation: {
                latitude: 6.9271,
                longitude: 79.8612
            },
            lastLocationUpdate: time:utcToCivil(time:utcNow()),
            status: "active",
            currentTaskId: (),
            eta: (),
            lastCheckpoint: ()
        };
    }
    
    isolated function updateAgentLocation(string agentId, Location location) returns boolean|error {
        return true;
    }
    
    isolated function getNearbyAgents(Location centerLocation, decimal radiusKm = 25) returns Agent[]|error {
        return [];
    }
}

# Agent Assignment API Service
@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000"],
        allowCredentials: true
    }
}
service /api/agent on new http:Listener(8091) {
    private final AgentAssignmentService agentService;
    
    function init() returns error? {
        postgresql:Client dbClient = check new(
            host = dbHost,
            port = dbPort,
            database = dbName,
            username = dbUsername,
            password = dbPassword
        );
        
        self.agentService = new AgentAssignmentService(dbClient);
    }
    
    # Assign an agent to a material
    # + request - Assignment request with location and urgency
    # + return - Assigned agent details with cost breakdown
    resource function post assignment(http:Request request) returns http:Response|error {
        json payload = check request.getJsonPayload();
        
        AssignmentRequest assignRequest = check payload.cloneWithType(AssignmentRequest);
        
        Agent agent = check self.agentService.assignAgent(
            assignRequest.materialLocation,
            assignRequest.urgency
        );
        
        http:Response response = new;
        response.setJsonPayload({
            success: true,
            agent: agent,
            mapUrl: self.generateMapUrl(assignRequest.materialLocation, agent.coordinates)
        });
        
        return response;
    }
    
    # Get agent tracking information
    # + agentId - The agent ID
    # + return - Current tracking information
    resource function get tracking/[string agentId]() returns http:Response|error {
        AgentTracking tracking = check self.agentService.getAgentTracking(agentId);
        
        json trackingJson = {
            agentId: tracking.agentId,
            agentName: tracking.agentName,
            currentLocation: tracking.currentLocation,
            lastLocationUpdate: tracking.lastLocationUpdate.toString(),
            status: tracking.status,
            currentTaskId: tracking.currentTaskId,
            eta: tracking.eta is () ? () : tracking.eta.toString(),
            lastCheckpoint: tracking.lastCheckpoint
        };
        
        http:Response response = new;
        response.setJsonPayload({
            success: true,
            tracking: trackingJson
        });
        
        return response;
    }
    
    # Update agent location
    # + agentId - The agent ID
    # + request - Location update request
    # + return - Success response
    resource function post location/[string agentId](http:Request request) returns http:Response|error {
        json payload = check request.getJsonPayload();
        Location location = check payload.cloneWithType(Location);
        
        boolean updated = check self.agentService.updateAgentLocation(agentId, location);
        
        http:Response response = new;
        response.setJsonPayload({
            success: updated,
            message: updated ? "Location updated successfully" : "Failed to update location"
        });
        
        return response;
    }
    
    # Get nearby agents
    # + lat - Latitude
    # + lng - Longitude
    # + radius - Search radius in km (optional, default 25)
    # + return - List of nearby agents
    resource function get nearby(decimal lat, decimal lng, decimal radius = 25) returns http:Response|error {
        Location centerLocation = {
            latitude: lat,
            longitude: lng
        };
        
        Agent[] agents = check self.agentService.getNearbyAgents(centerLocation, radius);
        
        http:Response response = new;
        response.setJsonPayload({
            success: true,
            agents: agents,
            center: centerLocation,
            radius: radius
        });
        
        return response;
    }
    
    # Calculate visit cost estimate
    # + request - Cost calculation request
    # + return - Detailed cost breakdown
    resource function post cost/estimate(http:Request request) returns http:Response|error {
        json payload = check request.getJsonPayload();
        CostEstimateRequest costRequest = check payload.cloneWithType(CostEstimateRequest);
        
        // Mock calculation for demo
        decimal distance = 15.5; // This would be calculated based on actual locations
        VisitCostDetails costDetails = {
            baseCost: 500,
            distanceCost: distance * 25,
            timeCost: 750,
            urgencySurcharge: costRequest.urgency == "high" ? 200 : 0,
            totalCost: 1637.5,
            estimatedDuration: 1.5,
            distanceKm: distance
        };
        
        http:Response response = new;
        response.setJsonPayload({
            success: true,
            costDetails: costDetails,
            currency: "LKR"
        });
        
        return response;
    }
    
    # Generate Google Maps URL for route visualization
    # + origin - Origin location
    # + destination - Destination location
    # + return - Google Maps URL
    private function generateMapUrl(Location origin, Location destination) returns string {
        return string `https://www.google.com/maps/dir/${origin.latitude},${origin.longitude}/${destination.latitude},${destination.longitude}`;
    }
}