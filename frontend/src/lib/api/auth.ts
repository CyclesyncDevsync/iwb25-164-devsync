import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { 
  LoginRequest, 
  LoginResponse, 
  RegistrationRequest, 
  RegistrationResponse,
  ApiResponse,
  User
} from '@/types/auth';

// Create base API instance
const createApiClient = (): AxiosInstance => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  
  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  client.interceptors.request.use(
    (config) => {
      const token = Cookies.get('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        Cookies.remove('token');
        Cookies.remove('refreshToken');
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export const apiClient = createApiClient();

// Authentication API endpoints
export const authApi = {
  // Regular user login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials);
    return response.data;
  },

  // Admin login
  adminLogin: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/admin/auth/login', credentials);
    return response.data;
  },

  // User registration
  register: async (data: RegistrationRequest): Promise<RegistrationResponse> => {
    const response = await apiClient.post<RegistrationResponse>('/api/auth/register', data);
    return response.data;
  },

  // Logout
  logout: async (): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/api/auth/logout');
    return response.data;
  },

  // Admin logout
  adminLogout: async (): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/api/admin/auth/logout');
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/auth/refresh', {
      refreshToken
    });
    return response.data;
  },

  // Validate token
  validateToken: async (token: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/api/auth/validate', {
      token
    });
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/api/user/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>('/api/user/profile', data);
    return response.data;
  },

  // Get user permissions
  getPermissions: async (): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>('/api/user/permissions');
    return response.data;
  },
};

// Dashboard API endpoints
export const dashboardApi = {
  // Buyer dashboard
  getBuyerDashboard: async (): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>('/api/buyer/dashboard');
    return response.data;
  },

  // Supplier dashboard
  getSupplierDashboard: async (): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>('/api/supplier/dashboard');
    return response.data;
  },

  // Admin dashboard
  getAdminDashboard: async (): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>('/api/admin/dashboard');
    return response.data;
  },

  // Get products (buyer view)
  getProducts: async (): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>('/api/buyer/products');
    return response.data;
  },

  // Get supplier products
  getSupplierProducts: async (): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>('/api/supplier/products');
    return response.data;
  },

  // Create product (supplier)
  createProduct: async (productData: any): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/api/supplier/products', productData);
    return response.data;
  },

  // Create order (buyer)
  createOrder: async (orderData: any): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/api/buyer/orders', orderData);
    return response.data;
  },

  // Get orders
  getOrders: async (): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>('/api/buyer/orders');
    return response.data;
  },

  // Admin - Get all users
  getAllUsers: async (): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>('/api/admin/users');
    return response.data;
  },

  // Admin - Create user
  createUser: async (userData: any): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/api/admin/users', userData);
    return response.data;
  },

  // Admin - Get system stats
  getSystemStats: async (): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>('/api/admin/stats');
    return response.data;
  },
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// API client with specific configuration for different endpoints
export const createAuthenticatedClient = (config?: AxiosRequestConfig): AxiosInstance => {
  const client = createApiClient();
  
  if (config) {
    Object.assign(client.defaults, config);
  }
  
  return client;
};
