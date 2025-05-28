
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export type OnboardingStep = 
  | 'personal-info'
  | 'ai-experience' 
  | 'trail-generation'
  | 'completed';

export type OnboardingType = 'club' | 'formacao';

interface NavigationOptions {
  type?: OnboardingType;
  force?: boolean;
}

export const useOnboardingNavigation = () => {
  const navigate = useNavigate();

  // Mapeamento de rotas para onboarding do clube
  const clubRoutes: Record<OnboardingStep, string> = {
    'personal-info': '/onboarding-new',
    'ai-experience': '/onboarding-new',
    'trail-generation': '/onboarding-new', 
    'completed': '/onboarding-new/completed'
  };

  // Mapeamento de rotas para formação
  const formacaoRoutes: Record<OnboardingStep, string> = {
    'personal-info': '/onboarding/personal-info',
    'ai-experience': '/onboarding/ai-experience',
    'trail-generation': '/onboarding/trail-generation',
    'completed': '/onboarding/completed'
  };

  // Sequência de etapas para diferentes tipos
  const stepSequences: Record<OnboardingType, OnboardingStep[]> = {
    club: ['personal-info', 'ai-experience', 'trail-generation', 'completed'],
    formacao: ['personal-info', 'ai-experience', 'trail-generation', 'completed']
  };

  // Navegar para uma etapa específica
  const navigateToStep = useCallback((
    step: OnboardingStep, 
    options: NavigationOptions = {}
  ) => {
    const { type = 'club', force = false } = options;
    const routes = type === 'club' ? clubRoutes : formacaoRoutes;
    const targetRoute = routes[step];

    if (targetRoute) {
      console.log(`[Navigation] Navegando para etapa: ${step} -> ${targetRoute}`);
      
      if (force) {
        window.location.href = targetRoute;
      } else {
        navigate(targetRoute);
      }
    } else {
      console.error(`[Navigation] Rota não encontrada para etapa: ${step}`);
    }
  }, [navigate]);

  // Navegar para próxima etapa
  const navigateToNext = useCallback((
    currentStep: OnboardingStep,
    options: NavigationOptions = {}
  ) => {
    const { type = 'club' } = options;
    const sequence = stepSequences[type];
    const currentIndex = sequence.indexOf(currentStep);
    
    if (currentIndex >= 0 && currentIndex < sequence.length - 1) {
      const nextStep = sequence[currentIndex + 1];
      navigateToStep(nextStep, options);
    } else {
      console.warn(`[Navigation] Não há próxima etapa após: ${currentStep}`);
    }
  }, [navigateToStep]);

  // Navegar para etapa anterior
  const navigateToPrevious = useCallback((
    currentStep: OnboardingStep,
    options: NavigationOptions = {}
  ) => {
    const { type = 'club' } = options;
    const sequence = stepSequences[type];
    const currentIndex = sequence.indexOf(currentStep);
    
    if (currentIndex > 0) {
      const previousStep = sequence[currentIndex - 1];
      navigateToStep(previousStep, options);
    } else {
      console.warn(`[Navigation] Não há etapa anterior antes de: ${currentStep}`);
    }
  }, [navigateToStep]);

  // Verificar se uma etapa é válida
  const isValidStep = useCallback((
    step: string,
    type: OnboardingType = 'club'
  ): step is OnboardingStep => {
    return stepSequences[type].includes(step as OnboardingStep);
  }, []);

  // Obter próxima etapa
  const getNextStep = useCallback((
    currentStep: OnboardingStep,
    type: OnboardingType = 'club'
  ): OnboardingStep | null => {
    const sequence = stepSequences[type];
    const currentIndex = sequence.indexOf(currentStep);
    
    if (currentIndex >= 0 && currentIndex < sequence.length - 1) {
      return sequence[currentIndex + 1];
    }
    
    return null;
  }, []);

  // Obter etapa anterior
  const getPreviousStep = useCallback((
    currentStep: OnboardingStep,
    type: OnboardingType = 'club'
  ): OnboardingStep | null => {
    const sequence = stepSequences[type];
    const currentIndex = sequence.indexOf(currentStep);
    
    if (currentIndex > 0) {
      return sequence[currentIndex - 1];
    }
    
    return null;
  }, []);

  // Resetar onboarding (voltar ao início)
  const resetOnboarding = useCallback((
    type: OnboardingType = 'club'
  ) => {
    const firstStep = stepSequences[type][0];
    navigateToStep(firstStep, { type, force: true });
  }, [navigateToStep]);

  return {
    navigateToStep,
    navigateToNext,
    navigateToPrevious,
    isValidStep,
    getNextStep,
    getPreviousStep,
    resetOnboarding,
    stepSequences,
    clubRoutes,
    formacaoRoutes
  };
};
