import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../constants';
import axios from 'axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk('user/fetchUsers', async () => {
  const response = await axios.get(API_ENDPOINTS.USERS);
  return response.data;
});

export const updateUserRole = createAsyncThunk(
  'user/updateUserRole',
  async (payload: { id: string; role: string }) => {
    const response = await axios.patch(`${API_ENDPOINTS.USERS}/${payload.id}`, { role: payload.role });
    return response.data;
  }
);

export const toggleUserStatus = createAsyncThunk(
  'user/toggleUserStatus',
  async (id: string) => {
    const response = await axios.patch(`${API_ENDPOINTS.USERS}/${id}/toggle-status`);
    return response.data;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchUsers.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      .addCase(updateUserRole.fulfilled, (state, action: PayloadAction<User>) => {
        const idx = state.users.findIndex(u => u.id === action.payload.id);
        if (idx !== -1) state.users[idx] = action.payload;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action: PayloadAction<User>) => {
        const idx = state.users.findIndex(u => u.id === action.payload.id);
        if (idx !== -1) state.users[idx] = action.payload;
      });
  },
});

export default userSlice.reducer;
