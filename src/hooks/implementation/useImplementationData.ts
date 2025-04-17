
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase, Solution, Module, Progress } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useImplementationData = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [solution, setSolution] = useState<Solution | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

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
        
        if (modulesData && modulesData.length > 0) {
          setModules(modulesData as Module[]);
        } else {
          // Create placeholder module for implementation screen
          const placeholderModule = {
            id: `placeholder-module`,
            solution_id: id,
            title: solution?.title || "Implementação",
            content: {},
            type: "implementation",
            module_order: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          setModules([placeholderModule as Module]);
        }
        
        // Fetch user progress
        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from("progress")
            .select("*")
            .eq("user_id", user.id)
            .eq("solution_id", id)
            .single();
          
          if (!progressError && progressData) {
            // Cast to Progress type - now with completed_at instead of completion_date
            setProgress(progressData as Progress);
            
            // Parse completed modules from progress data
            // Handle the case where completed_modules might not exist in the database
            if (progressData.completed_modules && Array.isArray(progressData.completed_modules)) {
              setCompletedModules(progressData.completed_modules);
            } else {
              console.log("No completed_modules found in progress data, initializing as empty array");
              setCompletedModules([]);
            }
          } else {
            // Create initial progress record if not exists
            const { data: newProgress, error: createError } = await supabase
              .from("progress")
              .insert({
                user_id: user.id,
                solution_id: id,
                current_module: 0,
                is_completed: false,
                completed_modules: [], // Initialize as empty array
                last_activity: new Date().toISOString(),
              })
              .select()
              .single();
            
            if (!createError && newProgress) {
              setProgress(newProgress as Progress);
              setCompletedModules([]);
            }
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
  }, [id, user, toast]);
  
  return {
    solution,
    modules,
    progress,
    completedModules,
    setCompletedModules,
    loading
  };
};
