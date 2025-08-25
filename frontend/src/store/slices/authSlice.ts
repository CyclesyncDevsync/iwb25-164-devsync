import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'admin' | 'agent' | 'supplier' | 'buyer' | 'guest';

interface AuthState {
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

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: {
    id: null,
    email: null,
    name: null,
    role: 'guest',
    profileImage: null,
  },
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ token: string; user: Partial<AuthState['user']> }>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = { ...state.user, ...action.payload.user };
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      return initialState;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<AuthState['user']>>) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUserProfile } = authSlice.actions;

export default authSlice.reducer;
