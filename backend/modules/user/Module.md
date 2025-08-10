# User Module

This module handles user-related functionality for the Cyclesync application.

## Features
- User profile management
- User preferences
- User data validation
- User CRUD operations

## Components
- **UserController**: HTTP endpoints for user operations
- **UserService**: Business logic for user management
- **UserTypes**: Type definitions for user data

## Usage
```ballerina
import hp/Cyclesync.user;

UserService userService = new();
UserProfile profile = userService.getUserProfile(userId);
```
