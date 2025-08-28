import { NextRequest, NextResponse } from 'next/server';

// Asgardeo Configuration
const ASGARDEO_CLIENT_ID = process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_ID!;
const ASGARDEO_CLIENT_SECRET = process.env.ASGARDEO_CLIENT_SECRET!;
const ASGARDEO_BASE_URL = process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_ASGARDEO_REDIRECT_URI!;
const BALLERINA_AUTH_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8085';

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('Callback received:', { code: !!code, state, error });

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(`${baseUrl}/auth/login?error=${error}`);
    }

    if (!code || !state) {
      console.error('Missing code or state');
      return NextResponse.redirect(`${baseUrl}/auth/login?error=missing_code_or_state`);
    }

    // Verify state and get PKCE verifier
    const storedState = request.cookies.get('auth_state')?.value;
    const codeVerifier = request.cookies.get('code_verifier')?.value;

    if (!storedState || !codeVerifier || storedState !== state) {
      console.error('Invalid state or missing code verifier');
      return NextResponse.redirect(`${baseUrl}/auth/login?error=invalid_state`);
    }

    console.log('State verified, exchanging code for tokens...');

    // Exchange authorization code for tokens
    const tokenResponse = await fetch(`${ASGARDEO_BASE_URL}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${ASGARDEO_CLIENT_ID}:${ASGARDEO_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed with status:', tokenResponse.status);
      console.error('Token exchange error details:', errorText);
      return NextResponse.redirect(`${baseUrl}/auth/login?error=token_exchange_failed`);
    }

    const tokens = await tokenResponse.json();
    console.log('Tokens received successfully');
    console.log('Token response includes id_token:', !!tokens.id_token);

    // Validate with Ballerina backend and get/create user
    const backendResponse = await fetch(`${BALLERINA_AUTH_URL}/api/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.id_token}`
      }
    });

    const backendData = await backendResponse.json();
    console.log('Backend validation response:', backendData);
    
    if (!backendResponse.ok) {
      console.error('Backend validation failed with status:', backendResponse.status);
      console.error('Backend error details:', backendData);
      return NextResponse.redirect(`${baseUrl}/auth/login?error=validation_failed&message=${encodeURIComponent(backendData.message || 'Validation failed')}`);
    }

    if (backendData.success && backendData.user) {
      // User exists and is auto-approved - redirect to dashboard
      console.log('User found, redirecting to dashboard');
      
      const dashboardRoute = getDashboardRoute(backendData.user.role);
      const response = NextResponse.redirect(`${baseUrl}${dashboardRoute}`);
      
      // Set authentication cookies
      response.cookies.set('asgardeo_id_token', tokens.id_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: tokens.expires_in || 3600,
        path: '/'
      });
      
      response.cookies.set('user_data', JSON.stringify(backendData.user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: tokens.expires_in || 3600,
        path: '/'
      });

      // Clean up temporary cookies
      response.cookies.delete('code_verifier');
      response.cookies.delete('auth_state');
      response.cookies.delete('flow_type');

      return response;
    } else {
      // New user from registration flow - needs role selection
      console.log('New user detected, redirecting to role selection');
      
      const response = NextResponse.redirect(`${baseUrl}/auth/role-selection`);
      
      // Store ID token temporarily for role selection
      response.cookies.set('pending_id_token', tokens.id_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 600, // 10 minutes
        path: '/'
      });

      // Clean up temporary cookies
      response.cookies.delete('code_verifier');
      response.cookies.delete('auth_state');
      response.cookies.delete('flow_type');

      return response;
    }

  } catch (error) {
    console.error('Callback processing error:', error);
    return NextResponse.redirect(`${baseUrl}/auth/login?error=callback_failed`);
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