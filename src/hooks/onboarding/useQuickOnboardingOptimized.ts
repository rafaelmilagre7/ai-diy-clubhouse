import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { useQuickOnboardingAutoSave } from './useQuickOnboardingAutoSave';
import { useOnboardingCompletion } from './useOnboardingCompletion';
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

  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  const { isSaving, lastSaveTime } = useQuickOnboardingAutoSave(data);
  const { data: completionData, refetch: refetchCompletion } = useOnboardingCompletion();

  // Função para sanitizar payload de forma rigorosa
  const sanitizePayload = (payload: any, targetTable: 'quick_onboarding' | 'profiles') => {
    console.log('🧹 Sanitizando payload para tabela:', targetTable);
    console.log('📥 Payload original:', JSON.stringify(payload, null, 2));

    const sanitized = { ...payload };

    // Campos que NUNCA devem ser enviados independente da tabela
    const forbiddenFields = [
      'updated_at', 'created_at', 'id', 'user_id'
    ];

    // Campos específicos por tabela
    const tableSpecificForbidden = {
      quick_onboarding: ['name'], // name não existe em quick_onboarding
      profiles: ['whatsapp', 'country_code', 'birth_date', 'how_found_us', 'referred_by', 'company_segment', 'annual_revenue_range', 'main_challenge', 'ai_knowledge_level', 'uses_ai', 'main_goal', 'desired_ai_areas', 'has_implemented', 'previous_tools', 'role', 'company_size', 'company_website'] // campos que não existem em profiles
    };

    // Remove campos proibidos globalmente
    forbiddenFields.forEach(field => {
      if (field in sanitized) {
        console.log(`❌ Removendo campo proibido: ${field}`);
        delete sanitized[field];
      }
    });

    // Remove campos específicos da tabela
    if (tableSpecificForbidden[targetTable]) {
      tableSpecificForbidden[targetTable].forEach(field => {
        if (field in sanitized) {
          console.log(`❌ Removendo campo não suportado por ${targetTable}: ${field}`);
          delete sanitized[field];
        }
      });
    }

    // Remove valores undefined, null ou vazios
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === undefined || sanitized[key] === null || sanitized[key] === '') {
        console.log(`❌ Removendo campo vazio: ${key}`);
        delete sanitized[key];
      }
    });

    console.log('✅ Payload sanitizado final:', JSON.stringify(sanitized, null, 2));
    return sanitized;
  };

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
    if (!user) {
      console.error('❌ Usuário não autenticado');
      toast.error('Usuário não autenticado');
      return false;
    }

    if (retryCount >= maxRetries) {
      console.error('❌ Máximo de tentativas excedido');
      toast.error('Falha após múltiplas tentativas. Tente novamente mais tarde.');
      return false;
    }

    try {
      console.log('🎯 Iniciando finalização do onboarding - Tentativa:', retryCount + 1);

      // 1. Atualizar quick_onboarding
      const quickOnboardingPayload = sanitizePayload({
        user_id: user.id,
        email: data.email,
        whatsapp: data.whatsapp,
        country_code: data.country_code,
        birth_date: data.birth_date || null,
        instagram_url: data.instagram_url || null,
        linkedin_url: data.linkedin_url || null,
        how_found_us: data.how_found_us,
        referred_by: data.referred_by || null,
        company_name: data.company_name,
        role: data.role,
        company_size: data.company_size,
        company_segment: data.company_segment,
        company_website: data.company_website || null,
        annual_revenue_range: data.annual_revenue_range,
        main_challenge: data.main_challenge,
        ai_knowledge_level: data.ai_knowledge_level,
        uses_ai: data.uses_ai,
        main_goal: data.main_goal,
        desired_ai_areas: data.desired_ai_areas || [],
        has_implemented: data.has_implemented,
        previous_tools: data.previous_tools || [],
        is_completed: true
      }, 'quick_onboarding');

      console.log('📤 Enviando para quick_onboarding:', quickOnboardingPayload);

      const { error: quickError } = await supabase
        .from('quick_onboarding')
        .upsert(quickOnboardingPayload, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (quickError) {
        console.error('❌ Erro ao atualizar quick_onboarding:', quickError);
        
        // Se for erro 400, não fazer retry
        if (quickError.code === '42703' || quickError.message?.includes('does not exist')) {
          console.error('❌ Erro de estrutura de dados (400) - parando retry');
          toast.error(`Erro de estrutura: ${quickError.message}`);
          return false;
        }
        
        throw quickError;
      }

      console.log('✅ quick_onboarding atualizado com sucesso');

      // 2. Atualizar profiles apenas com campos válidos
      const profilesPayload = sanitizePayload({
        company_name: data.company_name,
        industry: data.company_segment
      }, 'profiles');

      if (Object.keys(profilesPayload).length > 0) {
        console.log('📤 Enviando para profiles:', profilesPayload);

        const { error: profileError } = await supabase
          .from('profiles')
          .update(profilesPayload)
          .eq('id', user.id);

        if (profileError) {
          console.error('❌ Erro ao atualizar profiles:', profileError);
          
          // Se for erro 400, não fazer retry
          if (profileError.code === '42703' || profileError.message?.includes('does not exist')) {
            console.error('❌ Erro de estrutura de dados (400) em profiles - parando retry');
            toast.error(`Erro de estrutura em profiles: ${profileError.message}`);
            return false;
          }
          
          throw profileError;
        }

        console.log('✅ profiles atualizado com sucesso');
      }

      // 3. Refetch do status de completion
      await refetchCompletion();

      console.log('🎉 Onboarding finalizado com sucesso!');
      setRetryCount(0); // Reset retry count on success
      return true;

    } catch (error: any) {
      console.error('❌ Erro na finalização do onboarding:', error);
      
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);

      // Se não for erro 400 e ainda temos tentativas, fazer retry
      if (newRetryCount < maxRetries && 
          !error.code?.includes('42703') && 
          !error.message?.includes('does not exist')) {
        
        console.log(`🔄 Agendando retry ${newRetryCount}/${maxRetries} em ${newRetryCount * 2}s`);
        
        toast.error(`Erro na finalização (${newRetryCount}/${maxRetries}). Tentando novamente...`, {
          duration: 2000
        });

        // Retry com delay progressivo
        retryTimeoutRef.current = setTimeout(() => {
          completeOnboarding();
        }, newRetryCount * 2000);

        return false;
      } else {
        // Máximo de tentativas ou erro estrutural
        const errorMessage = error.message?.includes('does not exist') 
          ? 'Erro de estrutura: verifique campos inválidos no Supabase'
          : 'Erro ao finalizar onboarding após múltiplas tentativas';
        
        toast.error(errorMessage, { duration: 4000 });
        return false;
      }
    }
  }, [user, data, retryCount, refetchCompletion]);

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

  const isCompleted = completionData?.isCompleted || false;
  const totalSteps = 4;

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
