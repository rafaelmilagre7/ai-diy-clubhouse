
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface SimpleOnboardingData {
  name: string;
  email: string;
  whatsapp: string;
  country_code: string;
  how_found_us: string;
  company_name: string;
  role: string;
  company_size: string;
  company_segment: string;
  annual_revenue_range: string;
  main_challenge: string;
  ai_knowledge_level: string;
  uses_ai: string;
  main_goal: string;
}

const initialData: SimpleOnboardingData = {
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
};

export const useSimpleOnboarding = () => {
  const { user } = useAuth();
  const [data, setData] = useState<SimpleOnboardingData>(initialData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Carregar dados do usuário ao inicializar
  useEffect(() => {
    if (user?.email) {
      setData(prev => ({
        ...prev,
        email: user.email || '',
        name: user.user_metadata?.name || ''
      }));
    }
  }, [user]);

  const updateField = (field: keyof SimpleOnboardingData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(data.name && data.email && data.whatsapp && data.how_found_us);
      case 2:
        return !!(data.company_name && data.role && data.company_size && data.company_segment);
      case 3:
        return !!(data.ai_knowledge_level && data.uses_ai && data.main_goal);
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const saveData = async () => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('quick_onboarding')
        .upsert({
          user_id: user.id,
          name: data.name,
          email: data.email,
          whatsapp: data.whatsapp,
          country_code: data.country_code,
          how_found_us: data.how_found_us,
          company_name: data.company_name,
          role: data.role,
          company_size: data.company_size,
          company_segment: data.company_segment,
          annual_revenue_range: data.annual_revenue_range,
          main_challenge: data.main_challenge,
          ai_knowledge_level: data.ai_knowledge_level,
          uses_ai: data.uses_ai,
          main_goal: data.main_goal,
          current_step: currentStep,
          is_completed: false,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao salvar dados:', error);
        toast.error('Erro ao salvar dados');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const completeOnboarding = async () => {
    if (!user?.id) return false;

    try {
      setIsCompleting(true);
      
      // Primeiro salvar todos os dados
      const saveSuccess = await saveData();
      if (!saveSuccess) return false;

      // Depois marcar como completo
      const { error } = await supabase
        .from('quick_onboarding')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          current_step: 4,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao completar onboarding:', error);
        toast.error('Erro ao finalizar onboarding');
        return false;
      }

      toast.success('Onboarding concluído com sucesso! 🎉');
      return true;
    } catch (error) {
      console.error('Erro inesperado ao completar:', error);
      toast.error('Erro inesperado ao finalizar');
      return false;
    } finally {
      setIsCompleting(false);
    }
  };

  return {
    data,
    currentStep,
    isLoading,
    isSaving,
    isCompleting,
    updateField,
    nextStep,
    previousStep,
    saveData,
    completeOnboarding,
    canProceed: validateStep(currentStep),
    totalSteps: 3
  };
};
