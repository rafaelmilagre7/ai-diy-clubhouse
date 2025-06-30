
import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { OnboardingWizardContainer } from '@/components/onboarding/components/OnboardingWizardContainer';
import { OnboardingStepRenderer } from '@/components/onboarding/components/OnboardingStepRenderer';
import { OnboardingWizardControls } from '@/components/onboarding/components/OnboardingWizardControls';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';
import { useOnboardingValidation } from '@/components/onboarding/hooks/useOnboardingValidation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

const stepTitles = [
  'Informações Pessoais',
  'Perfil Empresarial', 
  'Maturidade em IA',
  'Objetivos e Expectativas',
  'Personalização da Experiência',
  'Finalização'
];

interface MockOnboardingContextType {
  currentStep: number;
  isSubmitting: boolean;
  data: OnboardingData;
  isLoading: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  validationErrors: Array<{ field: string; message: string }>;
  getFieldError: (field: string) => string | undefined;
  handleNext: () => Promise<void>;
  handlePrevious: () => Promise<void>;
  handleDataChange: (newData: Partial<OnboardingData>) => void;
  handleSubmit: () => Promise<void>;
  isCurrentStepValid: boolean;
  totalSteps: number;
  // Mock specific methods
  resetData: () => void;
  setCurrentStep: (step: number) => void;
  simulateLoading: (duration?: number) => void;
  simulateError: () => void;
}

const MockOnboardingContext = createContext<MockOnboardingContextType | null>(null);

export const useMockOnboarding = () => {
  const context = useContext(MockOnboardingContext);
  if (!context) {
    throw new Error('useMockOnboarding must be used within MockOnboardingWizardContainer');
  }
  return context;
};

const STORAGE_KEY = 'admin-onboarding-preview-data';

export const MockOnboardingWizardContainer: React.FC = () => {
  const totalSteps = 6;
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [simulatedError, setSimulatedError] = useState(false);

  // Initialize data from localStorage or defaults
  const [data, setData] = useState<OnboardingData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Erro ao carregar dados do localStorage:', error);
    }
    
    return {
      memberType: 'club',
      startedAt: new Date().toISOString(),
      name: '',
      email: '',
      phone: '',
      state: '',
      city: '',
      companyName: '',
      businessSector: '',
      companySize: '',
      position: '',
      hasImplementedAI: '',
      aiKnowledgeLevel: '',
      mainObjective: '',
      weeklyLearningTime: '',
      wantsNetworking: '',
      acceptsCaseStudy: ''
    };
  });

  const { 
    validationErrors, 
    getFieldError, 
    validateStep 
  } = useOnboardingValidation();

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setLastSaved(new Date());
    setHasUnsavedChanges(false);
  }, [data]);

  const handleDataChange = useCallback((newData: Partial<OnboardingData>): void => {
    setData(prev => ({ ...prev, ...newData }));
    setHasUnsavedChanges(true);
  }, []);

  const handleNext = useCallback(async (): Promise<void> => {
    if (currentStep < totalSteps) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate save
      setCurrentStep(prev => prev + 1);
      setIsLoading(false);
    }
  }, [currentStep, totalSteps]);

  const handlePrevious = useCallback(async (): Promise<void> => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      console.log('[MockOnboarding] Simulando finalização do onboarding');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (simulatedError) {
        throw new Error('Erro simulado para teste');
      }
      
      console.log('[MockOnboarding] Onboarding finalizado (simulado)');
      alert('🎉 Onboarding finalizado com sucesso! (Simulação)');
      
    } catch (error) {
      console.error('[MockOnboarding] Erro simulado:', error);
      alert('❌ Erro ao finalizar onboarding (simulado)');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, simulatedError]);

  // Mock specific methods
  const resetData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentStep(1);
    setData({
      memberType: 'club',
      startedAt: new Date().toISOString(),
      name: '',
      email: '',
      phone: '',
      state: '',
      city: '',
      companyName: '',
      businessSector: '',
      companySize: '',
      position: '',
      hasImplementedAI: '',
      aiKnowledgeLevel: '',
      mainObjective: '',
      weeklyLearningTime: '',
      wantsNetworking: '',
      acceptsCaseStudy: ''
    });
    setHasUnsavedChanges(false);
    setSimulatedError(false);
  }, []);

  const simulateLoading = useCallback((duration: number = 2000) => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), duration);
  }, []);

  const simulateError = useCallback(() => {
    setSimulatedError(prev => !prev);
  }, []);

  const isCurrentStepValid = React.useMemo(() => {
    return validateStep(currentStep, data, 'club');
  }, [validateStep, currentStep, data]);

  const contextValue: MockOnboardingContextType = React.useMemo(() => ({
    currentStep,
    isSubmitting,
    data,
    isLoading,
    lastSaved,
    hasUnsavedChanges,
    validationErrors,
    getFieldError,
    handleNext,
    handlePrevious,
    handleDataChange,
    handleSubmit,
    isCurrentStepValid,
    totalSteps,
    resetData,
    setCurrentStep,
    simulateLoading,
    simulateError
  }), [
    currentStep,
    isSubmitting,
    data,
    isLoading,
    lastSaved,
    hasUnsavedChanges,
    validationErrors,
    getFieldError,
    handleNext,
    handlePrevious,
    handleDataChange,
    handleSubmit,
    isCurrentStepValid,
    totalSteps,
    resetData,
    simulateLoading,
    simulateError
  ]);

  if (isLoading) {
    return (
      <div className="min-h-[600px] bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue mx-auto mb-4"></div>
          <p className="text-slate-300">Carregando preview...</p>
        </div>
      </div>
    );
  }

  return (
    <MockOnboardingContext.Provider value={contextValue}>
      <div className="min-h-[600px] bg-gradient-to-br from-[#0F111A] to-[#151823] p-6">
        <div className="max-w-4xl mx-auto">
          {/* Mock indicator */}
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
              <AlertCircle className="h-3 w-3 mr-1" />
              Modo Simulação
            </Badge>
            {simulatedError && (
              <Badge variant="destructive">
                Erro Simulado Ativo
              </Badge>
            )}
          </div>
          
          <OnboardingProgress 
            currentStep={currentStep} 
            totalSteps={totalSteps}
            stepTitles={stepTitles}
          />
          
          <Card className="mt-8 p-8 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
            <OnboardingStepRenderer
              currentStep={currentStep}
              data={data}
              onUpdateData={handleDataChange}
              onNext={handleNext}
              onPrev={handlePrevious}
              onComplete={handleSubmit}
              memberType={data.memberType || 'club'}
              validationErrors={validationErrors}
              getFieldError={getFieldError}
              isCompleting={isSubmitting}
            />
            
            {currentStep < totalSteps && (
              <OnboardingWizardControls
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNext={handleNext}
                onPrev={handlePrevious}
                canProceed={isCurrentStepValid}
                isLoading={isSubmitting}
                hasUnsavedChanges={hasUnsavedChanges}
                lastSaved={lastSaved}
                syncStatus={{
                  isSyncing: false,
                  lastSyncTime: lastSaved?.toISOString() || '',
                  syncError: ''
                }}
              />
            )}
          </Card>
        </div>
      </div>
    </MockOnboardingContext.Provider>
  );
};
