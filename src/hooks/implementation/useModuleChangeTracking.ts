
import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";
import { useAuth } from "@/contexts/auth";

export const useModuleChangeTracking = (solutionId: string, moduleIdx: number) => {
  const { log, logError } = useLogging("useModuleChangeTracking");
  const { user } = useAuth();
  
  /**
   * Registrar a visualização do módulo para fins de análise
   */
  const trackModuleView = useCallback((moduleIdx: number, moduleId: string) => {
    if (!user || !solutionId || !moduleId) return;
    
    const trackView = async () => {
      try {
        // Inserir registro de visualização
        const { error } = await supabase
          .from("module_views")
          .insert({
            user_id: user.id,
            solution_id: solutionId,
            module_id: moduleId,
            module_idx: moduleIdx,
            viewed_at: new Date().toISOString()
          });
          
        if (error) {
          // Ignorar erros de duplicação (visualizações repetidas)
          if (!error.message.includes("duplicate")) {
            throw error;
          }
        }
        
        // Registrar no log para diagnóstico
        log("Visualização de módulo registrada", {
          moduleIdx,
          moduleId,
          solutionId
        });
      } catch (error) {
        // Apenas registrar erro - não exibir ao usuário
        logError("Erro ao registrar visualização", { error, moduleIdx });
      }
    };
    
    // Executar assincronamente
    trackView();
  }, [user, solutionId, log, logError]);

  return {
    trackModuleView
  };
};
