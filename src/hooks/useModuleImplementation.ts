
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase, Solution, Module } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useModuleImplementation = () => {
  const { id, moduleIndex } = useParams<{ id: string; moduleIndex: string }>();
  const moduleIdx = parseInt(moduleIndex || "0");
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [solution, setSolution] = useState<Solution | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [progress, setProgress] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Fetch solution and modules
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch solution details
        const { data: solutionData, error: solutionError } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", id)
          .single();
        
        if (solutionError) {
          throw solutionError;
        }
        
        setSolution(solutionData as Solution);
        
        // Fetch modules for this solution
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select("*")
          .eq("solution_id", id)
          .order("module_order", { ascending: true });
        
        if (modulesError) {
          throw modulesError;
        }
        
        // For now, we'll create temporary mock modules if none exist
        const actualModules = modulesData.length > 0 
          ? modulesData 
          : Array(8).fill(0).map((_, idx) => ({
              id: `mock-${idx}`,
              solution_id: id,
              title: `Module ${idx}`,
              content: {},
              type: ["landing", "overview", "preparation", "implementation", "verification", "results", "optimization", "celebration"][idx],
              module_order: idx,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));
        
        setModules(actualModules as Module[]);
        setCurrentModule(actualModules[moduleIdx] as Module || null);
        
        // Fetch user progress
        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from("progress")
            .select("*")
            .eq("user_id", user.id)
            .eq("solution_id", id)
            .single();
          
          if (!progressError && progressData) {
            setProgress(progressData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao tentar carregar os dados da implementação.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, moduleIdx, user, toast]);
  
  // Update progress when module changes
  useEffect(() => {
    const updateProgress = async () => {
      if (!user || !id || !progress) return;
      
      try {
        const { error } = await supabase
          .from("progress")
          .update({ 
            current_module: moduleIdx,
            last_activity: new Date().toISOString()
          })
          .eq("id", progress.id);
        
        if (error) {
          throw error;
        }
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    };
    
    updateProgress();
  }, [moduleIdx, user, id, progress]);
  
  const handleComplete = async () => {
    // If this is the last module, ask for confirmation before marking as complete
    if (moduleIdx >= modules.length - 1) {
      setIsCompleting(true);
      
      if (user && progress) {
        try {
          const { error } = await supabase
            .from("progress")
            .update({ 
              is_completed: true,
              completion_date: new Date().toISOString(),
              last_activity: new Date().toISOString()
            })
            .eq("id", progress.id);
          
          if (error) {
            throw error;
          }
          
          // Navigate to the solution details page
          toast({
            title: "Implementação concluída!",
            description: "Parabéns! Você concluiu com sucesso a implementação desta solução.",
          });
          
          navigate(`/solution/${id}`);
        } catch (error) {
          console.error("Error completing implementation:", error);
          toast({
            title: "Erro ao concluir implementação",
            description: "Ocorreu um erro ao tentar marcar a implementação como concluída.",
            variant: "destructive",
          });
        } finally {
          setIsCompleting(false);
        }
      }
    } else {
      // Navigate to the next module
      navigate(`/implement/${id}/${moduleIdx + 1}`);
    }
  };
  
  const handlePrevious = () => {
    if (moduleIdx > 0) {
      navigate(`/implement/${id}/${moduleIdx - 1}`);
    } else {
      navigate(`/solution/${id}`);
    }
  };
  
  const calculateProgress = () => {
    if (!modules.length) return 0;
    return Math.min(100, Math.round((moduleIdx / (modules.length - 1)) * 100));
  };
  
  return {
    solution,
    modules,
    currentModule,
    loading,
    moduleIdx,
    handleComplete,
    handlePrevious,
    calculateProgress,
    isCompleting
  };
};
