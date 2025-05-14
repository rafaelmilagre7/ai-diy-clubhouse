
import { getStepsByUserType } from "../useStepDefinitions";

export function navigateAfterStep(
  stepId: string, 
  currentStepIndex: number | undefined, 
  navigate: (path: string) => void,
  shouldNavigate: boolean = true,
  onboardingType: 'club' | 'formacao' = 'club'
) {
  // Se não devemos navegar automaticamente, retornar
  if (!shouldNavigate) {
    console.log("[stepNavigator] Navegação automática desativada, permanecendo na página atual");
    return;
  }
  
  console.log(`[stepNavigator] Determinando próxima rota após etapa ${stepId} (índice atual: ${currentStepIndex}, tipo: ${onboardingType})`);
  
  // Mapeamentos específicos para o tipo club
  const clubNextRouteMap: {[key: string]: string} = {
    "personal_info": "/onboarding/professional-data",
    "professional_info": "/onboarding/business-context",
    "business_context": "/onboarding/ai-experience",
    "ai_experience": "/onboarding/club-goals",
    "business_goals": "/onboarding/customization",
    "experience_personalization": "/onboarding/complementary",
    "complementary_info": "/onboarding/review"
  };
  
  // Mapeamentos específicos para o tipo formação
  const formacaoNextRouteMap: {[key: string]: string} = {
    "personal_info": "/onboarding/formacao/ai-experience",
    "ai_experience": "/onboarding/formacao/goals",
    "learning_goals": "/onboarding/formacao/preferences",
    "learning_preferences": "/onboarding/formacao/review"
  };
  
  // Escolher o mapeamento com base no tipo de onboarding
  const nextRouteMap = onboardingType === 'club' ? clubNextRouteMap : formacaoNextRouteMap;
  
  // Verificar se temos uma rota direta para o próximo passo
  if (nextRouteMap[stepId]) {
    const nextRoute = nextRouteMap[stepId];
    console.log(`[stepNavigator] Navegando para ${nextRoute} (via mapeamento direto)`);
    
    // Uso de navigate para evitar recarregamento completo da página
    navigate(nextRoute);
    return;
  }
  
  // Caso alternativo: usar o índice atual para determinar o próximo passo
  if (typeof currentStepIndex === 'number' && currentStepIndex >= 0) {
    const steps = getStepsByUserType(onboardingType);
    
    if (currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1];
      console.log(`[stepNavigator] Navegando para ${nextStep.path} (próximo passo na sequência)`);
      
      navigate(nextStep.path);
    } else {
      // Determinar a página de revisão com base no tipo de onboarding
      const reviewPath = onboardingType === 'club' ? '/onboarding/review' : '/onboarding/formacao/review';
      console.log(`[stepNavigator] Navegando para ${reviewPath} (última etapa)`);
      
      navigate(reviewPath);
    }
    return;
  }
  
  console.warn("[stepNavigator] Não foi possível determinar a próxima etapa, permanecendo na página atual");
}

// Função para navegação direta para a etapa anterior
export function navigateToPreviousStep(
  stepId: string,
  navigate: (path: string) => void,
  onboardingType: 'club' | 'formacao' = 'club'
) {
  // Mapeamentos para navegação anterior
  const clubPrevRouteMap: {[key: string]: string} = {
    "professional_info": "/onboarding/personal-info",
    "business_context": "/onboarding/professional-data",
    "ai_experience": "/onboarding/business-context",
    "business_goals": "/onboarding/ai-experience",
    "experience_personalization": "/onboarding/club-goals",
    "complementary_info": "/onboarding/customization",
    "review": "/onboarding/complementary"
  };
  
  const formacaoPrevRouteMap: {[key: string]: string} = {
    "ai_experience": "/onboarding/formacao/personal-info",
    "learning_goals": "/onboarding/formacao/ai-experience",
    "learning_preferences": "/onboarding/formacao/goals",
    "review": "/onboarding/formacao/preferences"
  };
  
  const prevRouteMap = onboardingType === 'club' ? clubPrevRouteMap : formacaoPrevRouteMap;
  
  if (prevRouteMap[stepId]) {
    const prevRoute = prevRouteMap[stepId];
    console.log(`[stepNavigator] Navegando para a etapa anterior ${prevRoute} (via mapeamento direto)`);
    navigate(prevRoute);
    return true;
  }
  
  console.warn(`[stepNavigator] Rota anterior não encontrada para a etapa: ${stepId}`);
  return false;
}
