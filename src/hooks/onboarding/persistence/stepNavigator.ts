
import { steps } from "../useStepDefinitions";

export function navigateAfterStep(stepId: string, currentStepIndex: number, navigate: (path: string) => void, shouldNavigate: boolean = true) {
  // Se não devemos navegar automaticamente, retornar imediatamente
  if (!shouldNavigate) {
    console.log("Navegação automática desativada, permanecendo na página atual");
    return;
  }

  let nextPath = "";

  console.log(`Determinando próxima rota para o passo ${stepId}, índice ${currentStepIndex}, shouldNavigate=${shouldNavigate}`);

  // Navegação baseada no ID do passo atual - mais confiável do que índices
  if (stepId === "personal") {
    nextPath = "/onboarding/professional-data";
  } else if (stepId === "professional_data") {
    nextPath = "/onboarding/business-context";
    console.log("Navegando de dados profissionais para contexto do negócio");
  } else if (stepId === "business_context") {
    nextPath = "/onboarding/ai-experience";
  } else if (stepId === "ai_exp") {
    nextPath = "/onboarding/club-goals";
  } else if (stepId === "business_goals") {
    nextPath = "/onboarding/customization";
  } else if (stepId === "experience_personalization") {
    nextPath = "/onboarding/complementary";
  } else if (stepId === "complementary_info") {
    nextPath = "/onboarding/review";
  } else if (stepId === "review") {
    // Direcionar para a página de implementação após a revisão
    nextPath = "/implementation-trail";
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
  }, 300);
}
