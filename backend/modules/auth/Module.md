# Authentication Module

This module handles all authentication-related functionality for the Cyclesync application.

## Features
- Token validation using Asgardeo
- Authentication middleware
- Role-based access control
- Token caching for performance
- JWT token handling

## Components
- **AuthService**: Core authentication service
- **AuthMiddleware**: HTTP middleware for request authentication
- **AuthTypes**: Type definitions for authentication
- **AsgardeoConfig**: Configuration for Asgardeo integration

## Usage
```ballerina
import hp/Cyclesync.auth;

AuthMiddleware authMiddleware = new();
AuthResult result = authMiddleware.authenticate(request);
```
