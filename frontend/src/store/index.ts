import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authSlice } from '../store/slices/authSlice';
import { themeSlice } from '../store/slices/themeSlice';
import { baseApi } from '../store/api/baseApi';
import { RootState } from '@/types/store';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    theme: themeSlice.reducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

// Re-export the RootState and AppDispatch types from our store
export type { RootState };
export type AppDispatch = typeof store.dispatch;
