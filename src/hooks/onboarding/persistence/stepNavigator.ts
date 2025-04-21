
import { steps } from "../useStepDefinitions";

export function navigateAfterStep(stepId: string, currentStepIndex: number, navigate: (path: string) => void, shouldNavigate: boolean = true) {
  // Se não devemos navegar automaticamente, retornar imediatamente
  if (!shouldNavigate) {
    console.log("Navegação automática desativada, permanecendo na página atual");
    return;
  }

  let nextPath = "";

  console.log(`Determinando próxima rota para o passo ${stepId}, índice ${currentStepIndex}, shouldNavigate=${shouldNavigate}`);

  // Mapeamento direto de etapas para rotas - abordagem mais robusta
  const stepToRouteMap: {[key: string]: string} = {
    "personal": "/onboarding/professional-data",
    "professional_data": "/onboarding/business-context",
    "business_context": "/onboarding/ai-experience",
    "ai_exp": "/onboarding/club-goals",
    "business_goals": "/onboarding/customization",
    "experience_personalization": "/onboarding/complementary",
    "complementary_info": "/onboarding/review",
    "review": "/implementation-trail"
  };

  // Verificar se temos um mapeamento direto para esta etapa
  if (stepToRouteMap[stepId]) {
    nextPath = stepToRouteMap[stepId];
    console.log(`Usando mapeamento direto para navegar de ${stepId} para ${nextPath}`);
  } else {
    // Fallback genérico usando o array de steps
    const nextStepIndex = Math.min(currentStepIndex + 1, steps.length - 1);
    nextPath = steps[nextStepIndex]?.path || "/onboarding";
    console.log(`Usando fallback para navegação: índice ${nextStepIndex}, caminho ${nextPath}`);
  }

  // Faz navegação com pequeno delay para UX consistente
  console.log(`Navegando automaticamente para: ${nextPath}`);
  
  setTimeout(() => {
    console.log(`Executando navegação para: ${nextPath}`);
    navigate(nextPath);
  }, 500); // Aumentado o delay para dar mais tempo para os estados se atualizarem
}
