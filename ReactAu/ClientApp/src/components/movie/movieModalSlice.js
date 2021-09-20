import { createSlice } from '@reduxjs/toolkit';

const emptyMovie = { id: 0, title: '', releaseDate: '', genre: '', price: '' };

export const movieModalSlice = createSlice({
  name: 'movieModal',
  initialState: {
    movie: null
  },
  reducers: {
    update: (state, action) => {
      state.movie = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { update } = movieModalSlice.actions

export const getEmptyMovie = state => emptyMovie;

export default movieModalSlice.reducer
