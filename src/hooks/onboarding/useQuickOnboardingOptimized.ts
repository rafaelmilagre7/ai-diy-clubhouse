
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { useQuickOnboardingAutoSave } from './useQuickOnboardingAutoSave';
import { OnboardingValidator } from '@/utils/onboardingValidation';
import { toast } from 'sonner';

export const useQuickOnboardingOptimized = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<QuickOnboardingData>({
    name: '',
    email: '',
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
  const totalSteps = 4;

  // Auto-save dos dados
  const { isSaving, lastSaveTime } = useQuickOnboardingAutoSave(data);

  // Sanitizar payload antes de enviar ao Supabase
  const sanitizePayload = useCallback((payload: any) => {
    const cleanPayload = { ...payload };
    
    // Remove campos que NÃO existem nas tabelas
    delete cleanPayload.updated_at;
    delete cleanPayload.created_at;
    delete cleanPayload.id;
    
    // Remove valores undefined ou null desnecessários
    Object.keys(cleanPayload).forEach(key => {
      if (cleanPayload[key] === undefined) {
        delete cleanPayload[key];
      }
      // Converter null para string vazia em campos de texto
      if (cleanPayload[key] === null && typeof cleanPayload[key] === 'string') {
        cleanPayload[key] = '';
      }
    });

    console.log('🧹 Payload sanitizado:', cleanPayload);
    return cleanPayload;
  }, []);

  // Carregar dados existentes
  const loadExistingData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      console.log('📥 Carregando dados existentes...');

      // Buscar primeiro em quick_onboarding
      const { data: quickData, error: quickError } = await supabase
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (quickError && quickError.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar quick_onboarding:', quickError);
        throw quickError;
      }

      if (quickData) {
        console.log('✅ Dados encontrados em quick_onboarding:', quickData);
        
        // Verificar se está realmente completo
        setIsCompleted(quickData.is_completed || false);
        
        if (quickData.is_completed) {
          console.log('🎯 Onboarding já está completo');
          setHasExistingData(true);
          setData(quickData);
          return;
        }

        // Se não está completo, carregar dados mas continuar fluxo
        setHasExistingData(true);
        setData({
          name: quickData.name || '',
          email: quickData.email || '',
          whatsapp: quickData.whatsapp || '',
          country_code: quickData.country_code || '+55',
          birth_date: quickData.birth_date || '',
          instagram_url: quickData.instagram_url || '',
          linkedin_url: quickData.linkedin_url || '',
          how_found_us: quickData.how_found_us || '',
          referred_by: quickData.referred_by || '',
          company_name: quickData.company_name || '',
          role: quickData.role || '',
          company_size: quickData.company_size || '',
          company_segment: quickData.company_segment || '',
          company_website: quickData.company_website || '',
          annual_revenue_range: quickData.annual_revenue_range || '',
          main_challenge: quickData.main_challenge || '',
          ai_knowledge_level: quickData.ai_knowledge_level || '',
          uses_ai: quickData.uses_ai || '',
          main_goal: quickData.main_goal || '',
          desired_ai_areas: quickData.desired_ai_areas || [],
          has_implemented: quickData.has_implemented || '',
          previous_tools: quickData.previous_tools || []
        });

        // Determinar step atual baseado nos dados
        if (!quickData.name || !quickData.email || !quickData.whatsapp) {
          setCurrentStep(1);
        } else if (!quickData.company_name || !quickData.role) {
          setCurrentStep(2);
        } else if (!quickData.ai_knowledge_level || !quickData.main_goal) {
          setCurrentStep(3);
        } else {
          setCurrentStep(4);
        }
      }

    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error);
      setLoadError('Erro ao carregar dados existentes');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Finalizar onboarding
  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      console.error('❌ Usuário não encontrado');
      toast.error('Erro: usuário não autenticado');
      return false;
    }

    // Validar dados antes de tentar finalizar
    const validation = OnboardingValidator.validateAllSteps(data);
    if (!validation.isValid) {
      console.error('❌ Dados inválidos:', validation.errors);
      toast.error('Por favor, preencha todos os campos obrigatórios antes de finalizar');
      return false;
    }

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      setRetryCount(attempt);

      try {
        console.log(`🔄 Tentativa ${attempt}/${maxRetries} de finalização...`);

        // Preparar payload limpo para quick_onboarding
        const quickOnboardingPayload = sanitizePayload({
          user_id: user.id,
          name: data.name || '',
          email: data.email || '',
          whatsapp: data.whatsapp || '',
          country_code: data.country_code || '+55',
          birth_date: data.birth_date || null,
          instagram_url: data.instagram_url || null,
          linkedin_url: data.linkedin_url || null,
          how_found_us: data.how_found_us || '',
          referred_by: data.referred_by || null,
          company_name: data.company_name || '',
          role: data.role || '',
          company_size: data.company_size || '',
          company_segment: data.company_segment || '',
          company_website: data.company_website || null,
          annual_revenue_range: data.annual_revenue_range || '',
          main_challenge: data.main_challenge || '',
          ai_knowledge_level: data.ai_knowledge_level || '',
          uses_ai: data.uses_ai || '',
          main_goal: data.main_goal || '',
          desired_ai_areas: data.desired_ai_areas || [],
          has_implemented: data.has_implemented || '',
          previous_tools: data.previous_tools || [],
          is_completed: true
        });

        console.log('📤 Enviando para quick_onboarding:', quickOnboardingPayload);

        // Usar upsert para inserir/atualizar
        const { data: quickResult, error: quickError } = await supabase
          .from('quick_onboarding')
          .upsert(quickOnboardingPayload, { 
            onConflict: 'user_id',
            ignoreDuplicates: false 
          })
          .select()
          .single();

        if (quickError) {
          console.error(`❌ Erro na tentativa ${attempt} (quick_onboarding):`, quickError);
          
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            toast.error(`Erro na tentativa ${attempt}. Tentando novamente em ${delay/1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            toast.error('Falha ao finalizar após 3 tentativas. Verifique sua conexão.');
            return false;
          }
        }

        console.log('✅ quick_onboarding salvo com sucesso:', quickResult);

        // Atualizar estado local
        setIsCompleted(true);
        toast.success('Onboarding finalizado com sucesso!');
        return true;

      } catch (error: any) {
        console.error(`❌ Exceção na tentativa ${attempt}:`, error);
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          toast.error(`Erro inesperado. Tentando novamente em ${delay/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          toast.error('Erro inesperado após 3 tentativas. Tente novamente mais tarde.');
          return false;
        }
      }
    }

    return false;
  }, [user?.id, data, sanitizePayload]);

  // Funções de navegação
  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Atualizar campo
  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Verificar se pode prosseguir
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return OnboardingValidator.validateStep1(data).isValid;
      case 2:
        return OnboardingValidator.validateStep2(data).isValid;
      case 3:
        return OnboardingValidator.validateStep3(data).isValid;
      case 4:
        return OnboardingValidator.validateAllSteps(data).isValid;
      default:
        return false;
    }
  }, [currentStep, data]);

  // Carregar dados ao inicializar
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
    canProceed,
    isLoading,
    hasExistingData,
    loadError,
    totalSteps,
    isSaving,
    lastSaveTime,
    completeOnboarding,
    isCompleted,
    retryCount
  };
};
