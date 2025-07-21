
import { useState, useEffect } from "react";
import { supabase, Module } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for fetching module data from Supabase
 */
export const useModuleFetch = (solutionId: string | null) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Function to fetch modules from Supabase
  const fetchModules = async () => {
    if (!solutionId) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("solution_id", solutionId)
        .order("module_order", { ascending: true });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setModules(data as Module[]);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
      toast({
        title: "Erro ao carregar módulos",
        description: "Não foi possível carregar os módulos desta solução.",
        variant: "destructive",
      });
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
