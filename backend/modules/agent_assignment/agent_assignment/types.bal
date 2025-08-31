// Copyright (c) 2025 Cyclesync
// Agent Assignment Module - Type Definitions

import ballerina/time;

// Location represents a geographical point with coordinates
public type Location record {|
    decimal latitude;
    decimal longitude;
    string? address?;
|};

// Agent represents a field agent
public type Agent record {|
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

// VisitCostDetails contains cost breakdown for agent visits
public type VisitCostDetails record {|
    decimal baseCost;
    decimal distanceCost;
    decimal timeCost;
    decimal urgencySurcharge;
    decimal totalCost;
    decimal estimatedDuration;
    decimal distanceKm;
|};

// AgentTracking contains real-time agent tracking information
public type AgentTracking record {|
    string agentId;
    string agentName;
    Location currentLocation;
    time:Civil lastLocationUpdate;
    string status;
    string? currentTaskId;
    time:Civil? eta;
    string? lastCheckpoint;
|};