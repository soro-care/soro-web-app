import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bookings: [],
  availability: [],
  professionals: [],
  concerns: [],
  loading: false,
  error: null
};

const consultationSlice = createSlice({
  name: 'consultation',
  initialState,
  reducers: {
    setBookings: (state, action) => {
      state.bookings = action.payload;
    },
    setAvailability: (state, action) => {
      state.availability = action.payload;
    },
    setProfessionals: (state, action) => {
      state.professionals = action.payload;
    },
    setConcerns: (state, action) => {
      state.concerns = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { 
  setBookings, 
  setAvailability, 
  setProfessionals, 
  setConcerns,
  setLoading, 
  setError 
} = consultationSlice.actions;

export default consultationSlice.reducer;