
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
  name: 'Ana Silva Demo',
  email: 'ana.silva.demo@exemplo.com',
  phone: '(11) 99888-7766',
  instagram: '@anasilva.tech',
  linkedin: 'https://linkedin.com/in/anasilva',
  state: 'São Paulo',
  city: 'São Paulo',
  birthDate: '1985-03-15',
  curiosity: 'Apaixonada por tecnologia e inovação, sempre buscando aprender sobre IA.',
  profilePicture: '',
  companyName: 'TechNova Solutions',
  companyWebsite: 'https://technova.com.br',
  businessSector: 'Tecnologia',
  companySize: '11-50',
  annualRevenue: '500k-1m',
  position: 'Diretora de Tecnologia',
  hasImplementedAI: 'yes',
  aiToolsUsed: ['ChatGPT', 'Google Bard'],
  aiKnowledgeLevel: 'intermediate',
  dailyTools: ['Excel', 'PowerBI', 'Slack'],
  whoWillImplement: 'team',
  mainObjective: 'automate',
  areaToImpact: 'Atendimento ao Cliente',
  expectedResult90Days: 'Reduzir em 50% o tempo de resposta aos clientes',
  aiImplementationBudget: '10k-25k',
  weeklyLearningTime: '3-5',
  contentPreference: ['videos', 'exercises'],
  wantsNetworking: 'yes',
  bestDays: ['tuesday', 'thursday'],
  bestPeriods: ['morning', 'evening'],
  acceptsCaseStudy: 'yes'
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
        const parsedData = JSON.parse(savedData);
        // Merge with initialData to ensure all demo fields are present
        setData({ ...initialData, ...parsedData });
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
