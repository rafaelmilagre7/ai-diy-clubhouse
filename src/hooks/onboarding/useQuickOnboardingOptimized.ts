
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { QuickOnboardingData, adaptDatabaseToQuickData, adaptQuickDataToDatabase } from '@/types/quickOnboarding';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useQuickOnboardingOptimized = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<QuickOnboardingData>({
    name: '',
    email: '',
    whatsapp: '',
    country_code: '+55',
    how_found_us: '',
    company_name: '',
    company_size: '',
    company_segment: '',
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

  // Função para criar registro inicial vazio
  const createInitialRecord = useCallback(async (userId: string) => {
    try {
      console.log('🔧 Criando registro inicial de onboarding para usuário:', userId);
      
      const { data: insertData, error } = await supabase
        .from('quick_onboarding')
        .insert({
          user_id: userId,
          email: user?.email || '',
          name: user?.user_metadata?.name || user?.user_metadata?.full_name || '',
          current_step: 1,
          is_completed: false
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      console.log('✅ Registro inicial criado:', insertData);
      return insertData;
    } catch (error) {
      console.error('❌ Erro ao criar registro inicial:', error);
      throw error;
    }
  }, [user]);

  // Função para carregar dados existentes
  const loadExistingData = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ Usuário não encontrado, não carregando dados');
      setIsLoading(false);
      return;
    }

    try {
      console.log('📥 Carregando dados existentes de onboarding para:', user.id);
      setLoadError(null);
      
      const { data: existingData, error } = await supabase
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('❌ Erro ao carregar dados:', error);
        throw error;
      }
      
      if (existingData) {
        console.log('✅ Dados existentes encontrados:', existingData);
        
        const adaptedData = adaptDatabaseToQuickData(existingData);
        setData(adaptedData);
        setCurrentStep(existingData.current_step || 1);
        setHasExistingData(true);
        
        console.log('📊 Dados adaptados:', {
          currentStep: existingData.current_step,
          isCompleted: existingData.is_completed,
          dataKeys: Object.keys(adaptedData)
        });
      } else {
        console.log('ℹ️ Nenhum dado existente encontrado, criando registro inicial...');
        
        // Criar registro inicial se não existir
        const newRecord = await createInitialRecord(user.id);
        const adaptedData = adaptDatabaseToQuickData(newRecord);
        
        setData(adaptedData);
        setCurrentStep(1);
        setHasExistingData(false);
        
        console.log('🆕 Novo registro criado e carregado');
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados de onboarding:', error);
      setLoadError(error.message || 'Erro ao carregar dados do onboarding');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, createInitialRecord]);

  // Auto-save
  const autoSave = useCallback(async (updatedData: QuickOnboardingData, step: number) => {
    if (!user?.id || isCompleting) return;

    try {
      setIsSaving(true);
      
      const dbData = adaptQuickDataToDatabase(updatedData);
      
      const { error } = await supabase
        .from('quick_onboarding')
        .upsert({
          user_id: user.id,
          ...dbData,
          current_step: step,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      setLastSaveTime(new Date());
      console.log('💾 Auto-save realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no auto-save:', error);
      toast.error('Erro ao salvar automaticamente');
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, isCompleting]);

  // Atualizar campo
  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
    console.log(`📝 Atualizando campo ${field}:`, value);
    
    setData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-save com debounce
      setTimeout(() => autoSave(newData, currentStep), 1000);
      
      return newData;
    });
  }, [currentStep, autoSave]);

  // Verificar se pode prosseguir
  const canProceed = useCallback(() => {
    console.log('🔍 Verificando se pode prosseguir para step:', currentStep);
    
    switch (currentStep) {
      case 1:
        const step1Valid = !!(data.name && data.email && data.whatsapp && data.how_found_us);
        console.log('Step 1 válido:', step1Valid, {
          name: !!data.name,
          email: !!data.email,
          whatsapp: !!data.whatsapp,
          how_found_us: !!data.how_found_us
        });
        return step1Valid;
      
      case 2:
        const step2Valid = !!(data.company_name && data.company_size && data.company_segment);
        console.log('Step 2 válido:', step2Valid, {
          company_name: !!data.company_name,
          company_size: !!data.company_size,
          company_segment: !!data.company_segment
        });
        return step2Valid;
      
      case 3:
        const step3Valid = !!(data.ai_knowledge_level && data.uses_ai && data.main_goal);
        console.log('Step 3 válido:', step3Valid, {
          ai_knowledge_level: !!data.ai_knowledge_level,
          uses_ai: !!data.uses_ai,
          main_goal: !!data.main_goal
        });
        return step3Valid;
      
      default:
        return false;
    }
  }, [currentStep, data]);

  // Próximo step
  const nextStep = useCallback(async () => {
    if (!canProceed()) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const nextStepNum = Math.min(currentStep + 1, totalSteps);
    console.log(`➡️ Avançando para step ${nextStepNum}`);
    
    setCurrentStep(nextStepNum);
    await autoSave(data, nextStepNum);
  }, [currentStep, canProceed, data, autoSave, totalSteps]);

  // Step anterior
  const previousStep = useCallback(() => {
    const prevStepNum = Math.max(currentStep - 1, 1);
    console.log(`⬅️ Voltando para step ${prevStepNum}`);
    setCurrentStep(prevStepNum);
  }, [currentStep]);

  // Completar onboarding
  const completeOnboarding = useCallback(async () => {
    if (!user?.id) return false;

    try {
      setIsCompleting(true);
      console.log('🏁 Completando onboarding...');
      
      const dbData = adaptQuickDataToDatabase(data);
      
      const { error } = await supabase
        .from('quick_onboarding')
        .upsert({
          user_id: user.id,
          ...dbData,
          current_step: 4,
          is_completed: true,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      console.log('✅ Onboarding completado com sucesso');
      toast.success('Onboarding concluído com sucesso!');
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao completar onboarding:', error);
      toast.error('Erro ao finalizar onboarding');
      return false;
    } finally {
      setIsCompleting(false);
    }
  }, [user?.id, data]);

  // Carregar dados na inicialização
  useEffect(() => {
    loadExistingData();
  }, [loadExistingData]);

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
