
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { QuickOnboardingData, QuickOnboardingRecord } from '@/types/quickOnboarding';

const initialData: QuickOnboardingData = {
  name: '',
  email: '',
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
};

export const useQuickOnboardingNew = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<QuickOnboardingData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingRecord, setExistingRecord] = useState<QuickOnboardingRecord | null>(null);

  // Carregar dados existentes
  useEffect(() => {
    if (!user) return;

    const loadExistingData = async () => {
      try {
        const { data: existing, error } = await supabase
          .from('quick_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (existing && !error) {
          setExistingRecord(existing);
          setData({
            name: existing.name || '',
            email: existing.email || '',
            whatsapp: existing.whatsapp || '',
            country_code: existing.country_code || '+55',
            birth_date: existing.birth_date || '',
            instagram_url: existing.instagram_url || '',
            linkedin_url: existing.linkedin_url || '',
            how_found_us: existing.how_found_us || '',
            referred_by: existing.referred_by || '',
            company_name: existing.company_name || '',
            role: existing.role || '',
            company_size: existing.company_size || '',
            company_segment: existing.company_segment || '',
            company_website: existing.company_website || '',
            annual_revenue_range: existing.annual_revenue_range || '',
            main_challenge: existing.main_challenge || '',
            ai_knowledge_level: existing.ai_knowledge_level || '',
            uses_ai: existing.uses_ai || '',
            main_goal: existing.main_goal || ''
          });
          setCurrentStep(existing.current_step || 1);
        }
      } catch (error) {
        console.error('Erro ao carregar dados existentes:', error);
      }
    };

    loadExistingData();
  }, [user]);

  const updateField = useCallback((field: keyof QuickOnboardingData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return !!(data.name && data.email && data.whatsapp && data.how_found_us);
      case 2:
        return !!(data.company_name && data.role && data.company_size && 
                 data.company_segment && data.annual_revenue_range && data.main_challenge);
      case 3:
        return !!(data.ai_knowledge_level && data.uses_ai && data.main_goal);
      default:
        return false;
    }
  }, [data]);

  const canProceed = validateStep(currentStep);

  const saveStep = useCallback(async (stepNumber: number) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        user_id: user.id,
        ...data,
        current_step: stepNumber,
        updated_at: new Date().toISOString()
      };

      if (existingRecord) {
        const { error } = await supabase
          .from('quick_onboarding')
          .update(payload)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { data: newRecord, error } = await supabase
          .from('quick_onboarding')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        setExistingRecord(newRecord);
      }

      toast.success('Dados salvos com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao salvar dados:', error);
      toast.error(`Erro ao salvar: ${error.message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, data, existingRecord]);

  const nextStep = useCallback(async () => {
    if (!validateStep(currentStep)) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const saved = await saveStep(currentStep + 1);
    if (saved && currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, validateStep, saveStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const completeOnboarding = useCallback(async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('quick_onboarding')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          current_step: 4
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Onboarding concluído com sucesso! 🎉');
      
      // Auto-redirect após 2 segundos
      setTimeout(() => {
        navigate('/onboarding/completed');
      }, 2000);

      return true;
    } catch (error: any) {
      console.error('Erro ao completar onboarding:', error);
      toast.error(`Erro ao finalizar: ${error.message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, navigate]);

  return {
    currentStep,
    data,
    updateField,
    nextStep,
    previousStep,
    canProceed,
    isSubmitting,
    completeOnboarding,
    totalSteps: 4
  };
};
