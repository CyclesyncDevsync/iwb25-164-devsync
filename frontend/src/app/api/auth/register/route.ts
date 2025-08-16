import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { USER_ROLES } from '../../../../constants';

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' }, 
        { status: 400 }
      );
    }

    // Validate email format
    if (!email.includes('@')) {
      return NextResponse.json(
        { message: 'Invalid email format' }, 
        { status: 400 }
      );
    }

    // Validate password strength (simple check for demo)
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' }, 
        { status: 400 }
      );
    }

    // In a real app, you would check if user already exists, hash the password, etc.

    // Determine user role
    const userRole = role || USER_ROLES.BUYER; // Default to BUYER if no role specified

    // Mock user data - in a real app, you would save this to a database
    const newUser = {
      id: 'user_' + Date.now(),
      name,
      email,
      role: userRole,
    };

    // In a real app, you would send a verification email here
    // For demo purposes, we'll just return success

    return NextResponse.json({ 
      message: 'Registration successful. Please verify your email.',
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
