import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'
import surveyReducer from './surveySlice'
import blogReducer from './blogSlice'


export const store = configureStore({
  reducer: {
    user: userReducer,
    blog: blogReducer,
    survey: surveyReducer
  },
})