import { NextRequest, NextResponse } from 'next/server';
import { asgardeoAuth } from '@/lib/asgardeo';
import { signJWT, SessionData } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect('/?error=' + error);
    }

    if (!code || !state) {
      return NextResponse.redirect('/?error=missing_code_or_state');
    }

    // Verify state
    const storedState = request.cookies.get('auth_state')?.value;
    const codeVerifier = request.cookies.get('code_verifier')?.value;

    if (!storedState || !codeVerifier || storedState !== state) {
      return NextResponse.redirect('/?error=invalid_state');
    }

    // Exchange code for tokens
    const tokens = await asgardeoAuth.exchangeCodeForTokens(code, codeVerifier);
    
    // Get user info
    const userInfo = await asgardeoAuth.getUserInfo(tokens.access_token);

    // Create session data
    const sessionData: SessionData = {
      user: {
        id: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
        given_name: userInfo.given_name,
        family_name: userInfo.family_name
      },
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      idToken: tokens.id_token,
      expiresAt: Date.now() + (tokens.expires_in * 1000)
    };

    // Sign JWT session token
    const sessionToken = signJWT(sessionData);

    // Set session cookie and redirect
    const response = NextResponse.redirect('/dashboard');
    response.cookies.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600, // 1 hour
      path: '/'
    });

    // Clear temporary cookies
    response.cookies.delete('code_verifier');
    response.cookies.delete('auth_state');

    return response;
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect('/?error=authentication_failed');
  }
}