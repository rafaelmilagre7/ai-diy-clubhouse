
import { useState } from "react";
import { supabase, Progress } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useToastModern } from "@/hooks/useToastModern";
import { useLogging } from "@/hooks/useLogging";
import { validateModuleInteraction, logProgressEvent } from "./utils/progressUtils";

interface UseModuleCompletionProps {
  moduleIdx: number;
  progressId: string | undefined;
  solutionId: string | undefined;
  completedModules: number[];
  setCompletedModules: (modules: number[]) => void;
  modulesLength: number;
  hasInteracted: boolean;
  requireUserConfirmation: boolean;
}

/**
 * Hook to handle marking modules as completed
 */
export const useModuleCompletion = ({
  moduleIdx,
  progressId,
  solutionId,
  completedModules,
  setCompletedModules,
  modulesLength,
  hasInteracted,
  requireUserConfirmation
}: UseModuleCompletionProps) => {
  const { user } = useAuth();
  const { showError, showSuccess, showInfo } = useToastModern();
  const { log, logError } = useLogging();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  
  // Mark module as completed - Always requires user confirmation for final module
  const handleMarkAsCompleted = async () => {
    // Always require user to confirm completion of final module
    if (moduleIdx >= modulesLength - 1) {
      logProgressEvent(log, "Showing confirmation modal for final module", { 
        moduleIdx, 
        modulesLength 
      });
      setShowConfirmationModal(true);
      return;
    }
    
    // Validate that user has interacted with the content
    const validation = validateModuleInteraction(hasInteracted, requireUserConfirmation);
    if (!validation.isValid) {
      log("User hasn't interacted with content yet", { hasInteracted });
      showInfo("Interação necessária", validation.message);
      return;
    }
    
    // Mark this module as completed
    await completeModule();
  };
  
  // Save completed module to database
  const completeModule = async () => {
    if (!user || !progressId) return false;
    
    try {
      logProgressEvent(log, "Marking module as completed", { moduleIdx });
      
      // Add this module to completed modules if not already there
      if (!completedModules.includes(moduleIdx)) {
        const updatedCompletedModules = [...completedModules, moduleIdx];
        
        // Update in database
        const { error } = await supabase
          .from("progress")
          .update({ 
            completed_modules: updatedCompletedModules,
            last_activity: new Date().toISOString()
          })
          .eq("id", progressId);
        
        if (error) {
          throw error;
        }
        
        // Update local state
        setCompletedModules(updatedCompletedModules);
        
        showSuccess("Módulo concluído!", "Este módulo foi marcado como concluído com sucesso.");
        
        logProgressEvent(log, "Module marked as completed successfully", { 
          moduleIdx, 
          updatedCompletedModules 
        });
        
        return true;
      } else {
        log("Module already marked as completed", { moduleIdx });
        return false;
      }
    } catch (error) {
      logError("Error marking module as completed", error);
      showError("Erro ao marcar módulo", "Ocorreu um erro ao tentar marcar o módulo como concluído.");
      return false;
    }
  };
  
  return {
    handleMarkAsCompleted,
    completeModule,
    showConfirmationModal,
    setShowConfirmationModal
  };
};
