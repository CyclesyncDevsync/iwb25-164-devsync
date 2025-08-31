// User Management Service for Agent Creation
export interface User {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string; // computed field: firstName + lastName
  role?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  status?: string;
}

class UserBasedAgentManagementService {
  private baseURL = '/api/admin/agents';

  // Get all agents (users with role='agent')
  async getAgents(): Promise<{ data: { agents: User[], total: number } }> {
    const response = await fetch(this.baseURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch agents: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Transform the data to match User interface and add computed name field
    const agents = result.data.agents.map((agent: Record<string, unknown>) => ({
      ...agent,
      name: `${agent.first_name || agent.firstName || ''} ${agent.last_name || agent.lastName || ''}`.trim(),
      firstName: agent.first_name || agent.firstName,
      lastName: agent.last_name || agent.lastName
    }));

    return {
      data: {
        agents,
        total: result.data.total
      }
    };
  }

  // Create new agent
  async createAgent(agentData: CreateUserRequest): Promise<{ data: User }> {
    const payload = {
      ...agentData,
      role: 'agent' // Force role to be agent
    };

    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to create agent: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Transform the response data
    const agent = {
      ...result.data,
      name: `${result.data.first_name || result.data.firstName || ''} ${result.data.last_name || result.data.lastName || ''}`.trim(),
      firstName: result.data.first_name || result.data.firstName,
      lastName: result.data.last_name || result.data.lastName
    };

    return { data: agent };
  }

  // Update agent
  async updateAgent(agentId: string, updateData: UpdateUserRequest): Promise<{ data: User }> {
    const response = await fetch(`${this.baseURL}/${agentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update agent: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Transform the response data
    const agent = {
      ...result.data,
      name: `${result.data.first_name || result.data.firstName || ''} ${result.data.last_name || result.data.lastName || ''}`.trim(),
      firstName: result.data.first_name || result.data.firstName,
      lastName: result.data.last_name || result.data.lastName
    };

    return { data: agent };
  }

  // Delete agent
  async deleteAgent(agentId: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/${agentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete agent: ${response.statusText}`);
    }

    const result = await response.json();
    return { message: result.message };
  }
}

export const userBasedAgentManagementService = new UserBasedAgentManagementService();
