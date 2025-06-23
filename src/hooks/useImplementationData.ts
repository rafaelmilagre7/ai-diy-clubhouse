import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase, Solution, Module, Progress } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useLogging } from "@/hooks/useLogging";
import { getUserRoleName } from "@/lib/supabase/types";

export const useImplementationData = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { log, logError } = useLogging();
  const isAdmin = getUserRoleName(profile) === 'admin';
  
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
          .eq("id", id as any);
          
        // Se não for admin, filtra apenas soluções publicadas
        if (!isAdmin) {
          query = query.eq("published", true as any);
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
        
        setSolution(solutionData as unknown as Solution);
        
        // Fetch modules for this solution
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select("*")
          .eq("solution_id", id as any)
          .order("module_order", { ascending: true });
        
        if (modulesError) {
          logError("Erro ao buscar módulos:", modulesError);
          throw modulesError;
        }
        
        if (modulesData && modulesData.length > 0) {
          setModules(modulesData as unknown as Module[]);
        } else {
          // Create placeholder module for implementation screen
          const placeholderModule = {
            id: `placeholder-module`,
            solution_id: id,
            title: (solutionData as any)?.title || "Implementação",
            content: {},
            type: "implementation",
            module_order: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          setModules([placeholderModule as unknown as Module]);
        }
        
        // Fetch user progress
        if (user) {
          try {
            const { data: progressData, error: progressError } = await supabase
              .from("progress")
              .select("*")
              .eq("user_id", user.id as any)
              .eq("solution_id", id as any)
              .maybeSingle();
            
            if (progressError) {
              logError("Erro ao buscar progresso:", progressError);
            } else if (progressData) {
              // Cast to Progress type - now with completed_at instead of completion_date
              setProgress(progressData as unknown as Progress);
              
              // Parse completed modules from progress data
              // Handle the case where completed_modules might not exist in the database
              if ((progressData as any).completed_modules && Array.isArray((progressData as any).completed_modules)) {
                setCompletedModules((progressData as any).completed_modules);
              } else {
                log("No completed_modules found in progress data, initializing as empty array");
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
                } as any)
                .select()
                .single();
              
              if (createError) {
                logError("Erro ao criar progresso:", createError);
              } else if (newProgress) {
                setProgress(newProgress as unknown as Progress);
                setCompletedModules([]);
              }
            }
          } catch (progressError) {
            logError("Erro ao processar progresso:", progressError);
          }
        }
      } catch (error) {
        logError("Error fetching data:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao tentar carregar os dados da implementação.",
          variant: "destructive",
        });
        navigate("/solutions");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, user, toast, navigate, isAdmin, profile?.role, log, logError]);
  
  return {
    solution,
    modules,
    progress,
    completedModules,
    setCompletedModules,
    loading
  };
};
