import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { apiSlice } from '../features/api/apiSlice';
import conversationsReducers from '../features/conversions/conversionsSlice';
import authReducers from '../features/auth/AuthSlice';
import messagesReducers from '../features/messages/messagesSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducers,
    conversations: conversationsReducers,
    messages:messagesReducers,
  },
  devTools:process.env.NODE_ENV !=="production",
  middleware:(getDefaultMiddleware)=> getDefaultMiddleware().concat(apiSlice.middleware)
});
