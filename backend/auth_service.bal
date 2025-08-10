import ballerina/cache;
import ballerina/time;
import ballerina/http;

// Token cache for storing validated tokens
cache:Cache tokenCache = new(capacity = 1000, evictionFactor = 0.25, defaultMaxAge = 3600);

public class AsgardeoAuthService {
    
    private string clientId;
    private string clientSecret;
    private string domain;
    private http:Client? asgardeoClient;

    public function init(string clientId, string clientSecret, string domain) {
        self.clientId = clientId;
        self.clientSecret = clientSecret;
        self.domain = domain;
        
        // Initialize HTTP client for Asgardeo API calls
        self.asgardeoClient = checkpanic new("https://api.asgardeo.io", {
            timeout: 30
        });
    }

    public function validateToken(string token) returns AuthResult {
        // Check cache first
        any|cache:Error cachedResult = tokenCache.get(token);
        if (cachedResult is AuthContext) {
            // Check if cached token is still valid
            if (time:utcNow()[0] < cachedResult.exp) {
                return {
                    isValid: true,
                    context: cachedResult,
                    errorMessage: ()
                };
            } else {
                // Remove expired token from cache
                cache:Error? invalidateResult = tokenCache.invalidate(token);
                if (invalidateResult is cache:Error) {
                    // Log error if needed
                }
            }
        }

        // Simple token validation (for demo purposes)
        // In production, you would validate with Asgardeo JWKS endpoint
        if (token.length() < 10) {
            return {
                isValid: false,
                context: (),
                errorMessage: "Invalid token format"
            };
        }

        // Create a demo user context
        AuthContext authContext = {
            userId: "demo-user-" + token.substring(0, 8),
            username: "demo_user",
            email: "demo@example.com",
            roles: ["user"],
            groups: [],
            token: token,
            exp: time:utcNow()[0] + 3600 // 1 hour from now
        };

        // Cache the validated token
        cache:Error? putResult = tokenCache.put(token, authContext);
        if (putResult is cache:Error) {
            // Log error if needed
        }

        return {
            isValid: true,
            context: authContext,
            errorMessage: ()
        };
    }

    public function invalidateToken(string token) {
        cache:Error? invalidateResult = tokenCache.invalidate(token);
        if (invalidateResult is cache:Error) {
            // Log error if needed
        }
        // Token removed from cache
    }

    public function hasRole(AuthContext context, string role) returns boolean {
        return context.roles.indexOf(role) != ();
    }

    public function isAdmin(AuthContext context) returns boolean {
        return self.hasRole(context, "admin");
    }
}
