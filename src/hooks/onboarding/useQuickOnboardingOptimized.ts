
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface QuickOnboardingData {
  name: string;
  email: string;
  company_name: string;
  company_segment: string;
  primary_goal: string;
  ai_knowledge_level: string;
  current_step: number;
}

export const useQuickOnboardingOptimized = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<QuickOnboardingData>({
    name: '',
    email: user?.email || '',
    company_name: '',
    company_segment: '',
    primary_goal: '',
    ai_knowledge_level: '',
    current_step: 1
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
          company_name: existingData.company_name || '',
          company_segment: existingData.company_segment || '',
          primary_goal: existingData.primary_goal || '',
          ai_knowledge_level: existingData.ai_knowledge_level || '',
          current_step: existingData.current_step || 1
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
        company_name: data.company_name,
        company_segment: data.company_segment,
        primary_goal: data.primary_goal,
        ai_knowledge_level: data.ai_knowledge_level,
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
      setData(prev => ({ ...prev, current_step: nextStepNumber }));
      
      // Auto-save ao avançar
      await autoSave();
    }
  }, [currentStep, totalSteps, autoSave]);

  // Voltar passo
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      const prevStepNumber = currentStep - 1;
      setCurrentStep(prevStepNumber);
      setData(prev => ({ ...prev, current_step: prevStepNumber }));
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
        return data.primary_goal.trim() !== '';
      case 4:
        return data.ai_knowledge_level.trim() !== '';
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
          company_name: data.company_name,
          company_segment: data.company_segment,
          primary_goal: data.primary_goal,
          ai_knowledge_level: data.ai_knowledge_level,
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
            primary_goal: data.primary_goal
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
