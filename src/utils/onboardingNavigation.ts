import { validateOnboardingStep } from './validateOnboardingSteps';

// Navegação inteligente entre steps
export const canNavigateToStep = (
  currentStep: number, 
  targetStep: number, 
  data: any,
  isCompleted: boolean
): { canNavigate: boolean; reason?: string } => {
  
  console.log(`🧭 [NAVIGATION] Verificando navegação de ${currentStep} para ${targetStep}`, {
    isCompleted,
    data: !!data
  });
  
  // Se onboarding está completo, não permite navegar entre steps
  if (isCompleted) {
    return { 
      canNavigate: false, 
      reason: 'Onboarding já foi concluído' 
    };
  }
  
  // Sempre permite ir para step anterior
  if (targetStep < currentStep) {
    return { canNavigate: true };
  }
  
  // Sempre permite navegar para steps 1-6 durante o onboarding
  if (targetStep >= 1 && targetStep <= 6) {
    return { canNavigate: true };
  }
  
  // Para step 7+ (conclusão), verificar se pelo menos os steps essenciais estão válidos
  if (targetStep > 6) {
    const step1Valid = isStepValidForNavigation(1, data);
    
    if (!step1Valid) {
      return { 
        canNavigate: false, 
        reason: 'Complete pelo menos as informações pessoais básicas' 
      };
    }
    
    return { canNavigate: true };
  }
  
  return { canNavigate: false, reason: 'Step inválido' };
};

// Verificar se um step específico está válido para navegação
export const isStepValidForNavigation = (step: number, data: any): boolean => {
  if (!data) return false;
  
  const errors = validateOnboardingStep(step, data);
  const isValid = Object.keys(errors).length === 0;
  
  console.log(`🎯 [NAVIGATION] Step ${step} válido para navegação:`, isValid);
  return isValid;
};

// Obter próximo step recomendado
export const getNextRecommendedStep = (currentStep: number, data: any): number => {
  // Lógica simples: sempre próximo step sequencial
  return Math.min(currentStep + 1, 6);
};

// Obter step anterior
export const getPreviousStep = (currentStep: number): number => {
  return Math.max(currentStep - 1, 1);
};

// Verificar se pode concluir onboarding
export const canCompleteOnboarding = (data: any): { canComplete: boolean; missingSteps: number[] } => {
  const missingSteps: number[] = [];
  
  // Step 1 é obrigatório
  if (!isStepValidForNavigation(1, data)) {
    missingSteps.push(1);
  }
  
  return {
    canComplete: missingSteps.length === 0,
    missingSteps
  };
};