import { UserRole } from '@/store/slices/authSlice';

// Define the RootState type that includes all our slices
export interface RootState {
  auth: AuthState;
  theme: ThemeState;
  user: {
    users: Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      active: boolean;
    }>;
    loading: boolean;
    error: string | null;
  };
}

// Auth slice state
export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: {
    id: string | null;
    email: string | null;
    name: string | null;
    role: UserRole;
    profileImage?: string | null;
  };
  loading: boolean;
  error: string | null;
}

// Theme slice state
export interface ThemeState {
  darkMode: boolean;
  activeRole: UserRole;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
  };
}
