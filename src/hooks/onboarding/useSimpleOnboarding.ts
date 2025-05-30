
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { useRealtimeValidation } from './useRealtimeValidation';
import { toast } from 'sonner';

interface UseSimpleOnboardingReturn {
  data: QuickOnboardingData;
  currentStep: number;
  totalSteps: number;
  updateField: (field: keyof QuickOnboardingData, value: string | string[] | number | boolean) => void;
  nextStep: () => Promise<void>;
  previousStep: () => void;
  completeOnboarding: () => Promise<boolean>;
  canProceed: boolean;
  isSaving: boolean;
  isCompleting: boolean;
  isLoading: boolean;
}

export const useSimpleOnboarding = (): UseSimpleOnboardingReturn => {
  const { user } = useAuth();
  const [data, setData] = useState<QuickOnboardingData>({
    // Etapa 1 - Informações Pessoais
    name: '',
    email: '',
    whatsapp: '',
    country_code: '+55',
    birth_date: '',
    
    // Etapa 2 - Localização e Redes
    country: '',
    state: '',
    city: '',
    timezone: '',
    instagram_url: '',
    linkedin_url: '',
    
    // Etapa 3 - Como nos conheceu
    how_found_us: '',
    referred_by: '',
    
    // Etapa 4 - Seu negócio
    company_name: '',
    role: '',
    company_size: '',
    company_segment: '',
    company_website: '',
    annual_revenue_range: '',
    
    // Etapa 5 - Contexto do negócio
    business_model: '',
    business_challenges: [],
    additional_context: '',
    
    // Etapa 6 - Objetivos e metas
    primary_goal: '',
    expected_outcome_30days: '',
    week_availability: '',
    
    // Etapa 7 - Experiência com IA
    ai_knowledge_level: '',
    has_implemented: '',
    previous_tools: [],
    desired_ai_areas: [],
    
    // Etapa 8 - Personalização
    interests: [],
    time_preference: [],
    networking_availability: 0,
    skills_to_share: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const totalSteps = 8;

  // Validação em tempo real
  const { canProceed } = useRealtimeValidation(data, currentStep);

  // Carregar dados existentes do usuário
  const loadExistingData = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log('📖 Carregando dados existentes do onboarding...');
      
      const { data: existingData, error } = await supabase
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao carregar dados:', error);
        return;
      }

      if (existingData) {
        console.log('✅ Dados encontrados:', existingData);
        
        // Mapear dados do banco para o estado
        const mappedData: QuickOnboardingData = {
          // Etapa 1
          name: existingData.name || '',
          email: existingData.email || '',
          whatsapp: existingData.whatsapp || '',
          country_code: existingData.country_code || '+55',
          birth_date: existingData.birth_date || '',
          
          // Etapa 2
          country: existingData.country || '',
          state: existingData.state || '',
          city: existingData.city || '',
          timezone: existingData.timezone || '',
          instagram_url: existingData.instagram_url || '',
          linkedin_url: existingData.linkedin_url || '',
          
          // Etapa 3
          how_found_us: existingData.how_found_us || '',
          referred_by: existingData.referred_by || '',
          
          // Etapa 4
          company_name: existingData.company_name || '',
          role: existingData.role || '',
          company_size: existingData.company_size || '',
          company_segment: existingData.company_segment || '',
          company_website: existingData.company_website || '',
          annual_revenue_range: existingData.annual_revenue_range || '',
          
          // Etapa 5
          business_model: existingData.business_model || '',
          business_challenges: existingData.business_challenges || [],
          additional_context: existingData.additional_context || '',
          
          // Etapa 6
          primary_goal: existingData.primary_goal || '',
          expected_outcome_30days: existingData.expected_outcome_30days || '',
          week_availability: existingData.week_availability || '',
          
          // Etapa 7
          ai_knowledge_level: existingData.ai_knowledge_level || '',
          has_implemented: existingData.has_implemented || '',
          previous_tools: existingData.previous_tools || [],
          desired_ai_areas: existingData.desired_ai_areas || [],
          
          // Etapa 8
          interests: existingData.interests || [],
          time_preference: existingData.time_preference || [],
          networking_availability: existingData.networking_availability || 0,
          skills_to_share: existingData.skills_to_share || []
        };

        setData(mappedData);
        setCurrentStep(existingData.current_step || 1);
      } else {
        console.log('📝 Nenhum dado encontrado, iniciando novo onboarding');
        // Se não tem dados, inicializar com email do usuário
        setData(prev => ({
          ...prev,
          email: user.email || ''
        }));
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao carregar dados:', error);
      toast.error('Erro ao carregar dados do onboarding');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.email]);

  // Salvar dados no banco
  const saveData = useCallback(async (stepToSave?: number): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);
      console.log('💾 Salvando dados do onboarding...', { step: stepToSave || currentStep });

      const dataToSave = {
        user_id: user.id,
        current_step: stepToSave || currentStep,
        updated_at: new Date().toISOString(),
        
        // Mapear todos os campos para o banco
        name: data.name,
        email: data.email,
        whatsapp: data.whatsapp,
        country_code: data.country_code,
        birth_date: data.birth_date || null,
        country: data.country,
        state: data.state,
        city: data.city,
        timezone: data.timezone,
        instagram_url: data.instagram_url,
        linkedin_url: data.linkedin_url,
        how_found_us: data.how_found_us,
        referred_by: data.referred_by,
        role: data.role,
        company_name: data.company_name,
        company_size: data.company_size,
        company_segment: data.company_segment,
        company_website: data.company_website,
        annual_revenue_range: data.annual_revenue_range,
        business_model: data.business_model,
        business_challenges: data.business_challenges,
        additional_context: data.additional_context,
        primary_goal: data.primary_goal,
        expected_outcome_30days: data.expected_outcome_30days,
        week_availability: data.week_availability,
        ai_knowledge_level: data.ai_knowledge_level,
        has_implemented: data.has_implemented,
        previous_tools: data.previous_tools,
        desired_ai_areas: data.desired_ai_areas,
        interests: data.interests,
        time_preference: data.time_preference,
        networking_availability: data.networking_availability,
        skills_to_share: data.skills_to_share
      };

      const { error } = await supabase
        .from('quick_onboarding')
        .upsert(dataToSave, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('❌ Erro ao salvar dados:', error);
        toast.error('Erro ao salvar progresso');
        return false;
      }

      console.log('✅ Dados salvos com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro inesperado ao salvar:', error);
      toast.error('Erro inesperado ao salvar');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, data, currentStep]);

  // Atualizar campo
  const updateField = useCallback((field: keyof QuickOnboardingData, value: string | string[] | number | boolean) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Próxima etapa
  const nextStep = useCallback(async () => {
    if (!canProceed) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const success = await saveData();
    if (success && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      await saveData(currentStep + 1);
    }
  }, [canProceed, currentStep, totalSteps, saveData]);

  // Etapa anterior
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Completar onboarding
  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      setIsCompleting(true);
      console.log('🎯 Completando onboarding...');

      const { error } = await supabase
        .from('quick_onboarding')
        .update({
          is_completed: true,
          current_step: totalSteps,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erro ao completar onboarding:', error);
        toast.error('Erro ao finalizar onboarding');
        return false;
      }

      console.log('✅ Onboarding concluído com sucesso');
      toast.success('Onboarding concluído!');
      return true;
    } catch (error) {
      console.error('❌ Erro inesperado ao completar onboarding:', error);
      toast.error('Erro inesperado');
      return false;
    } finally {
      setIsCompleting(false);
    }
  }, [user?.id, totalSteps]);

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadExistingData();
  }, [loadExistingData]);

  // Auto-save em intervalos (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading && user?.id) {
        saveData();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [data, isLoading, user?.id, saveData]);

  return {
    data,
    currentStep,
    totalSteps,
    updateField,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed,
    isSaving,
    isCompleting,
    isLoading
  };
};
