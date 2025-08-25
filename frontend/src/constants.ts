// User roles in the system
export const USER_ROLES = {
  ADMIN: 'admin',
  AGENT: 'agent',
  SUPPLIER: 'supplier',
  BUYER: 'buyer',
  GUEST: 'guest',
};

// Application routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  CHAT: '/chat',
  ADMIN: {
    USERS: '/admin/users',
    MATERIALS: '/admin/materials',
    AUCTIONS: '/admin/auctions',
    TRANSACTIONS: '/admin/transactions',
    DISPUTES: '/admin/disputes',
    REPORTS: '/admin/reports',
  },
  AGENT: {
    ASSIGNMENTS: '/agent/assignments',
    VERIFICATION: '/agent/verification',
  },
  SUPPLIER: {
    MATERIALS: '/supplier/materials',
    AUCTIONS: '/supplier/auctions',
  },
  BUYER: {
    MARKETPLACE: '/buyer/marketplace',
    AUCTIONS: '/buyer/auctions',
  },
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
  },
  USERS: '/api/users',
  MATERIALS: '/api/materials',
  AUCTIONS: '/api/auctions',
  TRANSACTIONS: '/api/transactions',
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  THEME: 'theme_preference',
  USER: 'user_data',
};
