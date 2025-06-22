
import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStorage } from '../hooks/useOnboardingStorage';
import { useOnboardingValidation } from '../hooks/useOnboardingValidation';
import { OnboardingData } from '../types/onboardingTypes';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface OnboardingWizardContextType {
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
}

const OnboardingWizardContext = createContext<OnboardingWizardContextType | null>(null);

export const useOnboardingWizard = () => {
  const context = useContext(OnboardingWizardContext);
  if (!context) {
    throw new Error('useOnboardingWizard must be used within OnboardingWizardContainer');
  }
  return context;
};

interface OnboardingWizardContainerProps {
  children: (context: OnboardingWizardContextType) => ReactNode;
}

export const OnboardingWizardContainer: React.FC<OnboardingWizardContainerProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const totalSteps = 6;
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    data,
    updateData,
    forceSave,
    isLoading,
    hasUnsavedChanges,
    lastSaved
  } = useOnboardingStorage();

  const { 
    validationErrors, 
    getFieldError, 
    validateStep 
  } = useOnboardingValidation();

  const handleNext = useCallback(async (): Promise<void> => {
    if (currentStep < totalSteps) {
      await forceSave();
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps, forceSave]);

  const handlePrevious = useCallback(async (): Promise<void> => {
    if (currentStep > 1) {
      await forceSave();
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep, forceSave]);

  const handleDataChange = useCallback((newData: Partial<OnboardingData>): void => {
    updateData(newData);
  }, [updateData]);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (isSubmitting || !user?.id) return;
    
    try {
      setIsSubmitting(true);
      
      console.log('[OnboardingWizard] Iniciando finalização do onboarding');
      
      // 1. Salvar dados locais primeiro
      await forceSave();
      
      // 2. Salvar dados na tabela user_onboarding
      const onboardingRecord = {
        user_id: user.id,
        name: data.name || '',
        email: data.email || user.email || '',
        phone: data.phone || '',
        instagram: data.instagram || '',
        linkedin: data.linkedin || '',
        state: data.state || '',
        city: data.city || '',
        birth_date: data.birthDate || null,
        curiosity: data.curiosity || '',
        company_name: data.companyName || '',
        company_website: data.companyWebsite || '',
        business_sector: data.businessSector || '',
        company_size: data.companySize || '',
        annual_revenue: data.annualRevenue || '',
        position: data.position || '',
        has_implemented_ai: data.hasImplementedAI || '',
        ai_tools_used: data.aiToolsUsed || [],
        ai_knowledge_level: data.aiKnowledgeLevel || '',
        daily_tools: data.dailyTools || [],
        who_will_implement: data.whoWillImplement || '',
        main_objective: data.mainObjective || '',
        area_to_impact: data.areaToImpact || '',
        expected_result_90_days: data.expectedResult90Days || '',
        ai_implementation_budget: data.aiImplementationBudget || '',
        weekly_learning_time: data.weeklyLearningTime || '',
        content_preference: data.contentPreference || [],
        wants_networking: data.wantsNetworking || '',
        best_days: data.bestDays || [],
        best_periods: data.bestPeriods || [],
        accepts_case_study: data.acceptsCaseStudy || '',
        member_type: data.memberType || 'club',
        completed_at: new Date().toISOString(),
        started_at: data.startedAt || new Date().toISOString()
      };

      // Salvar na tabela user_onboarding
      const { error: saveError } = await supabase
        .from('user_onboarding')
        .upsert(onboardingRecord as any, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (saveError) {
        console.error('[OnboardingWizard] Erro ao salvar onboarding:', saveError);
        throw new Error(`Erro ao salvar onboarding: ${saveError.message}`);
      }

      console.log('[OnboardingWizard] Onboarding salvo com sucesso na user_onboarding');

      // 3. CRÍTICO: Atualizar profiles.onboarding_completed = true
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileUpdateError) {
        console.error('[OnboardingWizard] Erro ao atualizar profile:', profileUpdateError);
        throw new Error(`Erro ao atualizar perfil: ${profileUpdateError.message}`);
      }

      console.log('[OnboardingWizard] Profile atualizado com onboarding_completed = true');

      // 4. Mostrar mensagem de sucesso
      toast({
        title: "Onboarding Concluído! 🎉",
        description: "Seus dados foram salvos com sucesso. Redirecionando...",
      });

      // 5. Aguardar um pouco antes de redirecionar
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('[OnboardingWizard] Redirecionando usuário');
      
      // 6. Redirecionar baseado no tipo de membro
      const userRole = profile?.user_roles?.name;
      let redirectPath = '/dashboard';
      
      if (userRole === 'formacao') {
        redirectPath = '/formacao';
      }
      
      console.log('[OnboardingWizard] Redirecionando para:', redirectPath);
      navigate(redirectPath, { replace: true });
      
    } catch (error) {
      console.error('[OnboardingWizard] Erro ao finalizar onboarding:', error);
      toast({
        title: "Erro ao finalizar onboarding",
        description: "Ocorreu um erro ao salvar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, user?.id, profile?.user_roles?.name, forceSave, navigate, data]);

  const isCurrentStepValid = React.useMemo(() => {
    return validateStep(currentStep, data, 'club');
  }, [validateStep, currentStep, data]);

  const contextValue: OnboardingWizardContextType = React.useMemo(() => ({
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
    totalSteps
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
    totalSteps
  ]);

  return (
    <OnboardingWizardContext.Provider value={contextValue}>
      {children(contextValue)}
    </OnboardingWizardContext.Provider>
  );
};

export default OnboardingWizardContainer;
