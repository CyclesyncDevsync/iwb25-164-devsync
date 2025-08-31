// Agent management API service
const API_BASE_URL = '/api/admin/agents'; // Use Next.js API routes instead of direct backend calls

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  assignedArea: string;
  status: 'active' | 'inactive' | 'suspended';
  verificationCount: number;
  rating: number;
  joinDate: string;
  lastActive: string;
  specializations: string[];
  totalAssignments: number;
  completedAssignments: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  currentWorkload: number;
  maxWorkload: number;
  hourlyRate?: number;
  userId: number; // Link to User table
}

export interface AgentsResponse {
  status: string;
  data: {
    agents: Agent[];
    total: number;
    limit: number;
    offset: number;
  };
}

export interface AgentResponse {
  status: string;
  data: Agent;
}

export interface CreateAgentRequest {
  name: string;
  email: string;
  phone: string;
  location: string;
  assignedArea: string;
  specializations: string[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
  maxWorkload: number;
  hourlyRate?: number;
  userId?: number; // Optional - will create user if not provided
}

export interface UpdateAgentRequest {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  assignedArea?: string;
  status?: Agent['status'];
  specializations?: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  maxWorkload?: number;
  hourlyRate?: number;
}

export interface AgentPerformanceMetrics {
  agentId: string;
  completionRate: number;
  averageResponseTime: number;
  customerRating: number;
  totalEarnings: number;
  monthlyStats: {
    month: string;
    assignments: number;
    completions: number;
    earnings: number;
  }[];
}

class AgentManagementService {
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  async getAgents(
    status?: string,
    specialization?: string,
    limit = 50,
    offset = 0
  ): Promise<AgentsResponse> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (specialization) params.append('specialization', specialization);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    console.log('Making request to:', `${API_BASE_URL}?${params}`);
    console.log('Headers:', this.getHeaders());

    const response = await fetch(
      `${API_BASE_URL}?${params}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include', // Include cookies for authentication
      }
    );

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch agents';
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

  async getAgentById(agentId: string): Promise<AgentResponse> {
    const response = await fetch(
      `${API_BASE_URL}/${agentId}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch agent');
    }

    return response.json();
  }

  async createAgent(agentData: CreateAgentRequest): Promise<AgentResponse> {
    const response = await fetch(
      `${API_BASE_URL}`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(agentData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create agent');
    }

    return response.json();
  }

  async updateAgent(agentId: string, agentData: UpdateAgentRequest): Promise<AgentResponse> {
    const response = await fetch(
      `${API_BASE_URL}/${agentId}`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(agentData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update agent');
    }

    return response.json();
  }

  async deleteAgent(agentId: string): Promise<{ status: string; message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/${agentId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete agent');
    }

    return response.json();
  }

  async getAgentPerformance(agentId: string): Promise<AgentPerformanceMetrics> {
    const response = await fetch(
      `${API_BASE_URL}/${agentId}/performance`,
      {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch agent performance');
    }

    return response.json();
  }

  async assignAgent(materialId: string, agentId: string): Promise<{ status: string; message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/${agentId}/assign`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ materialId }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to assign agent');
    }

    return response.json();
  }

  async updateAgentStatus(agentId: string, status: Agent['status']): Promise<AgentResponse> {
    const response = await fetch(
      `${API_BASE_URL}/${agentId}/status`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update agent status');
    }

    return response.json();
  }
}

export const agentManagementService = new AgentManagementService();
