import { NextRequest, NextResponse } from 'next/server';
import { asgardeoAuth } from '@/lib/asgardeo';
import { verifyJWT } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session-token')?.value;
    let idToken: string | undefined;

    if (sessionToken) {
      const sessionData = verifyJWT(sessionToken);
      idToken = sessionData?.idToken;
    }

    const response = NextResponse.redirect(asgardeoAuth.getLogoutUrl(idToken));
    
    // Clear session cookie
    response.cookies.delete('session-token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.redirect('/');
  }
}