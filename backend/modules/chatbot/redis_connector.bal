// Copyright (c) 2025 CircularSync
// Chatbot Module - Redis Connector

import ballerina/tcp;
import ballerina/log;

# Redis connector for session management and caching
public isolated class RedisConnector {
    private final tcp:Client tcpClient;
    private final string host;
    private final int port;
    private final string? password;
    private final int database;
    
    # Initialize Redis connector
    # + host - Redis host
    # + port - Redis port  
    # + password - Redis password (optional)
    # + database - Redis database number
    public isolated function init(string host = "localhost", int port = 6379, string? password = (), int database = 1) returns error? {
        self.host = host;
        self.port = port;
        self.password = password;
        self.database = database;
        
        // Create TCP client
        self.tcpClient = check new(host, port);
        
        // Authenticate if password provided
        if password is string && password.length() > 0 {
            _ = check self.execute(["AUTH", password]);
        }
        
        // Select database
        if database != 0 {
            _ = check self.execute(["SELECT", database.toString()]);
        }
        
        log:printInfo(string `Connected to Redis at ${host}:${port} (database: ${database})`);
    }
    
    # Set a key-value pair with optional TTL
    # + key - Redis key
    # + value - Value to store
    # + ttl - Time to live in seconds (optional)
    # + return - OK if successful
    public isolated function set(string key, string value, int? ttl = ()) returns string|error {
        string[] command = ["SET", key, value];
        
        if ttl is int {
            command.push("EX");
            command.push(ttl.toString());
        }
        
        return check self.execute(command);
    }
    
    # Get value by key
    # + key - Redis key
    # + return - Value or nil if not found
    public isolated function get(string key) returns string?|error {
        string|error result = check self.execute(["GET", key]);
        if result is error || result == "(nil)" {
            return ();
        }
        return result;
    }
    
    # Delete key(s)
    # + keys - Key(s) to delete
    # + return - Number of keys deleted
    public isolated function del(string... keys) returns int|error {
        string[] command = ["DEL"];
        command.push(...keys);
        string result = check self.execute(command);
        return check int:fromString(result);
    }
    
    # Check if key exists
    # + key - Redis key
    # + return - True if exists
    public isolated function exists(string key) returns boolean|error {
        string result = check self.execute(["EXISTS", key]);
        int exists = check int:fromString(result);
        return exists == 1;
    }
    
    # Set expiration on key
    # + key - Redis key
    # + seconds - TTL in seconds
    # + return - True if expiration was set
    public isolated function expire(string key, int seconds) returns boolean|error {
        string result = check self.execute(["EXPIRE", key, seconds.toString()]);
        int success = check int:fromString(result);
        return success == 1;
    }
    
    # Increment counter
    # + key - Redis key
    # + return - Value after increment
    public isolated function incr(string key) returns int|error {
        string result = check self.execute(["INCR", key]);
        return check int:fromString(result);
    }
    
    # Get hash field
    # + key - Redis key
    # + field - Hash field
    # + return - Field value or nil
    public isolated function hget(string key, string 'field) returns string?|error {
        string|error result = check self.execute(["HGET", key, 'field]);
        if result is error || result == "(nil)" {
            return ();
        }
        return result;
    }
    
    # Set hash field
    # + key - Redis key
    # + field - Hash field
    # + value - Field value
    # + return - 1 if new field, 0 if updated
    public isolated function hset(string key, string 'field, string value) returns int|error {
        string result = check self.execute(["HSET", key, 'field, value]);
        return check int:fromString(result);
    }
    
    # Get all hash fields
    # + key - Redis key
    # + return - Map of field-value pairs
    public isolated function hgetall(string key) returns map<string>|error {
        string[] result = check self.executeArray(["HGETALL", key]);
        map<string> hashMap = {};
        
        int i = 0;
        while i < result.length() - 1 {
            hashMap[result[i]] = result[i + 1];
            i += 2;
        }
        
        return hashMap;
    }
    
    # Execute Redis command
    # + command - Command array
    # + return - Command result
    isolated function execute(string[] command) returns string|error {
        // Build RESP protocol message
        string message = self.buildRespMessage(command);
        
        // Send command
        byte[] messageBytes = message.toBytes();
        error? writeResult;
        lock {
            writeResult = self.tcpClient->writeBytes(messageBytes);
        }
        if writeResult is error {
            return writeResult;
        }
        
        // Read complete response
        string responseStr = check self.readCompleteResponse();
        
        return self.parseResponse(responseStr);
    }
    
    # Read complete Redis response
    # + return - Complete response string
    isolated function readCompleteResponse() returns string|error {
        // Read first part to determine response type and size
        byte[]|error readResult;
        lock {
            readResult = self.tcpClient->readBytes();
        }
        if readResult is error {
            return readResult;
        }
        byte[] initialBytes = readResult;
        string response = check string:fromBytes(initialBytes);
        
        // If it's a bulk string, we might need to read more
        if response.startsWith("$") {
            int? newlineIndex = response.indexOf("\r\n");
            if newlineIndex is int {
                string lengthStr = response.substring(1, newlineIndex);
                int length = check int:fromString(lengthStr);
                
                if length > 0 {
                    // Calculate total expected length
                    int headerLength = newlineIndex + 2; // +2 for \r\n
                    int totalExpected = headerLength + length + 2; // +2 for final \r\n
                    
                    // Read more if needed
                    while response.length() < totalExpected {
                        byte[]|error moreResult;
                        lock {
                            moreResult = self.tcpClient->readBytes();
                        }
                        if moreResult is error {
                            return moreResult;
                        }
                        byte[] moreBytes = moreResult;
                        string moreData = check string:fromBytes(moreBytes);
                        response = response + moreData;
                    }
                }
            }
        }
        
        return response;
    }
    
    # Execute command returning array
    # + command - Command array
    # + return - Array result
    isolated function executeArray(string[] command) returns string[]|error {
        string message = self.buildRespMessage(command);
        byte[] messageBytes = message.toBytes();
        error? writeResult;
        lock {
            writeResult = self.tcpClient->writeBytes(messageBytes);
        }
        if writeResult is error {
            return writeResult;
        }
        
        string responseStr = check self.readCompleteResponse();
        
        return self.parseArrayResponse(responseStr);
    }
    
    # Build RESP protocol message
    # + command - Command array
    # + return - RESP formatted message
    isolated function buildRespMessage(string[] command) returns string {
        string message = string `*${command.length()}${"\r\n"}`;
        
        foreach string part in command {
            byte[] partBytes = part.toBytes();
            message += string `$${partBytes.length()}${"\r\n"}${part}${"\r\n"}`;
        }
        
        return message;
    }
    
    # Parse simple string or error response
    # + response - Raw response
    # + return - Parsed response
    isolated function parseResponse(string response) returns string|error {
        if response.startsWith("+") {
            // Simple string
            int? endIndex = response.indexOf("\r\n");
            if endIndex is int {
                return response.substring(1, endIndex);
            }
            return response.substring(1).trim();
        } else if response.startsWith("-") {
            // Error
            int? endIndex = response.indexOf("\r\n");
            if endIndex is int {
                return error(response.substring(1, endIndex));
            }
            return error(response.substring(1).trim());
        } else if response.startsWith(":") {
            // Integer
            int? endIndex = response.indexOf("\r\n");
            if endIndex is int {
                return response.substring(1, endIndex);
            }
            return response.substring(1).trim();
        } else if response.startsWith("$") {
            // Bulk string
            int? newlineIndex = response.indexOf("\r\n");
            if newlineIndex is int {
                string lengthStr = response.substring(1, newlineIndex);
                int length = check int:fromString(lengthStr);
                if length == -1 {
                    return "(nil)";
                }
                int startIndex = newlineIndex + 2;
                int endIndex = startIndex + length;
                
                // Check if we have enough data
                if endIndex > response.length() {
                    return response.substring(startIndex).trim();
                }
                
                return response.substring(startIndex, endIndex);
            }
        }
        
        return response.trim();
    }
    
    # Parse array response
    # + response - Raw response
    # + return - Parsed array
    isolated function parseArrayResponse(string response) returns string[]|error {
        if !response.startsWith("*") {
            return error("Invalid array response");
        }
        
        string[] result = [];
        string[] lines = re `\r\n`.split(response);
        
        int i = 1; // Skip array length line
        while i < lines.length() - 1 {
            if lines[i].startsWith("$") {
                i += 1; // Skip length line
                if i < lines.length() {
                    result.push(lines[i]);
                }
            }
            i += 1;
        }
        
        return result;
    }
    
    # Check connection health
    # + return - True if connected
    public isolated function ping() returns boolean|error {
        string response = check self.execute(["PING"]);
        return response == "PONG";
    }
    
    # Close connection
    public isolated function close() returns error? {
        return self.tcpClient->close();
    }
}