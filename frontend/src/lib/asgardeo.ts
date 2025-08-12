interface TokenResponse {
  access_token: string;
  id_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface UserProfile {
  id?: string;
  userName?: string;
  name?: {
    givenName?: string;
    familyName?: string;
    formatted?: string;
  };
  displayName?: string;
  emails?: Array<{
    value: string;
    primary?: boolean;
  }>;
  profileUrl?: string;
  photos?: Array<{
    value: string;
  }>;
  userType?: string;
  title?: string;
  preferredLanguage?: string;
  locale?: string;
  timezone?: string;
  active?: boolean;
  groups?: Array<{
    value: string;
    display?: string;
  }>;
}

interface UserInfo {
  sub: string;
  name?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  nickname?: string;
  picture?: string;
  website?: string;
  email_verified?: boolean;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  updated_at?: number;
}

class AsgardeoAuth {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_ID!;
    this.clientSecret = process.env.ASGARDEO_CLIENT_SECRET!;
    this.baseUrl = process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL!;
    this.redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback`;
  }

  // Generate PKCE challenge
  async generateCodeChallenge(): Promise<{ codeVerifier: string; codeChallenge: string }> {
    const codeVerifier = this.generateRandomString(128);
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
    const hashArray = new Uint8Array(hashBuffer);
    const codeChallenge = btoa(String.fromCharCode(...hashArray))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    return { codeVerifier, codeChallenge };
  }

  private generateRandomString(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let text = '';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  // Get authorization URL
  getAuthorizationUrl(codeChallenge: string, state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'email openid profile',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: state
    });

    return `${this.baseUrl}/oauth2/authorize?${params.toString()}`;
  }

  // Exchange code for tokens
  async exchangeCodeForTokens(code: string, codeVerifier: string): Promise<TokenResponse> {
    console.log('Exchanging code for tokens...');
    const response = await fetch(`${this.baseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
        code_verifier: codeVerifier
      }).toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange failed:', response.status, errorText);
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await response.json();
    console.log('Tokens received:', {
      ...tokens,
      access_token: tokens.access_token ? tokens.access_token.substring(0, 50) + '...' : 'none',
      refresh_token: tokens.refresh_token ? 'received' : 'none',
      id_token: tokens.id_token ? 'received' : 'none'
    });
    
    return tokens;
  }

  // Get user info using access token
  async getUserInfo(accessToken: string): Promise<UserInfo> {
    console.log('Requesting user info from Asgardeo...');
    
    // Try with different accept headers to get more comprehensive data
    const acceptHeaders = [
      'application/json',
      'application/scim+json',
      '*/*'
    ];

    for (const acceptHeader of acceptHeaders) {
      try {
        const response = await fetch(`${this.baseUrl}/oauth2/userinfo`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': acceptHeader
          }
        });

        if (response.ok) {
          const userInfo = await response.json();
          console.log(`User info from Asgardeo (${acceptHeader}):`, userInfo);
          return userInfo;
        } else {
          console.log(`Failed with ${acceptHeader}, status:`, response.status);
          const errorText = await response.text();
          console.log('Error response:', errorText);
        }
      } catch (error) {
        console.log(`Error with ${acceptHeader}:`, error);
      }
    }

    throw new Error('Failed to get user info from all attempted methods');
  }

  // Get detailed user profile from SCIM API using user ID
  async getUserProfile(userId: string, accessToken: string): Promise<UserProfile | null> {
    console.log('Requesting detailed user profile from Asgardeo SCIM API...');
    console.log('User ID:', userId);
    console.log('Access token (first 20 chars):', accessToken.substring(0, 20) + '...');
    
    // Try multiple endpoints to get user data
    const endpoints = [
      `/scim2/Users/${userId}`,
      `/scim2/Users?filter=id eq "${userId}"`,
      `/api/users/v1/me`,
      `/api/users/v1/${userId}`,
      `/scim/Users/${userId}`,
      `/scim/Users?filter=id eq "${userId}"`
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${this.baseUrl}${endpoint}`);
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/scim+json',
            'Content-Type': 'application/scim+json'
          }
        });

        console.log(`Response status for ${endpoint}:`, response.status);
        
        if (response.ok) {
          const userProfile = await response.json();
          console.log(`Success! User profile from ${endpoint}:`, userProfile);
          
          // Handle different response formats
          if (userProfile.Resources && userProfile.Resources.length > 0) {
            return userProfile.Resources[0]; // SCIM search result
          } else if (userProfile.id || userProfile.userName) {
            return userProfile; // Direct user object
          }
        } else {
          const errorText = await response.text();
          console.log(`Error response for ${endpoint}:`, errorText);
        }
      } catch (error) {
        console.log(`Error with endpoint ${endpoint}:`, error);
      }
    }

    // If all SCIM endpoints fail, try to decode the ID token for user info
    try {
      console.log('SCIM endpoints failed, trying to extract user info from tokens...');
      return await this.extractUserFromTokens(accessToken);
    } catch (error) {
      console.log('Token extraction also failed:', error);
    }

    console.log('Could not fetch detailed user profile from any source');
    return null;
  }

  // Try to get user data using management API (if available)
  async getUserByManagementAPI(userId: string, accessToken: string): Promise<UserProfile | null> {
    console.log('Trying management API for user data...');
    
    const managementEndpoints = [
      `/api/server/v1/users/${userId}`,
      `/api/server/v1/users?filter=id+eq+${userId}`,
      `/api/identity/user/v1.0/users/${userId}`,
      `/management/users/${userId}`,
      `/identity/users/${userId}`,
      `/users/${userId}`
    ];

    for (const endpoint of managementEndpoints) {
      try {
        console.log(`Trying management endpoint: ${this.baseUrl}${endpoint}`);
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          console.log(`Success! User data from management API ${endpoint}:`, userData);
          return userData;
        } else {
          console.log(`Management API ${endpoint} returned status:`, response.status);
        }
      } catch (error) {
        console.log(`Error with management endpoint ${endpoint}:`, error);
      }
    }
    
    return null;
  }

  // Extract user info from tokens as fallback
  private async extractUserFromTokens(accessToken: string): Promise<UserProfile | null> {
    try {
      // Try to get user info from the userinfo endpoint with different accept headers
      const userInfoResponse = await fetch(`${this.baseUrl}/oauth2/userinfo`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json();
        console.log('Extended user info from userinfo endpoint:', userInfo);
        
        // Convert to UserProfile format
        return {
          id: userInfo.sub,
          userName: userInfo.preferred_username || userInfo.email,
          name: {
            givenName: userInfo.given_name,
            familyName: userInfo.family_name,
            formatted: userInfo.name
          },
          displayName: userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim(),
          emails: userInfo.email ? [{ value: userInfo.email, primary: true }] : [],
          active: true
        };
      }
    } catch (error) {
      console.log('Failed to extract user info from tokens:', error);
    }
    
    return null;
  }

  // Refresh tokens
  async refreshTokens(refreshToken: string): Promise<TokenResponse> {
    const response = await fetch(`${this.baseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }).toString()
    });

    if (!response.ok) {
      throw new Error('Failed to refresh tokens');
    }

    return response.json();
  }

  // Logout URL
  getLogoutUrl(idToken?: string): string {
    const params = new URLSearchParams({
      post_logout_redirect_uri: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      ...(idToken && { id_token_hint: idToken })
    });

    return `${this.baseUrl}/oidc/logout?${params.toString()}`;
  }
}

export const asgardeoAuth = new AsgardeoAuth();