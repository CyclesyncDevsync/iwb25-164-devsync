# Database Module

## Overview
This module handles all database connectivity and operations for the CircularSync platform.

## Features
- PostgreSQL connection management
- Connection pooling
- Health checks
- Database operations utilities
- Test operations

## Configuration
Configure in `Config.toml`:
```toml
dbHost = "localhost"
dbPort = 5432
dbUsername = "your_username"
dbPassword = "your_password"
dbName = "cyclesync_db"
dbConnectionPool = 10
dbSsl = true
```

## Usage
```ballerina
import Cyclesync.database;

// Initialize database
check database:initializeDatabase();

// Get client for operations
postgresql:Client dbClient = check database:getDatabaseClient();

// Check connection status
boolean connected = database:isDatabaseConnected();
```

## Functions
- `initializeDatabase()` - Initialize database connection
- `getDatabaseClient()` - Get database client instance
- `isDatabaseConnected()` - Check connection status
- `closeDatabaseConnection()` - Close database connection
- `executeTestOperations()` - Run database test suite