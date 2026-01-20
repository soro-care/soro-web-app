"use client";

import React, { useState } from 'react';
import { 
  ArrowRight, ArrowLeft, Check, Heart, Brain, Users, 
  Briefcase, Home, AlertCircle, CheckCircle, MessageCircle
} from 'lucide-react';
import { 
  SurveyData, ConcernID, ColorType, Concern, Step,
  AgeRange,
  Gender,
  Severity,
  YesNo,
  PreferredTime,
  ProfessionalGender,
  SessionFrequency
} from '@/types';

const ClientSurveyPage = () => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    age: '',
    gender: '',
    occupation: '',
    primaryConcerns: [],
    concernSeverity: '',
    previousTherapy: '',
    currentMedication: '',
    therapyGoals: [],
    sessionFrequency: '',
    preferredTime: '',
    professionalGender: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalConditions: '',
    additionalNotes: ''
  });

  const totalSteps = 4;

  const concerns: Concern[] = [
    { id: 'anxiety', label: 'Anxiety & Stress', icon: AlertCircle, color: 'blue' },
    { id: 'depression', label: 'Depression', icon: Heart, color: 'purple' },
    { id: 'relationships', label: 'Relationships', icon: Users, color: 'pink' },
    { id: 'trauma', label: 'Trauma/PTSD', icon: Brain, color: 'red' },
    { id: 'career', label: 'Career Issues', icon: Briefcase, color: 'green' },
    { id: 'family', label: 'Family Issues', icon: Home, color: 'orange' }
  ];

  const goals = [
    'Manage stress and anxiety',
    'Improve relationships',
    'Build self-confidence',
    'Process trauma',
    'Develop coping strategies',
    'Better work-life balance',
    'Overcome depression',
    'Improve communication skills'
  ];

  // const severityOptions: SeverityOption[] = [
  //   { value: 'mild', label: 'Mild', color: 'green' },
  //   { value: 'moderate', label: 'Moderate', color: 'yellow' },
  //   { value: 'severe', label: 'Severe', color: 'red' }
  // ];

  // const timeOptions: TimeOption[] = [
  //   { value: 'morning', label: 'Morning', icon: '🌅' },
  //   { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
  //   { value: 'evening', label: 'Evening', icon: '🌙' }
  // ];

  const handleInputChange = <K extends keyof SurveyData>(
    field: K, 
    value: SurveyData[K]
  ): void => {
    setSurveyData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (
    field: 'primaryConcerns' | 'therapyGoals', 
    item: ConcernID | string
  ): void => {
    setSurveyData(prev => {
      const array = prev[field] as Array<ConcernID | string>;
      if (array.includes(item)) {
        return { 
          ...prev, 
          [field]: array.filter(i => i !== item) as any 
        };
      } else {
        return { 
          ...prev, 
          [field]: [...array, item] as any 
        };
      }
    });
  };

  const handleNext = (): void => {
    if (currentStep < totalSteps) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleBack = (): void => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSubmit = (): void => {
    console.log('Survey submitted:', surveyData);
    alert('Survey submitted successfully! Redirecting to booking...');
  };

  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(surveyData.age && surveyData.gender && surveyData.occupation);
      case 2:
        return surveyData.primaryConcerns.length > 0 && !!surveyData.concernSeverity;
      case 3:
        return surveyData.therapyGoals.length > 0 && !!surveyData.sessionFrequency;
      case 4:
        return !!(surveyData.emergencyContact && surveyData.emergencyPhone);
      default:
        return false;
    }
  };

  const getColorClass = (color: ColorType): string => {
    const colors: Record<ColorType, string> = {
      blue: 'from-blue-500 to-cyan-600',
      purple: 'from-purple-500 to-indigo-600',
      pink: 'from-pink-500 to-rose-600',
      red: 'from-red-500 to-orange-600',
      green: 'from-green-500 to-emerald-600',
      orange: 'from-orange-500 to-amber-600',
      yellow: 'from-yellow-500 to-amber-600'
    };
    return colors[color] || colors.blue;
  };

  // const getSeverityColorClass = (color: ColorType, selected: boolean): string => {
  //   if (!selected) {
  //     return 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600';
  //   }
    
  //   const colorMap: Record<ColorType, string> = {
  //     green: 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600',
  //     yellow: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600',
  //     red: 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600',
  //     blue: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600',
  //     purple: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600',
  //     pink: 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-600',
  //     orange: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600'
  //   };
    
  //   return colorMap[color] || colorMap.red;
  // };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to SORO
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Help us understand your needs better
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-red-500 to-orange-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Survey Form */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 mb-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Let&apos;s start with the basics
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  This information helps us match you with the right professional
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Age Range *
                  </label>
                  <select
                    value={surveyData.age}
                    onChange={(e) => handleInputChange('age', e.target.value as AgeRange)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-20 transition-all"
                  >
                    <option value="">Select your age range</option>
                    <option value="18-24">18-24</option>
                    <option value="25-34">25-34</option>
                    <option value="35-44">35-44</option>
                    <option value="45-54">45-54</option>
                    <option value="55+">55+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Gender *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((gender) => (
                      <button
                        key={gender}
                        onClick={() => handleInputChange('gender', gender as Gender)}
                        className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                          surveyData.gender === gender
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Occupation *
                  </label>
                  <input
                    type="text"
                    value={surveyData.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    placeholder="e.g., Software Engineer, Teacher, Student"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-20 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Mental Health Concerns */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  What brings you here today?
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Select all areas you&apos;d like support with
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Primary Concerns * (Select all that apply)
                </label>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {concerns.map((concern) => {
                    const isSelected = surveyData.primaryConcerns.includes(concern.id);
                    return (
                      <button
                        key={concern.id}
                        onClick={() => toggleArrayItem('primaryConcerns', concern.id)}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          isSelected
                            ? 'border-red-500 bg-gradient-to-br ' + getColorClass(concern.color) + ' text-white shadow-lg scale-105'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <concern.icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                        <p className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                          {concern.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  How would you rate the severity of your concerns? *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'mild', label: 'Mild', color: 'green' },
                    { value: 'moderate', label: 'Moderate', color: 'yellow' },
                    { value: 'severe', label: 'Severe', color: 'red' }
                  ].map((severity) => (
                    <button
                      key={severity.value}
                      onClick={() => handleInputChange('concernSeverity', severity.value as Severity)}
                      className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                        surveyData.concernSeverity === severity.value
                          ? `border-${severity.color}-500 bg-${severity.color}-50 dark:bg-${severity.color}-900/20 text-${severity.color}-600`
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {severity.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Have you attended therapy before?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Yes', 'No'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleInputChange('previousTherapy', option as YesNo)}
                      className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                        surveyData.previousTherapy === option
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Are you currently taking any medication for mental health?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Yes', 'No'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleInputChange('currentMedication', option as YesNo)}
                      className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                        surveyData.currentMedication === option
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Goals & Preferences */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  What are your goals?
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Tell us what you hope to achieve through therapy
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Therapy Goals * (Select all that apply)
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {goals.map((goal) => {
                    const isSelected = surveyData.therapyGoals.includes(goal);
                    return (
                      <button
                        key={goal}
                        onClick={() => toggleArrayItem('therapyGoals', goal)}
                        className={`px-4 py-3 rounded-xl border-2 font-medium text-left transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-900 dark:text-white'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-red-500 bg-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        {goal}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Session Frequency *
                </label>
                <select
                  value={surveyData.sessionFrequency}
                  onChange={(e) => handleInputChange('sessionFrequency', e.target.value as SessionFrequency)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-20 transition-all"
                >
                  <option value="">Select frequency</option>
                  <option value="weekly">Once a week</option>
                  <option value="biweekly">Every two weeks</option>
                  <option value="monthly">Once a month</option>
                  <option value="asneeded">As needed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Time of Day
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'morning', label: 'Morning', icon: '🌅' },
                    { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
                    { value: 'evening', label: 'Evening', icon: '🌙' }
                  ].map((time) => (
                    <button
                      key={time.value}
                      onClick={() => handleInputChange('preferredTime', time.value as PreferredTime)}
                      className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                        surveyData.preferredTime === time.value
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <span className="text-2xl mb-1 block">{time.icon}</span>
                      {time.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Professional Gender Preference
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Male', 'Female', 'No preference'].map((pref) => (
                    <button
                      key={pref}
                      onClick={() => handleInputChange('professionalGender', pref as ProfessionalGender)}
                      className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                        surveyData.professionalGender === pref
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Emergency Contact & Additional Info */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Almost done!
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Just a few more details for your safety
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-900/30">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                      Emergency Contact Information
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      This information is kept confidential and will only be used in case of emergency
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Emergency Contact Name *
                  </label>
                  <input
                    type="text"
                    value={surveyData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    placeholder="Full name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Emergency Contact Phone *
                  </label>
                  <input
                    type="tel"
                    value={surveyData.emergencyPhone}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                    placeholder="+1 (234) 567-8900"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Medical Conditions (Optional)
                  </label>
                  <textarea
                    value={surveyData.medicalConditions}
                    onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                    placeholder="Any medical conditions we should be aware of..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-20 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={surveyData.additionalNotes}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                    placeholder="Anything else you'd like your therapist to know..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-20 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-900/30">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-300 mb-1">
                      Your information is secure
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      All data is encrypted and complies with HIPAA privacy regulations
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isStepValid()}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-5 h-5" />
              Complete Survey
            </button>
          )}
        </div>

        {/* Privacy Notice */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          By submitting this survey, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default ClientSurveyPage;