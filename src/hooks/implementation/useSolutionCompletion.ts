
import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useLogging } from "@/hooks/useLogging";
import { toast } from "sonner";

export const useSolutionCompletion = (solutionId: string) => {
  const [completing, setCompleting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { user } = useAuth();
  const { log, logError } = useLogging("useSolutionCompletion");

  // Função para gerar certificado
  const generateCertificate = useCallback(async () => {
    if (!user || !solutionId) {
      toast.error("Usuário não autenticado ou solução não especificada");
      return null;
    }

    setGenerating(true);
    try {
      // Verificar se já existe certificado
      const { data: existingCert, error: certCheckError } = await supabase
        .from("solution_certificates")
        .select("id")
        .eq("solution_id", solutionId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (certCheckError) throw certCheckError;

      // Se já existir certificado, retorna o ID
      if (existingCert) {
        return existingCert.id;
      }

      // Obter dados da solução
      const { data: solution, error: solutionError } = await supabase
        .from("solutions")
        .select("title")
        .eq("id", solutionId)
        .single();

      if (solutionError) throw solutionError;

      // Criar certificado
      const certificateData = {
        title: `Certificado de Implementação: ${solution.title}`,
        issued_date: new Date().toISOString(),
        solution_name: solution.title,
      };

      const { data: newCert, error: createError } = await supabase
        .from("solution_certificates")
        .insert({
          user_id: user.id,
          solution_id: solutionId,
          certificate_data: certificateData,
          issued_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) throw createError;
      
      log("Certificado gerado com sucesso", { certId: newCert.id });
      return newCert.id;
    } catch (error) {
      logError("Erro ao gerar certificado", { error });
      toast.error("Não foi possível gerar o certificado.");
      return null;
    } finally {
      setGenerating(false);
    }
  }, [solutionId, user, log, logError]);

  // Função para completar a implementação
  const completeSolution = useCallback(async () => {
    if (!user || !solutionId) {
      toast.error("Usuário não autenticado ou solução não especificada");
      return false;
    }

    setCompleting(true);
    try {
      // Obter progresso atual
      const { data: progress, error: progressError } = await supabase
        .from("progress")
        .select("*")
        .eq("solution_id", solutionId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (progressError) throw progressError;

      if (!progress) {
        toast.error("Nenhum progresso encontrado para esta solução");
        return false;
      }

      // Atualizar progresso para completo
      const { error: updateError } = await supabase
        .from("progress")
        .update({
          is_completed: true,
          implementation_status: "completed",
          completed_at: new Date().toISOString(),
          last_activity: new Date().toISOString()
        })
        .eq("id", progress.id);

      if (updateError) throw updateError;

      // Incrementar métricas de conclusão
      await supabase.rpc('increment', {
        row_id: solutionId,
        table_name: 'solution_metrics',
        column_name: 'total_completions'
      });

      // Gerar certificado automaticamente
      await generateCertificate();

      log("Solução marcada como concluída com sucesso", { solutionId });
      return true;
    } catch (error) {
      logError("Erro ao completar solução", { error });
      return false;
    } finally {
      setCompleting(false);
    }
  }, [solutionId, user, generateCertificate, log, logError]);

  return {
    completing,
    generating,
    completeSolution,
    generateCertificate
  };
};
