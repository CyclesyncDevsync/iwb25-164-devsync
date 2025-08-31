import ballerina/sql;
import ballerina/time;
import ballerinax/postgresql;

# Agent Assignment Service for location-based matching and costing
public isolated class AgentAssignmentService {
    private final postgresql:Client dbClient;
    
    public function init(postgresql:Client dbClient) {
        self.dbClient = dbClient;
    }
    
    # Find the most suitable agent for a material based on location, availability, and workload
    # + materialLocation - The location of the material
    # + urgency - The urgency level (high, medium, low)
    # + return - The assigned agent with cost details or error
    public isolated function assignAgent(Location materialLocation, string urgency = "medium") returns Agent|error {
        // Get available agents from the database
        sql:ParameterizedQuery query = `
            SELECT 
                a.agent_id,
                a.name,
                a.phone,
                a.email,
                a.location_lat,
                a.location_lng,
                a.current_workload,
                a.max_workload,
                a.rating,
                a.specializations,
                a.hourly_rate
            FROM agents a
            WHERE a.status = 'active' 
            AND a.current_workload < a.max_workload
            ORDER BY a.rating DESC, a.current_workload ASC
        `;
        
        stream<record {|
            string agent_id;
            string name;
            string phone;
            string email;
            decimal location_lat;
            decimal location_lng;
            int current_workload;
            int max_workload;
            decimal rating;
            string[] specializations;
            decimal hourly_rate;
        |}, sql:Error?> agentStream = self.dbClient->query(query);
        
        Agent? bestAgent = ();
        decimal minScore = 999999.0;
        
        check from var agent in agentStream
            do {
                // Calculate distance between agent and material
                decimal distance = self.calculateDistance(
                    agent.location_lat, agent.location_lng,
                    materialLocation.latitude, materialLocation.longitude
                );
                
                // Calculate workload factor (0-1, lower is better)
                decimal workloadFactor = <decimal>agent.current_workload / <decimal>agent.max_workload;
                
                // Calculate time factor based on urgency
                decimal timeFactor = urgency == "high" ? 0.5 : (urgency == "medium" ? 1.0 : 1.5);
                
                // Calculate composite score (lower is better)
                decimal score = (distance * timeFactor) + (workloadFactor * 50) - (agent.rating * 10);
                
                if score < minScore {
                    minScore = score;
                    
                    // Calculate visit cost
                    VisitCostDetails costDetails = self.calculateVisitCost(
                        distance, agent.hourly_rate, urgency
                    );
                    
                    // Estimate arrival time
                    time:Utc estimatedArrival = self.estimateArrivalTime(distance, urgency);
                    
                    bestAgent = {
                        agentId: agent.agent_id,
                        agentName: agent.name,
                        agentPhone: agent.phone,
                        agentEmail: agent.email,
                        coordinates: {
                            latitude: agent.location_lat,
                            longitude: agent.location_lng
                        },
                        currentWorkload: agent.current_workload,
                        maxWorkload: agent.max_workload,
                        rating: agent.rating,
                        specializations: agent.specializations,
                        distanceFromMaterial: distance,
                        estimatedArrival: estimatedArrival,
                        visitCost: costDetails.totalCost,
                        costBreakdown: costDetails,
                        assignmentScore: score,
                        status: "assigned",
                        assignedAt: time:utcNow()
                    };
                }
            };
        
        if bestAgent is () {
            return error("No available agents found");
        }
        
        // Update agent's workload
        sql:ParameterizedQuery updateQuery = `
            UPDATE agents 
            SET current_workload = current_workload + 1,
                last_assignment_at = CURRENT_TIMESTAMP
            WHERE agent_id = ${bestAgent.agentId}
        `;
        
        _ = check self.dbClient->execute(updateQuery);
        
        return bestAgent;
    }
    
    # Calculate distance between two coordinates using simplified formula
    # + lat1 - Latitude of first point
    # + lon1 - Longitude of first point  
    # + lat2 - Latitude of second point
    # + lon2 - Longitude of second point
    # + return - Distance in kilometers
    isolated function calculateDistance(decimal lat1, decimal lon1, decimal lat2, decimal lon2) returns decimal {
        // Simplified distance calculation for Sri Lanka's small geographic area
        // Using approximate conversion: 1 degree latitude = 111 km, 1 degree longitude = 111 km * cos(latitude)
        decimal latDiff = lat2 - lat1;
        decimal lonDiff = lon2 - lon1;
        
        // Average latitude for longitude correction
        decimal avgLat = (lat1 + lat2) / 2;
        decimal latRad = self.toRadians(avgLat);
        
        // Approximate cos(6.9 degrees) for Sri Lanka's latitude
        decimal cosLat = 0.993; // cos(6.9°) ≈ 0.993
        
        decimal latDistance = latDiff * 111;
        decimal lonDistance = lonDiff * 111 * cosLat;
        
        // Pythagorean distance
        decimal distanceSquared = (latDistance * latDistance) + (lonDistance * lonDistance);
        
        // Simple square root approximation
        return self.sqrt(distanceSquared);
    }
    
    # Convert degrees to radians
    isolated function toRadians(decimal degrees) returns decimal {
        return degrees * 3.14159265359 / 180;
    }
    
    # Simple square root calculation
    isolated function sqrt(decimal x) returns decimal {
        decimal zero = 0;
        if x < zero {
            return zero;
        }
        if x == zero {
            return zero;
        }
        
        // Newton's method for square root
        decimal guess = x / 2;
        decimal epsilon = 0.00001;
        
        int iterations = 0;
        while iterations < 10 {
            decimal newGuess = (guess + x / guess) / 2;
            if newGuess - guess < epsilon && guess - newGuess < epsilon {
                return newGuess;
            }
            guess = newGuess;
            iterations = iterations + 1;
        }
        
        return guess;
    }
    
    # Calculate visit cost based on distance and other factors
    # + distance - Distance in kilometers
    # + hourlyRate - Agent's hourly rate
    # + urgency - Urgency level
    # + return - Detailed cost breakdown
    isolated function calculateVisitCost(decimal distance, decimal hourlyRate, string urgency) returns VisitCostDetails {
        // Base cost calculation
        decimal baseCost = 500; // Base visit fee in LKR
        decimal distanceCost = distance * 25; // 25 LKR per kilometer
        
        // Time estimation (average speed 40 km/h in city)
        decimal travelTimeHours = distance / 40;
        decimal visitDurationHours = 0.5; // Standard 30 minute visit
        decimal totalTimeHours = (travelTimeHours * 2) + visitDurationHours; // Round trip + visit
        
        decimal timeCost = hourlyRate * totalTimeHours;
        
        // Urgency surcharge
        decimal urgencySurcharge = 0;
        if urgency == "high" {
            urgencySurcharge = (baseCost + distanceCost + timeCost) * 0.3; // 30% surcharge
        } else if urgency == "medium" {
            urgencySurcharge = (baseCost + distanceCost + timeCost) * 0.1; // 10% surcharge
        }
        
        decimal totalCost = baseCost + distanceCost + timeCost + urgencySurcharge;
        
        return {
            baseCost: baseCost,
            distanceCost: distanceCost,
            timeCost: timeCost,
            urgencySurcharge: urgencySurcharge,
            totalCost: totalCost,
            estimatedDuration: totalTimeHours,
            distanceKm: distance
        };
    }
    
    # Estimate arrival time based on distance and urgency
    # + distance - Distance in kilometers
    # + urgency - Urgency level
    # + return - Estimated arrival time
    isolated function estimateArrivalTime(decimal distance, string urgency) returns time:Utc {
        time:Utc currentTime = time:utcNow();
        
        // Base preparation time
        int preparationMinutes = 30;
        
        // Adjust based on urgency
        if urgency == "high" {
            preparationMinutes = 15;
        } else if urgency == "low" {
            preparationMinutes = 60;
        }
        
        // Travel time (average 40 km/h)
        int travelMinutes = <int>(distance * 60 / 40);
        
        // Total minutes until arrival
        int totalMinutes = preparationMinutes + travelMinutes;
        
        // Add to current time
        time:Seconds seconds = totalMinutes * 60;
        return time:utcAddSeconds(currentTime, seconds);
    }
    
    # Get agent tracking information
    # + agentId - The agent ID
    # + return - Current agent location and status
    public isolated function getAgentTracking(string agentId) returns AgentTracking|error {
        sql:ParameterizedQuery query = `
            SELECT 
                a.agent_id,
                a.name,
                a.location_lat,
                a.location_lng,
                a.last_location_update,
                a.status,
                at.tracking_id,
                at.current_task_id,
                at.eta,
                at.last_checkpoint
            FROM agents a
            LEFT JOIN agent_tracking at ON a.agent_id = at.agent_id
            WHERE a.agent_id = ${agentId}
        `;
        
        record {|
            string agent_id;
            string name;
            decimal location_lat;
            decimal location_lng;
            time:Civil last_location_update;
            string status;
            string? tracking_id;
            string? current_task_id;
            time:Civil? eta;
            string? last_checkpoint;
        |} result = check self.dbClient->queryRow(query);
        
        return {
            agentId: result.agent_id,
            agentName: result.name,
            currentLocation: {
                latitude: result.location_lat,
                longitude: result.location_lng
            },
            lastLocationUpdate: result.last_location_update,
            status: result.status,
            currentTaskId: result.current_task_id,
            eta: result.eta,
            lastCheckpoint: result.last_checkpoint
        };
    }
    
    # Update agent location
    # + agentId - The agent ID
    # + location - New location coordinates
    # + return - Success or error
    public isolated function updateAgentLocation(string agentId, Location location) returns boolean|error {
        sql:ParameterizedQuery query = `
            UPDATE agents 
            SET location_lat = ${location.latitude},
                location_lng = ${location.longitude},
                last_location_update = CURRENT_TIMESTAMP
            WHERE agent_id = ${agentId}
        `;
        
        sql:ExecutionResult result = check self.dbClient->execute(query);
        return result.affectedRowCount > 0;
    }
    
    # Get nearby agents for map display
    # + centerLocation - Center location for search
    # + radiusKm - Search radius in kilometers
    # + return - List of nearby agents
    public isolated function getNearbyAgents(Location centerLocation, decimal radiusKm = 25) returns Agent[]|error {
        // This is a simplified query - in production, use PostGIS for accurate distance calculations
        sql:ParameterizedQuery query = `
            SELECT 
                agent_id,
                name,
                phone,
                email,
                location_lat,
                location_lng,
                current_workload,
                max_workload,
                rating,
                status
            FROM agents
            WHERE status IN ('active', 'busy')
            AND location_lat BETWEEN ${centerLocation.latitude - radiusKm/111} AND ${centerLocation.latitude + radiusKm/111}
            AND location_lng BETWEEN ${centerLocation.longitude - radiusKm/111} AND ${centerLocation.longitude + radiusKm/111}
        `;
        
        stream<record {|
            string agent_id;
            string name;
            string phone;
            string email;
            decimal location_lat;
            decimal location_lng;
            int current_workload;
            int max_workload;
            decimal rating;
            string status;
        |}, sql:Error?> agentStream = self.dbClient->query(query);
        
        Agent[] agents = [];
        
        check from var agent in agentStream
            do {
                decimal distance = self.calculateDistance(
                    agent.location_lat, agent.location_lng,
                    centerLocation.latitude, centerLocation.longitude
                );
                
                if distance <= radiusKm {
                    agents.push({
                        agentId: agent.agent_id,
                        agentName: agent.name,
                        agentPhone: agent.phone,
                        agentEmail: agent.email,
                        coordinates: {
                            latitude: agent.location_lat,
                            longitude: agent.location_lng
                        },
                        currentWorkload: agent.current_workload,
                        maxWorkload: agent.max_workload,
                        rating: agent.rating,
                        distanceFromMaterial: distance,
                        status: agent.status,
                        assignedAt: time:utcNow()
                    });
                }
            };
        
        return agents;
    }
}

