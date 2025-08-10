import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { 
  AuthState, 
  AuthActions, 
  LoginRequest, 
  RegistrationRequest, 
  User, 
  UserType 
} from '@/types/auth';
import { authApi } from '@/lib/api/auth';

interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.login(credentials);
          const { accessToken, user } = response.data;
          
          // Store token in cookie and state
          Cookies.set('token', accessToken, {
            expires: 7, // 7 days
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
          });
          
          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Login failed'
          });
          throw error;
        }
      },

      register: async (data: RegistrationRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.register(data);
          
          set({
            isLoading: false,
            error: null
          });
          
          // Note: After registration, user still needs to login
          // This is a security best practice
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Registration failed'
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          const { token } = get();
          if (token) {
            await authApi.logout();
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear state and cookies regardless of API call success
          Cookies.remove('token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      },

      refreshToken: async () => {
        try {
          const refreshToken = Cookies.get('refreshToken');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await authApi.refreshToken(refreshToken);
          const { accessToken, user } = response.data;
          
          Cookies.set('token', accessToken, {
            expires: 7,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
          });
          
          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            error: null
          });
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        // Sync with cookie on rehydration
        const token = Cookies.get('token');
        if (token && state) {
          state.token = token;
          state.isAuthenticated = !!state.user;
        } else if (state) {
          state.token = null;
          state.isAuthenticated = false;
          state.user = null;
        }
      },
    }
  )
);

// Utility functions for role-based access control
export const usePermissions = () => {
  const { user } = useAuthStore();
  
  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) ?? false;
  };
  
  const hasUserType = (userType: UserType): boolean => {
    return user?.userType === userType;
  };
  
  const isAdmin = (): boolean => {
    return hasUserType(UserType.ADMIN) || hasRole('admin');
  };
  
  const isBuyer = (): boolean => {
    return hasUserType(UserType.BUYER) || hasRole('buyer');
  };
  
  const isSupplier = (): boolean => {
    return hasUserType(UserType.SUPPLIER_INDIVIDUAL) || 
           hasUserType(UserType.SUPPLIER_ORGANIZATION) || 
           hasRole('supplier');
  };
  
  const canAccess = (requiredRoles: string[] = [], requiredUserTypes: UserType[] = []): boolean => {
    if (requiredRoles.length === 0 && requiredUserTypes.length === 0) {
      return true; // No restrictions
    }
    
    const hasRequiredRole = requiredRoles.length === 0 || 
                          requiredRoles.some(role => hasRole(role));
    
    const hasRequiredUserType = requiredUserTypes.length === 0 || 
                               requiredUserTypes.some(type => hasUserType(type));
    
    return hasRequiredRole && hasRequiredUserType;
  };
  
  return {
    hasRole,
    hasUserType,
    isAdmin,
    isBuyer,
    isSupplier,
    canAccess,
    user
  };
};
