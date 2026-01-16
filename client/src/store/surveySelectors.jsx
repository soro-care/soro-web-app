export const selectSurveyStep = (state) => state.survey.step;
export const selectSurveyFormData = (state) => state.survey.formData;
export const selectSurveyLoading = (state) => state.survey.isLoading;
export const selectSurveySubmitted = (state) => state.survey.isSubmitted;
export const selectSurveyConcerns = (state) => state.survey.formData.concerns;