import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

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

    // Debug: Log user data being returned
    console.log('Returning user data from /api/auth/me:', sessionData.user);
    console.log('Detailed profile available:', !!sessionData.detailedProfile);

    return NextResponse.json({
      user: sessionData.user,
      detailedProfile: sessionData.detailedProfile,
      hasDetailedProfile: !!sessionData.detailedProfile
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json({ error: 'Session verification failed' }, { status: 500 });
  }
}