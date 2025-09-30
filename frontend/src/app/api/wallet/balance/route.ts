import { NextRequest, NextResponse } from 'next/server';

const WALLET_API_URL = process.env.NEXT_PUBLIC_WALLET_API_URL || 'http://localhost:8097';

export async function GET(request: NextRequest) {
  try {
    // Get ID token from HTTP-only cookie
    const idToken = request.cookies.get('asgardeo_id_token')?.value;
    
    if (!idToken) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please login to access wallet features' },
        { status: 401 }
      );
    }

    // Forward request to Ballerina wallet service with auth token
    const backendResponse = await fetch(`${WALLET_API_URL}/api/wallet/balance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      }
    });

    const backendData = await backendResponse.json();
    
    return NextResponse.json(backendData, { status: backendResponse.status });

  } catch (error) {
    console.error('Wallet balance error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch wallet balance' },
      { status: 500 }
    );
  }
}