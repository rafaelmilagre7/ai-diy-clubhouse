
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase, Solution, Module, Progress } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useLogging } from "@/hooks/useLogging";

export const useImplementationData = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { log, logError } = useLogging();
  const isAdmin = profile?.role === 'admin';
  
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
        let query = supabase
          .from("solutions")
          .select("*")
          .eq("id", id);
          
        // Se não for admin, filtra apenas soluções publicadas
        if (!isAdmin) {
          query = query.eq("published", true);
        }
        
        const { data: solutionData, error: solutionError } = await query.maybeSingle();
        
        if (solutionError) {
          logError("Erro ao buscar solução:", solutionError);
          // Se a solução não for encontrada ou não estiver publicada (para membros)
          if (!isAdmin) {
            toast({
              title: "Solução não disponível",
              description: "Esta solução não está disponível para implementação.",
              variant: "destructive"
            });
            navigate("/solutions");
            return;
          }
          
          throw solutionError;
        }
        
        if (!solutionData) {
          toast({
            title: "Solução não encontrada",
            description: "Esta solução não está disponível.",
            variant: "destructive"
          });
          navigate("/solutions");
          return;
        }
        
        setSolution(solutionData as Solution);
        
        // Fetch modules for this solution
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select("*")
          .eq("solution_id", id)
          .order("module_order", { ascending: true });
        
        if (modulesError) {
          logError("Erro ao buscar módulos:", modulesError);
          throw modulesError;
        }
        
        if (modulesData && modulesData.length > 0) {
          setModules(modulesData as Module[]);
        } else {
          // Create placeholder module for implementation screen
          const placeholderModule = {
            id: `placeholder-module`,
            solution_id: id,
            title: solutionData?.title || "Implementação",
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
          try {
            const { data: progressData, error: progressError } = await supabase
              .from("progress")
              .select("*")
              .eq("user_id", user.id)
              .eq("solution_id", id)
              .maybeSingle();
            
            if (progressError) {
              logError("Erro ao buscar progresso:", progressError);
            } else if (progressData) {
              // Cast to Progress type - now with completed_at instead of completion_date
              setProgress(progressData as Progress);
              
              // Parse completed modules from progress data
              // Handle the case where completed_modules might not exist in the database
              if (progressData.completed_modules && Array.isArray(progressData.completed_modules)) {
                setCompletedModules(progressData.completed_modules);
              } else {
                log("No completed_modules found in progress data, initializing as empty array");
                setCompletedModules([]);
              }
            }
          } catch (progressError) {
            logError("Erro ao processar progresso:", progressError);
          }
        }
      } catch (err) {
        logError("Erro ao buscar dados da solução:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, isAdmin]);

  return {
    solution,
    modules,
    progress,
    completedModules,
    loading,
    isAdmin
  };
};
