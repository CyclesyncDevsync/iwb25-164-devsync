// Authentication types for the frontend

export enum UserType {
  BUYER = 'buyer',
  SUPPLIER_INDIVIDUAL = 'supplier_individual',
  SUPPLIER_ORGANIZATION = 'supplier_organization',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userType: UserType;
  roles: string[];
  groups?: string[];
  organizationName?: string;
  businessLicense?: string;
  contactNumber?: string;
  address?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthContext {
  userId: string;
  username: string;
  email: string;
  userType: UserType;
  roles: string[];
  groups?: string[];
  token: string;
  exp: number;
  organizationName?: string;
  isVerified?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
  userType?: UserType;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    accessToken: string;
    refreshToken?: string;
    user: User;
    expiresIn: number;
  };
}

export interface RegistrationRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  organizationName?: string;
  businessLicense?: string;
  contactNumber?: string;
  address?: string;
}

export interface RegistrationResponse {
  status: string;
  message: string;
  data: {
    user: User;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegistrationRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export interface ApiResponse<T = any> {
  status: string;
  message: string;
  data?: T;
  error?: {
    code: number;
    message: string;
    details?: string;
  };
}

export interface ValidationErrors {
  [key: string]: string[];
}

// Role-based access control
export interface Permission {
  resource: string;
  action: string;
}

export interface RolePermissions {
  [role: string]: Permission[];
}

// Navigation menu items based on user type
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  roles?: string[];
  userTypes?: UserType[];
}

// Dashboard data structures
export interface DashboardData {
  buyer?: BuyerDashboard;
  supplier?: SupplierDashboard;
  admin?: AdminDashboard;
}

export interface BuyerDashboard {
  recentOrders: Order[];
  availableProducts: Product[];
  notifications: Notification[];
  statistics: {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
  };
}

export interface SupplierDashboard {
  products: Product[];
  orders: Order[];
  analytics: {
    totalProducts: number;
    totalOrders: number;
    revenue: number;
    rating: number;
  };
  notifications: Notification[];
}

export interface AdminDashboard {
  users: UserSummary[];
  statistics: {
    totalUsers: number;
    totalSuppliers: number;
    totalBuyers: number;
    systemHealth: string;
  };
  recentActivities: Activity[];
}

export interface Order {
  id: string;
  productName: string;
  quantity: number;
  totalAmount?: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  estimatedDelivery?: string;
  supplier?: string;
  buyer?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  supplier: {
    id: string;
    name: string;
    rating?: number;
  };
  availability: 'in-stock' | 'limited' | 'out-of-stock';
  specifications?: Record<string, any>;
  images?: string[];
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  date: string;
  read?: boolean;
}

export interface UserSummary {
  id: string;
  username: string;
  email: string;
  userType: UserType;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
}

export interface Activity {
  id: string;
  userId: string;
  username: string;
  action: string;
  timestamp: string;
  details?: string;
}
