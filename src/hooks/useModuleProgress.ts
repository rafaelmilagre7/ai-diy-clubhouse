
import { useState, useEffect } from "react";
import { supabase, Progress } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useLogging } from "@/hooks/useLogging";

export const useModuleProgress = (solutionId: string | undefined, actualSolutionId: string | undefined) => {
  const { user } = useAuth();
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [progressId, setProgressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { log, logError } = useLogging();

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user || !actualSolutionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        log("Buscando progresso do usuário", { userId: user.id, solutionId: actualSolutionId });

        const { data: progressData, error: progressError } = await supabase
          .from("progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("solution_id", actualSolutionId)
          .maybeSingle();

        if (progressError) {
          logError("Erro ao buscar progresso:", progressError);
          throw progressError;
        }

        if (progressData) {
          setProgressId(progressData.id);
          if (progressData.completed_modules && Array.isArray(progressData.completed_modules)) {
            setCompletedModules(progressData.completed_modules);
          }
          log("Progresso encontrado:", { progressId: progressData.id, completedModules: progressData.completed_modules });
        } else {
          // Criar progresso inicial se não existir
          const { data: newProgress, error: createError } = await supabase
            .from("progress")
            .insert({
              user_id: user.id,
              solution_id: actualSolutionId,
              current_module: 0,
              is_completed: false,
              completed_modules: [],
              last_activity: new Date().toISOString(),
            })
            .select()
            .single();

          if (createError) {
            logError("Erro ao criar progresso:", createError);
          } else if (newProgress) {
            setProgressId(newProgress.id);
            setCompletedModules([]);
            log("Progresso criado:", { progressId: newProgress.id });
          }
        }
      } catch (error: any) {
        logError("Erro em useModuleProgress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user, actualSolutionId, log, logError]);

  return {
    completedModules,
    setCompletedModules,
    progressId,
    loading
  };
};
