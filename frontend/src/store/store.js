import { configureStore } from '@reduxjs/toolkit';
import roomsReducer from './roomsSlice';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    rooms: roomsReducer,
    user: userReducer,
  },
});