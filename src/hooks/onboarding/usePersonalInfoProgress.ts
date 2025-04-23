
import { useStepDefinitions } from "./useStepDefinitions";
import { useStepNavigation } from "./useStepNavigation";

export const usePersonalInfoProgress = () => {
  const { steps } = useStepDefinitions();
  const { currentStepIndex, progress } = useStepNavigation();
  
  // Total de etapas no fluxo de onboarding
  const totalSteps = steps.length;
  
  // Calcular porcentagem de progresso
  const calculateProgressPercentage = (): number => {
    if (!progress) return 0;
    
    const completedSteps = progress.completed_steps?.length || 0;
    const total = totalSteps;
    
    // Se não há etapas completas, usar a etapa atual para mostrar algum progresso
    if (completedSteps === 0) {
      return Math.round(((currentStepIndex + 1) / total) * 100);
    }
    
    return Math.round((completedSteps / total) * 100);
  };
  
  const progressPercentage = calculateProgressPercentage();
  
  return {
    totalSteps,
    progressPercentage,
    currentStepIndex,
    currentStep: steps[currentStepIndex],
    isStepCompleted: (stepId: string) => progress?.completed_steps?.includes(stepId) || false
  };
};
