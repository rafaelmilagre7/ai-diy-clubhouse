
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
      console.log('🔄 useQuickOnboardingOptimized: Iniciando loadExistingData');
      console.log('👤 User disponível:', { id: user?.id, email: user?.email });
      
      if (!user?.id) {
        console.log('❌ Usuário não encontrado, finalizando loading');
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

        console.log('📊 Resultado da query:', { existingData, error });

        if (!mountedRef.current) {
          console.log('⚠️ Componente foi desmontado, abortando');
          return;
        }

        if (error && error.code !== 'PGRST116') {
          console.error('❌ Erro na query:', error);
          throw error;
        }

        if (existingData) {
          console.log('✅ Dados existentes encontrados:', existingData);
          setHasExistingData(true);
          
          // Converter dados do banco para o formato do componente
          const adaptedData = adaptDatabaseToQuickData(existingData);
          console.log('🔄 Dados adaptados:', adaptedData);
          
          setData(prev => ({ ...prev, ...adaptedData, email: user.email || adaptedData.email }));
          
          // Se já está completo, ir para etapa final
          if (existingData.is_completed) {
            console.log('✅ Onboarding já completo, indo para etapa 4');
            setCurrentStep(4);
          } else {
            console.log('📍 Definindo step atual:', existingData.current_step || 1);
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
          toast.error('Erro ao carregar dados. Você pode continuar mesmo assim.');
        }
      } finally {
        if (mountedRef.current) {
          console.log('✅ Finalizando loading');
          setIsLoading(false);
        }
      }
    };

    loadExistingData();
  }, [user?.id, user?.email]);

  // Auto-save otimizado com debounce
  const saveData = useCallback(async (dataToSave: QuickOnboardingData, stepToSave: number) => {
    if (!user?.id || !mountedRef.current) {
      console.log('⚠️ saveData abortado - user ou componente indisponível');
      return;
    }

    try {
      console.log('💾 Salvando dados:', { dataToSave, stepToSave });
      setIsSaving(true);
      
      // Converter dados para formato do banco
      const databasePayload = adaptQuickDataToDatabase(dataToSave);
      console.log('🔄 Payload do banco:', databasePayload);
      
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

      if (error) {
        console.error('❌ Erro no upsert:', error);
        throw error;
      }
      
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
    if (!hasExistingData && isLoading) {
      console.log('⏸️ Auto-save pausado - ainda carregando dados iniciais');
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    console.log('⏰ Agendando auto-save para 2 segundos');
    saveTimeoutRef.current = window.setTimeout(() => {
      console.log('💾 Executando auto-save');
      saveData(data, currentStep);
    }, 2000); // 2 segundos de debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, currentStep, hasExistingData, isLoading, saveData]);

  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
    console.log('📝 Atualizando campo:', { field, value });
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const nextStep = useCallback(() => {
    console.log('➡️ Próximo step:', { current: currentStep, total: totalSteps });
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const previousStep = useCallback(() => {
    console.log('⬅️ Step anterior:', { current: currentStep });
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Validação para poder prosseguir
  const canProceed = useCallback(() => {
    let result = false;
    
    switch (currentStep) {
      case 1:
        result = !!(data.name && data.email && data.whatsapp && data.how_found_us);
        break;
      case 2:
        result = !!(data.company_name && data.company_segment);
        break;
      case 3:
        result = !!(data.uses_ai && data.main_goal && data.ai_knowledge_level);
        break;
      default:
        result = true;
    }
    
    console.log('✅ canProceed:', { step: currentStep, result, data });
    return result;
  }, [currentStep, data]);

  const completeOnboarding = useCallback(async () => {
    if (!user?.id) {
      console.log('❌ completeOnboarding - usuário não encontrado');
      return false;
    }

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

      if (error) {
        console.error('❌ Erro ao completar:', error);
        throw error;
      }

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

  const hookResult = {
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

  console.log('🎯 useQuickOnboardingOptimized retornando:', hookResult);
  return hookResult;
};
