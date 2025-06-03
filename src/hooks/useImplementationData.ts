
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
        
        // Se não há módulos reais, deixar o array vazio para o fallback funcionar
        if (modulesData && modulesData.length > 0) {
          log("Módulos encontrados para a solução", { count: modulesData.length });
          setModules(modulesData as Module[]);
        } else {
          log("Nenhum módulo encontrado, sistema de fallback será usado");
          setModules([]);
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
              setProgress(progressData as Progress);
              
              if (progressData.completed_modules && Array.isArray(progressData.completed_modules)) {
                setCompletedModules(progressData.completed_modules);
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
                  completed_modules: [],
                  last_activity: new Date().toISOString(),
                })
                .select()
                .single();
              
              if (createError) {
                logError("Erro ao criar progresso:", createError);
              } else if (newProgress) {
                setProgress(newProgress as Progress);
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
