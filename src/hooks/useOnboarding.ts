import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { useDirectOnboardingAdapter } from '@/components/onboarding/hooks/useDirectOnboardingAdapter';
import { toast } from '@/hooks/use-toast';

interface OnboardingData {
  user_id?: string;
  personal_info: any;
  location_info: any;
  discovery_info: any;
  business_info: any;
  business_context: any;
  goals_info: any;
  ai_experience: any;
  personalization: any;
  current_step: number;
  completed_steps: number[];
  is_completed: boolean;
}

export const useOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const adapter = useDirectOnboardingAdapter();
  
  const [data, setData] = useState<OnboardingData>({
    personal_info: {},
    location_info: {},
    discovery_info: {},
    business_info: {},
    business_context: {},
    goals_info: {},
    ai_experience: {},
    personalization: {},
    current_step: 1,
    completed_steps: [],
    is_completed: false
  });

  // Carregar dados na inicialização
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    console.log('🔍 [ONBOARDING] Carregando dados...');
    const loadedData = await adapter.loadOnboardingData();
    
    if (loadedData) {
      console.log('✅ [ONBOARDING] Dados carregados:', loadedData);
      setData(loadedData);
    } else {
      console.log('📭 [ONBOARDING] Nenhum dado encontrado, iniciando do zero');
    }
  };

  const updateData = useCallback((stepData: any) => {
    console.log('🔄 [ONBOARDING] Atualizando dados locais:', stepData);
    setData(prev => ({
      ...prev,
      ...stepData
    }));
  }, []);

  const saveAndNavigate = async (stepData: any, currentStep: number, targetStep: number) => {
    console.log('💾 [ONBOARDING] Salvando e navegando...', { stepData, currentStep, targetStep });
    
    // Atualizar dados do step específico
    const updatedData = { ...data };
    
    switch (currentStep) {
      case 1:
        if (stepData.personal_info) {
          updatedData.personal_info = { ...updatedData.personal_info, ...stepData.personal_info };
        }
        if (stepData.location_info) {
          updatedData.location_info = { ...updatedData.location_info, ...stepData.location_info };
        }
        break;
      case 2:
        if (stepData.business_info) {
          updatedData.business_info = { ...updatedData.business_info, ...stepData.business_info };
        }
        break;
      case 3:
        if (stepData.ai_experience) {
          updatedData.ai_experience = { ...updatedData.ai_experience, ...stepData.ai_experience };
        }
        break;
      case 4:
        if (stepData.goals_info) {
          updatedData.goals_info = { ...updatedData.goals_info, ...stepData.goals_info };
        }
        break;
      case 5:
        if (stepData.personalization) {
          updatedData.personalization = { ...updatedData.personalization, ...stepData.personalization };
        }
        break;
    }

    // Marcar step como completo
    const completedSteps = [...new Set([...updatedData.completed_steps, currentStep])];
    updatedData.completed_steps = completedSteps;
    updatedData.current_step = Math.max(targetStep, updatedData.current_step);

    // Salvar no banco
    const success = await adapter.saveOnboardingData(updatedData);
    
    if (success) {
      console.log('✅ [ONBOARDING] Dados salvos com sucesso');
      setData(updatedData);
      
      toast({
        title: "Dados salvos! ✅",
        description: `Etapa ${currentStep} concluída com sucesso.`,
      });
      
      // Navegar para próxima etapa
      if (targetStep <= 6) {
        navigate(`/onboarding/step/${targetStep}`);
      } else {
        // Completar onboarding
        const completedData = { ...updatedData, is_completed: true };
        const completeSuccess = await adapter.completeOnboarding(completedData);
        
        if (completeSuccess) {
          toast({
            title: "Onboarding concluído! 🎉",
            description: "Bem-vindo(a) à nossa plataforma!",
          });
          navigate('/dashboard');
        }
      }
      
      return true;
    } else {
      console.error('❌ [ONBOARDING] Falha ao salvar dados');
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar seus dados. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const navigateToStep = (step: number) => {
    console.log('🧭 [ONBOARDING] Navegando para etapa:', step);
    navigate(`/onboarding/step/${step}`);
  };

  const canAccessStep = (step: number) => {
    // Pode acessar a etapa atual ou etapas anteriores completadas
    return step <= data.current_step || data.completed_steps.includes(step);
  };

  return {
    data,
    updateData,
    saveAndNavigate,
    navigateToStep,
    canAccessStep,
    isLoading: adapter.isLoading,
    isSaving: adapter.isSaving,
    currentStep: data.current_step,
    completedSteps: data.completed_steps,
    isCompleted: data.is_completed
  };
};