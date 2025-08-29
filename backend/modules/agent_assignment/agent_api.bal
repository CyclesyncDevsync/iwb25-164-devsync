import ballerina/http;
import ballerinax/postgresql;

// Database configuration from Config.toml
configurable string dbHost = ?;
configurable int dbPort = ?;
configurable string dbUsername = ?;
configurable string dbPassword = ?;
configurable string dbName = ?;

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
        
        self.agentService = new(dbClient);
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

# Assignment request type
type AssignmentRequest record {|
    Location materialLocation;
    string urgency = "medium";
    string materialId;
    string notes?;
|};

# Cost estimate request type
type CostEstimateRequest record {|
    Location pickupLocation;
    Location deliveryLocation?;
    string urgency = "medium";
    decimal estimatedWeight?;
|};