
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase, Solution, Progress } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useLogging } from "@/hooks/useLogging";

// Definindo o tipo Module baseado na estrutura da tabela learning_modules
interface Module {
  id: string;
  solution_id: string;
  title: string;
  content: any;
  type?: string;
  module_order: number;
  created_at: string;
  updated_at: string;
}

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
        
        // Fetch modules from learning_modules table instead of modules
        const { data: modulesData, error: modulesError } = await supabase
          .from("learning_modules")
          .select("*")
          // Assumindo que existe uma relação entre learning_modules e solutions
          // Se não houver campo solution_id em learning_modules, precisaremos buscar através do course_id
          .eq("course_id", id) // Mudando para course_id se learning_modules se relaciona com courses
          .order("order_index", { ascending: true });
        
        if (modulesError) {
          logError("Erro ao buscar módulos:", modulesError);
          // Se não conseguir buscar da learning_modules, tenta buscar relacionamento através de learning_lessons
          try {
            const { data: lessonsData, error: lessonsError } = await supabase
              .from("learning_lessons")
              .select(`
                *,
                module:learning_modules(*)
              `)
              .order("order_index", { ascending: true });
            
            if (!lessonsError && lessonsData && lessonsData.length > 0) {
              // Cria módulos baseados nas lições se existirem
              const transformedModules = lessonsData.map((lesson: any, index: number) => ({
                id: lesson.id,
                solution_id: id,
                title: lesson.title,
                content: lesson.content || {},
                type: "lesson",
                module_order: index,
                created_at: lesson.created_at,
                updated_at: lesson.updated_at,
              }));
              
              setModules(transformedModules as Module[]);
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
          } catch (fallbackError) {
            logError("Erro ao buscar dados alternativos:", fallbackError);
            // Create placeholder module as final fallback
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
        } else if (modulesData && modulesData.length > 0) {
          // Transform learning_modules data to Module format
          const transformedModules = modulesData.map((module: any) => ({
            id: module.id,
            solution_id: id, // Relaciona com a solução atual
            title: module.title,
            content: { description: module.description }, // Transforma description em content
            type: "module",
            module_order: module.order_index,
            created_at: module.created_at,
            updated_at: module.updated_at,
          }));
          
          setModules(transformedModules as Module[]);
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
  }, [id, user?.id, isAdmin]);
  
  return {
    solution,
    modules,
    progress,
    completedModules,
    setCompletedModules,
    loading
  };
};
