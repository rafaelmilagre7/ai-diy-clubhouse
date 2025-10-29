
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToastModern } from "@/hooks/useToastModern";
import { Solution } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";

interface SolutionModule {
  id: string;
  solution_id: string;
  title: string;
  description?: string;
  type: string;
  module_order: number;
  content: any;
  created_at: string;
  updated_at: string;
}

export const useModuleImplementation = () => {
  const { id, moduleIndex, moduleIdx } = useParams<{ 
    id: string; 
    moduleIndex: string;
    moduleIdx: string; 
  }>();
  
  const currentModuleIdx = moduleIndex || moduleIdx || "0";
  const moduleIdxNumber = parseInt(currentModuleIdx);
  
  const { user } = useAuth();
  const { showError, showSuccess, showInfo } = useToastModern();
  const navigate = useNavigate();
  const { log, logError } = useLogging();
  
  const [solution, setSolution] = useState<Solution | null>(null);
  const [modules, setModules] = useState<SolutionModule[]>([]);
  const [currentModule, setCurrentModule] = useState<SolutionModule | null>(null);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        log("Buscando dados da solução e módulos para implementação", { id, moduleIdx: moduleIdxNumber });
        
        // Fetch solution
        const { data: solutionData, error: solutionError } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        
        if (solutionError) {
          logError("Erro ao buscar solução:", solutionError);
          showError("Erro ao carregar solução", "Não foi possível encontrar a solução solicitada.");
          navigate("/solutions");
          return;
        }
        
        if (!solutionData) {
          showError("Solução não encontrada", "Não foi possível encontrar a solução solicitada.");
          navigate("/solutions");
          return;
        }
        
        setSolution(solutionData as Solution);
        log("Solução encontrada:", { solution: solutionData });
        
        // Criar módulos virtuais baseados na estrutura da solução
        const virtualModules: SolutionModule[] = [];
        
        // Módulo de introdução
        virtualModules.push({
          id: `intro-${id}`,
          solution_id: id,
          title: "Introdução",
          description: solutionData.description,
          type: "introduction",
          module_order: 0,
          content: {
            overview: solutionData.overview || solutionData.description,
            implementation_steps: solutionData.implementation_steps || []
          },
          created_at: solutionData.created_at,
          updated_at: solutionData.updated_at
        });

        // Buscar ferramentas da solução
        const { data: toolsData } = await supabase
          .from("solution_tools")
          .select("*")
          .eq("solution_id", id);
          
        if (toolsData && toolsData.length > 0) {
          virtualModules.push({
            id: `tools-${id}`,
            solution_id: id,
            title: "Ferramentas Necessárias",
            description: "Ferramentas e recursos para implementar esta solução",
            type: "tools",
            module_order: 1,
            content: {
              tools: toolsData
            },
            created_at: solutionData.created_at,
            updated_at: solutionData.updated_at
          });
        }

        // Buscar recursos da solução
        const { data: resourcesData } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("solution_id", id);
          
        if (resourcesData && resourcesData.length > 0) {
          virtualModules.push({
            id: `resources-${id}`,
            solution_id: id,
            title: "Materiais e Recursos",
            description: "Materiais de apoio para implementação",
            type: "resources",
            module_order: 2,
            content: {
              resources: resourcesData
            },
            created_at: solutionData.created_at,
            updated_at: solutionData.updated_at
          });
        }

        // Módulo de implementação
        virtualModules.push({
          id: `implementation-${id}`,
          solution_id: id,
          title: "Implementação",
          description: "Passo a passo para implementar a solução",
          type: "implementation",
          module_order: 3,
          content: {
            implementation_steps: solutionData.implementation_steps || [],
            checklist_items: solutionData.checklist_items || []
          },
          created_at: solutionData.created_at,
          updated_at: solutionData.updated_at
        });

        setModules(virtualModules);
        
        // Se não criou módulos, criar um padrão
        if (virtualModules.length === 0) {
          const placeholderModule = {
            id: `placeholder-${id}`,
            solution_id: id,
            title: solutionData.title,
            description: "Implementação da solução",
            type: "implementation",
            module_order: 0,
            content: {
              implementation_steps: solutionData.implementation_steps || [],
              checklist_items: solutionData.checklist_items || []
            },
            created_at: solutionData.created_at,
            updated_at: solutionData.updated_at
          };
          
          setModules([placeholderModule]);
          setCurrentModule(placeholderModule);
        } else {
          // Set current module based on moduleIdx
          if (moduleIdxNumber < virtualModules.length) {
            setCurrentModule(virtualModules[moduleIdxNumber]);
            log("Módulo atual definido:", { moduleId: virtualModules[moduleIdxNumber].id });
          } else {
            setCurrentModule(virtualModules[0]);
            log("Índice de módulo fora dos limites, usando o primeiro módulo", { 
              requestedIdx: moduleIdxNumber, 
              maxIdx: virtualModules.length - 1 
            });
          }
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
              if (progressData.current_module !== moduleIdxNumber) {
                const { error: updateError } = await supabase
                  .from("progress")
                  .update({ 
                    current_module: moduleIdxNumber,
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
                  current_module: moduleIdxNumber,
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
        showError("Erro", "Ocorreu um erro ao carregar os dados de implementação.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, moduleIdxNumber, user, showError, showSuccess, showInfo, navigate, log, logError]);
  
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
