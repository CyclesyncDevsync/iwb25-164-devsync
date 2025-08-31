// Copyright (c) 2025 CircularSync
// Chatbot Module - In-Memory Cache (Redis replacement)

import ballerina/log;
import ballerina/time;

# In-memory cache implementation as Redis replacement
public class RedisConnector {
    private final map<string> cache = {};
    private final map<time:Utc> expiryTimes = {};
    private final string host;
    private final int port;
    private final string? password;
    private final int database;
    
    # Initialize cache connector
    # + host - Host (unused, kept for compatibility)
    # + port - Port (unused, kept for compatibility)  
    # + password - Password (unused, kept for compatibility)
    # + database - Database number (unused, kept for compatibility)
    public function init(string host = "localhost", int port = 6379, string? password = (), int database = 1) returns error? {
        self.host = host;
        self.port = port;
        self.password = password;
        self.database = database;
        
        log:printInfo(string `In-memory cache initialized (Redis-compatible interface)`);
    }
    
    # Set a key-value pair with optional TTL
    # + key - Cache key
    # + value - Value to store
    # + ttl - Time to live in seconds (optional)
    # + return - OK if successful
    public function set(string key, string value, int? ttl = ()) returns string|error {
        self.cache[key] = value;
        
        if ttl is int {
            time:Utc expiryTime = time:utcAddSeconds(time:utcNow(), <time:Seconds>ttl);
            self.expiryTimes[key] = expiryTime;
        }
        
        return "OK";
    }
    
    # Get value by key
    # + key - Cache key
    # + return - Value or nil if not found
    public function get(string key) returns string?|error {
        // Check if key exists and hasn't expired
        if self.cache.hasKey(key) {
            if self.expiryTimes.hasKey(key) {
                time:Utc expiryTime = self.expiryTimes.get(key);
                if time:utcDiffSeconds(expiryTime, time:utcNow()) < <time:Seconds>0 {
                    // Key has expired
                    _ = self.cache.remove(key);
                    _ = self.expiryTimes.remove(key);
                    return ();
                }
            }
            return self.cache.get(key);
        }
        return ();
    }
    
    # Delete key(s)
    # + keys - Key(s) to delete
    # + return - Number of keys deleted
    public function del(string... keys) returns int|error {
        int count = 0;
        foreach string key in keys {
            if self.cache.hasKey(key) {
                _ = self.cache.remove(key);
                _ = self.expiryTimes.remove(key);
                count += 1;
            }
        }
        return count;
    }
    
    # Check if key exists
    # + key - Cache key
    # + return - True if exists
    public function exists(string key) returns boolean|error {
        if self.cache.hasKey(key) {
            // Check if expired
            if self.expiryTimes.hasKey(key) {
                time:Utc expiryTime = self.expiryTimes.get(key);
                if time:utcDiffSeconds(expiryTime, time:utcNow()) < <time:Seconds>0 {
                    // Key has expired
                    _ = self.cache.remove(key);
                    _ = self.expiryTimes.remove(key);
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    
    # Set expiration on key
    # + key - Cache key
    # + seconds - TTL in seconds
    # + return - True if expiration was set
    public function expire(string key, int seconds) returns boolean|error {
        if self.cache.hasKey(key) {
            time:Utc expiryTime = time:utcAddSeconds(time:utcNow(), <time:Seconds>seconds);
            self.expiryTimes[key] = expiryTime;
            return true;
        }
        return false;
    }
    
    # Increment counter
    # + key - Cache key
    # + return - Value after increment
    public function incr(string key) returns int|error {
        string? currentValue = check self.get(key);
        int value = 0;
        if currentValue is string {
            value = check int:fromString(currentValue);
        }
        value += 1;
        _ = check self.set(key, value.toString());
        return value;
    }
    
    # Get hash field
    # + key - Cache key
    # + field - Hash field
    # + return - Field value or nil
    public function hget(string key, string 'field) returns string?|error {
        string hashKey = string `${key}:${'field}`;
        return self.get(hashKey);
    }
    
    # Set hash field
    # + key - Cache key
    # + field - Hash field
    # + value - Field value
    # + return - 1 if new field, 0 if updated
    public function hset(string key, string 'field, string value) returns int|error {
        string hashKey = string `${key}:${'field}`;
        boolean isNew = !check self.exists(hashKey);
        _ = check self.set(hashKey, value);
        return isNew ? 1 : 0;
    }
    
    # Get all hash fields
    # + key - Cache key
    # + return - Map of field-value pairs
    public function hgetall(string key) returns map<string>|error {
        // This is a simplified implementation
        // In a real Redis, this would return all fields of a hash
        map<string> result = {};
        
        // Look for keys with the pattern key:*
        foreach var [k, v] in self.cache.entries() {
            if k.startsWith(key + ":") {
                string fieldName = k.substring(key.length() + 1);
                result[fieldName] = v;
            }
        }
        
        return result;
    }
    
    # Check connection health
    # + return - True if connected
    public function ping() returns boolean|error {
        return true;
    }
    
    # Close connection
    public function close() returns error? {
        self.cache.removeAll();
        self.expiryTimes.removeAll();
        return;
    }
}