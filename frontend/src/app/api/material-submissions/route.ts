import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deliveryMethod = searchParams.get('deliveryMethod');
    const status = searchParams.get('status');
    
    // Build query params
    const queryParams = new URLSearchParams();
    if (deliveryMethod) queryParams.append('deliveryMethod', deliveryMethod);
    if (status) queryParams.append('status', status);
    
    const backendUrl = queryParams.toString() 
      ? `http://localhost:8080/api/material-submissions?${queryParams}`
      : 'http://localhost:8080/api/material-submissions';
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Backend API error:', response.status, await response.text());
      return NextResponse.json(
        { error: 'Failed to fetch material submissions' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Return the data in the same format
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching material submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}