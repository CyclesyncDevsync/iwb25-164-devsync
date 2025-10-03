// Quality Assessment AI Types
// Defines data structures for AI-powered quality verification

import ballerina/time;

// Image upload request structure
public type ImageUploadRequest record {
    string wasteStreamId;
    string wasteType;
    string location;
    string fieldAgentId;
    string imageData; // Base64 encoded image data
    string imageFormat; // "jpeg", "png", "webp"
    string fileName;
    map<string> metadata?;
};

// Quality assessment result
public type QualityAssessment record {
    string assessmentId;
    string wasteStreamId;
    string fieldAgentId;
    time:Utc assessedAt;
    
    // Overall quality metrics
    float overallScore; // 0-100
    string qualityGrade; // "excellent", "good", "fair", "poor", "rejected"
    boolean approved;
    
    // Vision analysis results
    VisionAnalysis visionAnalysis;
    
    // Quality factors
    QualityFactors qualityFactors;
    
    // Compliance check
    ComplianceStatus compliance;
    
    // Recommendations
    string[] recommendations;
    string[] issues;
    
    // Next steps
    string nextAction; // "approve", "reject", "manual_review", "rescan"
    string? rejectionReason;
};

// Vision analysis from Google Vision API
public type VisionAnalysis record {
    ObjectDetection[] detectedObjects;
    TextAnnotation[] detectedText;
    LabelAnnotation[] detectedLabels?;
    ImageProperties imageProperties;
    SafeSearchAnnotation safeSearch;
    WebDetection? webDetection;
};

// Object detection results
public type ObjectDetection record {
    string name;
    float confidence;
    BoundingBox boundingBox;
    string category?;
};

// Bounding box for detected objects
public type BoundingBox record {
    float x;
    float y;
    float width;
    float height;
};

// Text annotation from OCR
public type TextAnnotation record {
    string text;
    float confidence;
    BoundingBox boundingBox;
    string language?;
};

// Label annotation from Label Detection
public type LabelAnnotation record {
    string description;
    float score;
    float topicality?;
};

// Image properties analysis
public type ImageProperties record {
    ColorInfo[] dominantColors;
    float aspectRatio;
    int imageWidth;
    int imageHeight;
    CropHint[] cropHints?;
};

// Color information
public type ColorInfo record {
    RGB color;
    float fraction;
    float pixelFraction;
};

// RGB color values
public type RGB record {
    int red;
    int green;
    int blue;
};

// Crop hint suggestions
public type CropHint record {
    BoundingBox boundingBox;
    float confidence;
    float importanceFraction;
};

// Safe search annotation
public type SafeSearchAnnotation record {
    string adult;
    string spoof;
    string medical;
    string violence;
    string racy;
};

// Web detection results
public type WebDetection record {
    WebEntity[] webEntities;
    WebImage[] fullMatchingImages;
    WebImage[] partialMatchingImages;
    WebPage[] pagesWithMatchingImages;
};

// Web entity
public type WebEntity record {
    string entityId?;
    float score;
    string description?;
};

// Web image
public type WebImage record {
    string url;
    float score;
};

// Web page
public type WebPage record {
    string url;
    float score;
    string pageTitle?;
    WebImage[] fullMatchingImages;
    WebImage[] partialMatchingImages;
};

// Quality factors derived from vision analysis
public type QualityFactors record {
    // Contamination assessment
    ContaminationAnalysis contamination;
    
    // Physical condition
    PhysicalCondition condition;
    
    // Sorting accuracy
    SortingAccuracy sorting;
    
    // Volume estimation
    VolumeEstimate volume;
    
    // Label compliance
    LabelCompliance labeling;
};

// Contamination analysis
public type ContaminationAnalysis record {
    float contaminationLevel; // 0-100, lower is better
    string[] contaminants;
    float purityScore; // 0-100, higher is better
    boolean crossContamination;
};

// Physical condition assessment
public type PhysicalCondition record {
    float damageLevel; // 0-100, lower is better
    string[] damageTypes;
    float integrityScore; // 0-100, higher is better
    boolean processable;
};

// Sorting accuracy
public type SortingAccuracy record {
    float accuracyScore; // 0-100, higher is better
    string[] incorrectItems;
    boolean correctCategory;
    float categoryConfidence;
    string? detectedType?; // The actual material type detected by Vision API
    string? expectedType?; // The material type provided by the user
    boolean materialTypeMatches?; // True if detected matches expected
    string? comparisonMessage?; // Human-readable comparison result
};

// Volume estimation
public type VolumeEstimate record {
    float estimatedVolume; // in cubic meters
    float confidence;
    string measurementMethod;
    float densityEstimate?;
};

