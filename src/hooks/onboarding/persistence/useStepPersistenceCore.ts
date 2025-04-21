
import { useProgress } from "../useProgress";
import { buildUpdateObject } from "./stepDataBuilder";
import { navigateAfterStep } from "./stepNavigator";
import { steps } from "../useStepDefinitions";
import { toast } from "sonner";
import { useLogging } from "@/hooks/useLogging";

export function useStepPersistenceCore({
  currentStepIndex,
  setCurrentStepIndex,
  navigate,
}: {
  currentStepIndex: number;
  setCurrentStepIndex: (i: number) => void;
  navigate: (path: string) => void;
}) {
  const { progress, updateProgress, refreshProgress } = useProgress();
  const { logError } = useLogging();

  // Simplificando a interface para aceitar apenas um objeto de dados
  const saveStepData = async (
    data: any,
    shouldNavigate: boolean = true
  ): Promise<void> => {
    if (!progress?.id) {
      console.error("Não foi possível salvar dados: ID de progresso não encontrado");
      toast.error("Erro ao salvar dados: ID de progresso não encontrado");
      return;
    }

    // Identificar qual é o passo atual baseado no currentStepIndex
    const currentStep = steps[currentStepIndex]?.id || '';
    
    console.log(`Salvando dados do passo ${currentStep}, índice ${currentStepIndex}, navegação automática: ${shouldNavigate ? "SIM" : "NÃO"}`, data);
    console.log("Estado atual do progresso:", progress);

    try {
      // Montar objeto de atualização para a etapa
      const updateObj = buildUpdateObject(currentStep, data, progress, currentStepIndex);
      if (Object.keys(updateObj).length === 0) {
        console.warn("Objeto de atualização vazio, nada para salvar");
        toast.warning("Sem dados para salvar");
        return;
      }

      console.log("Dados a serem enviados para o Supabase:", updateObj);

      // Atualizar no Supabase
      const updatedProgress = await updateProgress(updateObj);
      console.log("Dados atualizados com sucesso no banco:", updatedProgress);

      // Forçar atualização dos dados local após salvar
      await refreshProgress();
      console.log("Dados locais atualizados após salvar");
      
      // Notificar usuário do salvamento
      toast.success("Dados salvos com sucesso!");
      
      // Garantir navegação adequada para cada etapa
      if (shouldNavigate) {
        // Mapeamento direto das etapas para navegação garantida
        if (currentStep === "personal") {
          setTimeout(() => navigate("/onboarding/professional-data"), 500);
        } else if (currentStep === "professional_data") {
          setTimeout(() => navigate("/onboarding/business-context"), 500);
        } else if (currentStep === "business_context") {
          setTimeout(() => navigate("/onboarding/ai-experience"), 500);
        } else if (currentStep === "ai_exp") {
          setTimeout(() => navigate("/onboarding/club-goals"), 500);
        } else if (currentStep === "business_goals") {
          setTimeout(() => navigate("/onboarding/customization"), 500);
        } else if (currentStep === "experience_personalization") {
          setTimeout(() => navigate("/onboarding/complementary"), 500);
        } else if (currentStep === "complementary_info") {
          setTimeout(() => navigate("/onboarding/review"), 500);
        } else if (currentStep === "review") {
          setTimeout(() => navigate("/implementation-trail"), 500);
        } else {
          // Usar navegador de etapas padrão como fallback
          console.log(`Usando navegação padrão para etapa: ${currentStep}`);
          navigateAfterStep(currentStep, currentStepIndex, navigate, shouldNavigate);
        }
      } else {
        console.log("Navegação automática desativada, permanecendo na página atual");
      }
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      logError("save_step_data_error", { 
        step: currentStep, 
        error: error instanceof Error ? error.message : String(error),
        stepIndex: currentStepIndex
      });
      toast.error("Erro ao salvar dados. Por favor, tente novamente.");
      throw error;
    }
  };

  // Finaliza onboarding (marca como completo e leva à tela de trilha)
  const completeOnboarding = async () => {
    if (!progress?.id) {
      toast.error("Progresso não encontrado. Tente recarregar a página.");
      return;
    }
    
    try {
      console.log("Completando onboarding...");
      
      // Marca o onboarding como concluído
      await updateProgress({
        is_completed: true,
        completed_steps: steps.map(s => s.id),
      });
      
      // Atualiza dados locais
      await refreshProgress();
      console.log("Onboarding marcado como completo, gerando trilha de implementação...");
      
      toast.success("Onboarding concluído com sucesso!");
      
      // Usar setTimeout para garantir que a navegação ocorra após a atualização do estado
      setTimeout(() => {
        try {
          // Redirecionar para a página de geração de trilha com parâmetro para iniciar automaticamente
          navigate("/onboarding/trail-generation?autoGenerate=true");
        } catch (navError) {
          console.error("Erro ao navegar para a geração de trilha:", navError);
          logError("navigation_error", { 
            from: "completeOnboarding", 
            error: navError instanceof Error ? navError.message : String(navError) 
          });
          // Fallback para dashboard em caso de erro de navegação
          navigate("/dashboard");
        }
      }, 800);
    } catch (error) {
      console.error("Erro ao completar onboarding:", error);
      logError("complete_onboarding_error", { 
        error: error instanceof Error ? error.message : String(error) 
      });
      toast.error("Erro ao finalizar onboarding. Por favor, tente novamente.");
      
      // Mesmo com erro, tentar redirecionar para o dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    }
  };

  return {
    saveStepData,
    completeOnboarding,
  };
}
