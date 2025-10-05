import { NextRequest, NextResponse } from 'next/server';

const AUCTION_API_URL = process.env.NEXT_PUBLIC_AUCTION_API_URL || 'http://localhost:8096';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ auctionId: string }> }
) {
  try {
    // Await params in Next.js 15
    const { auctionId } = await params;
    
    // Debug: Log all cookies
    console.log('=== BID API DEBUG ===');
    console.log('All cookies:', request.cookies.getAll().map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })));

    // Try different possible cookie names
    const possibleTokens = [
      request.cookies.get('asgardeo_id_token')?.value,
      request.cookies.get('id_token')?.value,
      request.cookies.get('access_token')?.value,
      request.cookies.get('session_token')?.value
    ];

    console.log('Possible tokens found:', possibleTokens.map(t => t ? 'YES' : 'NO'));

    // Get ID token from HTTP-only cookie
    const idToken = request.cookies.get('asgardeo_id_token')?.value;

    console.log('ID Token found:', idToken ? 'Yes' : 'No');
    console.log('ID Token length:', idToken?.length || 0);

    if (!idToken) {
      console.log('ERROR: No asgardeo_id_token cookie found');
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please login to place bids - no token found' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();

    // Forward request to Ballerina auction service with authentication header
    console.log('Sending to backend:', `${AUCTION_API_URL}/api/auction/auction/${auctionId}/bid`);
    console.log('Authorization header:', `Bearer ${idToken.substring(0, 20)}...`);

    const backendResponse = await fetch(`${AUCTION_API_URL}/api/auction/auction/${auctionId}/bid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        ...body,
        // The backend will extract user ID from the JWT token
      })
    });

    const backendData = await backendResponse.json();
    console.log('Backend response:', backendData);

    return NextResponse.json(backendData, { status: backendResponse.status });

  } catch (error) {
    console.error('Auction bid error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to place bid' },
      { status: 500 }
    );
  }
}