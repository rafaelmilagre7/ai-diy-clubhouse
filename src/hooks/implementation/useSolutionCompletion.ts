
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
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
  
  const handleConfirmImplementation = async (): Promise<boolean> => {
    if (!progressId || !solutionId) {
      toast({
        title: "Erro",
        description: "Não foi possível completar a implementação. Dados de progresso inválidos.",
        variant: "destructive",
      });
      return false;
    }
    
    setIsCompleting(true);
    
    try {
      log("Confirming implementation", { 
        progress_id: progressId, 
        solution_id: solutionId 
      });
      
      // Marcar solução como implementada
      const { error } = await supabase
        .from("progress")
        .update({
          is_completed: true,
          completed_modules: [...new Set([...completedModules, moduleIdx])],
          completed_at: new Date().toISOString(), // Updated column name
        } as any)
        .eq("id", progressId as any);
      
      if (error) {
        throw error;
      }
      
      log("Implementation marked as complete", { 
        progress_id: progressId,
        solution_id: solutionId
      });
      
      // Atualizar estado local
      setCompletedModules(prev => [...new Set([...prev, moduleIdx])]);
      setIsCompleted(true);
      
      toast({
        title: "Parabéns!",
        description: "Você concluiu com sucesso a implementação desta solução.",
      });
      
      return true;
    } catch (error) {
      logError("Error confirming implementation", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao tentar completar a implementação. Tente novamente.",
        variant: "destructive",
      });
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
