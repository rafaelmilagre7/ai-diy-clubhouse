
import { useState, useEffect, useRef } from "react";
import { supabase, getAllSolutions } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSolutionsData = (
  activeCategory: string = "all",
  searchQuery: string = ""
) => {
  const { log, logError } = useLogging("useSolutionsData");
  const toastShownRef = useRef(false);
  
  // Buscar soluções da API usando a função centralizada
  const fetchSolutions = async () => {
    try {
      log("Buscando soluções disponíveis...");
      
      // Buscar diretamente da tabela solutions para garantir IDs corretos
      const { data: solutionsData, error: solutionsError } = await supabase
        .from("solutions")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (solutionsError) {
        throw solutionsError;
      }
      
      // Verificar se temos dados válidos
      if (!solutionsData || solutionsData.length === 0) {
        log("Nenhuma solução encontrada no banco de dados");
        
        if (!toastShownRef.current) {
          toast.warning("Não há soluções disponíveis", {
            description: "Nenhuma solução foi encontrada no banco de dados.",
            duration: 5000
          });
          toastShownRef.current = true;
        }
        return [];
      }
      
      // Log detalhado das soluções encontradas
      log(`Encontradas ${solutionsData.length} soluções.`, {
        firstSolution: solutionsData[0]?.id,
        allIds: solutionsData.map(s => s.id)
      });
      
      return solutionsData as Solution[];
      
    } catch (error) {
      logError("Erro ao buscar soluções:", error);
      
      if (!toastShownRef.current) {
        toast.error("Erro ao carregar soluções", {
          description: "Não foi possível buscar as soluções no momento.",
          id: "solutions-fetch-error"
        });
        toastShownRef.current = true;
      }
      
      throw error;
    }
  };

  // Usar React Query para buscar e armazenar em cache
  const { 
    data: solutions = [], 
    error,
    isLoading: loading,
    refetch
  } = useQuery({
    queryKey: ["solutions"],
    queryFn: fetchSolutions,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 2
  });

  // Validar IDs das soluções
  useEffect(() => {
    if (solutions && solutions.length > 0) {
      const invalidSolutions = solutions.filter(sol => !sol.id);
      if (invalidSolutions.length > 0) {
        logError(`${invalidSolutions.length} soluções com IDs inválidos encontradas`, { 
          invalidSolutionsCount: invalidSolutions.length,
          sampleInvalid: invalidSolutions.slice(0, 3) 
        });
      } else {
        log("Todas as soluções têm IDs válidos", {
          solutionIds: solutions.map(s => s.id)
        });
      }
    }
  }, [solutions, logError, log]);

  // Filtra as soluções com base na categoria e pesquisa
  const filteredSolutions = solutions.filter((solution: Solution) => {
    if (!solution.id) {
      logError("Solução sem ID detectada", { solution });
      return false;
    }
    
    const categoryMatch = 
      activeCategory === "all" || 
      solution.category === activeCategory;
    
    const searchLower = searchQuery.toLowerCase();
    const searchMatch = 
      !searchQuery ||
      solution.title.toLowerCase().includes(searchLower) ||
      (solution.description?.toLowerCase().includes(searchLower) || false);
    
    return categoryMatch && searchMatch;
  });

  // Resetar o toast quando a dependência mudar
  useEffect(() => {
    return () => {
      toastShownRef.current = false;
    };
  }, []);

  return {
    solutions,
    filteredSolutions,
    loading,
    error,
    refetch
  };
};
