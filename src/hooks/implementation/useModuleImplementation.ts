
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Module, Solution } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";
import { toast } from "sonner";

export const useModuleImplementation = () => {
  const { id, moduleIndex, moduleIdx } = useParams<{ 
    id: string; 
    moduleIndex: string;
    moduleIdx: string; 
  }>();
  
  // Compatibilidade entre URLs /implement/:id/:moduleIdx e /implementation/:id/:moduleIdx
  const currentModuleIdx = moduleIndex || moduleIdx || "0";
  const moduleIdxNumber = parseInt(currentModuleIdx);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { log, logError } = useLogging("useModuleImplementation");
  
  const [solution, setSolution] = useState<Solution | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadAttempt, setLoadAttempt] = useState(0);
  
  // Fetch solution and modules data - com limite de tentativas
  useEffect(() => {
    // Limitar número de tentativas para evitar loops
    if (loadAttempt > 2) {
      setLoading(false);
      return;
    }
    
    if (!id) {
      log("ID da solução não fornecido");
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        log("Buscando dados para implementação", { id, moduleIdx: moduleIdxNumber, attempt: loadAttempt });
        
        // Fetch solution
        const { data: solutionData, error: solutionError } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        
        if (solutionError) {
          logError("Erro ao buscar solução", { error: solutionError });
          if (solutionError.code === "PGRST116") {
            toast.error("Solução não encontrada");
            navigate("/solutions");
            return;
          }
          throw solutionError;
        }
        
        if (!solutionData) {
          toast.error("Solução não encontrada");
          navigate("/solutions");
          return;
        }
        
        setSolution(solutionData as Solution);
        log("Solução carregada", { id: solutionData.id });
        
        // Fetch modules for this solution
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select("*")
          .eq("solution_id", id)
          .order("module_order", { ascending: true });
        
        if (modulesError) {
          logError("Erro ao buscar módulos", { error: modulesError });
          throw modulesError;
        }
        
        // Verificar se temos módulos válidos
        if (modulesData && modulesData.length > 0) {
          setModules(modulesData as Module[]);
          log("Módulos carregados", { count: modulesData.length });
          
          // Set current module based on moduleIdx - verificar limites
          if (moduleIdxNumber < modulesData.length) {
            setCurrentModule(modulesData[moduleIdxNumber] as Module);
          } else if (modulesData.length > 0) {
            // Se o índice estiver fora dos limites, usar o primeiro módulo
            setCurrentModule(modulesData[0] as Module);
            // Corrigir o índice na URL
            navigate(`/implement/${id}/0`, { replace: true });
          }
        } else {
          // Se não houver módulos, criar um placeholder
          log("Nenhum módulo encontrado, criando placeholder");
          const placeholderModule = {
            id: `placeholder-${id}`,
            solution_id: id,
            title: solutionData.title,
            description: "Implementação da solução",
            type: "landing",
            module_order: 0,
            content: {
              blocks: [
                {
                  id: "welcome",
                  type: "header",
                  data: { text: "Bem-vindo à implementação", level: 1 }
                },
                {
                  id: "intro",
                  type: "paragraph",
                  data: { text: "Esta solução está sendo preparada para implementação. Em breve você poderá implementá-la passo a passo." }
                }
              ]
            },
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
              logError("Erro ao buscar progresso", { error: progressError });
            } else if (progressData) {
              setProgress(progressData);
              log("Progresso encontrado", { progress: progressData });
              
              // Update current module index in progress if different
              if (progressData.current_module !== moduleIdxNumber) {
                await supabase
                  .from("progress")
                  .update({ 
                    current_module: moduleIdxNumber,
                    last_activity: new Date().toISOString()
                  })
                  .eq("id", progressData.id);
              }
              
              // Set completed modules
              if (progressData.completed_modules && Array.isArray(progressData.completed_modules)) {
                setCompletedModules(progressData.completed_modules);
              } else {
                setCompletedModules([]);
              }
            } else {
              // Create progress record if it doesn't exist
              log("Nenhum progresso encontrado, criando novo registro");
              const { data: newProgress, error: createError } = await supabase
                .from("progress")
                .insert({
                  user_id: user.id,
                  solution_id: id,
                  current_module: moduleIdxNumber,
                  is_completed: false,
                  completed_modules: [],
                  last_activity: new Date().toISOString()
                })
                .select()
                .single();
              
              if (createError) {
                logError("Erro ao criar progresso", { error: createError });
              } else if (newProgress) {
                setProgress(newProgress);
                setCompletedModules([]);
              }
            }
          } catch (progressError) {
            logError("Erro ao processar progresso", { error: progressError });
          }
        } else {
          log("Usuário não autenticado, não é possível buscar progresso");
        }
      } catch (error) {
        logError("Erro ao carregar implementação", { error, id });
        // Incrementar contador de tentativas para limitar retentativas
        setLoadAttempt(prev => prev + 1);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, moduleIdxNumber, user, navigate, log, logError, loadAttempt]);
  
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
