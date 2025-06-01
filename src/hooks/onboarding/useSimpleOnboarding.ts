
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { useNavigate } from 'react-router-dom';

const initialData: QuickOnboardingData = {
  // Etapa 1 - Informações Pessoais
  name: '',
  email: '',
  whatsapp: '',
  country_code: '+55',
  
  // Etapa 2 - Localização e Redes
  country: 'Brasil',
  state: '',
  city: '',
  
  // Etapa 3 - Como nos conheceu
  how_found_us: '',
  
  // Etapa 4 - Seu negócio
  company_name: '',
  role: '',
  company_size: '',
  company_segment: '',
  annual_revenue_range: '',
  
  // Etapa 5 - Contexto do negócio
  business_model: '',
  business_challenges: [],
  
  // Etapa 6 - Objetivos e metas
  primary_goal: '',
  expected_outcome_30days: '',
  
  // Etapa 7 - Experiência com IA
  ai_knowledge_level: '',
  has_implemented: '',
  
  // Etapa 8 - Personalização
  interests: [],
  networking_availability: 5,
  
  // Controle
  currentStep: 1
};

export const useSimpleOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<QuickOnboardingData>(initialData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const totalSteps = 8;

  // Carregar dados existentes
  const loadExistingData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      console.log('🔄 Carregando dados existentes do onboarding...');

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
        console.log('✅ Dados existentes encontrados:', existingData);
        
        // Mapear dados do banco para o estado local
        const mappedData: QuickOnboardingData = {
          name: existingData.name || '',
          email: existingData.email || user.email || '',
          whatsapp: existingData.whatsapp || '',
          country_code: existingData.country_code || '+55',
          country: existingData.country || 'Brasil',
          state: existingData.state || '',
          city: existingData.city || '',
          how_found_us: existingData.how_found_us || '',
          company_name: existingData.company_name || '',
          role: existingData.role || '',
          company_size: existingData.company_size || '',
          company_segment: existingData.company_segment || '',
          annual_revenue_range: existingData.annual_revenue_range || '',
          business_model: existingData.business_model || '',
          business_challenges: existingData.business_challenges || [],
          primary_goal: existingData.primary_goal || '',
          expected_outcome_30days: existingData.expected_outcome_30days || '',
          ai_knowledge_level: existingData.ai_knowledge_level || '',
          has_implemented: existingData.has_implemented || '',
          interests: existingData.interests || [],
          networking_availability: existingData.networking_availability || 5,
          currentStep: existingData.current_step || 1
        };

        setData(mappedData);
        setCurrentStep(existingData.current_step || 1);
        
        // Se já está completo, redirecionar
        if (existingData.is_completed) {
          console.log('✅ Onboarding já completo, redirecionando...');
          navigate('/dashboard');
        }
      } else {
        console.log('ℹ️ Nenhum dado existente, criando registro inicial...');
        await createInitialRecord();
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados existentes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.email, navigate]);

  // Criar registro inicial
  const createInitialRecord = async () => {
    if (!user?.id) return;

    try {
      const initialRecord = {
        user_id: user.id,
        name: user.user_metadata?.name || '',
        email: user.email || '',
        current_step: 1,
        is_completed: false
      };

      const { error } = await supabase
        .from('quick_onboarding')
        .upsert(initialRecord, { onConflict: 'user_id' });

      if (error) {
        console.error('❌ Erro ao criar registro inicial:', error);
        throw error;
      }

      console.log('✅ Registro inicial criado');
    } catch (error) {
      console.error('❌ Erro ao criar registro inicial:', error);
    }
  };

  // Salvar dados atuais
  const saveCurrentData = useCallback(async () => {
    if (!user?.id || isSaving) return;

    try {
      setIsSaving(true);
      console.log('💾 Salvando dados da etapa:', currentStep);

      const updateData = {
        user_id: user.id,
        name: data.name,
        email: data.email,
        whatsapp: data.whatsapp,
        country_code: data.country_code,
        country: data.country,
        state: data.state,
        city: data.city,
        how_found_us: data.how_found_us,
        company_name: data.company_name,
        role: data.role,
        company_size: data.company_size,
        company_segment: data.company_segment,
        annual_revenue_range: data.annual_revenue_range,
        business_model: data.business_model,
        business_challenges: data.business_challenges,
        primary_goal: data.primary_goal,
        expected_outcome_30days: data.expected_outcome_30days,
        ai_knowledge_level: data.ai_knowledge_level,
        has_implemented: data.has_implemented,
        interests: data.interests,
        networking_availability: data.networking_availability,
        current_step: currentStep,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('quick_onboarding')
        .upsert(updateData, { onConflict: 'user_id' });

      if (error) {
        console.error('❌ Erro ao salvar dados:', error);
        throw error;
      }

      console.log('✅ Dados salvos com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar dados:', error);
      toast.error('Erro ao salvar progresso');
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, data, currentStep, isSaving]);

  // Atualizar campo
  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Próxima etapa
  const nextStep = useCallback(async () => {
    await saveCurrentData();
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps, saveCurrentData]);

  // Etapa anterior
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Completar onboarding
  const completeOnboarding = useCallback(async () => {
    if (!user?.id) return false;

    try {
      setIsCompleting(true);
      console.log('🎯 Completando onboarding...');

      await saveCurrentData();

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
        throw error;
      }

      console.log('✅ Onboarding completado com sucesso');
      toast.success('Onboarding completado! Bem-vindo à Viver de IA!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao completar onboarding:', error);
      toast.error('Erro ao finalizar onboarding');
      return false;
    } finally {
      setIsCompleting(false);
    }
  }, [user?.id, saveCurrentData, totalSteps]);

  // Verificar se pode prosseguir
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return !!(data.name && data.email && data.whatsapp);
      case 2:
        return !!(data.country && data.state && data.city);
      case 3:
        return !!data.how_found_us;
      case 4:
        return !!(data.company_name && data.role && data.company_size);
      case 5:
        return !!(data.business_model && data.business_challenges?.length);
      case 6:
        return !!(data.primary_goal && data.expected_outcome_30days);
      case 7:
        return !!(data.ai_knowledge_level && data.has_implemented);
      case 8:
        return !!(data.interests?.length && data.networking_availability);
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

  // Auto-save quando dados mudam
  useEffect(() => {
    if (!isLoading && user?.id) {
      const timeoutId = setTimeout(() => {
        saveCurrentData();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [data, saveCurrentData, isLoading, user?.id]);

  return {
    data,
    currentStep,
    totalSteps,
    isLoading,
    isSaving,
    isCompleting,
    canProceed: canProceed(),
    updateField,
    nextStep,
    previousStep,
    completeOnboarding
  };
};
