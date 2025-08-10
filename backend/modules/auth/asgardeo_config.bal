// Asgardeo Configuration
public type AsgardeoConfig record {|
    string tokenEndpoint;
    string userInfoEndpoint;
    string introspectionEndpoint;
    string clientId;
    string clientSecret;
    string jwksEndpoint;
    string issuer;
|};

// Configurable Asgardeo settings
configurable string ASGARDEO_TOKEN_ENDPOINT = "https://api.asgardeo.io/t/{organization}/oauth2/token";
configurable string ASGARDEO_USERINFO_ENDPOINT = "https://api.asgardeo.io/t/{organization}/oauth2/userinfo";
configurable string ASGARDEO_INTROSPECTION_ENDPOINT = "https://api.asgardeo.io/t/{organization}/oauth2/introspect";
configurable string ASGARDEO_JWKS_ENDPOINT = "https://api.asgardeo.io/t/{organization}/oauth2/jwks";
configurable string ASGARDEO_ISSUER = "https://api.asgardeo.io/t/{organization}/oauth2/token";
configurable string ASGARDEO_CLIENT_ID = "";
configurable string ASGARDEO_CLIENT_SECRET = "";

// Application Configuration
configurable int ASGARDEO_SERVER_PORT = 8080;
configurable string JWT_AUDIENCE = "account";
configurable int TOKEN_CACHE_EXPIRY = 300; // 5 minutes

public function getAsgardeoConfig() returns AsgardeoConfig {
    return {
        tokenEndpoint: ASGARDEO_TOKEN_ENDPOINT,
        userInfoEndpoint: ASGARDEO_USERINFO_ENDPOINT,
        introspectionEndpoint: ASGARDEO_INTROSPECTION_ENDPOINT,
        clientId: ASGARDEO_CLIENT_ID,
        clientSecret: ASGARDEO_CLIENT_SECRET,
        jwksEndpoint: ASGARDEO_JWKS_ENDPOINT,
        issuer: ASGARDEO_ISSUER
    };
}
