
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { toast } from 'sonner';

const initialData: QuickOnboardingData = {
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

export const useQuickOnboardingOptimized = () => {
  const { user } = useAuth();
  const [data, setData] = useState<QuickOnboardingData>(initialData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  // Load existing data or create initial record
  useEffect(() => {
    const loadOrCreateOnboarding = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        
        // Try to fetch existing data
        const { data: existingData, error } = await supabase
          .from('quick_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching onboarding data:', error);
          toast.error('Erro ao carregar dados do onboarding');
          return;
        }

        if (existingData) {
          // Load existing data
          setData({
            name: existingData.name || '',
            email: existingData.email || '',
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
        } else {
          // Create initial record
          const { error: insertError } = await supabase
            .from('quick_onboarding')
            .insert({
              user_id: user.id,
              email: user.email || '',
              current_step: 1,
              is_completed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('Error creating initial onboarding record:', insertError);
            toast.error('Erro ao inicializar onboarding');
          } else {
            // Update data with user info
            setData(prev => ({
              ...prev,
              email: user.email || '',
              name: user.user_metadata?.name || ''
            }));
          }
        }
      } catch (error) {
        console.error('Unexpected error in loadOrCreateOnboarding:', error);
        toast.error('Erro inesperado ao carregar onboarding');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrCreateOnboarding();
  }, [user]);

  // Auto-save functionality
  const saveData = async (updatedData: QuickOnboardingData, step: number) => {
    if (!user?.id) return;

    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('quick_onboarding')
        .upsert({
          user_id: user.id,
          ...updatedData,
          current_step: step,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving onboarding data:', error);
        toast.error('Erro ao salvar dados');
        return false;
      }

      setLastSaveTime(new Date());
      return true;
    } catch (error) {
      console.error('Unexpected error saving data:', error);
      toast.error('Erro inesperado ao salvar');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof QuickOnboardingData, value: string) => {
    const updatedData = { ...data, [field]: value };
    setData(updatedData);
    
    // Auto-save with debounce
    setTimeout(() => {
      saveData(updatedData, currentStep);
    }, 1000);
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

  const nextStep = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const newStep = currentStep + 1;
    setCurrentStep(newStep);
    await saveData(data, newStep);
  };

  const previousStep = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      saveData(data, newStep);
    }
  };

  const completeOnboarding = async () => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('quick_onboarding')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error completing onboarding:', error);
        toast.error('Erro ao finalizar onboarding');
        return false;
      }

      toast.success('Onboarding concluído com sucesso! 🎉');
      return true;
    } catch (error) {
      console.error('Unexpected error completing onboarding:', error);
      toast.error('Erro inesperado ao finalizar');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    data,
    currentStep,
    isLoading,
    isSaving,
    lastSaveTime,
    updateField,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed: validateStep(currentStep),
    totalSteps: 3
  };
};
