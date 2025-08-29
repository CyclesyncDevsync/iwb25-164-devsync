// Copyright (c) 2025 CircularSync
// Authentication Middleware

import ballerina/http;
import ballerina/log;

# Authentication middleware for protecting endpoints
public class AuthMiddleware {
    
    # Process authentication for requests
    #
    # + request - HTTP request
    # + return - Auth context or error
    public function authenticate(http:Request request) returns AuthContext|http:Unauthorized {
        // Extract Authorization header
        string|http:HeaderNotFoundError authHeader = request.getHeader("Authorization");
        
        if authHeader is http:HeaderNotFoundError {
            log:printWarn("Missing Authorization header");
            return <http:Unauthorized> {
                body: {
                    code: 401,
                    message: "Authorization header required",
                    details: "Please provide a valid ID token"
                }
            };
        }
        
        // Extract token from Bearer format
        if !authHeader.startsWith("Bearer ") {
            log:printWarn("Invalid Authorization header format");
            return <http:Unauthorized> {
                body: {
                    code: 401,
                    message: "Invalid authorization format",
                    details: "Use 'Bearer <id_token>' format"
                }
            };
        }
        
        string idToken = authHeader.substring(7); // Remove "Bearer "
        
        // Validate token
        AuthResult authResult = validateIdToken(idToken);
        
        if !authResult.isValid || authResult.context is () {
            log:printWarn(string `Authentication failed: ${authResult.errorMessage ?: "Unknown error"}`);
            return <http:Unauthorized> {
                body: {
                    code: 401,
                    message: authResult.errorMessage ?: "Authentication failed",
                    details: "Please login again"
                }
            };
        }
        
        return <AuthContext>authResult.context;
    }
    
    # Check if user has required role
    #
    # + context - Auth context
    # + requiredRole - Required role for access
    # + return - True if authorized, false otherwise
    public function hasRole(AuthContext context, UserRole requiredRole) returns boolean {
        // Super admin can access everything
        if context.role == SUPER_ADMIN {
            return true;
        }
        
        // Admin can access admin and agent areas
        if context.role == ADMIN && (requiredRole == ADMIN || requiredRole == AGENT) {
            return true;
        }
        
        // Exact role match
        return context.role == requiredRole;
    }
    
    # Check if user has permission for resource and action
    #
    # + context - Auth context
    # + resourceName - Resource being accessed
    # + action - Action being performed
    # + return - True if authorized
    public function hasPermission(AuthContext context, string resourceName, string action) returns boolean {
        return hasPermission(context.role, resourceName, action);
    }
    
    # Authorize request for specific role
    #
    # + context - Auth context
    # + requiredRole - Required role
    # + return - Success or Forbidden response
    public function authorizeRole(AuthContext context, UserRole requiredRole) returns ()|http:Forbidden {
        if !self.hasRole(context, requiredRole) {
            return <http:Forbidden> {
                body: {
                    code: 403,
                    message: "Insufficient permissions",
                    details: string `Required role: ${requiredRole}`
                }
            };
        }
        return;
    }
    
    # Authorize request for specific permission
    #
    # + context - Auth context  
    # + resourceName - Resource being accessed
    # + action - Action being performed
    # + return - Success or Forbidden response
    public function authorizePermission(AuthContext context, string resourceName, string action) returns ()|http:Forbidden {
        if !self.hasPermission(context, resourceName, action) {
            return <http:Forbidden> {
                body: {
                    code: 403,
                    message: "Insufficient permissions",
                    details: string `Required permission: ${action} on ${resourceName}`
                }
            };
        }
        return;
    }
}