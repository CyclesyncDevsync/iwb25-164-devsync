import { NextRequest, NextResponse } from 'next/server';
import { asgardeoAuth } from '@/lib/asgardeo';

export async function GET(request: NextRequest) {
  try {
    // Generate PKCE and state
    const { codeVerifier, codeChallenge } = await asgardeoAuth.generateCodeChallenge();
    const state = crypto.randomUUID();

    // Store PKCE and state in session/cookies for verification
    const response = NextResponse.redirect(
      asgardeoAuth.getAuthorizationUrl(codeChallenge, state)
    );

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

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}