import { NextRequest, NextResponse } from 'next/server';

const BALLERINA_AUTH_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8085';

export async function POST(request: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  try {
    const { role } = await request.json();
    
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

    const backendData = await backendResponse.json();
    console.log('Backend registration response:', backendData);

    if (!backendResponse.ok) {
      console.error('Backend registration failed:', backendData);
      
      // Handle "User already registered" case (409) as success for login purposes
      if (backendResponse.status === 409 && backendData.user) {
        console.log('User already exists, proceeding with login');
        
        // Get dashboard route for the user's role
        const dashboardRoute = getDashboardRoute(backendData.user.role);
        
        const response = NextResponse.json({
          success: true,
          message: 'Welcome back! Redirecting to your dashboard.',
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
      }
      
      return NextResponse.json(
        { success: false, message: backendData.message || 'Registration failed' },
        { status: backendResponse.status }
      );
    }

    if (backendData.code === 201 && backendData.user) {
      // Registration successful - user is auto-approved
      console.log('Registration completed successfully');
      
      // Get dashboard route for the user's role
      const dashboardRoute = getDashboardRoute(backendData.user.role);
      
      const response = NextResponse.json({
        success: true,
        message: 'Registration completed successfully! Redirecting to your dashboard.',
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
      return NextResponse.json(
        { success: false, message: 'Registration failed. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Role selection error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to complete registration. Please try again.' },
      { status: 500 }
    );
  }
}

// Helper function for role-based dashboard routing
function getDashboardRoute(role: string): string {
  switch (role) {
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