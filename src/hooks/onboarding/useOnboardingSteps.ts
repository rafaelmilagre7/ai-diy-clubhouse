
import { useEffect, useState } from 'react';
import { useProgress } from './useProgress';
import { toast } from 'sonner';
import { OnboardingData } from '@/types/onboarding';

export const useOnboardingSteps = () => {
  const { progress, updateProgress, refreshProgress } = useProgress();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: 'personal', title: 'Informações Pessoais', section: 'personal_info' },
    { id: 'goals', title: 'Dados Profissionais', section: 'professional_info' },
    { id: 'ai_exp', title: 'Experiência com IA', section: 'ai_experience' },
    { id: 'industry', title: 'Foco da Indústria', section: 'industry_focus' },
    { id: 'resources', title: 'Recursos Necessários', section: 'resources_needs' },
    { id: 'team', title: 'Informações da Equipe', section: 'team_info' },
    { id: 'preferences', title: 'Preferências', section: 'implementation_preferences' }
  ];

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    const loadProgress = async () => {
      const refreshedProgress = await refreshProgress();
      if (refreshedProgress?.completed_steps) {
        console.log("useOnboardingSteps: Etapas completadas:", refreshedProgress.completed_steps);
        
        const lastCompletedIndex = Math.max(
          ...refreshedProgress.completed_steps.map(step => 
            steps.findIndex(s => s.id === step)
          ).filter(index => index !== -1), // Filtra índices inválidos (-1)
          -1 // Fallback para -1 se o array estiver vazio
        );
        
        // Se o lastCompletedIndex for -1, manteremos o currentStepIndex como 0
        setCurrentStepIndex(lastCompletedIndex !== -1 ? Math.min(lastCompletedIndex + 1, steps.length - 1) : 0);
      }
    };
    
    loadProgress();
  }, [refreshProgress]);
  
  const saveStepData = async (
    stepId: string, 
    data: Partial<OnboardingData>
  ) => {
    if (!progress?.id) return;
    setIsSubmitting(true);
    try {
      console.log(`Salvando dados da etapa ${stepId}:`, data);
      
      // Etapa específica para dados profissionais
      if (stepId === "goals") {
        const professionalInfo = data.professional_info || {};
        
        // Verificamos se todos os campos obrigatórios estão preenchidos
        if (!professionalInfo.company_name || !professionalInfo.company_size || 
            !professionalInfo.company_sector || !professionalInfo.current_position) {
          toast.error("Por favor, preencha todos os campos obrigatórios");
          setIsSubmitting(false);
          return;
        }
        
        // Atualizamos tanto o objeto professional_info quanto os campos específicos
        await updateProgress({
          professional_info: professionalInfo,
          // Extrair os valores para campos individuais para fácil acesso
          company_name: professionalInfo.company_name,
          company_size: professionalInfo.company_size,
          company_sector: professionalInfo.company_sector,
          company_website: professionalInfo.company_website,
          current_position: professionalInfo.current_position,
          annual_revenue: professionalInfo.annual_revenue,
          completed_steps: [...(progress.completed_steps || []), stepId],
          current_step: steps[Math.min(currentStepIndex + 1, steps.length - 1)].id,
        });
      } else {
        const sectionKey = steps.find(s => s.id === stepId)?.section as keyof OnboardingData;
        if (!sectionKey) throw new Error('Seção inválida');
        
        await updateProgress({
          [sectionKey]: data[sectionKey],
          completed_steps: [...(progress.completed_steps || []), stepId],
          current_step: steps[Math.min(currentStepIndex + 1, steps.length - 1)].id,
        });
      }
      
      // Recarregar os dados do servidor para garantir que temos os dados mais atualizados
      await refreshProgress();
      
      toast.success('Progresso salvo com sucesso!');
      setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1));
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast.error('Erro ao salvar dados. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeOnboarding = async () => {
    if (!progress?.id) return;
    
    setIsSubmitting(true);
    try {
      await updateProgress({
        is_completed: true,
        completed_steps: steps.map(s => s.id),
      });

      // Recarregar os dados do servidor
      await refreshProgress();

      toast.success('Onboarding concluído com sucesso!');
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      toast.error('Erro ao completar onboarding. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    steps,
    currentStep,
    currentStepIndex,
    isSubmitting,
    saveStepData,
    completeOnboarding,
    progress
  };
};
