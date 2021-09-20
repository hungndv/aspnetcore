import { createSlice } from '@reduxjs/toolkit';

export const confirmModalSlice = createSlice({
  name: 'confirmModal',
  initialState: {
    movie: null
  },
  reducers: {
    confirmDelete: (state, action) => {
      state.movie = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { confirmDelete } = confirmModalSlice.actions

export default confirmModalSlice.reducer
