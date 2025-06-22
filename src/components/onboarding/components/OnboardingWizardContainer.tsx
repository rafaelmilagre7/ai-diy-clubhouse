
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { useOnboardingStorage } from '../hooks/useOnboardingStorage';
import { useOnboardingValidation } from '../hooks/useOnboardingValidation';
import { OnboardingData } from '../types/onboardingTypes';
import { getUserRoleName } from '@/lib/supabase/types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/utils/logger';

interface OnboardingWizardContainerProps {
  children: (props: {
    currentStep: number;
    isSubmitting: boolean;
    data: OnboardingData;
    isLoading: boolean;
    lastSaved: Date | null;
    hasUnsavedChanges: boolean;
    validationErrors: Array<{ field: string; message: string }>;
    getFieldError: (field: string) => string | undefined;
    handleNext: () => Promise<void>;
    handlePrevious: () => void;
    handleDataChange: (newData: Partial<OnboardingData>) => void;
    handleSubmit: () => Promise<void>;
    isCurrentStepValid: boolean;
    totalSteps: number;
  }) => React.ReactNode;
}

export const OnboardingWizardContainer: React.FC<OnboardingWizardContainerProps> = ({ children }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const roleName = getUserRoleName(profile);
  const memberType = roleName === 'formacao' ? 'formacao' : 'club';

  const initialData: OnboardingData = {
    name: profile?.name || '',
    email: profile?.email || user?.email || '',
    phone: (profile as any)?.phone || '',
    instagram: (profile as any)?.instagram || '',
    linkedin: (profile as any)?.linkedin || '',
    state: (profile as any)?.state || '',
    city: (profile as any)?.city || '',
    birthDate: (profile as any)?.birth_date || '',
    curiosity: (profile as any)?.curiosity || '',
    companyName: (profile as any)?.company_name || '',
    companyWebsite: (profile as any)?.company_website || '',
    businessSector: (profile as any)?.business_sector || '',
    companySize: (profile as any)?.company_size || '',
    annualRevenue: (profile as any)?.annual_revenue || '',
    position: (profile as any)?.position || '',
    hasImplementedAI: (profile as any)?.has_implemented_ai || 'nao',
    aiToolsUsed: (profile as any)?.ai_tools_used || [],
    aiKnowledgeLevel: (profile as any)?.ai_knowledge_level || '',
    dailyTools: (profile as any)?.daily_tools || [],
    whoWillImplement: (profile as any)?.who_will_implement || '',
    mainObjective: (profile as any)?.main_objective || '',
    areaToImpact: (profile as any)?.area_to_impact || '',
    expectedResult90Days: (profile as any)?.expected_result_90_days || '',
    aiImplementationBudget: (profile as any)?.ai_implementation_budget || '',
    weeklyLearningTime: (profile as any)?.weekly_learning_time || '',
    contentPreference: (profile as any)?.content_preference || [],
    wantsNetworking: (profile as any)?.wants_networking || 'nao',
    bestDays: (profile as any)?.best_days || [],
    bestPeriods: (profile as any)?.best_periods || [],
    acceptsCaseStudy: (profile as any)?.accepts_case_study || 'nao',
    memberType
  };

  const { data, updateData, forceSave } = useOnboardingStorage();
  const { validationErrors, validateStep, getFieldError } = useOnboardingValidation(data, currentStep, memberType);

  // Carregar dados ao inicializar
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        // Atualizar dados iniciais se necessário
        if (Object.keys(data).length === 1) { // Apenas memberType
          updateData(initialData);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados do onboarding:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const handleDataChange = useCallback((newData: Partial<OnboardingData>) => {
    updateData(newData);
    setHasUnsavedChanges(true);
  }, [updateData]);

  const isCurrentStepValid = validateStep(currentStep, data, memberType);

  const handleNext = useCallback(async () => {
    if (!isCurrentStepValid) {
      toast.error('Por favor, complete todos os campos obrigatórios antes de continuar.');
      return;
    }

    try {
      setIsSubmitting(true);
      await forceSave();
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      if (currentStep < 6) {
        setCurrentStep(prev => prev + 1);
      }
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast.error('Erro ao salvar seus dados. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isCurrentStepValid, forceSave, currentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);

      // Salvar dados finais
      const finalData = {
        ...data,
        completedAt: new Date().toISOString(),
        memberType
      };

      await forceSave();

      // Marcar onboarding como completado no perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (profileError) {
        throw profileError;
      }

      logger.info('Onboarding concluído com sucesso', {
        component: 'OnboardingWizardContainer',
        userId: user?.id,
        memberType
      });

      toast.success('Onboarding concluído com sucesso! Bem-vindo à plataforma.');
      
      // Redirecionar para o dashboard apropriado
      const redirectPath = memberType === 'formacao' ? '/formacao' : '/dashboard';
      navigate(redirectPath);

    } catch (error: any) {
      console.error('Erro ao finalizar onboarding:', error);
      logger.error('Erro ao finalizar onboarding', error, {
        component: 'OnboardingWizardContainer',
        userId: user?.id
      });
      toast.error('Erro ao finalizar onboarding. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, [data, forceSave, user?.id, memberType, navigate]);

  return children({
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
    totalSteps: 6
  });
};
