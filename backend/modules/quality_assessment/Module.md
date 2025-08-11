# Quality Assessment AI Module

## Overview

The Quality Assessment AI module provides computer vision-powered waste quality analysis for CircularSync. It integrates with Google Cloud Vision API via `ballerinax/googleapis.vision` connector to automatically assess waste quality from field agent photos, ensuring compliance with environmental standards and processing requirements.

## Features

### 🔍 Computer Vision Analysis
- **Object Detection**: Identifies waste materials, contaminants, and damage
- **Text Recognition (OCR)**: Reads labels, markings, and regulatory text
- **Image Properties**: Analyzes colors, composition, and visual quality
- **Safe Search**: Detects inappropriate or hazardous content

### 📊 Quality Scoring System
- **Overall Quality Score**: Comprehensive 0-100 scoring system
- **Quality Grades**: Excellent, Good, Fair, Poor, Rejected
- **Multi-factor Analysis**: Contamination, condition, sorting accuracy, labeling
- **Compliance Checking**: Environmental, safety, and transport standards

### 🎯 Waste Type Standards
- **Plastic**: PET, HDPE recycling standards with contamination limits
- **Paper**: Moisture content, ink removal, fiber quality assessment  
- **Metal**: Purity requirements, magnetic separation compatibility
- **Glass**: Color sorting, contamination detection, integrity checks
- **Organic**: Composting suitability, synthetic contamination detection

### ⚡ Processing Capabilities
- **Single Image Assessment**: Real-time quality analysis
- **Batch Processing**: Parallel processing of multiple images
- **Performance Tracking**: Agent accuracy and improvement metrics
- **Historical Analysis**: Quality trends and statistics

## API Endpoints

### Quality Assessment
```http
POST /api/ai/quality/assess-image
POST /api/ai/quality/batch-assess
```

### Standards & History  
```http
GET /api/ai/quality/standards/{wasteType}
GET /api/ai/quality/history/{wasteType}/{location}  
GET /api/ai/quality/agent-performance/{agentId}
```

### Health Check
```http
GET /api/ai/quality/health
```

## WSO2 Ballerina Components Used

### Core Services
- **Ballerina HTTP Service** - RESTful API endpoints and request handling
- **Google Vision Connector** - `ballerinax/googleapis.vision` for image analysis
- **Ballerina Concurrency** - Parallel batch processing with futures
- **Error Handling** - Comprehensive error management and validation

### Integration Features
- **Multi-protocol Support** - HTTP REST APIs with future WebSocket support
- **Authentication Ready** - Designed for WSO2 Identity Server integration  
- **Configuration Management** - Flexible quality standards configuration
- **Observability** - Built-in logging and monitoring capabilities

## Data Structures

### Main Types
- `ImageUploadRequest` - Image data with metadata
- `QualityAssessment` - Complete quality analysis result
- `VisionAnalysis` - Google Vision API response transformation
- `QualityFactors` - Multi-dimensional quality metrics
- `QualityStandards` - Waste type-specific requirements

### Analysis Components
- `ContaminationAnalysis` - Purity and contamination detection
- `PhysicalCondition` - Damage and integrity assessment
- `SortingAccuracy` - Category matching and confidence
- `LabelCompliance` - Required labeling verification
- `ComplianceStatus` - Regulatory compliance checking

## Quality Analysis Workflow

### 1. Image Processing
```ballerina
// Google Vision API analysis
VisionAnalysis analysis = analyzeImage(imageRequest);

// Extract key features
ObjectDetection[] objects = analysis.detectedObjects;
TextAnnotation[] labels = analysis.detectedText;  
ImageProperties properties = analysis.imageProperties;
```

### 2. Quality Factor Analysis
```ballerina
// Multi-dimensional quality assessment
ContaminationAnalysis contamination = analyzeContamination(vision, standards);
PhysicalCondition condition = analyzePhysicalCondition(vision, standards);
SortingAccuracy sorting = analyzeSortingAccuracy(vision, wasteType);
LabelCompliance labeling = checkLabelCompliance(vision, standards);
```

