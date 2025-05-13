
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
    console.log("Navegação automática desativada, permanecendo na página atual");
    return;
  }
  
  console.log(`Determinando próxima rota após etapa ${stepId} (índice atual: ${currentStepIndex}, tipo: ${onboardingType})`);
  
  // Obter os passos apropriados para o tipo de usuário
  const steps = getStepsByUserType(onboardingType);
  
  // Mapeamentos específicos para o tipo club
  const clubNextRouteMap: {[key: string]: string} = {
    "personal": "/onboarding/professional-data",
    "personal_info": "/onboarding/professional-data",
    "professional_info": "/onboarding/business-context",
    "business_context": "/onboarding/ai-experience",
    "ai_exp": "/onboarding/club-goals",
    "ai_experience": "/onboarding/club-goals",
    "business_goals": "/onboarding/customization",
    "experience_personalization": "/onboarding/complementary",
    "complementary_info": "/onboarding/review"
  };
  
  // Mapeamentos específicos para o tipo formação
  const formacaoNextRouteMap: {[key: string]: string} = {
    "personal": "/onboarding/formacao/ai-experience",
    "personal_info": "/onboarding/formacao/ai-experience",
    "ai_exp": "/onboarding/formacao/goals",
    "ai_experience": "/onboarding/formacao/goals",
    "formation_goals": "/onboarding/formacao/preferences",
    "learning_goals": "/onboarding/formacao/preferences",
    "learning_preferences": "/onboarding/formacao/review"
  };
  
  // Escolher o mapeamento com base no tipo de onboarding
  const nextRouteMap = onboardingType === 'club' ? clubNextRouteMap : formacaoNextRouteMap;
  
  // Verificar se temos uma rota direta para o próximo passo
  if (nextRouteMap[stepId]) {
    const nextRoute = nextRouteMap[stepId];
    console.log(`Navegando para ${nextRoute} (via mapeamento direto)`);
    
    // Uso de navigate em vez de window.location.href para evitar recarregamento completo da página
    navigate(nextRoute);
    return;
  }
  
  // Caso alternativo: usar o índice atual para determinar o próximo passo
  if (typeof currentStepIndex === 'number' && currentStepIndex >= 0) {
    if (currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1];
      console.log(`Navegando para ${nextStep.path} (próximo passo na sequência)`);
      
      navigate(nextStep.path);
    } else {
      // Determinar a página de revisão com base no tipo de onboarding
      const reviewPath = onboardingType === 'club' ? '/onboarding/review' : '/onboarding/formacao/review';
      console.log(`Navegando para ${reviewPath} (última etapa)`);
      
      navigate(reviewPath);
    }
    return;
  }
  
  console.warn("Não foi possível determinar a próxima etapa, permanecendo na página atual");
}
