
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useLogging } from "@/hooks/useLogging";
import { useAuth } from "@/contexts/auth";

export const useSolutionCompletion = (solutionId?: string, progress?: any) => {
  const [completing, setCompleting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();
  const { log, logError } = useLogging("useSolutionCompletion");
  const { user } = useAuth();

  const completeSolution = async (): Promise<boolean> => {
    if (!user || !solutionId) {
      toast.error("É necessário estar logado para concluir a implementação");
      return false;
    }

    if (!progress) {
      toast.error("Nenhum progresso encontrado para esta solução");
      return false;
    }

    try {
      setCompleting(true);
      log("Iniciando processo de conclusão", { progressId: progress.id });

      // Atualizar o registro de progresso para marcar como concluído
      const { error: progressError } = await supabase
        .from("progress")
        .update({
          is_completed: true,
          implementation_status: "completed",
          completed_at: new Date().toISOString()
        })
        .eq("id", progress.id);

      if (progressError) {
        throw progressError;
      }

      log("Progresso atualizado como concluído", { progressId: progress.id });

      // Incrementar métricas de conclusão na solução
      try {
        await supabase.rpc('increment', {
          row_id: solutionId,
          table_name: 'solution_metrics',
          column_name: 'total_completions'
        });
        log("Métricas de solução atualizadas");
      } catch (metricsError) {
        logError("Erro ao atualizar métricas da solução", { error: metricsError });
        // Não vamos interromper o fluxo por falha nas métricas
      }

      // Gerar certificado para o usuário
      try {
        const { data: certificateData, error: certificateError } = await supabase
          .from("solution_certificates")
          .insert({
            user_id: user.id,
            solution_id: solutionId,
            issued_at: new Date().toISOString(),
            certificate_data: {
              completedBy: user.id,
              completedAt: new Date().toISOString(),
              solutionId: solutionId
            }
          })
          .select();

        if (certificateError) {
          logError("Erro ao gerar certificado", { error: certificateError });
        } else {
          log("Certificado gerado com sucesso", { certificateId: certificateData?.[0]?.id });
        }
      } catch (certError) {
        logError("Erro ao gerar certificado", { error: certError });
      }

      toast.success("Parabéns! Você concluiu a implementação com sucesso!");
      return true;
    } catch (error) {
      logError("Erro ao concluir implementação", { error });
      toast.error("Ocorreu um erro ao concluir a implementação");
      return false;
    } finally {
      setCompleting(false);
    }
  };

  const generateCertificate = async (): Promise<void> => {
    if (!user || !solutionId) {
      toast.error("É necessário estar logado para gerar o certificado");
      return;
    }

    try {
      setGenerating(true);
      navigate(`/implementation/${solutionId}/certificate`);
    } catch (error) {
      logError("Erro ao gerar certificado", { error });
      toast.error("Ocorreu um erro ao gerar o certificado");
    } finally {
      setGenerating(false);
    }
  };

  return {
    completing,
    generating,
    completeSolution,
    generateCertificate
  };
};
