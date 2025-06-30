
import React, { createContext, useContext, useState, useEffect } from 'react';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';

interface MockOnboardingContextType {
  currentStep: number;
  totalSteps: number;
  data: OnboardingData;
  isLoading: boolean;
  hasError: boolean;
  validationErrors: Array<{ field: string; message: string }>;
  setCurrentStep: (step: number) => void;
  updateData: (newData: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  simulateError: () => void;
  toggleLoading: () => void;
  getFieldError: (field: string) => string | undefined;
}

const MockOnboardingContext = createContext<MockOnboardingContextType | null>(null);

export const useMockOnboarding = () => {
  const context = useContext(MockOnboardingContext);
  if (!context) {
    throw new Error('useMockOnboarding must be used within MockOnboardingWizardContainer');
  }
  return context;
};

const initialData: OnboardingData = {
  memberType: 'club',
  name: '',
  email: '',
  phone: '',
  instagram: '',
  linkedin: '',
  state: '',
  city: '',
  birthDate: '',
  curiosity: '',
  profilePicture: '',
  companyName: '',
  companyWebsite: '',
  businessSector: '',
  companySize: '',
  annualRevenue: '',
  position: '',
  hasImplementedAI: '',
  aiToolsUsed: [],
  aiKnowledgeLevel: '',
  dailyTools: [],
  whoWillImplement: '',
  mainObjective: '',
  areaToImpact: '',
  expectedResult90Days: '',
  aiImplementationBudget: '',
  weeklyLearningTime: '',
  contentPreference: [],
  wantsNetworking: '',
  bestDays: [],
  bestPeriods: [],
  acceptsCaseStudy: ''
};

interface MockOnboardingWizardContainerProps {
  children: React.ReactNode;
}

export const MockOnboardingWizardContainer: React.FC<MockOnboardingWizardContainerProps> = ({
  children
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Array<{ field: string; message: string }>>([]);
  
  const totalSteps = 6;

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('mock-onboarding-data');
    const savedStep = localStorage.getItem('mock-onboarding-step');
    
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (e) {
        console.warn('Failed to parse saved onboarding data');
      }
    }
    
    if (savedStep) {
      setCurrentStep(parseInt(savedStep, 10) || 1);
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('mock-onboarding-data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('mock-onboarding-step', currentStep.toString());
  }, [currentStep]);

  const updateData = (newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
    setHasError(false); // Clear errors when data updates
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const reset = () => {
    setCurrentStep(1);
    setData(initialData);
    setIsLoading(false);
    setHasError(false);
    setValidationErrors([]);
    localStorage.removeItem('mock-onboarding-data');
    localStorage.removeItem('mock-onboarding-step');
  };

  const simulateError = () => {
    setHasError(!hasError);
    if (!hasError) {
      setValidationErrors([
        { field: 'name', message: 'Erro simulado: Nome é obrigatório' },
        { field: 'email', message: 'Erro simulado: Email inválido' }
      ]);
    } else {
      setValidationErrors([]);
    }
  };

  const toggleLoading = () => {
    setIsLoading(!isLoading);
  };

  const getFieldError = (field: string): string | undefined => {
    const error = validationErrors.find(err => err.field === field);
    return error?.message;
  };

  const contextValue: MockOnboardingContextType = {
    currentStep,
    totalSteps,
    data,
    isLoading,
    hasError,
    validationErrors,
    setCurrentStep,
    updateData,
    nextStep,
    prevStep,
    reset,
    simulateError,
    toggleLoading,
    getFieldError
  };

  return (
    <MockOnboardingContext.Provider value={contextValue}>
      {children}
    </MockOnboardingContext.Provider>
  );
};
