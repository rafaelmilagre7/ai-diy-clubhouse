
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useLogging } from "@/hooks/useLogging";
import { useAuth } from "@/contexts/auth";
import { Solution } from "@/types/solution";

export const useCentralDataStore = () => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loadingSolutions, setLoadingSolutions] = useState<boolean>(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const { log, logError } = useLogging("useCentralDataStore");
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  // Fetch all solutions
  useEffect(() => {
    const fetchSolutions = async () => {
      setLoadingSolutions(true);
      setError(null);
      
      try {
        // Construir a consulta base
        let query = supabase
          .from("solutions")
          .select(`
            *,
            modules(count),
            solution_tools(count)
          `);
          
        // Para usuários não admin, filtrar apenas soluções publicadas
        if (!isAdmin) {
          query = query.eq("published", true);
        }
        
        const { data, error } = await query
          .order("updated_at", { ascending: false });
          
        if (error) throw error;
        
        // Extrair categorias únicas
        const uniqueCategories = [...new Set(data?.map(s => s.category) || [])];
        setCategories(uniqueCategories);
        
        // Processar dados para o formato esperado
        const processedSolutions = data?.map(solution => ({
          ...solution,
          modules_count: solution.modules?.length || 0,
          tools_count: solution.solution_tools?.length || 0,
        })) || [];
        
        setSolutions(processedSolutions);
      } catch (err: any) {
        logError("Erro ao buscar soluções", { error: err });
        setError(err);
      } finally {
        setLoadingSolutions(false);
      }
    };
    
    fetchSolutions();
  }, [isAdmin]);
  
  // Fetch tools
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const { data, error } = await supabase
          .from("tools")
          .select("*")
          .eq("status", true)
          .order("name");
          
        if (error) throw error;
        
        setTools(data || []);
      } catch (err: any) {
        logError("Erro ao buscar ferramentas", { error: err });
      }
    };
    
    fetchTools();
  }, []);
  
  // Fetch solution details
  const fetchSolutionDetails = async (solutionId: string): Promise<Solution | null> => {
    try {
      const { data, error } = await supabase
        .from("solutions")
        .select(`
          *,
          modules(count),
          solution_tools(count)
        `)
        .eq("id", solutionId)
        .single();
        
      if (error) throw error;
      
      return {
        ...data,
        modules_count: data.modules?.length || 0,
        tools_count: data.solution_tools?.length || 0
      };
    } catch (err: any) {
      logError("Erro ao buscar detalhes da solução", { error: err });
      throw err;
    }
  };
  
  // Add or update a solution
  const saveSolution = async (solution: any): Promise<void> => {
    try {
      if (solution.id) {
        // Update
        const { error } = await supabase
          .from("solutions")
          .update(solution)
          .eq("id", solution.id);
          
        if (error) throw error;
      } else {
        // Add new
        const { error } = await supabase
          .from("solutions")
          .insert(solution);
          
        if (error) throw error;
      }
    } catch (err: any) {
      logError("Erro ao salvar solução", { error: err });
      throw err;
    }
  };
  
  // Delete a solution
  const deleteSolution = async (solutionId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from("solutions")
        .delete()
        .eq("id", solutionId);
        
      if (error) throw error;
      
      // Update local state
      setSolutions(solutions.filter(s => s.id !== solutionId));
    } catch (err: any) {
      logError("Erro ao excluir solução", { error: err });
      throw err;
    }
  };

  return {
    solutions,
    loadingSolutions,
    categories,
    tools,
    error,
    // Methods
    fetchSolutionDetails,
    saveSolution,
    deleteSolution
  };
};
