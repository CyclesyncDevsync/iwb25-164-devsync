import ballerina/log;
import ballerina/http;
import ballerina/lang.'float as floats;

# Calculates transport costs based on distance and other factors
public class TransportCalculator {
    
    private final http:Client openStreetMapClient;
    
    public function init() {
        // OpenStreetMap doesn't require API key - simplified initialization
        self.openStreetMapClient = checkpanic new ("https://router.project-osrm.org");
        log:printInfo("Using OpenStreetMap for route calculation");
    }
    
    # Calculate transport cost
    # + pickup - Pickup location
    # + delivery - Delivery location
    # + quantity - Quantity in kg
    # + urgency - Urgency level (immediate, standard, flexible)
    # + return - Transport cost or error
    public function calculateTransportCost(Location pickup, Location delivery, 
                                         float quantity, string urgency) returns float|error {
        // Calculate distance
        float distance = check self.calculateDistance(pickup, delivery);
        
        // Get base transport rate
        float baseRate = TRANSPORT_RATES[urgency] ?: 0.3;
        
        // Calculate base cost
        float baseCost = distance * quantity * baseRate;
        
        // Apply bulk discount
        float bulkDiscount = self.getBulkDiscount(quantity);
        
        // Apply route complexity factor
        float routeFactor = check self.getRouteComplexityFactor(pickup, delivery);
        
        // Calculate final cost
        float totalCost = baseCost * bulkDiscount * routeFactor;
        
        log:printInfo(string `Transport cost calculated: Distance=${distance}km, ` +
                     string `Quantity=${quantity}kg, Base cost=${baseCost}, ` +
                     string `Total cost=${totalCost}`);
        
        return totalCost;
    }
    
    # Calculate detailed transport cost
    # + request - Transport cost request
    # + return - Transport cost response or error
    public function calculateDetailedCost(TransportCostRequest request) returns TransportCostResponse|error {
        // Calculate distance
        float distance = check self.calculateDistance(request.pickup, request.delivery);
        
        // Get base rate
        float baseRate = TRANSPORT_RATES[request.urgency] ?: 0.3;
        
        // Calculate base cost
        float baseCost = distance * request.quantity * baseRate;
        
        // Apply modifiers
        float bulkDiscount = self.getBulkDiscount(request.quantity);
        float routeFactor = check self.getRouteComplexityFactor(request.pickup, request.delivery);
        float urgencyMultiplier = self.getUrgencyMultiplier(request.urgency);
        
        // Calculate total
        float totalCost = baseCost * bulkDiscount * routeFactor * urgencyMultiplier;
        
        // Estimate delivery time
        string estimatedTime = self.estimateDeliveryTime(distance, request.urgency);
        
        return {
            distance: distance,
            baseCost: baseCost,
            urgencyMultiplier: urgencyMultiplier,
            totalCost: totalCost,
            estimatedTime: estimatedTime
        };
    }
    
    # Calculate distance between two locations
    # + pickup - Pickup location
    # + delivery - Delivery location
    # + return - Distance in km
    private function calculateDistance(Location pickup, Location delivery) returns float|error {
        // Try to use OpenStreetMap for routing
        float|error osmDistance = self.getOpenStreetMapDistance(pickup, delivery);
        if (osmDistance is float) {
            return osmDistance;
        }
        
        // Fallback to Haversine formula for straight-line distance
        log:printWarn("OpenStreetMap routing failed, using Haversine formula");
        return self.calculateHaversineDistance(pickup, delivery);
    }
    
    # Get distance using OpenStreetMap routing API
    # + pickup - Pickup location
    # + delivery - Delivery location
    # + return - Distance in km
    private function getOpenStreetMapDistance(Location pickup, Location delivery) returns float|error {
        // OSRM format: /route/v1/driving/{lon1},{lat1};{lon2},{lat2}
        string coordinates = string `${pickup.longitude},${pickup.latitude};${delivery.longitude},${delivery.latitude}`;
        string path = string `/route/v1/driving/${coordinates}?overview=false`;
        
        http:Response|error response = self.openStreetMapClient->get(path);
        if (response is error) {
            return response;
        }
        
        json|error jsonResponse = response.getJsonPayload();
        if (jsonResponse is error) {
            return jsonResponse;
        }
        
        // Parse OSRM response
        json code = check jsonResponse.code;
        if (code != "Ok") {
            return error("OpenStreetMap routing failed");
        }
        
        json routes = check jsonResponse.routes;
        json[] routesArray = <json[]>routes;
        json route = routesArray[0];
        float meters = <float>check route.distance;
        
        return meters / 1000.0;
    }
    
