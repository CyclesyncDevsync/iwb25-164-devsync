import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { asgardeoAuth } from '@/lib/asgardeo';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const sessionData = verifyJWT(sessionToken);

    if (!sessionData) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Just test the basic userinfo endpoint with different approaches
    const results: {
      basicUserInfo: unknown;
      tokenIntrospection: unknown;
      decodedIdToken: unknown;
      error: string | null;
    } = {
      basicUserInfo: null,
      tokenIntrospection: null,
      decodedIdToken: null,
      error: null
    };

    // Test basic userinfo
    try {
      results.basicUserInfo = await asgardeoAuth.getUserInfo(sessionData.accessToken);
    } catch (error) {
      results.error = `UserInfo failed: ${error instanceof Error ? error.message : String(error)}`;
    }

    // Try token introspection
    try {
      const introspectionResponse = await fetch(`${process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL}/oauth2/introspect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_ID}:${process.env.ASGARDEO_CLIENT_SECRET}`)}`
        },
        body: new URLSearchParams({
          token: sessionData.accessToken,
          token_type_hint: 'access_token'
        }).toString()
      });

      if (introspectionResponse.ok) {
        results.tokenIntrospection = await introspectionResponse.json();
      }
    } catch (error) {
      console.log('Token introspection failed:', error);
    }

    // Try to decode ID token (if available)
    if (sessionData.idToken) {
      try {
        // Simple base64 decode of JWT payload (not verifying signature)
        const parts = sessionData.idToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          results.decodedIdToken = payload;
        }
      } catch (error) {
        console.log('ID token decode failed:', error);
      }
    }

    return NextResponse.json({
      message: 'User info test results',
      sessionUser: sessionData.user,
      ...results
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
