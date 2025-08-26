# Authentication Module

## Overview
This module provides Asgardeo-based authentication and role-based user management for the CircularSync platform.

## Features
- Asgardeo ID token validation
- 5-role user system (super_admin, admin, agent, supplier, buyer)
- Role-based access control
- User registration and approval workflow
- PostgreSQL user data storage

## User Roles & Permissions

### Super Admin
- All permissions
- Can manage admins
- Full system access

### Admin  
- Manage users (except other admins)
- Approve/reject registrations
- System administration

### Agent
- Manage buyers and suppliers
- Handle auctions and transactions

### Supplier
- Self-register and manage profile
- Material management
- Auction participation

### Buyer
- Self-register and manage profile  
- Auction participation
- Order management

## Configuration
Configure in `Config.toml`:
```toml
[Cyclesync.auth]
asgardeoBaseUrl = "https://api.asgardeo.io/t/your-org"
asgardeoClientId = "your-client-id" 
asgardeoClientSecret = "your-client-secret"
```

## Database Schema
The module creates the following table:
- `users` - User profiles with roles and registration status

## API Endpoints

### Authentication
- `POST /api/auth/validate` - Validate ID token
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/register` - Register new user (buyers/suppliers)

### Admin User Management
- `GET /api/admin/users` - List all users (admin only)
- `PUT /api/admin/users/{id}` - Update user (admin only)
- `DELETE /api/admin/users/{id}` - Delete user (admin only)

## Usage
```ballerina
import Cyclesync.auth;

// Initialize auth schema
check auth:initializeAuthSchema();

// Validate token
AuthResult result = auth:validateIdToken(idToken);

// Check permissions
boolean canAccess = auth:hasPermission(userRole, "users", "read");
```