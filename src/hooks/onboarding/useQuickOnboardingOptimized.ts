
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { QuickOnboardingData, adaptQuickDataToDatabase, adaptDatabaseToQuickData } from '@/types/quickOnboarding';
import { toast } from 'sonner';

export const useQuickOnboardingOptimized = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<QuickOnboardingData>({
    name: '',
    email: '',
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
    main_goal: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const totalSteps = 4;
  const saveTimeoutRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Carregamento inicial otimizado
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔍 Carregando dados existentes do onboarding...');
        
        const { data: existingData, error } = await supabase
          .from('quick_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!mountedRef.current) return;

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (existingData) {
          console.log('✅ Dados existentes encontrados:', existingData);
          setHasExistingData(true);
          
          // Converter dados do banco para o formato do componente
          const adaptedData = adaptDatabaseToQuickData(existingData);
          setData(prev => ({ ...prev, ...adaptedData, email: user.email || adaptedData.email }));
          
          // Se já está completo, ir para etapa final
          if (existingData.is_completed) {
            setCurrentStep(4);
          } else {
            setCurrentStep(existingData.current_step || 1);
          }
        } else {
          console.log('📝 Nenhum dado existente, criando novo onboarding');
          // Preencher email do usuário
          setData(prev => ({ ...prev, email: user.email || '' }));
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        if (mountedRef.current) {
          setLoadError('Erro ao carregar dados do onboarding');
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadExistingData();
  }, [user?.id, user?.email]);

  // Auto-save otimizado com debounce
  const saveData = useCallback(async (dataToSave: QuickOnboardingData, stepToSave: number) => {
    if (!user?.id || !mountedRef.current) return;

    try {
      setIsSaving(true);
      
      // Converter dados para formato do banco
      const databasePayload = adaptQuickDataToDatabase(dataToSave);
      
      const savePayload = {
        user_id: user.id,
        ...databasePayload,
        email: dataToSave.email || user.email,
        current_step: stepToSave,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('quick_onboarding')
        .upsert(savePayload);

      if (error) throw error;
      
      if (mountedRef.current) {
        setLastSaveTime(new Date());
        console.log('✅ Dados salvos automaticamente');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      if (mountedRef.current) {
        toast.error('Erro ao salvar progresso');
      }
    } finally {
      if (mountedRef.current) {
        setIsSaving(false);
      }
    }
  }, [user?.id, user?.email]);

  // Auto-save com debounce
  useEffect(() => {
    if (!hasExistingData && isLoading) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      saveData(data, currentStep);
    }, 2000); // 2 segundos de debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, currentStep, hasExistingData, isLoading, saveData]);

  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

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

  // Validação para poder prosseguir
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return !!(data.name && data.email && data.whatsapp && data.how_found_us);
      case 2:
        return !!(data.company_name && data.company_segment);
      case 3:
        return !!(data.uses_ai && data.main_goal && data.ai_knowledge_level);
      default:
        return true;
    }
  }, [currentStep, data]);

  const completeOnboarding = useCallback(async () => {
    if (!user?.id) return false;

    try {
      setIsCompleting(true);
      console.log('🎯 Finalizando onboarding...');

      // Converter dados para formato do banco
      const databasePayload = adaptQuickDataToDatabase(data);

      const { error } = await supabase
        .from('quick_onboarding')
        .upsert({
          user_id: user.id,
          ...databasePayload,
          email: data.email || user.email,
          current_step: 4,
          is_completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      console.log('✅ Onboarding concluído com sucesso');
      toast.success('Onboarding concluído com sucesso!');
      return true;

    } catch (error) {
      console.error('❌ Erro ao completar onboarding:', error);
      toast.error('Erro ao finalizar onboarding');
      return false;
    } finally {
      setIsCompleting(false);
    }
  }, [user?.id, user?.email, data]);

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
