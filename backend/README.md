# Cyclesync - Ballerina API with Asgardeo Authentication

A well-structured Ballerina REST API with Asgardeo OAuth2 authentication, featuring role-based access control for users and administrators.

## Project Structure

```
├── main.bal                 # Main service entry point
├── types.bal               # Type definitions
├── config.bal              # Configuration management
├── auth_service.bal        # Asgardeo authentication service
├── auth_middleware.bal     # Authentication middleware
├── user_controller.bal     # User-specific endpoints (deprecated in favor of main.bal)
├── admin_controller.bal    # Admin-specific endpoints (deprecated in favor of main.bal)
├── Config.toml.template    # Configuration template
└── README.md              # This file
```

## Features

- **Asgardeo OAuth2 Integration**: Complete JWT token validation with Asgardeo
- **Role-Based Access Control**: Separate endpoints for users and administrators
- **Token Caching**: Performance optimization with configurable cache expiry
- **Middleware Architecture**: Clean separation of authentication logic
- **RESTful API Design**: Standard HTTP methods and status codes
- **Error Handling**: Comprehensive error responses
- **Health Check**: System health monitoring endpoint

## Authentication Flows

### User Endpoints (`/api/user`)
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update user profile  
- `GET /api/user/permissions` - Get user roles and permissions
- `POST /api/user/logout` - User logout
- `GET /api/user/dashboard` - User dashboard data

### Admin Endpoints (`/api/admin`)
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/users/{userId}` - Get specific user (admin only)
- `POST /api/admin/users` - Create new user (admin only)
- `GET /api/admin/stats` - Get system statistics (admin only)

### Public Endpoints
- `GET /health` - System health check (no authentication required)

## Setup Instructions

### 1. Asgardeo Configuration

1. **Create an Asgardeo Application:**
   - Go to [Asgardeo Console](https://console.asgardeo.io/)
   - Create a new application
   - Configure it as a Single Page Application (SPA) or Traditional Web Application
   - Note down the Client ID and Client Secret

2. **Configure Application Settings:**
   - Set appropriate callback URLs
   - Configure allowed origins
   - Set up roles: Create "admin" and "user" roles
   - Assign users to appropriate roles

### 2. Project Configuration

1. **Create Configuration File:**
   ```bash
   cp Config.toml.template Config.toml
   ```

2. **Update Config.toml:**
   ```toml
   # Replace {organization} with your Asgardeo organization name
   ASGARDEO_TOKEN_ENDPOINT = "https://api.asgardeo.io/t/yourorg/oauth2/token"
   ASGARDEO_USERINFO_ENDPOINT = "https://api.asgardeo.io/t/yourorg/oauth2/userinfo"
   ASGARDEO_INTROSPECTION_ENDPOINT = "https://api.asgardeo.io/t/yourorg/oauth2/introspect"
   ASGARDEO_JWKS_ENDPOINT = "https://api.asgardeo.io/t/yourorg/oauth2/jwks"
   ASGARDEO_ISSUER = "https://api.asgardeo.io/t/yourorg/oauth2/token"
   
   # Replace with your actual credentials
   ASGARDEO_CLIENT_ID = "your-actual-client-id"
   ASGARDEO_CLIENT_SECRET = "your-actual-client-secret"
   ```

### 3. Run the Application

```bash
# Build the project
bal build

# Run the project  
bal run

# Or run directly
bal run main.bal
```

The API will be available at `http://localhost:8080`

## Usage Examples

### 1. Health Check
```bash
curl http://localhost:8080/health
```

### 2. User Profile (Requires Authentication)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8080/api/user/profile
```

### 3. Admin Operations (Requires Admin Role)
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
     http://localhost:8080/api/admin/users
```

### 4. Update User Profile
```bash
curl -X PUT \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"firstName": "John", "lastName": "Doe"}' \
     http://localhost:8080/api/user/profile
```

## Authentication Process

1. **Client Authentication**: Client obtains JWT token from Asgardeo
2. **Token Validation**: API validates JWT token with Asgardeo
3. **Role Extraction**: Extract user roles from JWT payload
4. **Authorization**: Check if user has required permissions
5. **Caching**: Cache validated tokens for performance

## JWT Token Structure

Expected JWT payload should contain:
```json
{
  "sub": "user-id",
  "preferred_username": "username",
  "email": "user@example.com",
  "realm_access": {
    "roles": ["user", "admin"]
  },
  "groups": ["group1", "group2"],
  "exp": 1234567890,
  "iat": 1234567800
}
```

## Error Responses

Standard error response format:
```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `500` - Internal Server Error

## Development

### Adding New Endpoints

1. **User Endpoints**: Add to `/api/user` service in `main.bal`
2. **Admin Endpoints**: Add to `/api/admin` service in `main.bal`
3. **Public Endpoints**: Add to root service in `main.bal`

### Authentication Middleware

Use the `validateAuth()` function for protected endpoints:
```ballerina
resource function get protected(http:Request request) returns json|http:Response {
    AuthResult|http:Response authCheck = validateAuth(request);
    if (authCheck is http:Response) {
        return authCheck;
    }
    
    // Your endpoint logic here
    return {"message": "Success"};
}
```

For role-based protection:
```ballerina
resource function get adminOnly(http:Request request) returns json|http:Response {
    AuthResult|http:Response authCheck = validateAuth(request, "admin");
    if (authCheck is http:Response) {
        return authCheck;
    }
    
    // Admin-only logic here
    return {"message": "Admin success"};
}
```

## Security Considerations

1. **Token Validation**: All tokens are validated against Asgardeo
2. **Role-Based Access**: Admin endpoints require "admin" role
3. **Token Caching**: Tokens are cached for performance but expire automatically
4. **HTTPS**: Use HTTPS in production
5. **Token Expiry**: Respect JWT token expiry times

## Testing

Test the authentication flow:

1. **Get Token from Asgardeo**: Use OAuth2 authorization code flow
2. **Test User Endpoints**: Use user token
3. **Test Admin Endpoints**: Use admin token
4. **Test Token Validation**: Try with invalid/expired tokens

## Troubleshooting

### Common Issues

1. **Token Validation Fails**:
   - Check Asgardeo configuration
   - Verify JWKS endpoint is accessible
   - Ensure token is not expired

2. **Authorization Fails**:
   - Check user roles in Asgardeo
   - Verify role mapping in JWT payload

3. **Configuration Errors**:
   - Verify Config.toml values
   - Check network connectivity to Asgardeo

### Logging

The application logs authentication events. Check logs for:
- JWT validation failures
- Token introspection errors
- User info retrieval issues

## Dependencies

- `ballerina/http` - HTTP client/server
- `ballerina/jwt` - JWT token handling
- `ballerina/cache` - Token caching
- `ballerina/log` - Logging
- `ballerina/time` - Time utilities

## License

This project is open source and available under the MIT License.
