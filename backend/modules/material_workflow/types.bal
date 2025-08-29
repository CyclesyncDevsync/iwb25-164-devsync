// Material Workflow Types
// Contains all type definitions for the material workflow system

import ballerina/time;

// Workflow Stage Enumeration
public enum WorkflowStage {
    SUBMITTED = "submitted",
    AI_ANALYZING = "ai_analyzing", 
    AI_APPROVED = "ai_approved",
    AI_REJECTED = "ai_rejected",
    AGENT_ASSIGNED = "agent_assigned",
    AGENT_EN_ROUTE = "agent_en_route",
    AGENT_REVIEWING = "agent_reviewing", 
    AGENT_APPROVED = "agent_approved",
    AGENT_REJECTED = "agent_rejected",
    AUCTION_LISTED = "auction_listed",
    AUCTION_ACTIVE = "auction_active",
    AUCTION_COMPLETED = "auction_completed",
    PAYMENT_PENDING = "payment_pending",
    PICKUP_SCHEDULED = "pickup_scheduled",
    IN_TRANSIT = "in_transit",
    DELIVERED = "delivered",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}

// Core workflow types
public type EnhancedMaterialSubmission record {
    string supplierId;
    string title;
    string description;
    string category;
    string subCategory;
    int quantity;
    string unit;
    string condition;
    MaterialPhotoSubmission[] photos;
    Location location;
    MaterialPricing pricing;
    MaterialSpecifications specifications;
    string[] tags;
    time:Utc? estimatedPickupDate;
};

public type MaterialPhotoSubmission record {
    string filename;
    string base64Data;
    string format;
    int size;
    boolean isMain;
};

public type Location record {
    string address;
    string city;
    string district;
    string province;
    string? postalCode;
    Coordinates? coordinates;
};

public type Coordinates record {
    float latitude;
    float longitude;
};

public type MaterialPricing record {
    float expectedPrice;
    float minimumPrice;
    string currency;
    boolean negotiable;
};

public type MaterialSpecifications record {
    record {
        float? length;
        float? width;
        float? height;
        float? weight;
    }? dimensions;
    string material;
    string? color;
    string? brand;
    string? model;
    int? manufacturingYear;
};

public type MaterialWorkflow record {
    string workflowId;
    string materialId;
    string supplierId;
    MaterialInfo material;
    string currentStage;
    string[] completedStages;
    string? nextStage;
    StageHistoryItem[] stageHistory;
    time:Utc createdAt;
    time:Utc? estimatedCompletion;
    WorkflowBlocker[]? blockers;
    AIAnalysisResult? aiAnalysis;
    AgentAssignmentResult? agentAssignment;
    AgentReviewResult? agentReview;
};

public type MaterialInfo record {
    string title;
    string description;
    string category;
    string subCategory;
    int quantity;
    string unit;
    string condition;
    MaterialPhotoSubmission[] photos;
    Location location;
    MaterialPricing pricing;
    MaterialSpecifications specifications;
    string[] tags;
    time:Utc? estimatedPickupDate;
};

public type MaterialWorkflowResponse record {
    string workflowId;
    string materialId;
    string currentStage;
    string message;
    time:Utc? estimatedCompletion;
    string[] nextSteps;
};

public type MaterialWorkflowStatus record {
    string workflowId;
    string materialId;
    string currentStage;
    string[] completedStages;
    string? nextStage;
    StageHistoryItem[] stageHistory;
    time:Utc? estimatedCompletion;
    WorkflowBlocker[]? blockers;
    AIAnalysisResult? aiAnalysis;
    AgentAssignmentResult? agentAssignment;
    AgentReviewResult? agentReview;
};

public type StageHistoryItem record {
    string stage;
    time:Utc timestamp;
    string actor;
    string actorType;
    string? notes;
};

public type WorkflowBlocker record {
    string blockerId;
    string stage;
    string blockerType;
    string description;
    string severity;
    time:Utc createdAt;
    time:Utc? resolvedAt;
    string? resolutionNotes;
};

// AI Analysis types
public type AIAnalysisRequest record {
    string wasteStreamId;
    string wasteType;
    string fieldAgentId;
    string imageData;
    string imageFormat;
    string location;
    record {} additionalContext;
};

public type AIAnalysisResult record {
    string assessmentId;
    float overallScore;
    string qualityGrade;
    boolean approved;
    string[] recommendations;
    string[] issues;
    string nextAction;
    string? rejectionReason;
};

// Agent types
public type Agent record {
    string agentId;
    string name;
    string phone;
    string email;
    Coordinates currentLocation;
    boolean isAvailable;
    string[] specializations;
    float rating;
    int completedAssignments;
};

public type AgentAssignmentResult record {
    string agentId;
    string agentName;
    string agentPhone;
    string agentEmail;
    time:Utc estimatedArrival;
    time:Utc? actualArrival;
    float visitCost;
    float distanceFromMaterial;
    time:Utc assignedAt;
    string status;
    Coordinates? coordinates;
};

public type AgentAssignmentDetails record {
    AgentAssignmentResult assignment;
    MapData mapData;
    TimelineEvent[] timeline;
};

public type MapData record {
    Coordinates agentLocation;
    Coordinates materialLocation;
    RouteInfo route;
};

public type RouteInfo record {
    float distance;
    int estimatedTime;
    Coordinates[] waypoints;
};

public type TimelineEvent record {
    string event;
    time:Utc timestamp;
    string status;
    string description;
};

public type AgentCheckIn record {
    string agentId;
    string status;
    time:Utc arrivalTime;
    Coordinates currentLocation;
    string? notes;
};

public type AgentCheckInResponse record {
    boolean success;
    string message;
    string nextAction;
    string estimatedDuration;
};

public type AgentReviewSubmission record {
    string agentId;
    AgentFindings findings;
    string[] recommendations;
    string[] issues;
    MaterialPhotoSubmission[] photos;
    float visitCost;
    string? notes;
};

public type AgentFindings record {
    string actualCondition;
    int actualQuantity;
    string contamination;
    string packaging;
    string accessibility;
    MarketabilityScore marketability;
    string? specialNotes;
};

public type MarketabilityScore record {
    float score;
    string[] factors;
    string marketDemand;
    boolean competitivePrice;
};

public type AgentReviewResult record {
    string reviewId;
    string agentId;
    string materialId;
    float overallScore;
    string qualityGrade;
    boolean approved;
    AgentFindings findings;
    string[] recommendations;
    string[] issues;
    MaterialPhotoSubmission[] photos;
    float visitCost;
    time:Utc reviewDate;
    string nextAction;
    string? rejectionReason;
    string? notes;
};

public type AgentReviewResponse record {
    string reviewId;
    boolean approved;
    float overallScore;
    string qualityGrade;
    float visitCost;
    string nextAction;
    string message;
    time:Utc? auctionListingETA;
};

public type WorkflowNotification record {
    string notificationId;
    string workflowId;
    string message;
    string notificationType;
    time:Utc timestamp;
    boolean read;
};