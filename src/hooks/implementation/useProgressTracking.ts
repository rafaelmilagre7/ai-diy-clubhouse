import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase, Progress } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

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
  
  const [isCompleting, setIsCompleting] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Update progress when module changes
  useEffect(() => {
    const updateProgress = async () => {
      if (!user || !id || !progress) return;
      
      try {
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
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    };
    
    updateProgress();
  }, [moduleIdx, user, id, progress]);
  
  // Mark module as completed
  const handleMarkAsCompleted = async () => {
    // Show confirmation modal for last module
    if (moduleIdx >= modulesLength - 1) {
      setShowConfirmationModal(true);
      return;
    }
    
    // Otherwise just mark this module as completed
    if (user && progress) {
      try {
        // Add this module to completed modules if not already there
        if (!completedModules.includes(moduleIdx)) {
          const updatedCompletedModules = [...completedModules, moduleIdx];
          
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
          
          setCompletedModules(updatedCompletedModules);
          
          toast({
            title: "Módulo concluído!",
            description: "Este módulo foi marcado como concluído com sucesso.",
          });
        }
      } catch (error) {
        console.error("Error marking module as completed:", error);
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
        
        // Add this module to completed modules if not already there
        let updatedCompletedModules = [...completedModules];
        if (!completedModules.includes(moduleIdx)) {
          updatedCompletedModules = [...completedModules, moduleIdx];
        }
        
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
      } catch (error) {
        console.error("Error completing implementation:", error);
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
    setModuleInteraction
  };
};
