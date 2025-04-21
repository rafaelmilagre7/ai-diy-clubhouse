
import { steps } from "../useStepDefinitions";
import { toast } from "sonner";

export function navigateAfterStep(stepId: string, currentStepIndex: number, navigate: (path: string) => void, shouldNavigate: boolean = true) {
  // Se não devemos navegar automaticamente, retornar imediatamente
  if (!shouldNavigate) {
    console.log("Navegação automática desativada, permanecendo na página atual");
    return;
  }

  let nextPath = "";

  console.log(`Determinando próxima rota para o passo ${stepId}, shouldNavigate=${shouldNavigate}`);

  if (stepId === "personal") {
    nextPath = "/onboarding/professional-data";
  } else if (stepId === "professional_data") {
    nextPath = "/onboarding/business-context";
  } else if (stepId === "business_context") {
    nextPath = "/onboarding/ai-experience";
  } else if (stepId === "ai_exp") {
    nextPath = "/onboarding/club-goals";
    console.log("AI Experience completado, navegando para club-goals");
  } else if (stepId === "business_goals") {
    nextPath = "/onboarding/customization";
  } else if (stepId === "experience_personalization") {
    nextPath = "/onboarding/complementary";
  } else if (stepId === "complementary_info") {
    nextPath = "/onboarding/review";
  } else if (stepId === "review") {
    // Direcionar diretamente para a geração da trilha após a revisão
    nextPath = "/onboarding/trail-generation?autoGenerate=true";
  } else if (stepId === "goals") {
    // Caso especial para tratamento dos dados de empresa (componente reutilizado)
    nextPath = "/onboarding/business-context";
  } else {
    // fallback genérico pelo steps[]
    const nextStepIndex = Math.min(currentStepIndex + 1, steps.length - 1);
    nextPath = steps[nextStepIndex]?.path || "/onboarding";
  }

  // Faz navegação com pequeno delay para UX consistente
  console.log(`Navegando automaticamente para: ${nextPath}`);
  toast.success("Etapa concluída! Avançando...");
  setTimeout(() => {
    console.log(`Executando navegação para: ${nextPath}`);
    navigate(nextPath);
  }, 800);
}
