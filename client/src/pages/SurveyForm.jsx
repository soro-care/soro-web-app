import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';

const concernsOptions = [
  'Anxiety', 'Depression', 'Stress & burnout', 'Sleep difficulties',
  'Loneliness/isolation', 'Academic pressure', 
  'Relationship/family issues', 'Self-esteem/body image', 'Other'
];

const SurveyForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(state => state.user);


  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [formData, setFormData] = useState({
    ageRange: '',
    gender: '',
    concerns: [],
    otherConcern: '',
    diagnosed: '',
    diagnosisDetails: ''
  });
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    // Only check once when component mounts
    if (!checkedAuth) {
      if (!user || user.role !== "USER") {
        navigate('/dashboard', { replace: true });
      }
      setCheckedAuth(true);
    }
  }, [user, navigate, checkedAuth]);

  useEffect(() => {
    // Reset form when component mounts
    setStep(1);
    setFormData({
      ageRange: '',
      gender: '',
      concerns: [],
      otherConcern: '',
      diagnosed: '',
      diagnosisDetails: ''
    });
  }, []);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleConcern = (concern) => {
    setFormData(prev => {
      const exists = prev.concerns.includes(concern);
      const newConcerns = exists
        ? prev.concerns.filter(c => c !== concern)
        : prev.concerns.length < 2 
          ? [...prev.concerns, concern] 
          : prev.concerns;
      
      return {
        ...prev,
        concerns: newConcerns,
        otherConcern: concern === 'Other' && exists ? '' : prev.otherConcern
      };
    });
  };

  const validateStep = () => {
    switch(step) {
      case 1: return !!formData.ageRange || toast.error('Please select age range');
      case 2: return !!formData.gender || toast.error('Please select gender');
      case 3: return formData.concerns.length > 0 || toast.error('Select at least one concern');
      default: return true;
    }
  };

  const handleNext = () => {
    if (step < 4 && !validateStep()) return;
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    // Final validation
    if (!formData.diagnosed) return toast.error('Please select diagnosis option');
    if (formData.diagnosed === 'Yes' && !formData.diagnosisDetails.trim()) {
      return toast.error('Please specify diagnosis details');
    }

    setLoading(true);
    try {
      await Axios({
        ...SummaryApi.postSurvey,
        data: formData
      });
      setShowCompletion(true);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
  };

  if (showCompletion) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="text-6xl mb-6">👍</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Account Setup Complete!
          </h1>
          <button
            onClick={handleComplete}
            className="px-6 py-3 rounded-lg text-white bg-[#30459D] hover:bg-[#190D39] transition-colors"
          >
            Continue to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 relative"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
            Mental Wellness Survey
          </h1>
          <div className="flex justify-center mb-6">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`w-6 h-6 rounded-full mx-1 flex items-center justify-center text-sm
                  ${step === s ? 'bg-[#30459D] text-white' : 
                  step > s ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={e => e.preventDefault()}>
          {step === 1 && (
            <div className="space-y-6">
              <label className="block text-lg font-medium text-center">
                What is your age range?
              </label>
              <div className="grid grid-cols-2 gap-4">
                {["Under 18", "18–21", "22–25", "26+"].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateField('ageRange', option)}
                    className={`p-4 rounded-xl border-2 transition-all
                      ${formData.ageRange === option
                        ? 'border-[#30459D] bg-[#30459D]/10'
                        : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <label className="block text-lg font-medium text-center">
                What is your gender?
              </label>
              <div className="grid grid-cols-2 gap-4">
                {["Female", "Male", "Prefer not to say"].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateField('gender', option)}
                    className={`p-4 rounded-xl border-2 transition-all
                      ${formData.gender === option
                        ? 'border-[#30459D] bg-[#30459D]/10'
                        : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <label className="block text-lg font-medium text-center">
                Select up to 2 concerns
              </label>
              <div className="grid grid-cols-2 gap-3">
                {concernsOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleConcern(option)}
                    className={`p-3 rounded-lg border-2 transition-all
                      ${formData.concerns.includes(option)
                        ? 'border-[#30459D] bg-[#30459D]/10'
                        : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {formData.concerns.includes('Other') && (
                <input
                  type="text"
                  placeholder="Specify your concern"
                  value={formData.otherConcern}
                  onChange={e => updateField('otherConcern', e.target.value)}
                  className="w-full p-3 mt-4 border-2 rounded-lg focus:border-[#30459D]"
                />
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <label className="block text-lg font-medium text-center">
                Mental health diagnosis history?
              </label>
              <div className="space-y-3">
                {["Yes", "No", "Unsure"].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateField('diagnosed', option)}
                    className={`w-full p-3 rounded-lg border-2 transition-all
                      ${formData.diagnosed === option
                        ? 'border-[#30459D] bg-[#30459D]/10'
                        : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {formData.diagnosed === 'Yes' && (
                <input
                  type="text"
                  placeholder="Diagnosis details"
                  value={formData.diagnosisDetails}
                  onChange={e => updateField('diagnosisDetails', e.target.value)}
                  className="w-full p-3 mt-4 border-2 rounded-lg focus:border-[#30459D]"
                />
              )}
            </div>
          )}

          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2 text-gray-600 hover:text-[#30459D]"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={step === 4 ? handleSubmit : handleNext}
              disabled={loading}
              className={`ml-auto px-6 py-2 rounded-lg text-white transition-colors
                ${loading ? 'bg-gray-400' : 'bg-[#30459D] hover:bg-[#190D39]'}`}
            >
              {step === 4 ? (loading ? 'Submitting...' : 'Submit') : 'Next'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SurveyForm;