# Admin Module

This module handles administrative functionality for the Cyclesync application.

## Features
- User management (CRUD operations)
- System administration
- Role and permission management
- System statistics and monitoring
- Administrative reports

## Components
- **AdminController**: HTTP endpoints for admin operations
- **AdminService**: Business logic for administrative tasks
- **AdminTypes**: Type definitions for admin operations

## Usage
```ballerina
import hp/Cyclesync.admin;

AdminService adminService = new();
UserList users = adminService.getAllUsers();
```
