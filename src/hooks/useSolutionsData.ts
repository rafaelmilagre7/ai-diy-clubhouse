
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
      
      // Usar a função getAllSolutions para consistência
      const data = await getAllSolutions();
      
      // Verificar se temos dados válidos
      if (!data || data.length === 0) {
        log("Nenhuma solução encontrada no banco de dados");
        
        // Criar toast apenas se ainda não foi mostrado
        if (!toastShownRef.current) {
          toast.warning("Não há soluções disponíveis", {
            description: "Nenhuma solução foi encontrada no banco de dados.",
            duration: 5000
          });
          toastShownRef.current = true;
        }
      } else {
        log(`Encontradas ${data.length} soluções. Primeira solução: ${data[0]?.id} - ${data[0]?.title}`);
      }
      
      return data as Solution[];
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
    retry: 2 // Tentar 2 vezes antes de falhar
  });

  // Validar soluções para garantir que todos os registros têm IDs válidos
  useEffect(() => {
    if (solutions && solutions.length > 0) {
      const invalidSolutions = solutions.filter(sol => !sol.id || !sol.title);
      if (invalidSolutions.length > 0) {
        logError(`${invalidSolutions.length} soluções com dados inválidos encontradas`, { 
          invalidSolutionsCount: invalidSolutions.length,
          sampleInvalid: invalidSolutions.slice(0, 3) 
        });
      }
    }
  }, [solutions, logError]);

  // Filtra as soluções com base na categoria e pesquisa
  const filteredSolutions = solutions.filter((solution: Solution) => {
    // Verificar se a solução tem um ID válido
    if (!solution.id) {
      return false;
    }
    
    // Verificar categoria
    const categoryMatch = 
      activeCategory === "all" || 
      solution.category === activeCategory;
    
    // Verificar termo de pesquisa
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
