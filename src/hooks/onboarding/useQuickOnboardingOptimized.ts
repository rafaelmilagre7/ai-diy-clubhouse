import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { toast } from 'sonner';

export interface UseQuickOnboardingOptimizedResult {
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
}

export const useQuickOnboardingOptimized = (): UseQuickOnboardingOptimizedResult => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const totalSteps = 4;

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

  // Função específica para validar se o usuário está autenticado
  const validateUserAuth = useCallback(async () => {
    if (!user?.id) {
      console.error('❌ Usuário não autenticado');
      return false;
    }

    try {
      // Verificar se a sessão está válida
      const { data: session, error } = await supabase.auth.getSession();
      if (error || !session?.session) {
        console.error('❌ Sessão inválida:', error);
        return false;
      }
      
      console.log('✅ Usuário autenticado:', user.id);
      return true;
    } catch (error) {
      console.error('❌ Erro ao validar autenticação:', error);
      return false;
    }
  }, [user]);

  // Função para sanitizar rigorosamente o payload
  const sanitizeQuickOnboardingPayload = useCallback((payload: any) => {
    console.log('🧹 Sanitizando payload para quick_onboarding');
    console.log('📥 Payload original:', JSON.stringify(payload, null, 2));
    
    // Lista de campos permitidos na tabela quick_onboarding
    const allowedFields = [
      'user_id',
      'email',
      'whatsapp', 
      'country_code',
      'birth_date',
      'instagram_url',
      'linkedin_url',
      'how_found_us',
      'referred_by',
      'company_name',
      'role',
      'company_size',
      'company_segment',
      'company_website',
      'annual_revenue_range',
      'main_challenge',
      'ai_knowledge_level',
      'uses_ai',
      'main_goal',
      'desired_ai_areas',
      'has_implemented',
      'previous_tools',
      'is_completed'
    ];
    
    const clean: any = {};
    
    // Incluir apenas campos permitidos
    allowedFields.forEach(field => {
      if (field === 'user_id') {
        clean[field] = user?.id;
      } else if (field === 'is_completed') {
        clean[field] = false; // Sempre false até finalização manual
      } else if (payload.hasOwnProperty(field)) {
        const value = payload[field];
        
        // Tratar casos especiais
        if (field === 'birth_date' && value === '') {
          clean[field] = null;
        } else if (field === 'instagram_url' && value === '') {
          clean[field] = null;
        } else if (field === 'linkedin_url' && value === '') {
          clean[field] = null;
        } else if (field === 'company_website' && value === '') {
          clean[field] = null;
        } else if (field === 'referred_by' && value === '') {
          clean[field] = null;
        } else if (['desired_ai_areas', 'previous_tools'].includes(field)) {
          clean[field] = Array.isArray(value) ? value : [];
        } else if (value !== undefined && value !== '') {
          clean[field] = value;
        }
      }
    });

    // Garantir campos obrigatórios
    if (!clean.email || clean.email === '') {
      clean.email = user?.email || '';
    }

    console.log('✅ Payload sanitizado:', JSON.stringify(clean, null, 2));
    return clean;
  }, [user]);

  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    console.log('🎯 Iniciando finalização do onboarding...');
    
    // Validar autenticação
    const isAuthValid = await validateUserAuth();
    if (!isAuthValid) {
      toast.error('Erro de autenticação. Faça login novamente.');
      return false;
    }

    try {
      // Preparar payload final com is_completed = true
      const finalPayload = sanitizeQuickOnboardingPayload({
        ...data,
        is_completed: true
      });

      console.log('📤 Enviando payload final para Supabase');
      console.log('🔑 User ID:', user?.id);
      console.log('📊 Payload:', JSON.stringify(finalPayload, null, 2));

      // Usar upsert com on_conflict baseado em user_id
      const { data: result, error } = await supabase
        .from('quick_onboarding')
        .upsert(finalPayload, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro detalhado do Supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });

        // Tratamento específico de erros
        if (error.code === '42703') {
          toast.error('Erro de estrutura: campo não existe na tabela');
          return false;
        } else if (error.code === '23505') {
          toast.error('Erro: dados duplicados detectados');
          return false;
        } else if (error.message?.includes('RLS')) {
          toast.error('Erro de permissão: verifique autenticação');
          return false;
        }

        // Incrementar contador de retry apenas para erros não estruturais
        if (retryCount < 3) {
          console.log(`⚠️ Tentativa ${retryCount + 1}/3 falhará - incrementando retry`);
          setRetryCount(prev => prev + 1);
        }
        
        throw error;
      }

      console.log('✅ Onboarding finalizado com sucesso:', result);
      setIsCompleted(true);
      setRetryCount(0);
      
      return true;

    } catch (error: any) {
      console.error('❌ Erro na finalização:', error);
      
      // Não fazer retry para erros 400/403
      if (error.status === 400 || error.status === 403) {
        console.error('❌ Erro crítico - interrompendo retries');
        return false;
      }
      
      return false;
    }
  }, [data, user, validateUserAuth, sanitizeQuickOnboardingPayload, retryCount]);

  const loadExistingData = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      console.log('📊 Carregando dados existentes para:', user.id);
      
      const { data: existingData, error } = await supabase
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao carregar dados:', error);
        setLoadError('Erro ao carregar dados salvos');
        return;
      }

      if (existingData) {
        console.log('✅ Dados existentes encontrados');
        setHasExistingData(true);
        setIsCompleted(existingData.is_completed || false);
        
        // Mapear dados existentes para o estado
        setData({
          name: existingData.name || '',
          email: existingData.email || '',
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
        });
      }
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      setLoadError('Erro inesperado ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      loadExistingData();
    } else {
      setIsLoading(false);
    }
  }, [user, loadExistingData]);

  const updateField = useCallback((field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, []);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, []);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return !!(data.name && data.email && data.whatsapp && data.how_found_us);
      case 2:
        return !!(data.company_name && data.role && data.company_size && data.company_segment && data.annual_revenue_range && data.main_challenge);
      case 3:
        return !!(data.ai_knowledge_level && data.uses_ai && data.main_goal);
      default:
        return true;
    }
  }, [currentStep, data]);

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
    isSaving: false,
    lastSaveTime: null,
    completeOnboarding,
    isCompleted,
    retryCount
  };
};