    # Calculate distance using Haversine formula
    # + pickup - Pickup location
    # + delivery - Delivery location
    # + return - Distance in km
    private function calculateHaversineDistance(Location pickup, Location delivery) returns float {
        // Simple distance calculation (approximation for India region)
        float latDiff = delivery.latitude - pickup.latitude;
        float lonDiff = delivery.longitude - pickup.longitude;
        
        // Convert to approximate distance in km
        float latDistance = latDiff * 111.0; // 1 degree latitude ≈ 111 km
        float lonDistance = lonDiff * 85.0; // 1 degree longitude ≈ 85 km in India
        
        // Calculate approximate distance using Pythagorean theorem
        float distance = floats:sqrt((latDistance * latDistance) + (lonDistance * lonDistance));
        
        // Add 30% for road distance vs straight line
        return distance * 1.3;
    }
    
    # Get bulk discount based on quantity
    # + quantity - Quantity in kg
    # + return - Discount multiplier (1.0 = no discount)
    private function getBulkDiscount(float quantity) returns float {
        if (quantity > 1000.0) {
            return 0.8; // 20% discount
        } else if (quantity > 500.0) {
            return 0.9; // 10% discount
        } else if (quantity > 200.0) {
            return 0.95; // 5% discount
        }
        return 1.0;
    }
    
    # Get route complexity factor
    # + pickup - Pickup location
    # + delivery - Delivery location
    # + return - Route complexity multiplier
    private function getRouteComplexityFactor(Location pickup, Location delivery) returns float|error {
        // Simplified logic based on location
        // In production, this would use actual route analysis
        
        // Check if locations are in urban areas (simplified check)
        boolean pickupUrban = self.isUrbanArea(pickup);
        boolean deliveryUrban = self.isUrbanArea(delivery);
        
        if (pickupUrban && deliveryUrban) {
            return 1.2; // Urban multiplier
        } else if (!pickupUrban && !deliveryUrban) {
            return 0.8; // Rural multiplier
        }
        return 1.0; // Suburban multiplier
    }
    
    # Check if location is in urban area
    # + location - Location to check
    # + return - True if urban
    private function isUrbanArea(Location location) returns boolean {
        // Major city coordinates (simplified)
        // In production, use proper geocoding
        
        // Mumbai region
        if (location.latitude > 18.9 && location.latitude < 19.3 &&
            location.longitude > 72.7 && location.longitude < 73.1) {
            return true;
        }
        
        // Delhi region
        if (location.latitude > 28.4 && location.latitude < 28.8 &&
            location.longitude > 76.9 && location.longitude < 77.4) {
            return true;
        }
        
        // Bangalore region
        if (location.latitude > 12.8 && location.latitude < 13.2 &&
            location.longitude > 77.4 && location.longitude < 77.8) {
            return true;
        }
        
        return false;
    }
    
    # Get urgency multiplier
    # + urgency - Urgency level
    # + return - Urgency multiplier
    private function getUrgencyMultiplier(string urgency) returns float {
        match urgency {
            "immediate" => { return 1.5; }
            "standard" => { return 1.0; }
            "flexible" => { return 0.8; }
            _ => { return 1.0; }
        }
    }
    
    # Estimate delivery time
    # + distance - Distance in km
    # + urgency - Urgency level
    # + return - Estimated delivery time
    private function estimateDeliveryTime(float distance, string urgency) returns string {
        // Average speed assumptions
        float avgSpeed = 40.0; // km/h in urban areas
        
        float hours = distance / avgSpeed;
        
        match urgency {
            "immediate" => {
                if (hours < 2.0) {
                    return "2-4 hours";
                } else if (hours < 4.0) {
                    return "4-6 hours";
                }
                return "Same day";
            }
            "standard" => {
                if (hours < 4.0) {
                    return "Next day";
                } else if (hours < 8.0) {
                    return "1-2 days";
                }
                return "2-3 days";
            }
            "flexible" => {
                return "3-5 days";
            }
            _ => {
                return "1-2 days";
            }
        }
    }
    
    # Get optimal route suggestions
    # + pickups - Array of pickup locations
    # + delivery - Delivery location
    # + return - Ordered array of pickups for optimal route
    public function optimizeRoute(Location[] pickups, Location delivery) returns Location[]|error {
        if (pickups.length() <= 1) {
            return pickups;
        }
        
        // Simple nearest neighbor algorithm
        Location[] optimized = [];
        Location[] remaining = [...pickups];
        Location current = delivery;
        
        while (remaining.length() > 0) {
            int nearestIdx = 0;
            float minDistance = 999999.9;
            
            foreach int i in 0...remaining.length() - 1 {
                float distance = self.calculateHaversineDistance(current, remaining[i]);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestIdx = i;
                }
            }
            
            optimized.push(remaining[nearestIdx]);
            current = remaining[nearestIdx];
            _ = remaining.remove(nearestIdx);
        }
        
        return optimized;
    }
}