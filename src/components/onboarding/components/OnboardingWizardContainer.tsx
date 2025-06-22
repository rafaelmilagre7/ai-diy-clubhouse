
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { OnboardingData } from '../types/onboardingTypes';
import { useOnboardingData } from '@/hooks/useOnboardingData';
import { getUserRoleName } from '@/lib/supabase/types';

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
  const { user, profile, setProfile } = useAuth();
  const navigate = useNavigate();
  const { data: savedData, isLoading: loadingData } = useOnboardingData();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Array<{ field: string; message: string }>>([]);

  const totalSteps = 6;
  const memberType = getUserRoleName(profile) === 'formacao' ? 'formacao' : 'club';

  // Inicializar dados do onboarding
  const [data, setData] = useState<OnboardingData>({
    // Dados pessoais básicos
    name: '',
    email: user?.email || '',
    phone: '',
    instagram: '',
    linkedin: '',
    state: '',
    city: '',
    birthDate: '',
    curiosity: '',
    
    // Dados empresariais
    companyName: '',
    companyWebsite: '',
    businessSector: '',
    companySize: '',
    annualRevenue: '',
    position: '',
    
    // Maturidade em IA
    hasImplementedAI: false,
    aiToolsUsed: [],
    aiKnowledgeLevel: 'beginner',
    dailyTools: [],
    whoWillImplement: '',
    
    // Objetivos
    mainObjective: '',
    areaToImpact: '',
    expectedResult90Days: '',
    aiImplementationBudget: '',
    
    // Preferências
    weeklyLearningTime: '',
    contentPreference: '',
    wantsNetworking: false,
    bestDays: [],
    bestPeriods: [],
    acceptsCaseStudy: false,
    
    // Metadados
    memberType,
    startedAt: new Date().toISOString(),
    completedAt: null
  });

  // Carregar dados salvos quando disponíveis
  useEffect(() => {
    if (savedData && !hasUnsavedChanges) {
      console.log('[OnboardingWizardContainer] Carregando dados salvos:', savedData);
      setData(savedData);
      setLastSaved(new Date());
    }
  }, [savedData, hasUnsavedChanges]);

  // Salvar progresso automaticamente
  const saveProgress = useCallback(async (currentData: OnboardingData) => {
    if (!user?.id) {
      console.error('[OnboardingWizardContainer] Usuário não encontrado para salvar progresso');
      return;
    }

    try {
      console.log('[OnboardingWizardContainer] Salvando progresso:', currentData);

      const { error } = await supabase
        .from('user_onboarding')
        .upsert({
          user_id: user.id,
          name: currentData.name,
          email: currentData.email,
          phone: currentData.phone,
          instagram: currentData.instagram,
          linkedin: currentData.linkedin,
          state: currentData.state,
          city: currentData.city,
          birth_date: currentData.birthDate,
          curiosity: currentData.curiosity,
          company_name: currentData.companyName,
          company_website: currentData.companyWebsite,
          business_sector: currentData.businessSector,
          company_size: currentData.companySize,
          annual_revenue: currentData.annualRevenue,
          position: currentData.position,
          has_implemented_ai: currentData.hasImplementedAI,
          ai_tools_used: currentData.aiToolsUsed,
          ai_knowledge_level: currentData.aiKnowledgeLevel,
          daily_tools: currentData.dailyTools,
          who_will_implement: currentData.whoWillImplement,
          main_objective: currentData.mainObjective,
          area_to_impact: currentData.areaToImpact,
          expected_result_90_days: currentData.expectedResult90Days,
          ai_implementation_budget: currentData.aiImplementationBudget,
          weekly_learning_time: currentData.weeklyLearningTime,
          content_preference: currentData.contentPreference,
          wants_networking: currentData.wantsNetworking,
          best_days: currentData.bestDays,
          best_periods: currentData.bestPeriods,
          accepts_case_study: currentData.acceptsCaseStudy,
          member_type: currentData.memberType,
          started_at: currentData.startedAt,
          completed_at: currentData.completedAt,
          updated_at: new Date().toISOString() // CORREÇÃO: era updatedCAt
        });

      if (error) {
        console.error('[OnboardingWizardContainer] Erro ao salvar progresso:', error);
        toast.error('Erro ao salvar progresso');
        return;
      }

      console.log('[OnboardingWizardContainer] Progresso salvo com sucesso');
      setLastSaved(new Date());
      setHasUnsavedChanges(false);

    } catch (error) {
      console.error('[OnboardingWizardContainer] Erro inesperado ao salvar:', error);
      toast.error('Erro inesperado ao salvar progresso');
    }
  }, [user?.id]);

  // Validação por etapa
  const validateCurrentStep = useCallback(() => {
    const errors: Array<{ field: string; message: string }> = [];

    switch (currentStep) {
      case 1: // Informações Pessoais
        if (!data.name?.trim()) errors.push({ field: 'name', message: 'Nome é obrigatório' });
        if (!data.email?.trim()) errors.push({ field: 'email', message: 'Email é obrigatório' });
        if (!data.state?.trim()) errors.push({ field: 'state', message: 'Estado é obrigatório' });
        if (!data.city?.trim()) errors.push({ field: 'city', message: 'Cidade é obrigatória' });
        break;
      
      case 2: // Perfil Empresarial
        if (memberType === 'formacao') {
          if (!data.companyName?.trim()) errors.push({ field: 'companyName', message: 'Nome da empresa é obrigatório' });
          if (!data.position?.trim()) errors.push({ field: 'position', message: 'Cargo é obrigatório' });
        }
        break;
      
      case 3: // Maturidade em IA
        if (!data.aiKnowledgeLevel) errors.push({ field: 'aiKnowledgeLevel', message: 'Nível de conhecimento é obrigatório' });
        break;
      
      case 4: // Objetivos
        if (!data.mainObjective?.trim()) errors.push({ field: 'mainObjective', message: 'Objetivo principal é obrigatório' });
        break;
      
      case 5: // Preferências
        if (!data.weeklyLearningTime) errors.push({ field: 'weeklyLearningTime', message: 'Tempo de aprendizado é obrigatório' });
        break;
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [currentStep, data, memberType]);

  const getFieldError = useCallback((field: string) => {
    const error = validationErrors.find(e => e.field === field);
    return error?.message;
  }, [validationErrors]);

  const handleDataChange = useCallback((newData: Partial<OnboardingData>) => {
    console.log('[OnboardingWizardContainer] Atualizando dados:', newData);
    setData(prev => ({ ...prev, ...newData }));
    setHasUnsavedChanges(true);
  }, []);

  const handleNext = useCallback(async () => {
    console.log('[OnboardingWizardContainer] Tentando avançar para próxima etapa');
    
    if (!validateCurrentStep()) {
      console.log('[OnboardingWizardContainer] Validação falhou');
      toast.error('Complete todos os campos obrigatórios');
      return;
    }

    // Salvar progresso antes de avançar
    await saveProgress(data);
    
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      console.log('[OnboardingWizardContainer] Avançando para etapa:', currentStep + 1);
    }
  }, [currentStep, totalSteps, validateCurrentStep, saveProgress, data]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      console.log('[OnboardingWizardContainer] Retornando para etapa:', currentStep - 1);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    console.log('[OnboardingWizardContainer] Iniciando finalização do onboarding');
    
    if (!user?.id) {
      toast.error('Usuário não identificado');
      return;
    }

    setIsSubmitting(true);

    try {
      // Marcar onboarding como completado
      const completedData = {
        ...data,
        completedAt: new Date().toISOString()
      };

      // Salvar dados finais na tabela user_onboarding
      const { error: onboardingError } = await supabase
        .from('user_onboarding')
        .upsert({
          user_id: user.id,
          name: completedData.name,
          email: completedData.email,
          phone: completedData.phone,
          instagram: completedData.instagram,
          linkedin: completedData.linkedin,
          state: completedData.state,
          city: completedData.city,
          birth_date: completedData.birthDate,
          curiosity: completedData.curiosity,
          company_name: completedData.companyName,
          company_website: completedData.companyWebsite,
          business_sector: completedData.businessSector,
          company_size: completedData.companySize,
          annual_revenue: completedData.annualRevenue,
          position: completedData.position,
          has_implemented_ai: completedData.hasImplementedAI,
          ai_tools_used: completedData.aiToolsUsed,
          ai_knowledge_level: completedData.aiKnowledgeLevel,
          daily_tools: completedData.dailyTools,
          who_will_implement: completedData.whoWillImplement,
          main_objective: completedData.mainObjective,
          area_to_impact: completedData.areaToImpact,
          expected_result_90_days: completedData.expectedResult90Days,
          ai_implementation_budget: completedData.aiImplementationBudget,
          weekly_learning_time: completedData.weeklyLearningTime,
          content_preference: completedData.contentPreference,
          wants_networking: completedData.wantsNetworking,
          best_days: completedData.bestDays,
          best_periods: completedData.bestPeriods,
          accepts_case_study: completedData.acceptsCaseStudy,
          member_type: completedData.memberType,
          started_at: completedData.startedAt,
          completed_at: completedData.completedAt,
          updated_at: new Date().toISOString()
        });

      if (onboardingError) {
        console.error('[OnboardingWizardContainer] Erro ao salvar dados do onboarding:', onboardingError);
        throw onboardingError;
      }

      // Atualizar o campo onboarding_completed no perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('[OnboardingWizardContainer] Erro ao atualizar perfil:', profileError);
        throw profileError;
      }

      // Atualizar profile no contexto
      if (profile) {
        setProfile({
          ...profile,
          onboarding_completed: true
        });
      }

      console.log('[OnboardingWizardContainer] Onboarding finalizado com sucesso');
      toast.success('Onboarding concluído com sucesso!');

      // Redirecionar para dashboard apropriado
      const redirectPath = memberType === 'formacao' ? '/formacao' : '/dashboard';
      navigate(redirectPath, { replace: true });

    } catch (error: any) {
      console.error('[OnboardingWizardContainer] Erro ao finalizar onboarding:', error);
      toast.error(`Erro ao finalizar onboarding: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id, data, profile, setProfile, navigate, memberType]);

  // Validar etapa atual
  const isCurrentStepValid = validateCurrentStep();

  if (loadingData) {
    return null; // O componente pai já mostra loading
  }

  return (
    <>
      {children({
        currentStep,
        isSubmitting,
        data,
        isLoading: loadingData,
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
      })}
    </>
  );
};
