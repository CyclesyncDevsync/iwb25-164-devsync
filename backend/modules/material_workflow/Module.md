# Material Workflow Module

This module handles the enhanced material submission workflow including AI analysis, agent assignment, and on-site verification.

## Features

### 1. Enhanced Material Submission
- Material submission with photo upload
- AI-powered quality assessment
- Automated agent assignment
- Location-based cost calculation

### 2. AI Analysis Integration
- Integrates with quality assessment service
- Automated approval/rejection based on AI analysis
- Detailed recommendations and issue identification

### 3. Agent Assignment System
- Finds best available agent based on location and specialization
- Calculates visit costs based on distance and material type
- Real-time agent tracking and status updates

### 4. Workflow Management
- Complete material lifecycle tracking
- Stage-based workflow progression
- History and audit trail
- Automated notifications

## API Endpoints

### Material Submission
```
POST /api/material/workflow/submit
```

### Workflow Status
```
GET /api/material/workflow/status/{workflowId}
```

### Agent Assignment
```
GET /api/material/workflow/agent/{workflowId}
```

### Agent Check-in
```
POST /api/material/workflow/agent/{workflowId}/checkin
```

### Agent Review
```
POST /api/material/workflow/agent/{workflowId}/review
```

## Workflow Stages

1. **Submitted** - Material submitted by supplier
2. **AI Analyzing** - AI quality assessment in progress
3. **AI Approved/Rejected** - AI analysis complete
4. **Agent Assigned** - Field agent assigned for verification
5. **Agent En Route** - Agent traveling to location
6. **Agent Reviewing** - On-site verification in progress
7. **Agent Approved/Rejected** - Agent review complete
8. **Auction Listed** - Material approved and listed for auction

## Configuration

The service runs on port 8086 and integrates with:
- Quality Assessment Service (port 8082)
- Auction Service (for listing approved materials)
- Notification Service (for real-time updates)

## Agent Assignment Algorithm

The agent assignment system considers:
- Agent location and distance to material
- Agent specialization in material type
- Agent availability and rating
- Visit cost calculation based on distance

## Quality Assessment Integration

The module integrates with the AI quality assessment service to:
- Analyze uploaded material photos
- Generate quality scores and grades
- Provide recommendations for improvement
- Identify potential issues or contamination

## Notification System

Automated notifications are sent for:
- Material submission confirmation
- AI analysis results
- Agent assignment
- Agent arrival
- Review completion
- Auction listing