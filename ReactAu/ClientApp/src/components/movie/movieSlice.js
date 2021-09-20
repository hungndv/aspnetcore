import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const initialState = {
  successMsg: '',
  queryParams: {
    searchString: '',
    pageIndex: 1,
    sortOrder: 'title_asc'
  }
};

export const movieSlice = createSlice({
  name: 'movie',
  initialState,
  reducers: {
    setSuccessMsg: (state, action) => {
      state.successMsg = action.payload;
    },
    setQueryParams: (state, action) => {
      state.queryParams = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setQueryParams, setSuccessMsg } = movieSlice.actions;

export default movieSlice.reducer;

export const movieApi = createApi({
  reducerPath: 'movieApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${window.location.origin.toString()}/` }),
  tagTypes: ['movie'],
  endpoints: builder => ({
    getMovies: builder.query({
      query: ({ searchString, pageIndex, sortOrder }) => `api/movies/get?searchString=${searchString}&pageIndex=${pageIndex}&sortOrder=${sortOrder}`,
      providesTags: ['movie']
      //transformResponse:
    }),
    updateMovie: builder.mutation({
      query: (movie) => ({
        url: 'api/movies/update',
        method: 'POST',
        body: movie
      }),
      //invalidatesTags: ['movie']
      async onQueryStarted(movie, { dispatch, getState, queryFulfilled }) {
        // `updateQueryData` requires the endpoint name and cache key arguments,
        // so it knows which piece of cache state to update
        const patchResult = dispatch(
          movieApi.util.updateQueryData('getMovies', getState().movie.queryParams, draft => {
            // The `draft` is Immer-wrapped and can be "mutated" like in createSlice
            const m = draft.items.find(m => m.id === movie.id)
            if (m) {
              Object.entries(movie).forEach(([k, v]) => {
                m[k] = v;
              })
            }
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      }
    }),
    addMovie: builder.mutation({
      query: movie => ({
        url: 'api/movies/add',
        method: 'POST',
        body: movie
      }),
      invalidatesTags: ['movie'],
      //async onQueryStarted(movie, { dispatch, queryFulfilled }) {
      //  let patchResult;
      //  try {
      //    var { data } = await queryFulfilled;
      //    if (data) {
      //      patchResult = dispatch(movieApi.util.updateQueryData('getMovies', undefined, draft => {
      //        draft.push(data);
      //      }));
      //    }
      //  } catch {
      //    patchResult.undo();
      //  }
      //}
    }),
    deleteMovie: builder.mutation({
      query: movie => ({
        url: 'api/movies/delete',
        method: 'POST',
        body: movie
      }),
      invalidatesTags: ['movie'],
      //async onQueryStarted(movie, { dispatch, queryFulfilled }) {
      //  let patchResult;
      //  try {
      //    await queryFulfilled;
      //    patchResult = dispatch(movieApi.util.updateQueryData('getMovies', undefined, draft => {
      //      let idx = draft.findIndex(m => m.id === movie.id);
      //      draft.splice(idx, 1);
      //    }));
      //  } catch {
      //    patchResult.undo();
      //  }
      //}
    }),
  })
});

export const { useAddMovieMutation, useDeleteMovieMutation, useGetMoviesQuery, useUpdateMovieMutation } = movieApi;