// Label compliance
public type LabelCompliance record {
    boolean hasRequiredLabels;
    string[] missingLabels;
    string[] detectedLabels;
    float complianceScore; // 0-100
};

// Compliance status
public type ComplianceStatus record {
    boolean environmentalCompliance;
    boolean safetyCompliance;
    boolean transportCompliance;
    string[] violations;
    string[] warnings;
};

// Quality standards for different waste types
public type QualityStandards record {
    string wasteType;
    QualityThresholds thresholds;
    string[] requiredLabels;
    string[] prohibitedContaminants;
    PhysicalRequirements physicalRequirements;
    ProcessingRequirements processingRequirements;
};

// Quality thresholds
public type QualityThresholds record {
    float minOverallScore;
    float maxContaminationLevel;
    float minPurityScore;
    float minIntegrityScore;
    float minSortingAccuracy;
    float minCategoryConfidence;
};

// Physical requirements
public type PhysicalRequirements record {
    float maxMoistureContent?;
    float minDensity?;
    float maxDensity?;
    string[] acceptableConditions;
    string[] unacceptableConditions;
};

// Processing requirements
public type ProcessingRequirements record {
    boolean requiresSorting;
    boolean requiresCleaning;
    boolean requiresPreProcessing;
    string[] processingSteps;
    map<string> processingParameters;
};

// Historical quality data
public type QualityHistory record {
    string wasteType;
    string location;
    string fieldAgentId;
    QualityTrend[] trends;
    QualityStatistics statistics;
    time:Utc lastUpdated;
};

// Quality trend data
public type QualityTrend record {
    time:Utc timestamp;
    float qualityScore;
    string qualityGrade;
    int samplesCount;
};

// Quality statistics
public type QualityStatistics record {
    float averageScore;
    float standardDeviation;
    int totalAssessments;
    int approvedCount;
    int rejectedCount;
    float approvalRate;
    map<string> issueFrequency;
};

// Batch assessment request
public type BatchAssessmentRequest record {
    string batchId;
    string wasteType;
    string location;
    string fieldAgentId;
    ImageUploadRequest[] images;
    map<string> batchMetadata?;
};

// Batch assessment result
public type BatchAssessmentResult record {
    string batchId;
    time:Utc processedAt;
    int totalImages;
    int processedImages;
    int approvedImages;
    int rejectedImages;
    
    QualityAssessment[] individualAssessments;
    BatchQualityMetrics batchMetrics;
    string[] batchIssues;
    string batchRecommendation;
};

// Batch quality metrics
public type BatchQualityMetrics record {
    float averageQualityScore;
    float batchPurityScore;
    float uniformityScore; // How consistent the quality is across the batch
    string overallGrade;
    boolean batchApproved;
};

// Agent performance metrics
public type AgentPerformance record {
    string fieldAgentId;
    time:Utc periodStart;
    time:Utc periodEnd;
    
    int totalAssessments;
    float averageQualityScore;
    float accuracyScore; // How often agent assessments match AI
    int improvementSuggestions;
    
    PerformanceTrend[] trends;
    string[] strengthAreas;
    string[] improvementAreas;
};

// Performance trend
public type PerformanceTrend record {
    time:Utc date;
    float qualityScore;
    float accuracyScore;
    int assessmentCount;
};

// Real-time quality alert
public type QualityAlert record {
    string alertId;
    string alertType; // "low_quality", "contamination", "safety_issue", "compliance_violation"
    string severity; // "low", "medium", "high", "critical"
    string wasteStreamId;
    string location;
    string fieldAgentId;
    time:Utc triggeredAt;
    
    string message;
    string[] affectedAreas;
    string[] recommendedActions;
    boolean requiresImmediateAttention;
};

// Quality assessment configuration
public type QualityConfig record {
    map<QualityStandards> wasteTypeStandards;
    VisionAPIConfig visionConfig;
    AlertConfig alertConfig;
    ProcessingConfig processingConfig;
};

// Vision API configuration
public type VisionAPIConfig record {
    string[] enabledFeatures; // "OBJECT_LOCALIZATION", "TEXT_DETECTION", etc.
    float confidenceThreshold;
    int maxResults;
    boolean batchProcessing;
    map<string> featureSettings;
};

// Alert configuration
public type AlertConfig record {
    map<float> alertThresholds;
    string[] notificationChannels;
    map<string> escalationRules;
    boolean realTimeAlerts;
};

// Processing configuration
public type ProcessingConfig record {
    int maxImageSize; // in MB
    string[] supportedFormats;
    boolean enableImageEnhancement;
    boolean enableParallelProcessing;
    int processingTimeout; // in seconds
};