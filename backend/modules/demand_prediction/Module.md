# Demand Prediction Module

This module provides AI-powered demand prediction services for the CircularSync platform.

## Module Organization

```
demand_prediction/
├── types.bal                    # Data structures and types
├── data_generator.bal           # Dummy data generation for testing
├── forecasting_algorithms.bal   # Core forecasting algorithms
├── demand_prediction_service.bal # HTTP service endpoints
└── Module.md                    # This file
```

## Running the Service

To run the demand prediction service independently:

```bash
cd backend/ai/demand_prediction
bal run .
```

The service will start on port 8081.

## Module Dependencies

- `ballerina/http` - For REST API endpoints
- `ballerina/time` - For timestamp handling
- `ballerina/log` - For logging
- `ballerina/uuid` - For unique ID generation
- `ballerina/random` - For data generation
- `ballerina/lang.'float` - For float operations
- `ballerina/lang.'int` - For integer operations
- `ballerina/lang.array` - For array operations