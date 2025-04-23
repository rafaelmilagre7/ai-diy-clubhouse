
import { useState, useEffect, useCallback, useRef } from "react";
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
  
  // Controle para evitar múltiplas notificações e chamadas
  const fetchingRef = useRef(false);
  const errorShownRef = useRef(false);
  const successShownRef = useRef(false);

  const fetchSolution = useCallback(async () => {
    // Se não há ID ou já está buscando, não continuar
    if (!id || fetchingRef.current) {
      return;
    }
    
    try {
      // Marcar como em processo de busca
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      log("Iniciando busca por solução", { id, retryAttempt: retryCount });
      
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
          if (!errorShownRef.current) {
            toast.error("Esta solução não está disponível no momento.", {
              id: `solution-not-available-${id}`, // ID único para evitar duplicação
            });
            errorShownRef.current = true;
          }
          navigate("/solutions");
          return;
        }
        
        throw fetchError;
      }
      
      if (data) {
        log("Dados da solução encontrados", { solutionId: data.id, solutionTitle: data.title });
        setSolution(data as Solution);
        
        // Toast apenas na primeira carga bem-sucedida e se não já foi mostrado
        if (retryCount === 0 && !successShownRef.current) {
          toast.success("Solução carregada com sucesso!", {
            id: `solution-loaded-${id}`, // ID único para evitar duplicação
          });
          successShownRef.current = true;
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
        if (!errorShownRef.current) {
          toast.error("Não foi possível encontrar a solução solicitada.", {
            id: `solution-not-found-${id}` // ID único para evitar duplicação
          });
          errorShownRef.current = true;
        }
        setError(`Solução não encontrada com ID: ${id}`);
      }
    } catch (error: any) {
      logError("Erro em useSolutionData:", { error });
      setError(error);
      
      // Verificar se é um erro de conexão
      const isNetworkError = error?.message?.includes('fetch') || error?.message?.includes('network');
      
      if (!errorShownRef.current) {
        toast.error(isNetworkError 
          ? "Erro de conexão com o servidor. Verifique sua internet." 
          : "Não foi possível carregar os dados da solução.", {
          id: `solution-error-${id}`, // ID único para evitar duplicação
          duration: 5000
        });
        errorShownRef.current = true;
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [id, user, isAdmin, profile?.role, log, logError, logDebug, navigate, retryCount]);

  // Função para recarregar os dados
  const refetch = useCallback(() => {
    // Resetar flags para permitir mostrar notificações novamente
    errorShownRef.current = false;
    successShownRef.current = false;
    setRetryCount(prevCount => prevCount + 1);
    return fetchSolution();
  }, [fetchSolution]);

  useEffect(() => {
    // Limpar estado ao mudar o ID para prevenir dados obsoletos
    if (id) {
      setSolution(null);
      setProgress(null);
      setError(null);
      errorShownRef.current = false;
      successShownRef.current = false;
      fetchingRef.current = false;
    }
    
    // Prevenir execuções desnecessárias
    fetchSolution();
    
    // Limpar ao desmontar
    return () => {
      fetchingRef.current = false;
    };
  }, [fetchSolution, id]);

  return {
    solution,
    setSolution,
    loading,
    error,
    progress,
    refetch
  };
};
