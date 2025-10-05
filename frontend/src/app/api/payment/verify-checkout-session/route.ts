import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const PAYMENT_API_URL = process.env.NEXT_PUBLIC_PAYMENT_API_URL || 'http://localhost:8098';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const idToken = cookieStore.get('asgardeo_id_token')?.value;

    if (!idToken) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate session ID
    if (!body.sessionId) {
      return NextResponse.json(
        { status: 'error', message: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Forward to Ballerina backend
    const response = await fetch(`${PAYMENT_API_URL}/api/payment/verify-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        sessionId: body.sessionId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: data.message || 'Failed to verify checkout session' 
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error verifying checkout session:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
