
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { QuickOnboardingData } from '@/types/quickOnboarding';

export const useQuickOnboardingOptimized = () => {
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
    main_goal: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  const totalSteps = 4;

  // Carregar dados existentes
  const loadExistingData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔄 Carregando dados do quick onboarding...');

      const { data: existingData, error } = await supabase
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (existingData) {
        console.log('✅ Dados encontrados:', existingData);
        setData({
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
          main_goal: existingData.main_goal || ''
        });
        setCurrentStep(existingData.current_step || 1);
        setHasExistingData(true);
      } else {
        console.log('ℹ️ Nenhum dado encontrado, iniciando novo onboarding');
        setData(prev => ({ ...prev, email: user.email || '' }));
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      setLoadError('Erro ao carregar dados existentes');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.email]);

  // Atualizar campo específico
  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Auto-save a cada mudança (debounced)
  const autoSave = useCallback(async () => {
    if (!user?.id || isSaving) return;

    setIsSaving(true);
    try {
      const saveData = {
        user_id: user.id,
        name: data.name,
        email: data.email,
        whatsapp: data.whatsapp,
        country_code: data.country_code,
        birth_date: data.birth_date,
        instagram_url: data.instagram_url,
        linkedin_url: data.linkedin_url,
        how_found_us: data.how_found_us,
        referred_by: data.referred_by,
        company_name: data.company_name,
        role: data.role,
        company_size: data.company_size,
        company_segment: data.company_segment,
        company_website: data.company_website,
        annual_revenue_range: data.annual_revenue_range,
        main_challenge: data.main_challenge,
        ai_knowledge_level: data.ai_knowledge_level,
        uses_ai: data.uses_ai,
        main_goal: data.main_goal,
        current_step: currentStep,
        is_completed: false,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('quick_onboarding')
        .upsert(saveData, { onConflict: 'user_id' });

      if (error) throw error;

      setLastSaveTime(new Date());
      console.log('💾 Auto-save realizado');
    } catch (error) {
      console.error('❌ Erro no auto-save:', error);
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, data, currentStep, isSaving]);

  // Avançar para próximo passo
  const nextStep = useCallback(async () => {
    if (currentStep < totalSteps) {
      const nextStepNumber = currentStep + 1;
      setCurrentStep(nextStepNumber);
      
      // Auto-save ao avançar
      await autoSave();
    }
  }, [currentStep, totalSteps, autoSave]);

  // Voltar passo
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      const prevStepNumber = currentStep - 1;
      setCurrentStep(prevStepNumber);
    }
  }, [currentStep]);

  // Verificar se pode prosseguir
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return data.name.trim() !== '' && data.email.trim() !== '';
      case 2:
        return data.company_name.trim() !== '' && data.company_segment.trim() !== '';
      case 3:
        return data.ai_knowledge_level.trim() !== '';
      case 4:
        return data.main_goal.trim() !== '';
      default:
        return false;
    }
  }, [currentStep, data]);

  // Completar onboarding
  const completeOnboarding = useCallback(async () => {
    if (!user?.id) return false;

    setIsCompleting(true);
    try {
      console.log('🎯 Finalizando quick onboarding...');

      // Atualizar quick_onboarding como completo
      const { error: quickError } = await supabase
        .from('quick_onboarding')
        .upsert({
          user_id: user.id,
          name: data.name,
          email: data.email,
          whatsapp: data.whatsapp,
          country_code: data.country_code,
          birth_date: data.birth_date,
          instagram_url: data.instagram_url,
          linkedin_url: data.linkedin_url,
          how_found_us: data.how_found_us,
          referred_by: data.referred_by,
          company_name: data.company_name,
          role: data.role,
          company_size: data.company_size,
          company_segment: data.company_segment,
          company_website: data.company_website,
          annual_revenue_range: data.annual_revenue_range,
          main_challenge: data.main_challenge,
          ai_knowledge_level: data.ai_knowledge_level,
          uses_ai: data.uses_ai,
          main_goal: data.main_goal,
          current_step: totalSteps,
          is_completed: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (quickError) throw quickError;

      // Criar entrada no onboarding_progress para compatibilidade
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          current_step: 'completed',
          completed_steps: ['personal_info', 'professional_info', 'business_goals', 'ai_experience'],
          is_completed: true,
          personal_info: {
            name: data.name,
            email: data.email
          },
          professional_info: {
            company_name: data.company_name,
            company_sector: data.company_segment
          },
          business_goals: {
            primary_goal: data.main_goal
          },
          ai_experience: {
            knowledge_level: data.ai_knowledge_level
          },
          onboarding_type: 'quick',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (progressError) throw progressError;

      toast.success('Onboarding concluído com sucesso!');
      return true;

    } catch (error) {
      console.error('❌ Erro ao completar onboarding:', error);
      toast.error('Erro ao finalizar onboarding');
      return false;
    } finally {
      setIsCompleting(false);
    }
  }, [user?.id, data, totalSteps]);

  // Carregar dados na inicialização
  useEffect(() => {
    loadExistingData();
  }, [loadExistingData]);

  // Auto-save com debounce
  useEffect(() => {
    if (hasExistingData || Object.values(data).some(value => value !== '' && value !== user?.email)) {
      const timeoutId = setTimeout(autoSave, 2000); // 2 segundos de debounce
      return () => clearTimeout(timeoutId);
    }
  }, [data, hasExistingData, autoSave, user?.email]);

  return {
    // Estado atual
    currentStep,
    totalSteps,
    data,
    isLoading,
    isSaving,
    isCompleting,
    hasExistingData,
    loadError,
    lastSaveTime,
    
    // Ações
    updateField,
    nextStep,
    previousStep,
    completeOnboarding,
    
    // Utilidades
    canProceed: canProceed(),
    getProgress: () => ((currentStep - 1) / totalSteps) * 100
  };
};
