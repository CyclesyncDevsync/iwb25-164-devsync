import { NextRequest, NextResponse } from 'next/server';

const AUCTION_API_URL = process.env.NEXT_PUBLIC_AUCTION_API_URL || 'http://localhost:8096';

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIMPLIFIED BID API ===');

    // Get ID token from HTTP-only cookie (same as wallet API)
    const idToken = request.cookies.get('asgardeo_id_token')?.value;
    console.log('Bid ID Token found:', idToken ? 'Yes' : 'No');

    if (!idToken) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please login to place bids' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { auctionId, bid_amount } = body;

    if (!auctionId || !bid_amount) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing auctionId or bid_amount' },
        { status: 400 }
      );
    }

    console.log('Placing bid for auction:', auctionId, 'amount:', bid_amount);

    // Forward request to Ballerina auction service
    const backendResponse = await fetch(`${AUCTION_API_URL}/api/auction/auction/${auctionId}/bid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ bid_amount })
    });

    const backendData = await backendResponse.json();
    console.log('Backend response:', backendData);

    return NextResponse.json(backendData, { status: backendResponse.status });

  } catch (error) {
    console.error('Bid API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to place bid' },
      { status: 500 }
    );
  }
}