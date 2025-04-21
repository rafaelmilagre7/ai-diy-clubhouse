
import { useProgress } from "../useProgress";
import { buildUpdateObject } from "./stepDataBuilder";
import { navigateAfterStep } from "./stepNavigator";
import { steps } from "../useStepDefinitions";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

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

  const saveStepData = async (
    stepId: string, 
    data: any,
    shouldNavigate: boolean = true
  ) => {
    if (!progress?.id) {
      console.error("Não foi possível salvar dados: ID de progresso não encontrado");
      toast.error("Erro ao salvar dados: ID de progresso não encontrado");
      return;
    }

    console.log(`Salvando dados do passo ${stepId}, navegação automática: ${shouldNavigate ? "SIM" : "NÃO"}`, data);

    try {
      // Montar objeto de atualização para a etapa
      const updateObj = buildUpdateObject(stepId, data, progress, currentStepIndex);
      if (Object.keys(updateObj).length === 0) {
        console.warn("Objeto de atualização vazio, nada para salvar");
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
      
      // Navegar para a próxima etapa apenas se solicitado
      if (shouldNavigate) {
        console.log(`Iniciando navegação automática após salvar o passo ${stepId}`);
        navigateAfterStep(stepId, currentStepIndex, navigate, shouldNavigate);
      } else {
        console.log("Navegação automática desativada, permanecendo na página atual");
      }
      
      return updatedProgress;
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar dados. Por favor, tente novamente.");
      throw error;
    }
  };

  // Finaliza onboarding (marca como completo e leva ao dashboard)
  const completeOnboarding = async () => {
    if (!progress?.id) return;
    try {
      console.log("Completando onboarding...");
      
      // Marca o onboarding como concluído
      await updateProgress({
        is_completed: true,
        completed_steps: steps.map(s => s.id),
      });
      
      // Atualiza dados locais
      const updatedProgress = await refreshProgress();
      console.log("Onboarding marcado como completo, gerando trilha de implementação...");
      
      // Gerar trilha de implementação personalizada
      try {
        // Buscar todas as soluções publicadas
        const { data: solutions } = await supabase
          .from("solutions")
          .select("*")
          .eq("published", true);
        
        if (solutions && solutions.length > 0) {
          // Chamar a função de geração de trilha
          const { data, error: fnError } = await supabase.functions.invoke("generate-implementation-trail", {
            body: {
              onboardingProgress: updatedProgress,
              availableSolutions: solutions,
            },
          });
          
          if (fnError) {
            console.error("Erro ao gerar trilha:", fnError);
          } else if (data && data.recommendations) {
            console.log("Trilha gerada com sucesso:", data.recommendations);
            
            // Salvar trilha no banco de dados
            const user = (await supabase.auth.getUser()).data.user;
            if (user) {
              try {
                await supabase
                  .from("implementation_trails")
                  .insert({
                    user_id: user.id,
                    trail_data: data.recommendations,
                  });
                console.log("Trilha salva no banco de dados");
              } catch (dbError) {
                console.error("Erro ao salvar trilha:", dbError);
              }
            }
          }
        } else {
          console.log("Nenhuma solução disponível para gerar trilha");
        }
      } catch (trailError) {
        console.error("Erro ao tentar gerar trilha:", trailError);
        // Não interromper o fluxo principal se a geração da trilha falhar
      }
      
      toast.success("Onboarding concluído com sucesso!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      console.error("Erro ao completar onboarding:", error);
      toast.error("Erro ao finalizar onboarding. Por favor, tente novamente.");
    }
  };

  return {
    saveStepData,
    completeOnboarding,
  };
}
