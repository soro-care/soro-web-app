import { createContext, useContext, useState } from 'react';


const SurveyContext = createContext();

export const SurveyProvider = ({ children }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    ageRange: '',
    gender: '',
    concerns: [],
    otherConcern: '',
    diagnosed: '',
    diagnosisDetails: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const concernsOptions = [
    'Anxiety', 'Depression', 'Stress & burnout', 'Sleep difficulties',
    'Loneliness/isolation', 'Academic pressure', 
    'Relationship/family issues', 'Self-esteem/body image', 'Other'
  ];

  const validateStep = (currentStep) => {
    switch(currentStep) {
      case 1:
        if (!formData.ageRange) {
          toast.error('Please select your age range');
          return false;
        }
        return true;
      case 2:
        if (!formData.gender) {
          toast.error('Please select your gender');
          return false;
        }
        return true;
      case 3:
        if (formData.concerns.length === 0) {
          toast.error('Please select at least one concern');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (step < 4 && !validateStep(step)) return;
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleConcern = (concern) => {
    setFormData(prev => {
      if (prev.concerns.includes(concern)) {
        return {
          ...prev,
          concerns: prev.concerns.filter(c => c !== concern),
          otherConcern: concern === 'Other' ? '' : prev.otherConcern
        };
      }
      return prev.concerns.length < 2 ? 
        { ...prev, concerns: [...prev.concerns, concern] } : 
        prev;
    });
  };

  return (
    <SurveyContext.Provider value={{
      step,
      formData,
      isSubmitting,
      concernsOptions,
      nextStep,
      prevStep,
      updateFormData,
      toggleConcern,
      setIsSubmitting
    }}>
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurvey = () => useContext(SurveyContext);