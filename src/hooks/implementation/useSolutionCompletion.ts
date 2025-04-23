
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useLogging } from "@/hooks/useLogging";
import { useAuth } from "@/contexts/auth";

interface UseSolutionCompletionProps {
  progressId?: string;
  solutionId?: string;
  moduleIdx: number;
  completedModules: number[];
  setCompletedModules: (modules: number[]) => void;
}

export const useSolutionCompletion = ({
  progressId,
  solutionId,
  moduleIdx,
  completedModules,
  setCompletedModules
}: UseSolutionCompletionProps) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();
  const { log, logError } = useLogging("useSolutionCompletion");
  const { user } = useAuth();
  
  // Função para confirmar a implementação da solução
  const handleConfirmImplementation = async () => {
    // Se não há ID de progresso ou ID de solução, não podemos continuar
    if (!progressId || !solutionId || !user) {
      toast({
        title: "Erro ao completar implementação",
        description: "Informações insuficientes para completar a implementação.",
        variant: "destructive"
      });
      return Promise.reject(new Error("Informações insuficientes"));
    }
    
    try {
      setIsCompleting(true);
      
      // Marcar solução como implementada
      const { error } = await supabase
        .from("progress")
        .update({
          is_completed: true,
          implementation_status: "completed",
          completed_at: new Date().toISOString(),
          last_activity: new Date().toISOString()
        })
        .eq("id", progressId);
        
      if (error) throw error;
      
      // Registrar estatísticas de implementação
      await supabase.rpc('increment', {
        row_id: solutionId,
        table_name: 'solution_metrics',
        column_name: 'total_completions'
      }).catch(err => {
        // Log do erro, mas não bloquear o fluxo
        logError("Erro ao incrementar métricas", { error: err });
      });
      
      // Registra entrada de certificado
      await supabase
        .from("solution_certificates")
        .insert({
          user_id: user.id,
          solution_id: solutionId,
          issued_at: new Date().toISOString(),
          certificate_data: {
            completion_date: new Date().toISOString()
          }
        })
        .catch(err => {
          // Log do erro, mas não bloquear o fluxo
          logError("Erro ao criar certificado", { error: err });
        });
      
      log("Solução marcada como implementada", { 
        progressId,
        solutionId,
        userId: user.id
      });
      
      toast({
        title: "Implementação Concluída",
        description: "Parabéns! Você completou a implementação desta solução."
      });
      
      setIsCompleted(true);
      
      return Promise.resolve();
    } catch (error) {
      logError("Erro ao confirmar implementação", { error });
      toast({
        title: "Erro ao completar implementação",
        description: "Não foi possível completar a implementação. Por favor, tente novamente.",
        variant: "destructive"
      });
      return Promise.reject(error);
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
