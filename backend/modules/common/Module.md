# Common Module

This module contains shared utilities, types, and functions used across all modules in the Cyclesync application.

## Features
- Common type definitions
- Utility functions
- Shared constants
- Error handling utilities
- Response formatting utilities

## Components
- **CommonTypes**: Common type definitions
- **Utils**: Utility functions
- **Constants**: Application constants
- **ErrorUtils**: Error handling utilities

## Usage
```ballerina
import hp/Cyclesync.common;

common:ApiResponse response = common:createSuccessResponse("Operation completed", data);
```
