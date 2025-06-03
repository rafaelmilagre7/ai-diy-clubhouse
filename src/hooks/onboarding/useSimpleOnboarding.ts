
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface OnboardingData {
  name: string;
  email: string;
  whatsapp: string;
  country_code: string;
  birth_date: string;
  how_found_us: string;
  company_name: string;
  role: string;
  [key: string]: any;
}

export const useSimpleOnboarding = () => {
  const { user, profile } = useAuth();
  const [data, setData] = useState<OnboardingData>({
    name: profile?.name || '',
    email: profile?.email || user?.email || '',
    whatsapp: '',
    country_code: '+55',
    birth_date: '',
    how_found_us: '',
    company_name: profile?.company_name || '',
    role: profile?.role || 'member'
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const totalSteps = 8;

  // Carregar dados existentes
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: quickData } = await supabase
          .from('quick_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (quickData && !quickData.is_completed) {
          setData(prev => ({ ...prev, ...quickData }));
          setCurrentStep(quickData.current_step || 1);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [user?.id]);

  const updateField = useCallback((field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return !!(data.name && data.email && data.whatsapp && data.birth_date);
      default:
        return true;
    }
  }, [currentStep, data])();

  const saveProgress = useCallback(async () => {
    if (!user?.id) return false;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('quick_onboarding')
        .upsert({
          user_id: user.id,
          current_step: currentStep,
          is_completed: false,
          ...data,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar progresso');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, currentStep, data]);

  const nextStep = useCallback(async () => {
    const saved = await saveProgress();
    if (saved && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, [saveProgress, currentStep, totalSteps]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const completeOnboarding = useCallback(async () => {
    if (!user?.id) return false;

    setIsCompleting(true);
    try {
      const { error } = await supabase
        .from('quick_onboarding')
        .upsert({
          user_id: user.id,
          current_step: totalSteps,
          is_completed: true,
          completed_at: new Date().toISOString(),
          ...data
        });

      if (error) throw error;
      
      toast.success('Onboarding concluído com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao completar:', error);
      toast.error('Erro ao finalizar onboarding');
      return false;
    } finally {
      setIsCompleting(false);
    }
  }, [user?.id, data, totalSteps]);

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
