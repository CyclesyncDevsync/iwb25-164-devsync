import { NextResponse } from 'next/server';
import { generateCodeVerifier, generateCodeChallenge, generateState } from '@/lib/pkce';

// Asgardeo Configuration
const ASGARDEO_CLIENT_ID = process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_ID!;
const ASGARDEO_BASE_URL = process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_ASGARDEO_REDIRECT_URI!;
const SCOPES = 'email openid profile';

export async function POST() {
  try {
    console.log('Initiating Asgardeo login flow...');

    // Generate PKCE parameters
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();

    // Build authorization URL for login
    const authUrl = new URL(`${ASGARDEO_BASE_URL}/oauth2/authorize`);
    authUrl.searchParams.append('client_id', ASGARDEO_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', SCOPES);
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('state', state);

    const redirectUrl = authUrl.toString();
    
    console.log('Login URL generated:', redirectUrl);

    const response = NextResponse.json({
      success: true,
      message: 'Redirecting to Asgardeo for login...',
      redirectUrl: redirectUrl
    });

    // Store PKCE and state in HTTP-only cookies for verification
    response.cookies.set('code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600, // 10 minutes
      path: '/'
    });

    response.cookies.set('auth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600, // 10 minutes
      path: '/'
    });

    // Mark this as a login flow (not registration)
    response.cookies.set('flow_type', 'login', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600, // 10 minutes
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login initiation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to initiate login. Please try again.' },
      { status: 500 }
    );
  }
}