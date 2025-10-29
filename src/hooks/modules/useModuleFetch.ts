
import { useState, useEffect } from "react";
import { supabase, Module } from "@/lib/supabase";
import { useToastModern } from "@/hooks/useToastModern";

/**
 * Hook for fetching module data from Supabase
 */
export const useModuleFetch = (solutionId: string | null) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showError } = useToastModern();

  // Function to fetch modules from Supabase
  // CORREÇÃO: A tabela 'modules' não existe - criando módulos mock baseados nos recursos
  const fetchModules = async () => {
    if (!solutionId) return;
    
    try {
      setIsLoading(true);
      
      // Buscar a solução para obter dados básicos
      const { data: solutionData, error: solutionError } = await supabase
        .from("solutions")
        .select("*")
        .eq("id", solutionId)
        .single();
      
      if (solutionError) {
        throw solutionError;
      }
      
      // Criar um módulo padrão para a solução
      if (solutionData) {
        const mockModule: Module = {
          id: `module-${solutionId}`,
          title: solutionData.title || "Implementação",
          type: "implementation",
          content: {
            blocks: [],
            videos: solutionData.videos || []
          },
          solution_id: solutionId,
          module_order: 1,
          created_at: solutionData.created_at,
          updated_at: solutionData.updated_at
        };
        
        setModules([mockModule]);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
      showError("Erro ao carregar módulos", "Não foi possível carregar os módulos desta solução.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch modules when solutionId changes
  useEffect(() => {
    if (solutionId) {
      fetchModules();
    } else {
      setModules([]);
    }
  }, [solutionId]);

  return {
    modules,
    setModules,
    isLoading,
    fetchModules
  };
};
