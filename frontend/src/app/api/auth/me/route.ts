import { NextRequest, NextResponse } from 'next/server';

const BALLERINA_AUTH_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8085';

export async function GET(request: NextRequest) {
  try {
    // Get ID token from HTTP-only cookie
    const idToken = request.cookies.get('asgardeo_id_token')?.value;
    
    if (!idToken) {
      return NextResponse.json(
        { success: false, message: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Validate token with Ballerina backend
    const backendResponse = await fetch(`${BALLERINA_AUTH_URL}/api/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      }
    });

    const backendData = await backendResponse.json();
    console.log('Backend validation response:', backendData);
    
    if (!backendResponse.ok) {
      console.error('Backend validation failed:', backendData);
      
      // Clear invalid cookies
      const response = NextResponse.json(
        { success: false, message: 'Invalid authentication token' },
        { status: 401 }
      );
      response.cookies.delete('asgardeo_id_token');
      response.cookies.delete('user_data');
      
      return response;
    }

    // Check for the correct response format from Ballerina backend
    if (backendData.code === 200 && backendData.user) {
      console.log('User authenticated successfully:', backendData.user);
      
      // Update user data cookie with fresh data
      const response = NextResponse.json({
        success: true,
        message: 'User authenticated',
        user: backendData.user,
        idToken: idToken
      });
      
      response.cookies.set('user_data', JSON.stringify(backendData.user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600, // 1 hour
        path: '/'
      });
      
      return response;
    } else {
      console.error('Unexpected backend response format:', backendData);
      return NextResponse.json(
        { success: false, message: 'User not found or invalid response format' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { success: false, message: 'Session validation failed' },
      { status: 500 }
    );
  }
}