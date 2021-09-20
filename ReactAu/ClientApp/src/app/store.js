import { configureStore, createStore } from '@reduxjs/toolkit'
import { composeWithDevTools } from 'redux-devtools-extension'
import movieReducer, { movieApi } from '../components/movie/movieSlice'
import movieModalReducer from '../components/movie/movieModalSlice'
import confirmModalReducer from '../components/movie/confirmModalSlice'

export default configureStore({
  reducer: {
    movie: movieReducer,
    movieModal: movieModalReducer,
    confirmModal: confirmModalReducer,
    // Add the generated reducer as a specific top-level slice
    [movieApi.reducerPath]: movieApi.reducer
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(movieApi.middleware),
  //enhancers: composeWithDevTools([middlewareEnhancer, monitorReducersEnhancer])
})
