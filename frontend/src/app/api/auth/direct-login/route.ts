import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    // Get the redirect path from query params
    const searchParams = request.nextUrl.searchParams;
    const redirectPath = searchParams.get('redirect') || '/';
    
    // Generate PKCE parameters
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    const state = crypto.randomBytes(16).toString('base64url');
    
    // Store PKCE parameters in cookies
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    
    response.cookies.set('pkce_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600, // 10 minutes
      path: '/'
    });
    
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600, // 10 minutes
      path: '/'
    });
    
    // Store the original redirect path
    response.cookies.set('auth_redirect', redirectPath, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600, // 10 minutes
      path: '/'
    });
    
    // Build Asgardeo authorization URL
    const authorizationUrl = new URL('https://api.asgardeo.io/t/org3hyzl/oauth2/authorize');
    authorizationUrl.searchParams.set('response_type', 'code');
    authorizationUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_ID || '1BHltIqFq3i3x46ee8yFW37MVawa');
    authorizationUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/callback`);
    authorizationUrl.searchParams.set('scope', 'openid profile email');
    authorizationUrl.searchParams.set('state', state);
    authorizationUrl.searchParams.set('code_challenge', codeChallenge);
    authorizationUrl.searchParams.set('code_challenge_method', 'S256');
    
    // Redirect directly to Asgardeo
    return NextResponse.redirect(authorizationUrl.toString());
  } catch (error) {
    console.error('Failed to initiate direct login:', error);
    return NextResponse.redirect(new URL('/auth/login?error=auth_failed', request.url));
  }
}