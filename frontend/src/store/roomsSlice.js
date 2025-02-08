import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  rooms: [],
  activeRoom: null,
  loading: false,
  error: null,
};

const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    setRooms: (state, action) => {
      state.rooms = action.payload;
    },
    setActiveRoom: (state, action) => {
      state.activeRoom = action.payload;
    },
    addRoom: (state, action) => {
      state.rooms.push(action.payload);
    },
    removeRoom: (state, action) => {
      state.rooms = state.rooms.filter(room => room.id !== action.payload);
    },
  },
});

export const { setRooms, setActiveRoom, addRoom, removeRoom } = roomsSlice.actions;
export default roomsSlice.reducer;