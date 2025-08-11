// API constants
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  AGENT: 'agent',
  SUPPLIER: 'supplier',
  BUYER: 'buyer',
  GUEST: 'guest',
} as const;

// Auth constants
export const AUTH_STORAGE_KEY = 'cyclesync_auth';

// Status types
export const STATUS_TYPES = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  IN_AUCTION: 'in_auction',
  COMPLETED: 'completed',
} as const;

// Material categories
export const MATERIAL_CATEGORIES = [
  'Plastic',
  'Metal',
  'Paper',
  'Glass',
  'Electronics',
  'Textiles',
  'Organic',
  'Other',
] as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ADMIN: {
    HOME: '/admin',
    USERS: '/admin/users',
    MATERIALS: '/admin/materials',
    AUCTIONS: '/admin/auctions',
    TRANSACTIONS: '/admin/transactions',
  },
  AGENT: {
    HOME: '/agent',
    ASSIGNMENTS: '/agent/assignments',
    VERIFICATION: '/agent/verification',
  },
  SUPPLIER: {
    HOME: '/supplier',
    MATERIALS: '/supplier/materials',
    AUCTIONS: '/supplier/auctions',
  },
  BUYER: {
    HOME: '/buyer',
    MARKETPLACE: '/buyer/marketplace',
    AUCTIONS: '/buyer/auctions',
  },
  AUCTION: {
    LIST: '/auction',
    DETAILS: (id: string) => `/auction/${id}`,
  },
  CHAT: '/chat',
} as const;
