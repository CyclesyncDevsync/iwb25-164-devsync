// Copyright (c) 2025 CircularSync
// Database Initialization for Auth Module

import ballerina/log;
import ballerina/sql;
import ballerinax/postgresql;
import Cyclesync.database;

# Initialize auth database schema
#
# + return - Error if initialization fails
public function initializeAuthSchema() returns error? {
    postgresql:Client dbClient = check database:getDatabaseClient();
    
    log:printInfo("Initializing authentication database schema");
    
    // Create users table
    sql:ExecutionResult|error createUsersResult = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            asgardeo_id VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'admin', 'agent', 'supplier', 'buyer')),
            status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            approved_by VARCHAR(255),
            rejected_by VARCHAR(255),
            rejection_reason TEXT
        )
    `);
    
    if createUsersResult is error {
        log:printError("Failed to create users table", createUsersResult);
        return createUsersResult;
    }
    
    // Create indexes
    sql:ExecutionResult|error indexResult1 = dbClient->execute(`CREATE INDEX IF NOT EXISTS idx_users_asgardeo_id ON users(asgardeo_id)`);
    if indexResult1 is error {
        log:printWarn("Failed to create asgardeo_id index", indexResult1);
    }
    
    sql:ExecutionResult|error indexResult2 = dbClient->execute(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    if indexResult2 is error {
        log:printWarn("Failed to create email index", indexResult2);
    }
    
    sql:ExecutionResult|error indexResult3 = dbClient->execute(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
    if indexResult3 is error {
        log:printWarn("Failed to create role index", indexResult3);
    }
    
    sql:ExecutionResult|error indexResult4 = dbClient->execute(`CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)`);
    if indexResult4 is error {
        log:printWarn("Failed to create status index", indexResult4);
    }
    
    sql:ExecutionResult|error indexResult5 = dbClient->execute(`CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)`);
    if indexResult5 is error {
        log:printWarn("Failed to create created_at index", indexResult5);
    }
    
    // Create default super admin user
    sql:ExecutionResult|error superAdminResult = dbClient->execute(`
        INSERT INTO users (asgardeo_id, email, first_name, last_name, role, status, created_at, updated_at)
        VALUES ('default-super-admin-id', 'superadmin@cyclesync.com', 'Super', 'Admin', 'super_admin', 'approved', NOW(), NOW())
        ON CONFLICT (asgardeo_id) DO NOTHING
    `);
    
    if superAdminResult is error {
        log:printWarn("Failed to create default super admin", superAdminResult);
    } else {
        log:printInfo("Default super admin user ensured");
    }
    
    // Create default admin user  
    sql:ExecutionResult|error adminResult = dbClient->execute(`
        INSERT INTO users (asgardeo_id, email, first_name, last_name, role, status, created_at, updated_at)
        VALUES ('default-admin-id', 'admin@cyclesync.com', 'Admin', 'User', 'admin', 'approved', NOW(), NOW())
        ON CONFLICT (asgardeo_id) DO NOTHING
    `);
    
    if adminResult is error {
        log:printWarn("Failed to create default admin", adminResult);
    } else {
        log:printInfo("Default admin user ensured");
    }
    
    // Create default agent user
    sql:ExecutionResult|error agentResult = dbClient->execute(`
        INSERT INTO users (asgardeo_id, email, first_name, last_name, role, status, created_at, updated_at)
        VALUES ('bcee8b75-d97a-4a72-b7a9-686be582dc45', 'agent@cyclesync.com', 'Agent', 'User', 'agent', 'approved', NOW(), NOW())
        ON CONFLICT (asgardeo_id) DO NOTHING
    `);
    
    if agentResult is error {
        log:printWarn("Failed to create default agent", agentResult);
    } else {
        log:printInfo("Default agent user ensured");
    }
    
    log:printInfo("Authentication database schema initialized successfully");
    return;
}