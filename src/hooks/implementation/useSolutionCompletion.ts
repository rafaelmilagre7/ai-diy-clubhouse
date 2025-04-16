
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { useLogging } from "@/hooks/useLogging";
import { logProgressEvent } from "./utils/progressUtils";

interface UseSolutionCompletionProps {
  progressId: string | undefined;
  solutionId: string | undefined;
  moduleIdx: number;
  completedModules: number[];
  setCompletedModules: (modules: number[]) => void;
}

/**
 * Hook to handle completing the entire solution implementation
 */
export const useSolutionCompletion = ({
  progressId,
  solutionId,
  moduleIdx,
  completedModules,
  setCompletedModules
}: UseSolutionCompletionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { log, logError } = useLogging();
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Handle full implementation confirmation
  const handleConfirmImplementation = async () => {
    if (!user || !progressId) return;
    
    try {
      setIsCompleting(true);
      logProgressEvent(log, "Confirming full implementation", { solution_id: solutionId });
      
      // Add this module to completed modules if not already there
      let updatedCompletedModules = [...completedModules];
      if (!completedModules.includes(moduleIdx)) {
        updatedCompletedModules = [...completedModules, moduleIdx];
      }
      
      // Update in database
      const { error } = await supabase
        .from("progress")
        .update({ 
          is_completed: true,
          completion_date: new Date().toISOString(),
          completed_modules: updatedCompletedModules,
          last_activity: new Date().toISOString()
        })
        .eq("id", progressId);
      
      if (error) {
        throw error;
      }
      
      // Update completed modules
      setCompletedModules(updatedCompletedModules);
      
      toast({
        title: "Implementação concluída!",
        description: "Parabéns! Você concluiu com sucesso a implementação desta solução.",
      });
      
      logProgressEvent(log, "Implementation confirmed successfully", {
        solution_id: solutionId,
        completed_modules: updatedCompletedModules
      });
      
      return true;
    } catch (error) {
      logError("Error completing implementation", error);
      toast({
        title: "Erro ao concluir implementação",
        description: "Ocorreu um erro ao tentar marcar a implementação como concluída.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsCompleting(false);
    }
  };
  
  return {
    isCompleting,
    handleConfirmImplementation
  };
};
