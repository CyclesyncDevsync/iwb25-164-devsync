import { NextRequest, NextResponse } from 'next/server';
import { asgardeoAuth } from '@/lib/asgardeo';
import { signJWT, SessionData } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(`${baseUrl}/?error=${error}`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${baseUrl}/?error=missing_code_or_state`);
    }

    // Verify state
    const storedState = request.cookies.get('auth_state')?.value;
    const codeVerifier = request.cookies.get('code_verifier')?.value;

    if (!storedState || !codeVerifier || storedState !== state) {
      return NextResponse.redirect(`${baseUrl}/?error=invalid_state`);
    }

    // Exchange code for tokens
    const tokens = await asgardeoAuth.exchangeCodeForTokens(code, codeVerifier);
    
    // Get user info
    const userInfo = await asgardeoAuth.getUserInfo(tokens.access_token);
    
    // Debug: Log user info received from Asgardeo
    console.log('User info from Asgardeo:', userInfo);

    // Try to get detailed user profile from SCIM API
    let detailedProfile = null;
    if (userInfo.sub) {
      try {
        detailedProfile = await asgardeoAuth.getUserProfile(userInfo.sub, tokens.access_token);
        console.log('Detailed user profile:', detailedProfile);
      } catch (error) {
        console.error('Failed to fetch detailed user profile:', error);
      }

      // If SCIM failed, try management API
      if (!detailedProfile) {
        try {
          console.log('Trying management API as fallback...');
          detailedProfile = await asgardeoAuth.getUserByManagementAPI(userInfo.sub, tokens.access_token);
          console.log('User profile from management API:', detailedProfile);
        } catch (error) {
          console.error('Management API also failed:', error);
        }
      }
    }

    // Extract user data with preference for detailed profile
    const extractedUserData = {
      id: userInfo.sub,
      name: '',
      email: '',
      given_name: '',
      family_name: ''
    };

    // Use detailed profile data if available
    if (detailedProfile) {
      extractedUserData.name = detailedProfile.displayName || 
                               detailedProfile.name?.formatted || 
                               `${detailedProfile.name?.givenName || ''} ${detailedProfile.name?.familyName || ''}`.trim();
      extractedUserData.given_name = detailedProfile.name?.givenName || '';
      extractedUserData.family_name = detailedProfile.name?.familyName || '';
      extractedUserData.email = detailedProfile.emails?.[0]?.value || '';
    }

    // Fallback to userInfo if detailed profile is not available or incomplete
    if (!extractedUserData.name) {
      extractedUserData.name = userInfo.name || 
                               userInfo.preferred_username || 
                               `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim() || 
                               userInfo.email?.split('@')[0] || 
                               'Unknown User';
    }
    if (!extractedUserData.email) {
      extractedUserData.email = userInfo.email || '';
    }
    if (!extractedUserData.given_name) {
      extractedUserData.given_name = userInfo.given_name || '';
    }
    if (!extractedUserData.family_name) {
      extractedUserData.family_name = userInfo.family_name || '';
    }

    // Create session data
    const sessionData: SessionData = {
      user: extractedUserData,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      idToken: tokens.id_token,
      expiresAt: Date.now() + (tokens.expires_in * 1000),
      detailedProfile: detailedProfile // Store the full profile for reference
    };
    
    // Debug: Log session data being stored
    console.log('Session data being stored:', sessionData);

    // Sign JWT session token
    const sessionToken = signJWT(sessionData);

    // Set session cookie and redirect
    const response = NextResponse.redirect(`${baseUrl}/dashboard`);
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
    return NextResponse.redirect(`${baseUrl}/?error=authentication_failed`);
  }
}