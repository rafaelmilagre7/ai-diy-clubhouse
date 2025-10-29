
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToastModern } from "@/hooks/useToastModern";
import { useLogging } from "@/hooks/useLogging";

interface SolutionCompletionProps {
  progressId?: string;
  solutionId?: string;
  moduleIdx: number;
  completedModules: number[];
  setCompletedModules: React.Dispatch<React.SetStateAction<number[]>>;
}

export const useSolutionCompletion = ({
  progressId,
  solutionId,
  moduleIdx,
  completedModules,
  setCompletedModules
}: SolutionCompletionProps) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { log, logError } = useLogging();
  const { showError, showSuccess } = useToastModern();
  
  const handleConfirmImplementation = async (): Promise<boolean> => {
    if (!progressId || !solutionId) {
      showError("Erro", "Não foi possível completar a implementação. Dados de progresso inválidos.");
      return false;
    }
    
    setIsCompleting(true);
    
    try {
      log("Confirming implementation", { 
        progress_id: progressId, 
        solution_id: solutionId 
      });
      
      // Marcar solução como implementada
      console.log("🔧 [DEBUG] Tentando marcar solução como implementada:", { 
        progressId, 
        solutionId, 
        completedModules,
        moduleIdx 
      });
      
      const { error } = await supabase
        .from("progress")
        .update({
          is_completed: true,
          completed_modules: [...new Set([...completedModules, moduleIdx])],
          completed_at: new Date().toISOString(),
        })
        .eq("id", progressId);
      
      if (error) {
        console.error("🔧 [DEBUG] Erro ao atualizar progresso:", error);
        throw error;
      }
      
      console.log("🔧 [DEBUG] Progresso atualizado com sucesso!");
      
      log("Implementation marked as complete", { 
        progress_id: progressId,
        solution_id: solutionId
      });
      
      // Atualizar estado local
      setCompletedModules(prev => [...new Set([...prev, moduleIdx])]);
      setIsCompleted(true);
      
      showSuccess("Parabéns!", "Você concluiu com sucesso a implementação desta solução.");
      
      return true;
    } catch (error) {
      logError("Error confirming implementation", error);
      showError("Erro", "Ocorreu um erro ao tentar completar a implementação. Tente novamente.");
      return false;
    } finally {
      setIsCompleting(false);
    }
  };
  
  return {
    isCompleting,
    isCompleted,
    handleConfirmImplementation
  };
};
