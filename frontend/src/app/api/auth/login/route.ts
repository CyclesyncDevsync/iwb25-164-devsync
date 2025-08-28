import { NextResponse } from 'next/server';
import { asgardeoAuth } from '@/lib/asgardeo';

export async function POST() {
  try {
    console.log('Initiating Asgardeo login flow...');

    // Generate PKCE and state
    const { codeVerifier, codeChallenge } = await asgardeoAuth.generateCodeChallenge();
    const state = crypto.randomUUID();

    // Get authorization URL
    const redirectUrl = asgardeoAuth.getAuthorizationUrl(codeChallenge, state);
    
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