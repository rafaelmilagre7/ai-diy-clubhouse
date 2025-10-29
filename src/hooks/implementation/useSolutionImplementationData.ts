
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase, Solution, Progress } from "@/lib/supabase";
import { useToastModern } from "@/hooks/useToastModern";

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

export const useSolutionImplementationData = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const { showError } = useToastModern();
  const navigate = useNavigate();
  const isAdmin = profile?.role === 'admin';
  
  const [solution, setSolution] = useState<Solution | null>(null);
  const [modules, setModules] = useState<SolutionModule[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

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
        
        const { data: solutionData, error: solutionError } = await query.single();
        
        if (solutionError) {
          if (solutionError.code === "PGRST116" && !isAdmin) {
            showError("Solução não disponível", "Esta solução não está disponível para implementação.");
            navigate("/solutions");
            return;
          }
          throw solutionError;
        }
        
        setSolution(solutionData as Solution);
        
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

        // Módulo de ferramentas (se existirem)
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

        // Módulo de recursos (se existirem)
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
        
        // Fetch user progress
        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from("progress")
            .select("*")
            .eq("user_id", user.id)
            .eq("solution_id", id)
            .single();
          
          if (!progressError && progressData) {
            setProgress(progressData as Progress);
            
            if (progressData.completed_modules && Array.isArray(progressData.completed_modules)) {
              setCompletedModules(progressData.completed_modules);
            } else {
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
            
            if (!createError && newProgress) {
              setProgress(newProgress as Progress);
              setCompletedModules([]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showError("Erro ao carregar dados", "Ocorreu um erro ao tentar carregar os dados da implementação.");
        navigate("/solutions");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, user, showError, navigate, isAdmin, profile?.role]);
  
  return {
    solution,
    modules,
    progress,
    completedModules,
    setCompletedModules,
    loading
  };
};
