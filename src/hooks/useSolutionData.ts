
import { useState, useEffect, useCallback } from "react";
import { supabase, Solution } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { useLogging } from "@/hooks/useLogging";
import { toast } from "sonner";

export const useSolutionData = (id: string | undefined) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { log, logError, logDebug } = useLogging("useSolutionData");
  const [solution, setSolution] = useState<Solution | null>(null);
  const [progress, setProgress] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const isAdmin = profile?.role === 'admin';

  const fetchSolution = useCallback(async () => {
    if (!id) {
      log("ID da solução não fornecido");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      log("Iniciando busca por solução", { id, retryAttempt: retryCount });
      
      // Informações de debug sobre a conexão
      log("Tentando conectar ao Supabase", { 
        userAuthenticated: !!user,
        solutionId: id
      });
      
      // Buscar a solução pelo ID
      let query = supabase
        .from("solutions")
        .select("*")
        .eq("id", id);
        
      // Se não for um admin, só mostra soluções publicadas
      if (!isAdmin) {
        query = query.eq("published", true);
      }
      
      const { data, error: fetchError } = await query.maybeSingle();
      
      if (fetchError) {
        logError("Erro ao buscar solução:", { error: fetchError, id });
        
        // Se o erro for de registro não encontrado e o usuário não é admin,
        // provavelmente está tentando acessar uma solução não publicada
        if (fetchError.code === "PGRST116" && !isAdmin) {
          toast.error("Esta solução não está disponível no momento.", {
            id: `solution-not-available-${id}` // ID único para evitar duplicação
          });
          navigate("/solutions");
          return;
        }
        
        throw fetchError;
      }
      
      if (data) {
        log("Dados da solução encontrados", { solutionId: data.id, solutionTitle: data.title });
        setSolution(data as Solution);
        
        // Toast apenas na primeira carga bem-sucedida
        if (retryCount === 0) {
          toast.success("Solução carregada com sucesso!", {
            id: `solution-loaded-${id}` // ID único para evitar duplicação
          });
        }
        
        // Fetch progress for this solution and user if user is authenticated
        if (user) {
          try {
            const { data: progressData, error: progressError } = await supabase
              .from("progress")
              .select("*")
              .eq("solution_id", id)
              .eq("user_id", user.id)
              .maybeSingle();
              
            if (progressError) {
              logError("Erro ao buscar progresso:", { error: progressError });
            } else if (progressData) {
              setProgress(progressData);
              log("Dados de progresso encontrados", { progressId: progressData.id });
            } else {
              log("Nenhum progresso encontrado para esta solução", { solutionId: id, userId: user.id });
            }
          } catch (progressFetchError) {
            logError("Erro ao buscar progresso:", { error: progressFetchError });
            // Não mostrar erro para o usuário se apenas o progresso falhar
          }
        }
      } else {
        log("Nenhuma solução encontrada com ID", { id });
        setError(`Solução não encontrada com ID: ${id}`);
        toast.error("Não foi possível encontrar a solução solicitada.", {
          id: `solution-not-found-${id}` // ID único para evitar duplicação
        });
      }
    } catch (error: any) {
      logError("Erro em useSolutionData:", { error });
      setError(error);
      toast.error("Não foi possível carregar os dados da solução.", {
        id: `solution-error-${id}` // ID único para evitar duplicação
      });
    } finally {
      setLoading(false);
    }
  }, [id, user, isAdmin, profile?.role, log, logError, logDebug, navigate, retryCount]);

  // Função para recarregar os dados
  const refetch = useCallback(() => {
    setRetryCount(prevCount => prevCount + 1);
    return fetchSolution();
  }, [fetchSolution]);

  useEffect(() => {
    // Prevenir execuções desnecessárias
    fetchSolution();
  }, [fetchSolution]);

  return {
    solution,
    setSolution,
    loading,
    error,
    progress,
    refetch
  };
};

