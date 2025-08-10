import ballerina/test;
import hp/Cyclesync.auth;

// Test Authentication Service
@test:Config {}
function testAuthServiceInit() {
    auth:AsgardeoAuthService authService = new("test-client", "test-secret", "test-domain");
    test:assertTrue(authService is auth:AsgardeoAuthService, "Auth service should be initialized");
}

@test:Config {}
function testValidTokenValidation() {
    auth:AsgardeoAuthService authService = new("test-client", "test-secret", "test-domain");
    string validToken = "valid-token-with-sufficient-length";
    
    auth:AuthResult result = authService.validateToken(validToken);
    test:assertTrue(result.isValid, "Valid token should pass validation");
    test:assertTrue(result.context is auth:AuthContext, "Valid token should have auth context");
}

@test:Config {}
function testInvalidTokenValidation() {
    auth:AsgardeoAuthService authService = new("test-client", "test-secret", "test-domain");
    string invalidToken = "short";
    
    auth:AuthResult result = authService.validateToken(invalidToken);
    test:assertFalse(result.isValid, "Invalid token should fail validation");
    test:assertTrue(result.context is (), "Invalid token should not have auth context");
    test:assertTrue(result.errorMessage is string, "Invalid token should have error message");
}

@test:Config {}
function testRoleValidation() {
    auth:AsgardeoAuthService authService = new("test-client", "test-secret", "test-domain");
    
    auth:AuthContext context = {
        userId: "test-user",
        username: "testuser",
        email: "test@example.com",
        roles: ["user", "admin"],
        groups: [],
        token: "test-token",
        exp: 1723300000
    };
    
    boolean hasUserRole = authService.hasRole(context, "user");
    boolean hasAdminRole = authService.hasRole(context, "admin");
    boolean hasInvalidRole = authService.hasRole(context, "invalid");
    
    test:assertTrue(hasUserRole, "Should have user role");
    test:assertTrue(hasAdminRole, "Should have admin role");
    test:assertFalse(hasInvalidRole, "Should not have invalid role");
}

@test:Config {}
function testIsAdmin() {
    auth:AsgardeoAuthService authService = new("test-client", "test-secret", "test-domain");
    
    auth:AuthContext adminContext = {
        userId: "admin-user",
        username: "admin",
        email: "admin@example.com",
        roles: ["admin", "user"],
        groups: [],
        token: "admin-token",
        exp: 1723300000
    };
    
    auth:AuthContext userContext = {
        userId: "regular-user",
        username: "user",
        email: "user@example.com",
        roles: ["user"],
        groups: [],
        token: "user-token",
        exp: 1723300000
    };
    
    boolean adminIsAdmin = authService.isAdmin(adminContext);
    boolean userIsAdmin = authService.isAdmin(userContext);
    
    test:assertTrue(adminIsAdmin, "Admin user should be identified as admin");
    test:assertFalse(userIsAdmin, "Regular user should not be identified as admin");
}

// Test Authentication Middleware
@test:Config {}
function testAuthMiddlewareInit() {
    auth:AuthMiddleware middleware = new();
    test:assertTrue(middleware is auth:AuthMiddleware, "Auth middleware should be initialized");
}
