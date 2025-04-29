
import { steps } from "../useStepDefinitions";

export function navigateAfterStep(
  stepId: string, 
  currentStepIndex: number | undefined, 
  navigate: (path: string) => void,
  shouldNavigate: boolean = true
) {
  // Se não devemos navegar automaticamente, retornar
  if (!shouldNavigate) {
    console.log("Navegação automática desativada, permanecendo na página atual");
    return;
  }
  
  console.log(`Determinando próxima rota após etapa ${stepId} (índice atual: ${currentStepIndex})`);
  
  // Mapeamento direto de etapas para rotas de navegação
  const nextRouteMap: {[key: string]: string} = {
    "personal": "/onboarding/professional-data",
    "professional_data": "/onboarding/business-context",
    "business_context": "/onboarding/ai-experience",
    "ai_exp": "/onboarding/club-goals",
    "business_goals": "/onboarding/customization",
    "experience_personalization": "/onboarding/complementary",
    "complementary_info": "/onboarding/review"
  };
  
  // Verificar se temos uma rota direta para o próximo passo
  if (nextRouteMap[stepId]) {
    const nextRoute = nextRouteMap[stepId];
    console.log(`Navegando para ${nextRoute} (via mapeamento direto)`);
    
    try {
      // Uso de navigate em vez de window.location.href para evitar recarregamento completo da página
      navigate(nextRoute);
      return;
    } catch (error) {
      console.error(`Erro ao navegar para ${nextRoute}:`, error);
      // Continuar com o método alternativo abaixo em caso de erro
    }
  }
  
  // Caso alternativo: usar o índice atual para determinar o próximo passo
  if (typeof currentStepIndex === 'number' && currentStepIndex >= 0) {
    try {
      if (currentStepIndex < steps.length - 1) {
        const nextStep = steps[currentStepIndex + 1];
        console.log(`Navegando para ${nextStep.path} (próximo passo na sequência)`);
        
        navigate(nextStep.path);
      } else {
        console.log('Navegando para /onboarding/review (última etapa)');
        
        navigate('/onboarding/review');
      }
      return;
    } catch (error) {
      console.error("Erro ao navegar para a próxima etapa:", error);
      // Se falhar, tentar uma navegação mais simples
    }
  }
  
  // Adicionar um fallback em caso de erro na determinação de rota
  try {
    console.warn("Não foi possível determinar a próxima etapa, assumindo primeira etapa");
    navigate('/onboarding');
  } catch (error) {
    console.error("Erro no fallback de navegação:", error);
    // Último recurso: recarregar a página para o onboarding
    window.location.href = '/onboarding';
  }
}
