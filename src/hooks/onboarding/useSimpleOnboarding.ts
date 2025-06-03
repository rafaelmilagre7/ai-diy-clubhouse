
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TOTAL_STEPS = 8;

const getInitialData = (): QuickOnboardingData => ({
  // Etapa 1 - Quem é você
  name: '',
  email: '',
  whatsapp: '',
  country_code: '+55',
  birth_date: '',
  
  // Etapa 2 - Localização e redes
  country: '',
  state: '',
  city: '',
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
  content_formats: [],
  
  // Etapa 7 - Experiência com IA
  ai_knowledge_level: '',
  desired_ai_areas: [],
  previous_tools: [],
  
  // Etapa 8 - Personalização
  available_days: [],
  interests: [],
  networking_availability: 5
});

export const useSimpleOnboarding = () => {
  const { user } = useAuth();
  const [data, setData] = useState<QuickOnboardingData>(getInitialData());
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados salvos no início
  useEffect(() => {
    const loadSavedData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔄 Carregando dados salvos do onboarding...');
        
        const { data: savedData, error } = await supabase
          .from('quick_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('❌ Erro ao carregar dados:', error);
        } else if (savedData) {
          console.log('✅ Dados carregados:', savedData);
          setData(prev => ({ ...prev, ...savedData }));
          
          // Determinar step atual baseado nos dados
          if (savedData.is_completed) {
            setCurrentStep(TOTAL_STEPS);
          } else {
            const stepFromData = determineCurrentStep(savedData);
            setCurrentStep(stepFromData);
          }
        }
      } catch (error) {
        console.error('❌ Erro inesperado ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedData();
  }, [user?.id]);

  // Determinar step atual baseado nos dados preenchidos
  const determineCurrentStep = (data: QuickOnboardingData): number => {
    // Step 1: Informações básicas
    if (!data.name || !data.email || !data.whatsapp) return 1;
    
    // Step 2: Localização
    if (!data.country || !data.state || !data.city) return 2;
    
    // Step 3: Como nos conheceu
    if (!data.how_found_us) return 3;
    
    // Step 4: Negócio
    if (!data.company_name || !data.role || !data.company_size || !data.company_segment) return 4;
    
    // Step 5: Contexto do negócio
    if (!data.business_model) return 5;
    
    // Step 6: Objetivos
    if (!data.primary_goal || !data.expected_outcome_30days) return 6;
    
    // Step 7: Experiência com IA
    if (!data.ai_knowledge_level || !data.desired_ai_areas?.length) return 7;
    
    // Step 8: Personalização
    if (!data.available_days?.length) return 8;
    
    return TOTAL_STEPS;
  };

  // Validar se pode prosseguir para próximo step
  const validateCurrentStep = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return !!(data.name?.trim() && data.email?.trim() && data.whatsapp?.trim());
      
      case 2:
        return !!(data.country?.trim() && data.state?.trim() && data.city?.trim());
      
      case 3:
        return !!data.how_found_us?.trim();
      
      case 4:
        return !!(
          data.company_name?.trim() && 
          data.role?.trim() && 
          data.company_size?.trim() && 
          data.company_segment?.trim()
        );
      
      case 5:
        return !!data.business_model?.trim();
      
      case 6:
        return !!(
          data.primary_goal?.trim() && 
          data.expected_outcome_30days?.trim() &&
          data.content_formats?.length
        );
      
      case 7:
        return !!(
          data.ai_knowledge_level?.trim() && 
          data.desired_ai_areas?.length
        );
      
      case 8:
        return !!(data.available_days?.length);
      
      default:
        return false;
    }
  }, [currentStep, data]);

  const canProceed = validateCurrentStep();

  // Atualizar campo
  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Salvar dados no Supabase
  const saveData = useCallback(async (dataToSave: QuickOnboardingData) => {
    if (!user?.id) return false;

    try {
      console.log('💾 Salvando dados no Supabase...', dataToSave);

      const { error } = await supabase
        .from('quick_onboarding')
        .upsert({
          user_id: user.id,
          ...dataToSave,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Erro ao salvar:', error);
        toast.error('Erro ao salvar dados');
        return false;
      }

      console.log('✅ Dados salvos com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro inesperado ao salvar:', error);
      toast.error('Erro inesperado ao salvar');
      return false;
    }
  }, [user?.id]);

  // Avançar para próximo step
  const nextStep = useCallback(async () => {
    if (!canProceed) return;

    setIsSaving(true);
    const success = await saveData(data);
    
    if (success) {
      setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    }
    
    setIsSaving(false);
  }, [canProceed, data, saveData]);

  // Voltar para step anterior
  const previousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  // Completar onboarding
  const completeOnboarding = useCallback(async () => {
    if (!user?.id) return false;

    setIsCompleting(true);

    try {
      console.log('🎯 Finalizando onboarding...');

      const finalData = {
        ...data,
        is_completed: true,
        completed_at: new Date().toISOString()
      };

      const success = await saveData(finalData);

      if (success) {
        console.log('🎉 Onboarding finalizado com sucesso!');
        toast.success('Onboarding finalizado com sucesso!');
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Erro ao finalizar onboarding:', error);
      toast.error('Erro ao finalizar onboarding');
      return false;
    } finally {
      setIsCompleting(false);
    }
  }, [user?.id, data, saveData]);

  return {
    data,
    currentStep,
    updateField,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed,
    totalSteps: TOTAL_STEPS,
    isSaving,
    isCompleting,
    isLoading
  };
};
