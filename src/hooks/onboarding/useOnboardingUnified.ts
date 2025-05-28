
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { OnboardingProgress } from '@/types/onboarding';
import { useOnboardingCache } from './useOnboardingCache';
import { validatePartialData, sanitizeOnboardingData } from '@/lib/validation/onboardingSchemas';
import { toast } from 'sonner';

interface OnboardingState {
  name: string;
  email: string;
  company_name: string;
  main_goal: string;
  ai_knowledge_level: string;
  desired_ai_areas: string[];
  has_implemented: string;
  previous_tools: string[];
}

export const useOnboardingUnified = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getCachedProgress, setCachedProgress, invalidateUserCache } = useOnboardingCache();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingState>({
    name: '',
    email: '',
    company_name: '',
    main_goal: '',
    ai_knowledge_level: '',
    desired_ai_areas: [],
    has_implemented: '',
    previous_tools: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const totalSteps = 4;
  const loadingRef = useRef(false);

  // Carregar dados existentes
  const loadExistingData = useCallback(async () => {
    if (!user?.id || loadingRef.current) return;
    
    loadingRef.current = true;
    setIsLoading(true);
    setLoadError(null);

    try {
      // Tentar cache primeiro
      const cachedData = getCachedProgress(user.id);
      if (cachedData) {
        console.log('📦 Dados carregados do cache');
        populateFromProgress(cachedData);
        setHasExistingData(true);
        setIsLoading(false);
        loadingRef.current = false;
        return;
      }

      // Buscar do banco
      const { data: progress, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (progress) {
        console.log('🗄️ Dados carregados do banco');
        populateFromProgress(progress);
        setCachedProgress(user.id, progress);
        setHasExistingData(true);
      } else {
        console.log('📝 Nenhum progresso encontrado, iniciando novo');
        setHasExistingData(false);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      setLoadError('Erro ao carregar dados anteriores');
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [user?.id, getCachedProgress, setCachedProgress]);

  // Popular estado com dados do progresso
  const populateFromProgress = (progress: OnboardingProgress) => {
    const newData: OnboardingState = {
      name: progress.personal_info?.name || '',
      email: progress.personal_info?.email || '',
      company_name: progress.professional_info?.company_name || '',
      main_goal: progress.business_goals?.primary_goal || '',
      ai_knowledge_level: progress.ai_experience?.knowledge_level || '',
      desired_ai_areas: progress.ai_experience?.desired_ai_areas || [],
      has_implemented: progress.ai_experience?.has_implemented || '',
      previous_tools: progress.ai_experience?.previous_tools || []
    };
    
    setData(newData);
  };

  // Atualizar campo específico
  const updateField = useCallback((field: keyof OnboardingState, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Validar etapa atual
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return data.name.trim() && data.email.trim();
      case 2:
        return data.company_name.trim() && data.main_goal.trim();
      case 3:
        return data.ai_knowledge_level && data.desired_ai_areas.length > 0 && data.has_implemented;
      case 4:
        return true;
      default:
        return false;
    }
  }, [currentStep, data]);

  // Avançar para próxima etapa
  const nextStep = useCallback(async () => {
    if (!canProceed()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Validar dados da etapa atual
      let stepData;
      let stepKey;
      
      if (currentStep === 1) {
        stepKey = 'personal_info';
        stepData = { name: data.name, email: data.email };
      } else if (currentStep === 2) {
        stepKey = 'professional_info';
        stepData = { company_name: data.company_name, main_goal: data.main_goal };
      } else if (currentStep === 3) {
        stepKey = 'ai_experience';
        stepData = {
          ai_knowledge_level: data.ai_knowledge_level,
          desired_ai_areas: data.desired_ai_areas,
          has_implemented: data.has_implemented,
          previous_tools: data.previous_tools
        };
      }

      if (stepData && stepKey) {
        const validation = validatePartialData(stepData, stepKey);
        if (!validation.success) {
          toast.error(validation.error);
          return;
        }
      }

      // Salvar progresso no banco
      await saveCurrentProgress();
      
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      }
    } catch (error) {
      console.error('Erro ao avançar etapa:', error);
      toast.error('Erro ao salvar progresso');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentStep, data, canProceed]);

  // Voltar etapa anterior
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Salvar progresso atual
  const saveCurrentProgress = useCallback(async () => {
    if (!user?.id) return;

    const sanitizedData = sanitizeOnboardingData({
      personal_info: {
        name: data.name,
        email: data.email
      },
      professional_info: {
        company_name: data.company_name
      },
      business_goals: {
        primary_goal: data.main_goal
      },
      ai_experience: {
        knowledge_level: data.ai_knowledge_level,
        desired_ai_areas: data.desired_ai_areas,
        has_implemented: data.has_implemented,
        previous_tools: data.previous_tools
      }
    });

    const progressData = {
      user_id: user.id,
      current_step: `step_${currentStep}`,
      completed_steps: Array.from({ length: currentStep }, (_, i) => `step_${i + 1}`),
      is_completed: currentStep === totalSteps,
      ...sanitizedData,
      updated_at: new Date().toISOString()
    };

    const { data: result, error } = await supabase
      .from('onboarding_progress')
      .upsert(progressData, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;

    // Atualizar cache
    if (result) {
      setCachedProgress(user.id, result);
    }
  }, [user?.id, data, currentStep, setCachedProgress]);

  // Completar onboarding
  const completeOnboarding = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      await saveCurrentProgress();
      
      // Invalidar cache para forçar reload
      if (user?.id) {
        invalidateUserCache(user.id);
      }
      
      toast.success('Onboarding concluído com sucesso!');
      navigate('/onboarding-new/completed');
      return true;
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      toast.error('Erro ao finalizar onboarding');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [saveCurrentProgress, navigate, user?.id, invalidateUserCache]);

  // Carregar dados na inicialização
  useEffect(() => {
    if (user?.id) {
      loadExistingData();
    }
  }, [user?.id, loadExistingData]);

  return {
    currentStep,
    data,
    updateField,
    nextStep,
    previousStep,
    canProceed: canProceed(),
    isSubmitting,
    completeOnboarding,
    totalSteps,
    isLoading,
    hasExistingData,
    loadError
  };
};