### 3. Scoring & Decision
```ballerina
// Weighted scoring system
float overallScore = calculateOverallScore(qualityFactors, standards);
string qualityGrade = determineQualityGrade(overallScore);
boolean approved = overallScore >= standards.thresholds.minOverallScore;
```

## Quality Standards Configuration

### Plastic Standards Example
```ballerina
QualityStandards plasticStandards = {
    wasteType: "plastic",
    thresholds: {
        minOverallScore: 70.0,
        maxContaminationLevel: 15.0,
        minPurityScore: 85.0,
        minIntegrityScore: 80.0
    },
    requiredLabels: ["recycling", "plastic", "pet"],
    prohibitedContaminants: ["metal", "glass", "organic", "hazardous"]
};
```

## Integration with CircularSync Architecture

### Field Agent Workflow
1. **Photo Upload** - Field agent captures waste stream photos
2. **AI Analysis** - Google Vision API processes images automatically  
3. **Quality Score** - Multi-factor assessment generates quality metrics
4. **Approval Decision** - Automated approve/reject based on standards
5. **Notifications** - Real-time alerts for quality issues

### Supply Chain Integration
- **Supplier Confidence** - Quality scores build trust in waste streams
- **Pricing Impact** - Quality grades influence bidding recommendations
- **Processing Planning** - Quality factors inform processing requirements
- **Compliance Assurance** - Automated regulatory compliance checking

## Performance Features

### Parallel Processing
```ballerina
// Batch processing with futures for scalability
future<QualityAssessment|error>[] futures = [];
foreach ImageUploadRequest image in batchRequest.images {
    futures.push(start processIndividualImage(image));
}
```

### Caching & Optimization
- Image processing optimization for mobile uploads
- Quality standards caching for improved response times
- Batch processing for high-volume operations
- Parallel analysis for multiple quality factors

## Security & Compliance

### Data Protection
- Secure image handling with size and format validation
- Google Vision API integration with proper authentication
- No persistent storage of sensitive image data
- Compliance with data protection regulations

### Quality Assurance  
- Multi-layer validation of assessment results
- Confidence scoring for AI predictions
- Manual review triggers for borderline cases
- Audit trails for all quality decisions

## Monitoring & Analytics

### Real-time Metrics
- Quality assessment processing times
- AI confidence levels and accuracy
- Field agent performance tracking  
- Quality trend analysis over time

### Business Intelligence
- Quality score distributions by waste type
- Geographic quality variations
- Contamination pattern detection
- Processing efficiency improvements

## Future Enhancements

### Advanced AI Features
- Custom ML model training for specific waste types
- Defect detection using computer vision  
- Volume estimation from 2D images
- Multi-angle photo analysis

### Integration Expansion
- IoT sensor data fusion for comprehensive quality assessment
- Blockchain integration for immutable quality records
- Predictive quality modeling based on environmental factors
- Mobile app SDK for field agent optimization

## Configuration

### Environment Variables
- `GOOGLE_VISION_CREDENTIALS_PATH` - Service account credentials
- `QUALITY_STANDARDS_CONFIG` - Custom quality standards file
- `IMAGE_PROCESSING_TIMEOUT` - Processing timeout in seconds
- `MAX_IMAGE_SIZE_MB` - Maximum upload size limit

### Dependencies
```toml
[dependencies]
"ballerinax/googleapis.vision" = "latest"
"ballerina/http" = "latest"  
"ballerina/time" = "latest"
"ballerina/uuid" = "latest"
```

This Quality Assessment AI module demonstrates advanced use of WSO2 Ballerina's ecosystem, showcasing network-first programming, external API integration, parallel processing, and comprehensive error handling while solving real-world waste management challenges.