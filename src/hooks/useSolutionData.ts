
import { useState, useEffect, useCallback } from "react";
import { supabase, Solution } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { useLogging } from "@/hooks/useLogging";
import { useQuery } from "@tanstack/react-query";

export const useSolutionData = (id: string | undefined) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { log, logError } = useLogging("useSolutionData");
  const isAdmin = profile?.role === 'admin';
  const [solutionData, setSolutionData] = useState<Solution | null>(null);
  const [progress, setProgress] = useState<any | null>(null);
  
  // Função para buscar solução - otimizada e robusta
  const fetchSolution = useCallback(async () => {
    if (!id) {
      log("ID da solução não fornecido, não será possível buscar dados");
      return null;
    }
    
    try {
      log("Buscando dados da solução", { id });
      
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
        logError("Erro ao buscar solução", { error: fetchError, id });
        throw fetchError;
      }
      
      if (!data) {
        log("Solução não encontrada", { id });
        return null;
      }
      
      log("Dados da solução encontrados com sucesso", { 
        solutionId: data.id, 
        solutionTitle: data.title,
        solutionCategory: data.category,
        solutionPublished: data.published
      });
      
      return data as Solution;
      
    } catch (error: any) {
      logError("Erro em useSolutionData", { error });
      return null;
    }
  }, [id, isAdmin, log, logError]);

  // Usar React Query para gerenciar os estados e cache - otimizado
  const { 
    data: solution, 
    error,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['solution', id],
    queryFn: fetchSolution,
    enabled: !!id,
    staleTime: 1000 * 30, // 30 segundos antes de considerar os dados obsoletos
    cacheTime: 1000 * 60 * 5, // Cache por 5 minutos
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Sincronizar o estado interno com os dados obtidos imediatamente
  useEffect(() => {
    if (solution) {
      log("Atualizando estado interno com solução encontrada", { 
        id: solution.id, 
        title: solution.title 
      });
      setSolutionData(solution);
    }
  }, [solution, log]);

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
          logError("Erro ao buscar progresso", { error });
          return null;
        }
        
        if (data) {
          setProgress(data);
          log("Dados de progresso encontrados", { progressId: data.id });
        } else {
          log("Nenhum progresso encontrado para esta solução", { 
            solutionId, 
            userId: user.id 
          });
        }
        
        return data;
      } catch (error) {
        logError("Erro ao buscar progresso", { error });
        return null;
      }
    };

    if (solution?.id && user) {
      fetchProgress(solution.id);
    }
  }, [solution, user, log, logError]);

  // Função para definir a solução manualmente (para o editor)
  const setSolution = (solution: Solution) => {
    log("Atualizando solução manualmente", { id: solution.id });
    setSolutionData(solution);
  };

  return {
    solution: solutionData,
    loading: isLoading,
    error,
    progress,
    refetch,
    setSolution
  };
};
