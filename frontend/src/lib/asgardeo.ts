interface TokenResponse {
  access_token: string;
  id_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface UserInfo {
  sub: string;
  name: string;
  email: string;
  given_name?: string;
  family_name?: string;
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
      scope: 'openid profile email',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: state
    });

    return `${this.baseUrl}/oauth2/authorize?${params.toString()}`;
  }

  // Exchange code for tokens
  async exchangeCodeForTokens(code: string, codeVerifier: string): Promise<TokenResponse> {
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
      throw new Error('Failed to exchange code for tokens');
    }

    return response.json();
  }

  // Get user info using access token
  async getUserInfo(accessToken: string): Promise<UserInfo> {
    const response = await fetch(`${this.baseUrl}/oauth2/userinfo`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
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