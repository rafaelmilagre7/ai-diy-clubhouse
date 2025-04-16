import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase, Progress } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useLogging } from "@/hooks/useLogging";

export const useProgressTracking = (
  progress: Progress | null, 
  completedModules: number[], 
  setCompletedModules: (modules: number[]) => void,
  modulesLength: number
) => {
  const { id, moduleIndex } = useParams<{ id: string; moduleIndex: string }>();
  const moduleIdx = parseInt(moduleIndex || "0");
  const { user } = useAuth();
  const { toast } = useToast();
  const { log, logError } = useLogging();
  
  const [isCompleting, setIsCompleting] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [requireUserConfirmation, setRequireUserConfirmation] = useState(true);

  // Update progress when module changes
  useEffect(() => {
    const updateProgress = async () => {
      if (!user || !id || !progress) return;
      
      try {
        log("Updating progress for module change", { 
          moduleIdx, 
          progressId: progress.id,
          solution_id: id
        });
        
        const { error } = await supabase
          .from("progress")
          .update({ 
            current_module: moduleIdx,
            last_activity: new Date().toISOString()
          })
          .eq("id", progress.id);
        
        if (error) {
          throw error;
        }
        
        log("Progress updated successfully");
      } catch (error) {
        logError("Error updating progress", error);
      }
    };
    
    updateProgress();
  }, [moduleIdx, user, id, progress, log, logError]);
  
  // Mark module as completed - Always requires user confirmation
  const handleMarkAsCompleted = async () => {
    // Always require user to confirm completion of final module
    if (moduleIdx >= modulesLength - 1) {
      log("Showing confirmation modal for final module", { moduleIdx, modulesLength });
      setShowConfirmationModal(true);
      return;
    }
    
    // Only mark as completed if user has actually interacted with the content
    if (!hasInteracted && requireUserConfirmation) {
      log("User hasn't interacted with content yet", { hasInteracted });
      toast({
        title: "Interação necessária",
        description: "Você precisa revisar o conteúdo completo antes de marcar como concluído.",
        variant: "warning",
      });
      return;
    }
    
    // Otherwise just mark this module as completed
    if (user && progress) {
      try {
        log("Marking module as completed", { moduleIdx });
        
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
            .eq("id", progress.id);
          
          if (error) {
            throw error;
          }
          
          // Update local state
          setCompletedModules(updatedCompletedModules);
          
          toast({
            title: "Módulo concluído!",
            description: "Este módulo foi marcado como concluído com sucesso.",
          });
          
          log("Module marked as completed successfully", { 
            moduleIdx, 
            updatedCompletedModules 
          });
        } else {
          log("Module already marked as completed", { moduleIdx });
        }
      } catch (error) {
        logError("Error marking module as completed", error);
        toast({
          title: "Erro ao marcar módulo",
          description: "Ocorreu um erro ao tentar marcar o módulo como concluído.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Handle full implementation confirmation
  const handleConfirmImplementation = async () => {
    if (user && progress) {
      try {
        setIsCompleting(true);
        log("Confirming full implementation", { solution_id: id });
        
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
          .eq("id", progress.id);
        
        if (error) {
          throw error;
        }
        
        // Close the confirmation modal and update completed modules
        setCompletedModules(updatedCompletedModules);
        setShowConfirmationModal(false);
        
        toast({
          title: "Implementação concluída!",
          description: "Parabéns! Você concluiu com sucesso a implementação desta solução.",
        });
        
        log("Implementation confirmed successfully", {
          solution_id: id,
          completed_modules: updatedCompletedModules
        });
      } catch (error) {
        logError("Error completing implementation", error);
        toast({
          title: "Erro ao concluir implementação",
          description: "Ocorreu um erro ao tentar marcar a implementação como concluída.",
          variant: "destructive",
        });
      } finally {
        setIsCompleting(false);
      }
    }
  };

  // Set interaction state for the current module
  const setModuleInteraction = (interacted: boolean) => {
    log("Setting module interaction", { interacted, moduleIdx });
    setHasInteracted(interacted);
  };
  
  // Calculate progress percentage based on completed modules
  const calculateProgress = () => {
    if (!modulesLength) return 0;
    return Math.min(100, Math.round((completedModules.length / modulesLength) * 100));
  };
  
  return {
    moduleIdx,
    isCompleting,
    hasInteracted,
    showConfirmationModal,
    setShowConfirmationModal,
    handleMarkAsCompleted,
    handleConfirmImplementation,
    calculateProgress,
    setModuleInteraction,
    requireUserConfirmation,
    setRequireUserConfirmation
  };
};
