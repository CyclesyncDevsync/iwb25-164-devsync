import { NextRequest, NextResponse } from 'next/server';

const WALLET_API_URL = process.env.NEXT_PUBLIC_WALLET_API_URL || 'http://localhost:8097';

export async function GET(request: NextRequest) {
  try {
    // Debug: Log cookies for wallet API
    console.log('=== WALLET API DEBUG ===');
    console.log('Wallet cookies:', request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value })));

    // Get ID token from HTTP-only cookie
    const idToken = request.cookies.get('asgardeo_id_token')?.value;
    console.log('Wallet ID Token found:', idToken ? 'Yes' : 'No');

    if (!idToken) {
      console.log('Wallet: No asgardeo_id_token cookie found');
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