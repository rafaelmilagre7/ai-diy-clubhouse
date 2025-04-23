
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase, Solution } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { useLogging } from "@/hooks/useLogging";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export const useSolutionData = (id: string | undefined) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { log, logError } = useLogging("useSolutionData");
  const isAdmin = profile?.role === 'admin';
  const [solutionData, setSolutionData] = useState<Solution | null>(null);
  
  // Refs para controle de estados e operações
  const toastShownRef = useRef<Record<string, boolean>>({
    error: false,
    success: false,
    notFound: false,
    notAvailable: false
  });

  // Função para buscar solução
  const fetchSolution = useCallback(async () => {
    if (!id) {
      log("ID da solução não fornecido");
      return null;
    }
    
    try {
      log("Iniciando busca por solução", { id });
      
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
          if (!toastShownRef.current.notAvailable) {
            toast.error("Esta solução não está disponível no momento.", {
              id: `solution-not-available-${id}`,
              duration: 3000
            });
            toastShownRef.current.notAvailable = true;
          }
          navigate("/solutions");
          return null;
        }
        
        throw fetchError;
      }
      
      if (!data) {
        log("Nenhuma solução encontrada com ID", { id });
        if (!toastShownRef.current.notFound) {
          toast.error("Não foi possível encontrar a solução solicitada.", {
            id: `solution-not-found-${id}`,
            duration: 3000
          });
          toastShownRef.current.notFound = true;
        }
        return null;
      }
      
      log("Dados da solução encontrados", { solutionId: data.id, solutionTitle: data.title });
      
      // Toast apenas na primeira carga bem-sucedida
      if (!toastShownRef.current.success) {
        toast.success("Solução carregada com sucesso!", {
          id: `solution-loaded-${id}`,
          duration: 3000
        });
        toastShownRef.current.success = true;
      }
      
      return data as Solution;
    } catch (error: any) {
      logError("Erro em useSolutionData:", { error });
      
      // Verificar se é um erro de conexão
      const isNetworkError = error?.message?.includes('fetch') || 
                           error?.message?.includes('network');
      
      // Mostrar toast de erro apenas uma vez
      if (!toastShownRef.current.error) {
        toast.error(isNetworkError 
          ? "Erro de conexão com o servidor. Verifique sua internet." 
          : "Não foi possível carregar os dados da solução.", {
          id: `solution-error-${id}`,
          duration: 5000
        });
        toastShownRef.current.error = true;
      }
      
      throw error;
    }
  }, [id, isAdmin, navigate, log, logError]);

  // Usar React Query para gerenciar os estados e cache
  const { 
    data: solution, 
    error,
    isLoading: loading,
    refetch
  } = useQuery({
    queryKey: ['solution', id],
    queryFn: fetchSolution,
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos antes de considerar os dados obsoletos
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Função para definir a solução manualmente (necessária para o editor)
  const setSolution = (solution: Solution) => {
    setSolutionData(solution);
  };

  // Progress state
  const [progress, setProgress] = useState<any | null>(null);

  // Fetch progresso quando a solução é carregada
  useEffect(() => {
    const fetchProgress = async (solutionId: string) => {
      if (!user || !solutionId) return null;
      
      try {
        const { data, error } = await supabase
          .from("progress")
          .select("*")
          .eq("solution_id", solutionId)
          .eq("user_id", user.id)
          .maybeSingle();
          
        if (error) {
          logError("Erro ao buscar progresso:", { error });
          return null;
        }
        
        return data;
      } catch (error) {
        logError("Erro ao buscar progresso:", { error });
        return null;
      }
    };

    if (solution && user) {
      fetchProgress(solution.id).then(progressData => {
        if (progressData) {
          setProgress(progressData);
          log("Dados de progresso encontrados", { progressId: progressData.id });
        } else {
          log("Nenhum progresso encontrado para esta solução", { 
            solutionId: solution.id, 
            userId: user.id 
          });
        }
      });
    }
  }, [solution, user, log, logError]);

  // Reset refs quando o ID muda
  useEffect(() => {
    if (id) {
      toastShownRef.current = {
        error: false,
        success: false,
        notFound: false,
        notAvailable: false
      };
    }
  }, [id]);

  return {
    solution: solutionData || solution,
    loading,
    error,
    progress,
    refetch,
    setSolution
  };
};
