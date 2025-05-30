import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useQuickOnboardingOptimized = () => {
  const { user } = useAuth();
  
  // Estado inicial com todas as propriedades obrigatórias
  const [data, setData] = useState<QuickOnboardingData>({
    name: '',
    email: '',
    whatsapp: '',
    country_code: '+55',
    how_found_us: '',
    company_name: '',
    role: '', // Adicionado
    company_size: '',
    company_segment: '',
    annual_revenue_range: '', // Adicionado
    main_challenge: '', // Adicionado
    ai_knowledge_level: '',
    uses_ai: '',
    main_goal: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const totalSteps = 4;

  const loadExistingData = useCallback(async () => {
    if (!user?.id) {
      console.log('❌ Usuário não encontrado, não é possível carregar dados');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔄 Carregando dados existentes para usuário:', user.id);
      
      const { data: existingData, error } = await supabase
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao carregar dados de onboarding:', error);
        throw new Error(`Erro ao carregar dados: ${error.message}`);
      }

      if (existingData) {
        console.log('✅ Dados existentes encontrados:', existingData);
        setData({
          name: existingData.name || '',
          email: existingData.email || user.email || '',
          whatsapp: existingData.whatsapp || '',
          country_code: existingData.country_code || '+55',
          how_found_us: existingData.how_found_us || '',
          company_name: existingData.company_name || '',
          role: existingData.role || '',
          company_size: existingData.company_size || '',
          company_segment: existingData.company_segment || '',
          annual_revenue_range: existingData.annual_revenue_range || '',
          main_challenge: existingData.main_challenge || '',
          ai_knowledge_level: existingData.ai_knowledge_level || '',
          uses_ai: existingData.uses_ai || '',
          main_goal: existingData.main_goal || ''
        });
        setCurrentStep(existingData.current_step || 1);
        setHasExistingData(true);
      } else {
        console.log('🆕 Nenhum dado existente encontrado, criando registro inicial...');
        
        // Criar registro inicial automaticamente
        const initialData = {
          user_id: user.id,
          name: user.user_metadata?.name || user.user_metadata?.full_name || '',
          email: user.email || '',
          whatsapp: '',
          country_code: '+55',
          how_found_us: '',
          company_name: '',
          role: '',
          company_size: '',
          company_segment: '',
          annual_revenue_range: '',
          main_challenge: '',
          ai_knowledge_level: '',
          uses_ai: '',
          main_goal: '',
          current_step: 1,
          is_completed: false
        };

        const { error: insertError } = await supabase
          .from('quick_onboarding')
          .insert(initialData);

        if (insertError) {
          console.error('❌ Erro ao criar registro inicial:', insertError);
          throw new Error(`Erro ao criar registro inicial: ${insertError.message}`);
        }

        console.log('✅ Registro inicial criado com sucesso');
        setData({
          name: initialData.name,
          email: initialData.email,
          whatsapp: initialData.whatsapp,
          country_code: initialData.country_code,
          how_found_us: initialData.how_found_us,
          company_name: initialData.company_name,
          role: initialData.role,
          company_size: initialData.company_size,
          company_segment: initialData.company_segment,
          annual_revenue_range: initialData.annual_revenue_range,
          main_challenge: initialData.main_challenge,
          ai_knowledge_level: initialData.ai_knowledge_level,
          uses_ai: initialData.uses_ai,
          main_goal: initialData.main_goal
        });
        setCurrentStep(1);
        setHasExistingData(false);
      }

    } catch (error: any) {
      console.error('❌ Erro no carregamento de dados:', error);
      setLoadError(error.message || 'Erro desconhecido ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const autoSave = useCallback(async (currentData: QuickOnboardingData, step: number) => {
    if (!user?.id) return;

    try {
      setIsSaving(true);
      console.log('💾 Auto-salvando dados do step:', step);

      const updateData = {
        ...currentData,
        current_step: step,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('quick_onboarding')
        .upsert({
          user_id: user.id,
          ...updateData
        });

      if (error) {
        console.error('❌ Erro no auto-save:', error);
        toast.error('Erro ao salvar dados automaticamente');
        return;
      }

      console.log('✅ Auto-save realizado com sucesso');
      setLastSaveTime(new Date());
    } catch (error) {
      console.error('❌ Erro no auto-save:', error);
    } finally {
      setIsSaving(false);
    }
  }, [user?.id]);

  const updateField = useCallback((field: keyof QuickOnboardingData, value: string) => {
    console.log(`📝 Atualizando campo ${field}:`, value);
    
    setData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Trigger auto-save after a delay
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        autoSave(newData, currentStep);
      }, 1000);
      
      return newData;
    });
  }, [currentStep, autoSave]);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return !!(data.name && data.email && data.whatsapp && data.how_found_us);
      case 2:
        return !!(data.company_name && data.role && data.company_size && data.company_segment);
      case 3:
        return !!(data.ai_knowledge_level && data.uses_ai && data.main_goal);
      default:
        return true;
    }
  }, [currentStep, data]);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps && canProceed()) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      autoSave(data, newStep);
      console.log('➡️ Avançando para step:', newStep);
    }
  }, [currentStep, totalSteps, canProceed, data, autoSave]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      autoSave(data, newStep);
      console.log('⬅️ Voltando para step:', newStep);
    }
  }, [currentStep, data, autoSave]);

  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      setIsCompleting(true);
      console.log('🎯 Finalizando onboarding...');

      const { error } = await supabase
        .from('quick_onboarding')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erro ao finalizar onboarding:', error);
        toast.error('Erro ao finalizar onboarding');
        return false;
      }

      console.log('✅ Onboarding finalizado com sucesso');
      toast.success('Onboarding concluído com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao finalizar onboarding:', error);
      toast.error('Erro ao finalizar onboarding');
      return false;
    } finally {
      setIsCompleting(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadExistingData();
  }, [loadExistingData]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    currentStep,
    data,
    updateField,
    nextStep,
    previousStep,
    canProceed: canProceed(),
    isLoading,
    hasExistingData,
    loadError,
    totalSteps,
    isSaving,
    lastSaveTime,
    completeOnboarding,
    isCompleting
  };
};
