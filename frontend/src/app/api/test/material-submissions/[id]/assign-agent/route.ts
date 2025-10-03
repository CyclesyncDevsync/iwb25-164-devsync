import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log('Test API: Assign agent route called:', { id, body });
    
    // Transform the request body to match backend expectations
    const backendPayload = {
      agentId: body.agentAsgardeoId || body.agentId
    };
    
    console.log('Test API: Calling backend with payload:', backendPayload);
    
    const response = await fetch(
      `http://localhost:8080/api/test/material-submissions/${id}/assign-agent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendPayload),
      }
    );

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Test API: Failed to parse response as JSON:', jsonError);
      data = { message: 'Invalid response from backend' };
    }
    
    console.log('Test API: Backend response:', { status: response.status, data });

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to assign agent' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Test API: Error in assign-agent proxy:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}