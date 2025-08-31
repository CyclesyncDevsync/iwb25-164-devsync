// User management API service
const API_BASE_URL = '/api/admin'; // Use Next.js API routes instead of direct backend calls

export interface User {
  id: number;
  asgardeoId: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: 'super_admin' | 'admin' | 'agent' | 'supplier' | 'buyer';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

export interface UsersResponse {
  status: string;
  data: {
    users: User[];
    total: number;
    limit: number;
    offset: number;
  };
}

export interface UserResponse {
  status: string;
  data: User;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: User['role'];
  asgardeoId?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: User['role'];
  status?: User['status'];
  rejectionReason?: string;
}

class UserManagementService {
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  async getUsers(
    role?: string,
    status?: string,
    limit = 50,
    offset = 0
  ): Promise<UsersResponse> {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    console.log('Making request to:', `${API_BASE_URL}/users?${params}`);
    console.log('Headers:', this.getHeaders());

    const response = await fetch(
      `${API_BASE_URL}/users?${params}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include', // Include cookies for authentication
      }
    );

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch users';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch {
        // If we can't parse the error as JSON, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      console.error('API Error:', errorMessage);
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async getUserById(userId: number): Promise<UserResponse> {
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch user');
    }

    return response.json();
  }

  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    const response = await fetch(
      `${API_BASE_URL}/users`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(userData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create user');
    }

    return response.json();
  }

  async updateUser(userId: number, userData: UpdateUserRequest): Promise<UserResponse> {
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(userData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user');
    }

    return response.json();
  }

  async deleteUser(userId: number): Promise<{ status: string; message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete user');
    }

    return response.json();
  }
}

export const userManagementService = new UserManagementService();
