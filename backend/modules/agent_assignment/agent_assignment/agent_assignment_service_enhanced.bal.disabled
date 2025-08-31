import ballerina/sql;
import ballerina/time;
import ballerina/uuid;
import ballerinax/postgresql;
import hp/Cyclesync.notifications;

# Enhanced Agent Assignment Service with notification support
public isolated class AgentAssignmentServiceEnhanced {
    private final postgresql:Client dbClient;
    private final notifications:NotificationService notificationService;
    
    public function init(postgresql:Client dbClient) {
        self.dbClient = dbClient;
        self.notificationService = new (dbClient);
    }
    
    # Assign agent to supplier material with notification
    # + materialLocation - The location of the material
    # + supplierId - The supplier ID
    # + supplierName - The supplier name  
    # + materialId - The material ID
    # + materialDetails - Material details for notification
    # + urgency - The urgency level (high, medium, low)
    # + return - The assigned agent with cost details or error
    public isolated function assignAgentWithNotification(
        Location materialLocation, 
        string supplierId,
        string supplierName,
        string materialId,
        json materialDetails,
        string urgency = "medium"
    ) returns AgentAssignment|error {
        
        // First, find and assign the best agent using existing logic
        Agent agent = check self.assignAgent(materialLocation, urgency);
        
        // Create assignment record in database
        string assignmentId = check self.createAssignmentRecord(
            agent.agentId, supplierId, materialId, agent.visitCost ?: 0
        );
        
        // Create notification for the agent
        string notificationId = check self.notificationService.createAgentAssignmentNotification(
            agent.agentId,
            supplierId,
            supplierName,
            materialId,
            materialDetails
        );
        
        // Create chat room for agent-supplier communication
        string chatRoomId = check self.createChatRoom(
            agent.agentId, supplierId, materialId, assignmentId
        );
        
        // Return enhanced assignment details
        return {
            assignmentId: assignmentId,
            agent: agent,
            supplierId: supplierId,
            materialId: materialId,
            chatRoomId: chatRoomId,
            notificationId: notificationId,
            createdAt: time:utcNow()
        };
    }
    
    # Create assignment record in database
    isolated function createAssignmentRecord(
        string agentId, 
        string supplierId, 
        string materialId,
        decimal estimatedCost
    ) returns string|error {
        string assignmentId = uuid:createType1AsString();
        
        sql:ParameterizedQuery query = `
            INSERT INTO agent_assignments (
                assignment_id, agent_id, supplier_id, material_id,
                status, estimated_cost, created_at
            ) VALUES (
                ${assignmentId}, ${agentId}, ${supplierId}, ${materialId},
                'pending', ${estimatedCost}, CURRENT_TIMESTAMP
            )
        `;
        
        _ = check self.dbClient->execute(query);
        return assignmentId;
    }
    
    # Create chat room for agent-supplier communication
    isolated function createChatRoom(
        string agentId, 
        string supplierId, 
        string materialId,
        string assignmentId
    ) returns string|error {
        string roomId = string `agent-${agentId}-supplier-${supplierId}-${materialId}`;
        
        sql:ParameterizedQuery query = `
            INSERT INTO chat_rooms (
                room_id, agent_id, supplier_id, material_id, 
                assignment_id, status, created_at
            ) VALUES (
                ${roomId}, ${agentId}, ${supplierId}, ${materialId},
                ${assignmentId}, 'active', CURRENT_TIMESTAMP
            )
            ON CONFLICT (agent_id, supplier_id, material_id) 
            DO UPDATE SET 
                assignment_id = ${assignmentId},
                status = 'active',
                created_at = CURRENT_TIMESTAMP
        `;
        
        _ = check self.dbClient->execute(query);
        return roomId;
    }
    
    # Original assignAgent method (kept for backward compatibility)
    public isolated function assignAgent(Location materialLocation, string urgency = "medium") returns Agent|error {
        // [Original implementation remains the same as in agent_assignment_service.bal]
        // This is just a placeholder - in real implementation, copy the logic from original file
        
        // Get available agents from users table where role = 'agent'
        sql:ParameterizedQuery query = `
            SELECT 
                u.asgardeo_id as agent_id,
                CONCAT(u.first_name, ' ', u.last_name) as name,
                u.email,
                6.9271 as location_lat,  -- Default Colombo latitude
                79.8612 as location_lng, -- Default Colombo longitude
                0 as current_workload,   -- Default workload
                5 as max_workload,       -- Default capacity
                4.0 as rating,           -- Default rating
                ARRAY['general']::TEXT[] as specializations,
                2500.00 as hourly_rate   -- Default rate
            FROM users u
            WHERE u.role = 'agent' 
            AND u.status = 'approved'
            ORDER BY u.created_at ASC
        `;
        
        stream<record {|
            string agent_id;
            string name;
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
                        agentPhone: agent.email, // Using email as phone since no phone field
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
        
        // Skip workload update since we're using defaults
        
        return bestAgent;
    }
    
    # Calculate distance between two coordinates using simplified formula
    isolated function calculateDistance(decimal lat1, decimal lon1, decimal lat2, decimal lon2) returns decimal {
        // Simplified distance calculation for Sri Lanka's small geographic area
        decimal latDiff = lat2 - lat1;
        decimal lonDiff = lon2 - lon1;
        
        // Average latitude for longitude correction
        decimal avgLat = (lat1 + lat2) / 2;
        decimal cosLat = 0.993; // cos(6.9°) ≈ 0.993 for Sri Lanka
        
        decimal latDistance = latDiff * 111;
        decimal lonDistance = lonDiff * 111 * cosLat;
        
        // Pythagorean distance
        decimal distanceSquared = (latDistance * latDistance) + (lonDistance * lonDistance);
        
        // Simple square root approximation
        return self.sqrt(distanceSquared);
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
    public isolated function getAgentTracking(string agentId) returns AgentTracking|error {
        sql:ParameterizedQuery query = `
            SELECT 
                u.asgardeo_id as agent_id,
                CONCAT(u.first_name, ' ', u.last_name) as name,
                COALESCE(u.location_lat, 6.9271) as location_lat,
                COALESCE(u.location_lng, 79.8612) as location_lng,
                COALESCE(u.current_workload, 0) as current_workload,
                u.status,
                u.last_location_update,
                aa.assignment_id,
                aa.material_id,
                aa.supplier_id,
                aa.status as assignment_status
            FROM users u
            LEFT JOIN agent_assignments aa ON u.asgardeo_id = aa.agent_id 
                AND aa.status IN ('pending', 'in_progress')
            WHERE u.asgardeo_id = ${agentId}
            AND u.role = 'agent'
        `;
        
        record {|
            string agent_id;
            string name;
            decimal location_lat;
            decimal location_lng;
            int current_workload;
            string status;
            time:Civil? last_location_update;
            string? assignment_id;
            string? material_id;
            string? supplier_id;
            string? assignment_status;
        |} agentRecord = check self.dbClient->queryRow(query);
        
        AgentTracking tracking = {
            agentId: agentRecord.agent_id,
            agentName: agentRecord.name,
            currentLocation: {
                latitude: agentRecord.location_lat,
                longitude: agentRecord.location_lng
            },
            lastLocationUpdate: agentRecord.last_location_update is time:Civil ? <time:Civil>agentRecord.last_location_update : time:utcToCivil(time:utcNow()),
            status: agentRecord.status,
            currentTaskId: agentRecord.assignment_id,
            eta: (),
            lastCheckpoint: agentRecord.assignment_id is string ? "Material Assignment" : ()
        };
        return tracking;
    }
    
    # Update agent location
    public isolated function updateAgentLocation(string agentId, Location location) returns boolean|error {
        sql:ParameterizedQuery query = `
            UPDATE users 
            SET location_lat = ${location.latitude},
                location_lng = ${location.longitude},
                last_location_update = CURRENT_TIMESTAMP
            WHERE asgardeo_id = ${agentId}
            AND role = 'agent'
        `;
        
        sql:ExecutionResult result = check self.dbClient->execute(query);
        return result.affectedRowCount > 0;
    }
    
    # Get nearby agents
    public isolated function getNearbyAgents(Location location, decimal radiusKm = 10.0) returns Agent[]|error {
        // Get all active agents
        sql:ParameterizedQuery query = `
            SELECT 
                u.asgardeo_id as agent_id,
                CONCAT(u.first_name, ' ', u.last_name) as name,
                u.email,
                COALESCE(u.location_lat, 6.9271) as location_lat,
                COALESCE(u.location_lng, 79.8612) as location_lng,
                COALESCE(u.current_workload, 0) as current_workload,
                COALESCE(u.max_workload, 5) as max_workload,
                COALESCE(u.rating, 4.0) as rating,
                COALESCE(u.specializations, ARRAY['general']::TEXT[]) as specializations,
                COALESCE(u.hourly_rate, 2500.00) as hourly_rate
            FROM users u
            WHERE u.role = 'agent'
            AND u.status = 'approved'
            AND u.location_lat IS NOT NULL
            AND u.location_lng IS NOT NULL
        `;
        
        stream<record {|
            string agent_id;
            string name;
            string email;
            decimal location_lat;
            decimal location_lng;
            int current_workload;
            int max_workload;
            decimal rating;
            string? specializations;
            decimal hourly_rate;
        |}, sql:Error?> agentStream = self.dbClient->query(query);
        
        Agent[] nearbyAgents = [];
        
        check from var agent in agentStream
            do {
                decimal distance = self.calculateDistance(
                    location.latitude, location.longitude,
                    agent.location_lat, agent.location_lng
                );
                
                if distance <= radiusKm {
                    nearbyAgents.push({
                        agentId: agent.agent_id,
                        agentName: agent.name,
                        agentPhone: agent.email, // Using email as phone since no phone field
                        agentEmail: agent.email,
                        coordinates: {
                            latitude: agent.location_lat,
                            longitude: agent.location_lng
                        },
                        currentWorkload: agent.current_workload,
                        maxWorkload: agent.max_workload,
                        rating: agent.rating,
                        specializations: agent.specializations is string ? 
                            re`\s*,\s*`.split(<string>agent.specializations) : [],
                        distanceFromMaterial: distance,
                        estimatedArrival: self.estimateArrivalTime(distance, "medium"),
                        visitCost: 0,
                        costBreakdown: {
                            baseCost: 0,
                            distanceCost: 0,
                            timeCost: 0,
                            urgencySurcharge: 0,
                            totalCost: 0,
                            estimatedDuration: 0,
                            distanceKm: distance
                        },
                        assignmentScore: 0,
                        status: "available",
                        assignedAt: time:utcNow()
                    });
                }
            };
        
        return nearbyAgents;
    }
}

# Enhanced agent assignment type
public type AgentAssignment record {|
    string assignmentId;
    Agent agent;
    string supplierId;
    string materialId;
    string chatRoomId;
    string notificationId;
    time:Utc createdAt;
|};

