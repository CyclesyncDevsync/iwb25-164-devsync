import ballerina/http;

// Authentication Middleware
public class AuthMiddleware {
    private final AsgardeoAuthService authService;

    public function init() {
        self.authService = new AsgardeoAuthService("your-client-id", "your-client-secret", "your-domain");
    }

    // Generic authentication middleware
    public function authenticate(http:Request request) returns AuthResult {
        string|error authHeader = request.getHeader("Authorization");
        
        if (authHeader is error) {
            return {
                isValid: false,
                context: (),
                errorMessage: "Missing Authorization header"
            };
        }

        if (!authHeader.startsWith("Bearer ")) {
            return {
                isValid: false,
                context: (),
                errorMessage: "Invalid Authorization header format"
            };
        }

        string token = authHeader.substring(7); // Remove "Bearer " prefix
        
        if (token.trim() == "") {
            return {
                isValid: false,
                context: (),
                errorMessage: "Empty token"
            };
        }

        return self.authService.validateToken(token);
    }

    // Role-based authentication middleware
    public function authenticateWithRole(http:Request request, string requiredRole) 
            returns AuthResult {
        AuthResult authResult = self.authenticate(request);
        
        if (!authResult.isValid) {
            return authResult;
        }

        AuthContext? authContext = authResult.context;
        if (authContext == ()) {
            return {
                isValid: false,
                context: (),
                errorMessage: "Invalid authentication context"
            };
        }

        if (!self.authService.hasRole(authContext, requiredRole)) {
            return {
                isValid: false,
                context: authContext,
                errorMessage: "Insufficient permissions. Required role: " + requiredRole
            };
        }

        return authResult;
    }

    // Admin-only authentication middleware
    public function authenticateAdmin(http:Request request) returns AuthResult {
        AuthResult authResult = self.authenticate(request);
        
        if (!authResult.isValid) {
            return authResult;
        }

        AuthContext? authContext = authResult.context;
        if (authContext == ()) {
            return {
                isValid: false,
                context: (),
                errorMessage: "Invalid authentication context"
            };
        }

        if (!self.authService.isAdmin(authContext)) {
            return {
                isValid: false,
                context: authContext,
                errorMessage: "Admin access required"
            };
        }

        return authResult;
    }

    // User authentication middleware (any authenticated user)
    public function authenticateUser(http:Request request) returns AuthResult {
        return self.authenticate(request);
    }
}

// Utility functions for extracting auth context from request headers
public function getAuthContextFromRequest(http:Request request) returns AuthContext|error {
    string userId = check request.getHeader("X-User-ID");
    string username = check request.getHeader("X-Username");
    string email = check request.getHeader("X-User-Email");
    string rolesHeader = check request.getHeader("X-User-Roles");
    string[] roles = rolesHeader != "" ? [rolesHeader] : [];

    return {
        userId: userId,
        username: username,
        email: email,
        roles: roles,
        groups: [],
        token: "",
        exp: 0
    };
}

// Middleware function to validate authentication
public function validateAuth(http:Request request, string? requiredRole = ()) returns AuthResult|http:Response {
    // Create auth middleware instance  
    AuthMiddleware authMiddleware = new ();
    
    AuthResult authResult;
    if (requiredRole != ()) {
        authResult = authMiddleware.authenticateWithRole(request, requiredRole);
    } else {
        authResult = authMiddleware.authenticate(request);
    }
    
    if (!authResult.isValid) {
        http:Response response = new;
        response.statusCode = 401;
        response.setJsonPayload({
            "error": "Unauthorized",
            "message": authResult.errorMessage ?: "Authentication failed"
        });
        return response;
    }
    
    return authResult;
}
