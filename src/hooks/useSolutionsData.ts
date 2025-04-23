
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
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
  
  // Buscar soluções da API
  const fetchSolutions = async () => {
    try {
      log("Buscando soluções...");
      
      let query = supabase
        .from("solutions")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        logError("Erro ao buscar soluções:", error);
        throw error;
      }
      
      log(`Encontradas ${data?.length || 0} soluções`);
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
    isLoading: loading 
  } = useQuery({
    queryKey: ["solutions"],
    queryFn: fetchSolutions,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 1
  });

  // Filtra as soluções com base na categoria e pesquisa
  const filteredSolutions = solutions.filter((solution: Solution) => {
    // Verificar categoria
    const categoryMatch = 
      activeCategory === "all" || 
      solution.category === activeCategory;
    
    // Verificar termo de pesquisa
    const searchLower = searchQuery.toLowerCase();
    const searchMatch = 
      !searchQuery ||
      solution.title.toLowerCase().includes(searchLower) ||
      solution.description.toLowerCase().includes(searchLower);
    
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
    error
  };
};
