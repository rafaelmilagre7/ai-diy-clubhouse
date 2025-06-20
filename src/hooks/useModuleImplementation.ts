
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase, Solution, Module, Progress } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useLogging } from "@/hooks/useLogging";

export const useModuleImplementation = () => {
  const { id, moduleIndex } = useParams<{ id: string; moduleIndex: string }>();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { log, logError } = useLogging();
  const isAdmin = profile?.role === 'admin';
  
  const [solution, setSolution] = useState<Solution | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  const moduleIdx = parseInt(moduleIndex || "0");

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
          const modulesList = modulesData as unknown as Module[];
          setModules(modulesList);
          
          // Get current module or create placeholder
          if (moduleIdx < modulesList.length) {
            setCurrentModule(modulesList[moduleIdx] as unknown as Module);
          } else {
            setCurrentModule(modulesList[0] as unknown as Module);
          }
        } else {
          // Create placeholder module for implementation screen
          const placeholderModule = {
            id: `placeholder-module-${moduleIdx}`,
            solution_id: id,
            title: (solutionData as any)?.title || "Implementação",
            content: {},
            type: "implementation",
            module_order: moduleIdx,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as unknown as Module;
          
          setModules([placeholderModule]);
          setCurrentModule(placeholderModule);
        }
        
        // Fetch user progress
        if (user) {
          try {
            const { data: progressData, error: progressError } = await supabase
              .from("progress")
              .select("*")
              .eq("solution_id", id as any)
              .eq("user_id", user.id as any)
              .maybeSingle();
            
            if (progressError) {
              logError("Erro ao buscar progresso:", progressError);
            } else if (progressData) {
              setProgress(progressData as unknown as Progress);
            } else {
              // Create initial progress record if not exists
              const { data: newProgress, error: createError } = await supabase
                .from("progress")
                .insert({
                  user_id: user.id,
                  solution_id: id,
                  current_module: moduleIdx,
                  is_completed: false,
                  completed_modules: [],
                  last_activity: new Date().toISOString(),
                } as any)
                .select()
                .single();
              
              if (createError) {
                logError("Erro ao criar progresso:", createError);
              } else if (newProgress) {
                setProgress(newProgress as unknown as Progress);
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
  }, [id, moduleIndex, user, toast, navigate, isAdmin, profile?.role, log, logError]);
  
  return {
    solution,
    modules,
    currentModule,
    progress,
    loading,
    moduleIdx
  };
};
