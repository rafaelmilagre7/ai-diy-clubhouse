
import { steps } from "../useStepDefinitions";
import { toast } from "sonner";

/**
 * Navega para a próxima etapa após salvar os dados da etapa atual
 * Utiliza um mapeamento direto quando possível, ou fallback para navegação sequencial
 */
export function navigateAfterStep(
  stepId: string, 
  currentStepIndex: number, 
  navigate: (path: string) => void, 
  shouldNavigate: boolean = true
) {
  // Se não devemos navegar automaticamente, retornar imediatamente
  if (!shouldNavigate) {
    console.log("Navegação automática desativada, permanecendo na página atual");
    return;
  }

  // Mapeamento explícito de etapas para rotas de navegação
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
    const nextPath = stepToRouteMap[stepId];
    console.log(`Navegando de ${stepId} para ${nextPath}`);
    
    // Usar um delay antes da navegação para garantir que todos os estados foram atualizados
    setTimeout(() => {
      console.log(`Executando navegação para: ${nextPath}`);
      navigate(nextPath);
      toast.success("Avançando para a próxima etapa");
    }, 800);
  } else {
    // Fallback para navegação sequencial usando o array de steps
    console.warn(`Etapa ${stepId} não encontrada no mapeamento direto, usando fallback sequencial`);
    const nextStepIndex = Math.min(currentStepIndex + 1, steps.length - 1);
    const nextPath = steps[nextStepIndex]?.path || "/onboarding";
    
    setTimeout(() => {
      console.log(`Executando navegação de fallback para: ${nextPath}`);
      navigate(nextPath);
    }, 800);
  }
}

/**
 * Navega diretamente para uma etapa específica pelo seu ID
 */
export function navigateToStepById(stepId: string, navigate: (path: string) => void) {
  const stepIndex = steps.findIndex(step => step.id === stepId);
  if (stepIndex >= 0) {
    const path = steps[stepIndex].path;
    console.log(`Navegando diretamente para etapa ${stepId} com caminho ${path}`);
    navigate(path);
  } else {
    console.warn(`Etapa ${stepId} não encontrada para navegação direta`);
    navigate("/onboarding"); // Fallback para a primeira etapa
  }
}

/**
 * Navega diretamente para um caminho específico
 */
export function directNavigateToPath(path: string, navigate: (path: string) => void) {
  console.log(`Navegação direta para caminho: ${path}`);
  navigate(path);
}
