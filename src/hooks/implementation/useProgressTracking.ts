
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";
import { calculateProgressPercentage, logProgressEvent } from "./utils/progressUtils";
import { Progress } from "@/types/solution";
import { toast } from "sonner";

export const useProgressTracking = (
  solutionId: string,
  progress: Progress | null,
  currentModuleIdx: number,
  totalModules: number = 8
) => {
  const { log, logError } = useLogging("useProgressTracking");
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Inicializar array de módulos concluídos a partir do progresso existente
  useEffect(() => {
    if (progress && Array.isArray(progress.completed_modules)) {
      setCompletedModules(progress.completed_modules);
    }
  }, [progress]);

  // Marcar um módulo como concluído
  const markModuleCompleted = useCallback(async (moduleIdx: number) => {
    if (!solutionId || isUpdating) return;
    
    // Verificar se o módulo já está marcado como concluído
    if (completedModules.includes(moduleIdx)) {
      log("Módulo já estava marcado como concluído", { moduleIdx });
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Adicionar o novo módulo à lista de concluídos
      const updatedModules = [...completedModules, moduleIdx];
      
      // Atualizar o estado local primeiro para UI responsiva
      setCompletedModules(updatedModules);
      
      // Se existir um registro de progresso, atualizar
      if (progress?.id) {
        const { error } = await supabase
          .from("progress")
          .update({
            completed_modules: updatedModules,
            current_module: Math.max(currentModuleIdx, moduleIdx + 1), // Avançar para o próximo módulo
            last_activity: new Date().toISOString()
          })
          .eq("id", progress.id);
          
        if (error) throw error;
        
        // Registrar evento de progresso para análise
        await logProgressEvent(
          progress.user_id,
          solutionId,
          "module_completed",
          { moduleIdx, total_completed: updatedModules.length }
        );
      }
      
      // Feedback visual
      toast.success("Módulo concluído com sucesso!");
      
    } catch (error) {
      logError("Erro ao atualizar progresso", { error, moduleIdx });
      toast.error("Erro ao salvar seu progresso. Tente novamente.");
      
      // Reverter estado em caso de erro
      setCompletedModules(completedModules);
    } finally {
      setIsUpdating(false);
    }
  }, [solutionId, progress, completedModules, currentModuleIdx, log, logError]);

  // Calcular porcentagem de conclusão
  const completionPercentage = calculateProgressPercentage(
    completedModules, 
    totalModules
  );
  
  // Função para calcular a porcentagem de progresso
  const calculateProgress = useCallback(() => {
    return Math.round((completedModules.length / totalModules) * 100);
  }, [completedModules, totalModules]);

  // Função para confirmar implementação
  const handleConfirmImplementation = useCallback(async () => {
    if (!solutionId || !progress?.id) {
      toast.error("Dados insuficientes para concluir a implementação.");
      return false;
    }

    setIsCompleting(true);
    try {
      const { error } = await supabase
        .from("progress")
        .update({
          is_completed: true,
          implementation_status: 'completed',
          completed_at: new Date().toISOString(),
          last_activity: new Date().toISOString()
        })
        .eq("id", progress.id);

      if (error) throw error;
      
      // Registrar evento de conclusão
      await logProgressEvent(
        progress.user_id,
        solutionId,
        "solution_completed",
        { totalModules, completedModules: completedModules.length }
      );
      
      return true;
    } catch (error) {
      logError("Erro ao confirmar implementação", { error });
      toast.error("Erro ao confirmar implementação. Tente novamente.");
      return false;
    } finally {
      setIsCompleting(false);
    }
  }, [solutionId, progress, completedModules.length, logError, totalModules]);

  return {
    completedModules,
    setCompletedModules,
    markModuleCompleted,
    isUpdating,
    completionPercentage,
    calculateProgress,
    handleConfirmImplementation,
    isCompleting
  };
};
