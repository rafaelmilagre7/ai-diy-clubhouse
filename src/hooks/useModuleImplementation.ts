
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Module, Solution } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";

export const useModuleImplementation = () => {
  const { id, moduleIndex } = useParams<{ id: string; moduleIndex: string }>();
  const moduleIdx = moduleIndex ? parseInt(moduleIndex) : 0;
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { log, logError } = useLogging();
  
  const [solution, setSolution] = useState<Solution | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch solution and modules data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        log("Buscando dados da solução e módulos para implementação", { id, moduleIdx });
        
        // Fetch solution
        const { data: solutionData, error: solutionError } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        
        if (solutionError) {
          logError("Erro ao buscar solução:", solutionError);
          toast({
            title: "Erro ao carregar solução",
            description: "Não foi possível encontrar a solução solicitada.",
            variant: "destructive"
          });
          navigate("/solutions");
          return;
        }
        
        if (!solutionData) {
          toast({
            title: "Solução não encontrada",
            description: "Não foi possível encontrar a solução solicitada.",
            variant: "destructive"
          });
          navigate("/solutions");
          return;
        }
        
        setSolution(solutionData as Solution);
        log("Solução encontrada:", { solution: solutionData });
        
        // Fetch modules for this solution
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select("*")
          .eq("solution_id", id)
          .order("module_order", { ascending: true });
        
        if (modulesError) {
          logError("Erro ao buscar módulos:", modulesError);
          toast({
            title: "Erro ao carregar módulos",
            description: "Não foi possível carregar os módulos desta solução.",
            variant: "destructive"
          });
          return;
        }
        
        if (modulesData && modulesData.length > 0) {
          setModules(modulesData as Module[]);
          log("Módulos encontrados:", { count: modulesData.length });
          
          // Set current module based on moduleIdx
          if (moduleIdx < modulesData.length) {
            setCurrentModule(modulesData[moduleIdx] as Module);
            log("Módulo atual definido:", { moduleId: modulesData[moduleIdx].id });
          } else {
            // If moduleIdx is out of bounds, set to first module
            setCurrentModule(modulesData[0] as Module);
            log("Índice de módulo fora dos limites, usando o primeiro módulo", { requestedIdx: moduleIdx, maxIdx: modulesData.length - 1 });
          }
        } else {
          log("Nenhum módulo encontrado, criando placeholder", { solutionId: id });
          
          // Create placeholder module if no modules exist
          const placeholderModule = {
            id: `placeholder-${id}`,
            solution_id: id,
            title: solutionData.title,
            description: "Implementação da solução",
            type: "implementation",
            module_order: 0,
            content: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          setModules([placeholderModule as Module]);
          setCurrentModule(placeholderModule as Module);
        }
        
        // Fetch progress for logged in user
        if (user) {
          try {
            const { data: progressData, error: progressError } = await supabase
              .from("progress")
              .select("*")
              .eq("solution_id", id)
              .eq("user_id", user.id)
              .maybeSingle();
            
            if (progressError) {
              logError("Erro ao buscar progresso:", progressError);
            } else if (progressData) {
              setProgress(progressData);
              log("Progresso encontrado:", { progress: progressData });
              
              // Update current module index in progress if different
              if (progressData.current_module !== moduleIdx) {
                const { error: updateError } = await supabase
                  .from("progress")
                  .update({ 
                    current_module: moduleIdx,
                    last_activity: new Date().toISOString()
                  })
                  .eq("id", progressData.id);
                
                if (updateError) {
                  logError("Erro ao atualizar progresso:", updateError);
                }
              }
              
              // Set completed modules
              if (progressData.completed_modules && Array.isArray(progressData.completed_modules)) {
                setCompletedModules(progressData.completed_modules);
                log("Módulos completados:", { completedModules: progressData.completed_modules });
              } else {
                setCompletedModules([]);
              }
            } else {
              log("Nenhum progresso encontrado, criando novo registro", { userId: user.id, solutionId: id });
              
              // Create progress record if it doesn't exist
              const { data: newProgress, error: createError } = await supabase
                .from("progress")
                .insert({
                  user_id: user.id,
                  solution_id: id,
                  current_module: moduleIdx,
                  is_completed: false,
                  completed_modules: [],
                  last_activity: new Date().toISOString()
                })
                .select()
                .single();
              
              if (createError) {
                logError("Erro ao criar progresso:", createError);
              } else {
                setProgress(newProgress);
                log("Novo progresso criado:", { progress: newProgress });
              }
            }
          } catch (progressError) {
            logError("Erro ao processar progresso:", progressError);
          }
        }
      } catch (error) {
        logError("Erro no useModuleImplementation:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao carregar os dados de implementação.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, moduleIdx, user, toast, navigate, log, logError]);
  
  return {
    solution,
    modules,
    currentModule,
    completedModules,
    setCompletedModules,
    progress,
    loading
  };
};
