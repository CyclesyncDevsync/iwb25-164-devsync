import { NextRequest, NextResponse } from 'next/server';

const BACKEND_ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:8093';

export async function GET(request: NextRequest) {
  try {
    // Get ID token from HTTP-only cookie
    const idToken = request.cookies.get('asgardeo_id_token')?.value;
    
    if (!idToken) {
      return NextResponse.json(
        { success: false, message: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

    // Call backend to get agents
    const backendResponse = await fetch(`${BACKEND_ADMIN_URL}/api/admin/users?role=agent&limitParam=${limit}&offsetParam=${offset}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await backendResponse.json();
    
    if (!backendResponse.ok) {
      console.error('Failed to fetch agents:', data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch agents' },
        { status: backendResponse.status }
      );
    }

    // Transform the backend response to match frontend expectations
    const agents = data.users?.map((user: any) => ({
      id: user.id.toString(),
      asgardeo_id: user.asgardeoId, // Add the asgardeo_id field
      first_name: user.firstName,
      last_name: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone || 'Not provided', // Phone might not be in the users table
      location: 'Not specified', // Location data needs to be added
      assignedArea: 'Not specified', // Assigned area needs to be added
      status: user.status === 'approved' ? 'active' : 'inactive',
      verificationCount: 0, // This would need to come from a different table
      rating: 0, // Rating would need to come from a different table
      joinDate: user.createdAt,
      lastActive: user.updatedAt,
      specializations: [], // Specializations would need to come from a different table
      totalAssignments: 0, // This would need to come from assignments table
      completedAssignments: 0 // This would need to come from assignments table
    })) || [];

    return NextResponse.json({
      success: true,
      agents: agents,
      total: data.total || agents.length
    });

  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}