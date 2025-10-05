import { NextRequest, NextResponse } from 'next/server';

const PAYMENT_API_URL = process.env.NEXT_PUBLIC_PAYMENT_API_URL || 'http://localhost:8098';

export async function POST(request: NextRequest) {
  try {
    // Get ID token from HTTP-only cookie
    const idToken = request.cookies.get('asgardeo_id_token')?.value;
    
    if (!idToken) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please login to access payment features' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();

    // Validate required fields
    if (!body.amount) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Amount is required' },
        { status: 400 }
      );
    }

    // Forward request to Ballerina payment service with auth token
    const backendResponse = await fetch(`${PAYMENT_API_URL}/api/payment/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        amount: body.amount,
        currency: body.currency || 'lkr',
        successUrl: body.successUrl || `${process.env.NEXTAUTH_URL}/buyer/wallet?payment=success`,
        cancelUrl: body.cancelUrl || `${process.env.NEXTAUTH_URL}/buyer/wallet?payment=cancelled`
      })
    });

    const backendData = await backendResponse.json();
    
    return NextResponse.json(backendData, { status: backendResponse.status });

  } catch (error) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
