import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Processing logout request...');
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear all authentication cookies
    response.cookies.delete('asgardeo_id_token');
    response.cookies.delete('user_data');
    response.cookies.delete('session-token'); // Legacy cookie cleanup
    response.cookies.delete('pending_id_token');
    response.cookies.delete('code_verifier');
    response.cookies.delete('auth_state');
    response.cookies.delete('flow_type');

    console.log('Authentication cookies cleared');
    
    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    );
  }
}