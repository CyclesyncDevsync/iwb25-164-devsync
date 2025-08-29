import { NextRequest, NextResponse } from 'next/server';

const BALLERINA_AUTH_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8085';

export async function POST(request: NextRequest) {
  console.log('=== ROLE SELECTION POST ENDPOINT CALLED ===');
  console.log('Environment check:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- BALLERINA_AUTH_URL:', BALLERINA_AUTH_URL);
  
  try {
    console.log('Parsing request body...');
    const { role } = await request.json();
    console.log('Received role:', role);
    
    // Validate role selection
    if (!role || (role !== 'buyer' && role !== 'supplier')) {
      return NextResponse.json(
        { success: false, message: 'Please select either buyer or supplier role' },
        { status: 400 }
      );
    }

    // Get pending ID token from cookies
    const pendingIdToken = request.cookies.get('pending_id_token')?.value;
    
    if (!pendingIdToken) {
      return NextResponse.json(
        { success: false, message: 'Registration session expired. Please register again.' },
        { status: 401 }
      );
    }

    console.log('Completing registration with role:', role);
    console.log('Request details:');
    console.log('- URL:', `${BALLERINA_AUTH_URL}/api/auth/register`);
    console.log('- Token length:', pendingIdToken.length);
    console.log('- Request body:', JSON.stringify({ role }));

    // Complete registration with Ballerina backend
    const backendResponse = await fetch(`${BALLERINA_AUTH_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pendingIdToken}` // Send ID token in Authorization header
      },
      body: JSON.stringify({
        role: role
      }),
    });

    console.log('Backend response received:');
    console.log('- Status:', backendResponse.status);
    console.log('- Status text:', backendResponse.statusText);
    console.log('- Headers:', Object.fromEntries(backendResponse.headers.entries()));

    const backendData = await backendResponse.json();
    console.log('Backend registration response:', JSON.stringify(backendData, null, 2));

    if (!backendResponse.ok) {
      console.error('Backend registration failed:', backendData);
      
      return NextResponse.json(
        { success: false, message: backendData.message || 'Registration failed' },
        { status: backendResponse.status }
      );
    }

    // Handle both new user creation and existing user role update
    if ((backendData.code === 201 || backendData.code === 409) && backendData.user) {
      console.log(`Registration/Role update successful with code ${backendData.code}`);
      console.log('User data:', JSON.stringify(backendData.user, null, 2));
      
      // Get dashboard route for the user's role
      const dashboardRoute = getDashboardRoute(backendData.user.role);
      
      const response = NextResponse.json({
        success: true,
        message: backendData.code === 201 ? 
          'Registration completed successfully! Redirecting to your dashboard.' : 
          'Role updated successfully! Redirecting to your dashboard.',
        user: backendData.user,
        redirectUrl: dashboardRoute
      });

      // Set authentication cookies
      response.cookies.set('asgardeo_id_token', pendingIdToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600, // 1 hour
        path: '/'
      });
      
      response.cookies.set('user_data', JSON.stringify(backendData.user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600, // 1 hour
        path: '/'
      });

      // Clean up pending token
      response.cookies.delete('pending_id_token');

      return response;
    } else {
      console.error('Unexpected response format or missing user data');
      return NextResponse.json(
        { success: false, message: backendData.message || 'Registration failed. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('=== ROLE SELECTION ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('This appears to be a network/fetch error');
      console.error('Possible causes: Backend not running, wrong URL, network issues');
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to complete registration. Please try again.' },
      { status: 500 }
    );
  }
}

// Helper function for role-based dashboard routing
function getDashboardRoute(role: string): string {
  switch (role.toUpperCase()) {
    case 'SUPER_ADMIN':
      return '/admin';
    case 'ADMIN':
      return '/admin';
    case 'AGENT':
      return '/agent';
    case 'SUPPLIER':
      return '/supplier';
    case 'BUYER':
      return '/buyer';
    default:
      return '/dashboard';
  }
}