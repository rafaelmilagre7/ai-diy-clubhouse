
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { OnboardingData, OnboardingFormData } from '@/types/onboarding';
import { toast } from 'sonner';
import { onboardingSteps } from '@/config/onboardingSteps';
import { useAuth } from '@/contexts/auth';

export function useOnboarding() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState<OnboardingData | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('personal');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Carregar dados do onboarding
  const fetchOnboardingData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { data: onboardingData, error } = await supabase
        .from('onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar dados de onboarding:', error);
        toast.error('Erro ao carregar seus dados. Por favor, tente novamente.');
        return;
      }

      if (onboardingData) {
        setData(onboardingData);
        setCurrentStep(onboardingData.current_step || 'personal');
      } else {
        // Criar um novo registro de onboarding se não existir
        const { data: newOnboarding, error: insertError } = await supabase
          .from('onboarding')
          .insert({
            user_id: user.id,
            name: user.user_metadata?.name || '',
            email: user.email || '',
          })
          .select('*')
          .single();

        if (insertError) {
          console.error('Erro ao criar onboarding:', insertError);
          toast.error('Erro ao inicializar o processo de onboarding.');
          return;
        }

        setData(newOnboarding);
        setCurrentStep('personal');
      }
    } catch (err) {
      console.error('Erro ao carregar onboarding:', err);
      toast.error('Erro inesperado ao carregar dados.');
    } finally {
      setIsLoading(false);
    }
  };

  // Salvar dados do formulário
  const saveFormData = async (formData: Partial<OnboardingFormData>, step: string) => {
    if (!user || !data) return false;
    
    try {
      setIsSaving(true);
      
      // Encontrar o próximo passo
      const currentStepIndex = onboardingSteps.findIndex(s => s.id === step);
      const nextStep = onboardingSteps[currentStepIndex + 1]?.id || step;
      
      // Verificar se o passo atual já foi concluído
      const completedSteps = [...(data.completed_steps || [])];
      if (!completedSteps.includes(step)) {
        completedSteps.push(step);
      }
      
      // Atualizar dados no banco
      const { error } = await supabase
        .from('onboarding')
        .update({
          ...formData,
          current_step: nextStep,
          completed_steps: completedSteps,
        })
        .eq('id', data.id);

      if (error) {
        console.error('Erro ao salvar dados:', error);
        toast.error('Erro ao salvar dados. Por favor, tente novamente.');
        return false;
      }

      // Atualizar estado local
      setData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...formData,
          current_step: nextStep,
          completed_steps: completedSteps,
        };
      });
      
      setCurrentStep(nextStep);
      toast.success('Dados salvos com sucesso!');
      
      // Navegar para o próximo passo se houver
      if (nextStep !== step) {
        const nextStepRoute = `/onboarding/${nextStep}`;
        navigate(nextStepRoute);
      }
      
      return true;
    } catch (err) {
      console.error('Erro ao salvar dados:', err);
      toast.error('Erro inesperado ao salvar dados.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Navegar para um passo específico
  const goToStep = (step: string) => {
    if (!data) return;
    
    // Verificar se o passo anterior foi concluído
    const stepIndex = onboardingSteps.findIndex(s => s.id === step);
    const previousSteps = onboardingSteps.slice(0, stepIndex);
    
    const canNavigate = previousSteps.every(prevStep => {
      return prevStep.isCompleted(data);
    });
    
    if (!canNavigate) {
      toast.warning('Você precisa completar os passos anteriores primeiro.');
      return;
    }
    
    setCurrentStep(step);
    navigate(`/onboarding/${step}`);
  };

  // Marcar onboarding como concluído
  const completeOnboarding = async () => {
    if (!user || !data) return false;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('onboarding')
        .update({
          is_completed: true,
        })
        .eq('id', data.id);

      if (error) {
        console.error('Erro ao completar onboarding:', error);
        toast.error('Erro ao finalizar o onboarding. Por favor, tente novamente.');
        return false;
      }

      setData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          is_completed: true,
        };
      });
      
      toast.success('Onboarding concluído com sucesso!');
      navigate('/dashboard');
      return true;
    } catch (err) {
      console.error('Erro ao completar onboarding:', err);
      toast.error('Erro inesperado ao finalizar o processo.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Inicializar dados ao carregar
  useEffect(() => {
    if (user) {
      fetchOnboardingData();
    }
  }, [user]);

  return {
    isLoading,
    isSaving,
    data,
    currentStep,
    saveFormData,
    goToStep,
    completeOnboarding,
    refreshData: fetchOnboardingData,
  };
}
