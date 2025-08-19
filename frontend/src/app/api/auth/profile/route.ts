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

    // Check if token is expired
    if (Date.now() > sessionData.expiresAt) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    // Fetch fresh user profile data
    let freshProfile = null;
    let managementProfile = null;
    try {
      freshProfile = await asgardeoAuth.getUserProfile(sessionData.user.id, sessionData.accessToken);
      console.log('Fresh profile from SCIM:', freshProfile);
    } catch (error) {
      console.error('Error fetching fresh profile:', error);
    }

    // Try management API as well
    try {
      managementProfile = await asgardeoAuth.getUserByManagementAPI(sessionData.user.id, sessionData.accessToken);
      console.log('Profile from management API:', managementProfile);
    } catch (error) {
      console.error('Error fetching from management API:', error);
    }

    // Get fresh userinfo
    let freshUserInfo = null;
    try {
      freshUserInfo = await asgardeoAuth.getUserInfo(sessionData.accessToken);
    } catch (error) {
      console.error('Error fetching fresh user info:', error);
    }

    return NextResponse.json({
      user: sessionData.user,
      storedDetailedProfile: sessionData.detailedProfile,
      freshProfile: freshProfile,
      managementProfile: managementProfile,
      freshUserInfo: freshUserInfo,
      accessToken: sessionData.accessToken.substring(0, 20) + '...', // Truncated for security
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Profile fetch failed' }, { status: 500 });
  }
}
