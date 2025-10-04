import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId, ...restBody } = body;
    
    console.log('Test assign route called:', { submissionId, body });
    
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('Authorization');
    
    // Also get the ID token from cookies (which is the actual auth token)
    const idToken = request.cookies.get('asgardeo_id_token')?.value;
    
    // Transform the request body to match backend expectations for the status update endpoint
    // additional_details must be a valid JSON string since backend stores it as JSONB
    const additionalDetails = {
      notes: restBody.notes || 'Material submission assigned by admin',
      assignedBy: restBody.assignedBy || 'admin',
      assignmentDate: new Date().toISOString(),
      location: restBody.location || null
    };
    
    const backendPayload = {
      submission_status: 'assigned',
      agent_id: restBody.agentAsgardeoId || restBody.agentId,
      additional_details: JSON.stringify(additionalDetails)
    };
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Use the ID token from cookie if no authorization header is present
    const token = authHeader ? authHeader : idToken ? `Bearer ${idToken}` : null;
    
    if (!token) {
      console.error('No authentication token available');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    headers['Authorization'] = token;
    
    // Use the actual working endpoint that updates the database (on port 8086)
    const response = await fetch(
      `http://localhost:8086/api/material-submissions/${submissionId}/status`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(backendPayload),
      }
    );

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse response as JSON:', jsonError);
      data = { message: 'Invalid response from backend' };
    }
    
    console.log('Backend response:', { status: response.status, data });

    if (!response.ok) {
      console.error('Assignment failed:', data);
      return NextResponse.json(
        { error: data.message || 'Failed to assign agent' },
        { status: response.status }
      );
    }

    console.log('Assignment successful!', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in test-assign proxy:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}