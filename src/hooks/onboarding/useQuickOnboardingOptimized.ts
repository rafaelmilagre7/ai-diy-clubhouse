
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { useQuickOnboardingAutoSave } from './useQuickOnboardingAutoSave';
import { useOnboardingValidation } from './useOnboardingValidation';
import { toast } from 'sonner';

interface UseQuickOnboardingOptimizedReturn {
  currentStep: number;
  data: QuickOnboardingData;
  updateField: (field: string, value: any) => void;
  nextStep: () => void;
  previousStep: () => void;
  canProceed: () => boolean;
  isLoading: boolean;
  hasExistingData: boolean;
  loadError: string | null;
  totalSteps: number;
  isSaving: boolean;
  lastSaveTime: number | null;
  completeOnboarding: () => Promise<boolean>;
  isCompleted: boolean;
  retryCount: number;
  canFinalize: () => boolean;
}

const TOTAL_STEPS = 4;

export const useQuickOnboardingOptimized = (): UseQuickOnboardingOptimizedReturn => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<QuickOnboardingData>({
    name: '',
    email: user?.email || '',
    whatsapp: '',
    country_code: '+55',
    birth_date: '',
    instagram_url: '',
    linkedin_url: '',
    how_found_us: '',
    referred_by: '',
    company_name: '',
    role: '',
    company_size: '',
    company_segment: '',
    company_website: '',
    annual_revenue_range: '',
    main_challenge: '',
    ai_knowledge_level: '',
    uses_ai: '',
    main_goal: '',
    desired_ai_areas: [],
    has_implemented: '',
    previous_tools: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [finalizeValidation, setFinalizeValidation] = useState(false);
  
  const completionInProgressRef = useRef(false);
  
  const { validateStep1, validateStep2, validateStep3, validateAllSteps } = useOnboardingValidation();
  const { isSaving, lastSaveTime } = useQuickOnboardingAutoSave(data);

  // Verificar se todos os campos obrigatórios estão preenchidos
  const validateRequiredFields = useCallback((stepData: QuickOnboardingData): { isValid: boolean; missingFields: string[] } => {
    const missingFields: string[] = [];
    
    console.log('🔍 Validando campos obrigatórios:', stepData);

    // Etapa 1 - Dados pessoais
    if (!stepData.name?.trim()) missingFields.push('name');
    if (!stepData.email?.trim()) missingFields.push('email');
    if (!stepData.whatsapp?.trim()) missingFields.push('whatsapp');
    if (!stepData.how_found_us?.trim()) missingFields.push('how_found_us');
    if (stepData.how_found_us === 'indicacao' && !stepData.referred_by?.trim()) {
      missingFields.push('referred_by');
    }

    // Etapa 2 - Dados do negócio
    if (!stepData.company_name?.trim()) missingFields.push('company_name');
    if (!stepData.role?.trim()) missingFields.push('role');
    if (!stepData.company_size?.trim()) missingFields.push('company_size');
    if (!stepData.company_segment?.trim()) missingFields.push('company_segment');
    if (!stepData.annual_revenue_range?.trim()) missingFields.push('annual_revenue_range');
    if (!stepData.main_challenge?.trim()) missingFields.push('main_challenge');

    // Etapa 3 - Experiência com IA
    if (!stepData.ai_knowledge_level?.trim()) missingFields.push('ai_knowledge_level');
    if (!stepData.uses_ai?.trim()) missingFields.push('uses_ai');
    if (!stepData.main_goal?.trim()) missingFields.push('main_goal');

    const isValid = missingFields.length === 0;
    
    console.log(`✅ Validação campos obrigatórios: ${isValid ? 'APROVADA' : 'REPROVADA'}`);
    if (!isValid) {
      console.log('❌ Campos faltando:', missingFields);
    }

    return { isValid, missingFields };
  }, []);

  // Verificar se pode finalizar (validação completa com backend)
  const canFinalize = useCallback((): boolean => {
    if (!user?.id) {
      console.log('❌ canFinalize: Usuário não autenticado');
      return false;
    }

    // Primeira validação: campos obrigatórios
    const { isValid: fieldsValid, missingFields } = validateRequiredFields(data);
    if (!fieldsValid) {
      console.log('❌ canFinalize: Campos obrigatórios faltando:', missingFields);
      return false;
    }

    // Segunda validação: etapas específicas
    const step1Valid = validateStep1(data);
    const step2Valid = validateStep2(data);
    const step3Valid = validateStep3(data);

    if (!step1Valid || !step2Valid || !step3Valid) {
      console.log('❌ canFinalize: Validação de etapas falhou', {
        step1: step1Valid,
        step2: step2Valid,
        step3: step3Valid
      });
      return false;
    }

    console.log('✅ canFinalize: Todas as validações passaram');
    return true;
  }, [data, user?.id, validateRequiredFields, validateStep1, validateStep2, validateStep3]);

  // Carregar dados existentes do Supabase
  const loadExistingData = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ Usuário não autenticado, pulando carregamento de dados');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      
      console.log('📥 Carregando dados existentes do usuário:', user.id);

      // Verificar sessão válida
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.session) {
        throw new Error('Sessão inválida');
      }

      const { data: existingData, error } = await supabase
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao carregar dados existentes:', error);
        setLoadError('Erro ao carregar dados salvos');
        return;
      }

      if (existingData) {
        console.log('✅ Dados existentes encontrados:', existingData);
        
        // Mapear dados do Supabase para o estado local
        const mappedData: QuickOnboardingData = {
          name: existingData.name || '',
          email: existingData.email || user.email || '',
          whatsapp: existingData.whatsapp || '',
          country_code: existingData.country_code || '+55',
          birth_date: existingData.birth_date || '',
          instagram_url: existingData.instagram_url || '',
          linkedin_url: existingData.linkedin_url || '',
          how_found_us: existingData.how_found_us || '',
          referred_by: existingData.referred_by || '',
          company_name: existingData.company_name || '',
          role: existingData.role || '',
          company_size: existingData.company_size || '',
          company_segment: existingData.company_segment || '',
          company_website: existingData.company_website || '',
          annual_revenue_range: existingData.annual_revenue_range || '',
          main_challenge: existingData.main_challenge || '',
          ai_knowledge_level: existingData.ai_knowledge_level || '',
          uses_ai: existingData.uses_ai || '',
          main_goal: existingData.main_goal || '',
          desired_ai_areas: existingData.desired_ai_areas || [],
          has_implemented: existingData.has_implemented || '',
          previous_tools: existingData.previous_tools || []
        };

        setData(mappedData);
        setHasExistingData(true);
        setIsCompleted(!!existingData.is_completed);
        
        console.log('✅ Estado local atualizado com dados do Supabase');
        console.log('🏁 is_completed no Supabase:', existingData.is_completed);
      } else {
        console.log('ℹ️ Nenhum dado existente encontrado');
        setHasExistingData(false);
        setIsCompleted(false);
      }

    } catch (error) {
      console.error('❌ Erro no carregamento de dados:', error);
      setLoadError('Erro ao conectar com servidor');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.email]);

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadExistingData();
  }, [loadExistingData]);

  // Atualizar campo específico
  const updateField = useCallback((field: string, value: any) => {
    console.log(`📝 Atualizando campo: ${field} =`, value);
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Verificar se pode prosseguir para próxima etapa
  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return validateStep1(data);
      case 2:
        return validateStep2(data);
      case 3:
        return validateStep3(data);
      case 4:
        return canFinalize();
      default:
        return false;
    }
  }, [currentStep, data, validateStep1, validateStep2, validateStep3, canFinalize]);

  // Avançar para próxima etapa
  const nextStep = useCallback(() => {
    if (canProceed() && currentStep < TOTAL_STEPS) {
      const nextStepNumber = currentStep + 1;
      console.log(`➡️ Avançando para etapa ${nextStepNumber}`);
      setCurrentStep(nextStepNumber);
    } else {
      console.log('⚠️ Não pode avançar para próxima etapa - validação falhou');
      toast.error('Complete todos os campos obrigatórios antes de continuar');
    }
  }, [canProceed, currentStep]);

  // Voltar para etapa anterior
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      const prevStepNumber = currentStep - 1;
      console.log(`⬅️ Voltando para etapa ${prevStepNumber}`);
      setCurrentStep(prevStepNumber);
    }
  }, [currentStep]);

  // Sanitizar payload para o Supabase
  const sanitizePayloadForSupabase = useCallback((payload: QuickOnboardingData) => {
    console.log('🧹 Sanitizando payload para Supabase');
    console.log('📤 Payload original:', payload);

    const sanitized = {
      user_id: user?.id,
      name: payload.name?.trim() || '',
      email: payload.email?.trim() || user?.email || '',
      whatsapp: payload.whatsapp?.trim() || '',
      country_code: payload.country_code || '+55',
      birth_date: payload.birth_date || null,
      instagram_url: payload.instagram_url?.trim() || null,
      linkedin_url: payload.linkedin_url?.trim() || null,
      how_found_us: payload.how_found_us?.trim() || '',
      referred_by: payload.referred_by?.trim() || null,
      company_name: payload.company_name?.trim() || '',
      role: payload.role?.trim() || '',
      company_size: payload.company_size?.trim() || '',
      company_segment: payload.company_segment?.trim() || '',
      company_website: payload.company_website?.trim() || null,
      annual_revenue_range: payload.annual_revenue_range?.trim() || '',
      main_challenge: payload.main_challenge?.trim() || '',
      ai_knowledge_level: payload.ai_knowledge_level?.trim() || '',
      uses_ai: payload.uses_ai?.trim() || '',
      main_goal: payload.main_goal?.trim() || '',
      desired_ai_areas: Array.isArray(payload.desired_ai_areas) ? payload.desired_ai_areas : [],
      has_implemented: payload.has_implemented?.trim() || '',
      previous_tools: Array.isArray(payload.previous_tools) ? payload.previous_tools : [],
      is_completed: true
      // Deixar created_at e updated_at serem gerenciados pelo Supabase
    };

    console.log('✅ Payload sanitizado:', sanitized);
    return sanitized;
  }, [user?.id, user?.email]);

  // Finalizar onboarding
  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (completionInProgressRef.current) {
      console.log('⚠️ Finalização já em progresso');
      return false;
    }

    if (!user?.id) {
      console.error('❌ Usuário não autenticado');
      toast.error('Erro de autenticação. Faça login novamente.');
      return false;
    }

    // Validação rigorosa antes de finalizar
    if (!canFinalize()) {
      console.error('❌ Validação de finalização falhou');
      toast.error('Complete todos os campos obrigatórios antes de finalizar');
      return false;
    }

    completionInProgressRef.current = true;

    try {
      console.log('🎯 Iniciando finalização do onboarding');
      
      // Verificar sessão válida
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.session) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      // Sanitizar dados para envio
      const sanitizedPayload = sanitizePayloadForSupabase(data);
      
      console.log('📤 Enviando payload final para quick_onboarding');

      // Salvar no quick_onboarding
      const { error: quickError } = await supabase
        .from('quick_onboarding')
        .upsert(sanitizedPayload, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (quickError) {
        console.error('❌ Erro ao salvar quick_onboarding:', quickError);
        
        if (quickError.code === '23502') {
          const match = quickError.message.match(/column "([^"]+)"/);
          const missingField = match ? match[1] : 'campo obrigatório';
          throw new Error(`Campo obrigatório não preenchido: ${missingField}`);
        }
        
        throw quickError;
      }

      console.log('✅ quick_onboarding salvo com sucesso');

      // Atualizar estado local
      setIsCompleted(true);
      
      console.log('🎉 Onboarding finalizado com sucesso!');
      return true;

    } catch (error: any) {
      console.error('❌ Erro na finalização do onboarding:', error);
      
      setRetryCount(prev => prev + 1);
      
      if (error.message?.includes('Campo obrigatório')) {
        toast.error(error.message);
      } else if (error.message?.includes('Sessão')) {
        toast.error(error.message);
      } else {
        toast.error(`Erro ao finalizar onboarding: ${error.message || 'Erro desconhecido'}`);
      }
      
      return false;
    } finally {
      completionInProgressRef.current = false;
    }
  }, [user?.id, canFinalize, data, sanitizePayloadForSupabase]);

  return {
    currentStep,
    data,
    updateField,
    nextStep,
    previousStep,
    canProceed,
    isLoading,
    hasExistingData,
    loadError,
    totalSteps: TOTAL_STEPS,
    isSaving,
    lastSaveTime,
    completeOnboarding,
    isCompleted,
    retryCount,
    canFinalize
  };
};
