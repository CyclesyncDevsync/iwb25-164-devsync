import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authSlice } from '../store/slices/authSlice';
import { themeSlice } from '../store/slices/themeSlice';
import { baseApi } from '../store/api/baseApi';

import userReducer from './userSlice';
import supplierReducer from './slices/supplierSlice';
import auctionReducer from './slices/auctionSlice';
import walletReducer from './slices/walletSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    theme: themeSlice.reducer,
    user: userReducer,
    supplier: supplierReducer,
    auctions: auctionReducer,
    wallet: walletReducer,
    chat: chatReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

// Define RootState type
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
