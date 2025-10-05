import { NextRequest, NextResponse } from 'next/server';

const PAYMENT_API_URL = process.env.NEXT_PUBLIC_PAYMENT_API_URL || 'http://localhost:8098';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get ID token from HTTP-only cookie
    const idToken = request.cookies.get('asgardeo_id_token')?.value;
    
    if (!idToken) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please login to access payment features' },
        { status: 401 }
      );
    }

    const paymentIntentId = params.id;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    // Forward request to Ballerina payment service with auth token
    const backendResponse = await fetch(`${PAYMENT_API_URL}/api/payment/intent/${paymentIntentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });

    const backendData = await backendResponse.json();
    
    return NextResponse.json(backendData, { status: backendResponse.status });

  } catch (error) {
    console.error('Payment intent retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to retrieve payment intent' },
      { status: 500 }
    );
  }
}