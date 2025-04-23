
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useLogging } from "@/hooks/useLogging";

interface UseModuleCompletionProps {
  moduleIdx: number;
  progressId?: string;
  solutionId?: string;
  completedModules: number[];
  setCompletedModules: (modules: number[]) => void;
  modulesLength: number;
  hasInteracted?: boolean;
  requireUserConfirmation?: boolean;
}

export const useModuleCompletion = ({
  moduleIdx,
  progressId,
  solutionId,
  completedModules,
  setCompletedModules,
  modulesLength,
  hasInteracted = false,
  requireUserConfirmation = true
}: UseModuleCompletionProps) => {
  const [markingAsCompleted, setMarkingAsCompleted] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const { toast } = useToast();
  const { log, logError } = useLogging("useModuleCompletion");
  
  // Verifica se o módulo atual já foi concluído
  const isModuleCompleted = completedModules.includes(moduleIdx);
  
  // Função para marcar o módulo como concluído
  const handleMarkAsCompleted = async () => {
    // Se o módulo já está marcado como concluído
    if (isModuleCompleted) {
      log("Módulo já concluído", { moduleIdx });
      return;
    }
    
    // Se precisar de confirmação do usuário e não houve interação
    if (requireUserConfirmation && !hasInteracted) {
      setShowConfirmationModal(true);
      return;
    }
    
    // Se não há ID de progresso, não podemos continuar
    if (!progressId) {
      logError("Sem ID de progresso para marcar conclusão", { moduleIdx });
      toast({
        title: "Erro ao salvar progresso",
        description: "Não foi possível salvar seu progresso. Por favor, tente novamente.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setMarkingAsCompleted(true);
      
      // Adicionar o módulo atual à lista de concluídos
      const updatedModules = [...completedModules, moduleIdx];
      
      // Atualizar no banco de dados
      const { error } = await supabase
        .from("progress")
        .update({
          completed_modules: updatedModules,
          current_module: Math.min(moduleIdx + 1, modulesLength - 1),
          last_activity: new Date().toISOString()
        })
        .eq("id", progressId);
        
      if (error) throw error;
      
      // Atualizar o estado local
      setCompletedModules(updatedModules);
      
      log("Módulo marcado como concluído", { 
        moduleIdx, 
        progressId,
        solutionId,
        updatedModules
      });
      
      toast({
        title: "Módulo concluído",
        description: "Seu progresso foi salvo com sucesso."
      });
    } catch (error) {
      logError("Erro ao marcar módulo como concluído", { error, moduleIdx });
      toast({
        title: "Erro ao salvar progresso",
        description: "Não foi possível salvar seu progresso. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setMarkingAsCompleted(false);
      setShowConfirmationModal(false);
    }
  };
  
  return {
    isModuleCompleted,
    markingAsCompleted,
    handleMarkAsCompleted,
    showConfirmationModal,
    setShowConfirmationModal
  };
};
