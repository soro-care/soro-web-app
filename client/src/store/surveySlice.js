// surveySlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  step: 1,
  formData: {
    ageRange: '',
    gender: '',
    concerns: [],
    otherConcern: '',
    diagnosed: null,
    diagnosisDetails: ''
  },
  isSubmitted: false,
  isLoading: false
};

const surveySlice = createSlice({
  name: 'survey',
  initialState,
  reducers: {
    setSurveyStep: (state, action) => {
      state.step = action.payload;
    },
    updateSurveyData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    toggleConcern: (state, action) => {
      const concern = action.payload;
      const index = state.formData.concerns.indexOf(concern);
      
      if (index !== -1) {
        // Remove concern if already selected
        state.formData.concerns.splice(index, 1);
        if (concern === 'Other') {
          state.formData.otherConcern = '';
        }
      } else if (state.formData.concerns.length < 2) {
        // Add concern if less than 2 selected
        state.formData.concerns.push(concern);
      }
    },
    setSurveyLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    submitSurveySuccess: (state) => {
      state.isSubmitted = true;
    },
    resetSurvey: () => initialState
  }
});

export const { 
  setSurveyStep, 
  updateSurveyData, 
  toggleConcern,
  setSurveyLoading,
  submitSurveySuccess,
  resetSurvey
} = surveySlice.actions;

export default surveySlice.reducer;