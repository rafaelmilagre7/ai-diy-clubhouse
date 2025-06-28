
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface SimpleSolution {
  id: string;
  title: string;
  description: string;
  category: string;
  estimated_time_hours: number;
  created_at: string;
  updated_at: string;
}

interface SimpleModule {
  id: string;
  solution_id: string;
  title: string;
  content: any;
  type: string;
  module_order: number;
  created_at: string;
  updated_at: string;
}

interface SimpleProgress {
  id: string;
  user_id: string;
  solution_id: string;
  status: string;
  progress_percentage: number;
  started_at: string;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useModuleImplementation = () => {
  const { id, moduleIndex } = useParams<{ id: string; moduleIndex: string }>();
  const { user, profile } = useSimpleAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isAdmin = profile?.user_roles?.name === 'admin';
  
  const [solution, setSolution] = useState<SimpleSolution | null>(null);
  const [modules, setModules] = useState<SimpleModule[]>([]);
  const [currentModule, setCurrentModule] = useState<SimpleModule | null>(null);
  const [progress, setProgress] = useState<SimpleProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const moduleIdx = parseInt(moduleIndex || "0");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch solution details
        const solutionQuery = supabase
          .from("solutions")
          .select("id, title, description, category, estimated_time_hours, created_at, updated_at")
          .eq("id", id)
          .single();
        
        const { data: solutionData, error: solutionError } = await solutionQuery;
        
        if (solutionError) {
          console.error("Erro ao buscar solução:", solutionError);
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
        
        setSolution(solutionData);
        
        // Fetch modules for this solution - using correct field names from database
        const modulesQuery = supabase
          .from("modules")
          .select("id, solution_id, title, content, type, module_order, created_at, updated_at")
          .eq("solution_id", id)
          .order("module_order", { ascending: true });
        
        const { data: modulesData, error: modulesError } = await modulesQuery;
        
        if (modulesError) {
          console.error("Erro ao buscar módulos:", modulesError);
          // Create placeholder modules if query fails
          const placeholderModule: SimpleModule = {
            id: `placeholder-module-${moduleIdx}`,
            solution_id: id,
            title: solutionData.title || "Implementação",
            content: {},
            type: "implementation",
            module_order: moduleIdx,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          setModules([placeholderModule]);
          setCurrentModule(placeholderModule);
        } else if (modulesData && modulesData.length > 0) {
          setModules(modulesData);
          
          // Get current module or create placeholder
          if (moduleIdx < modulesData.length) {
            setCurrentModule(modulesData[moduleIdx]);
          } else {
            setCurrentModule(modulesData[0]);
          }
        } else {
          // Create placeholder module for implementation screen
          const placeholderModule: SimpleModule = {
            id: `placeholder-module-${moduleIdx}`,
            solution_id: id,
            title: solutionData.title || "Implementação",
            content: {},
            type: "implementation",
            module_order: moduleIdx,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          setModules([placeholderModule]);
          setCurrentModule(placeholderModule);
        }
        
        // Fetch user progress - using correct field names from database
        if (user) {
          try {
            const progressQuery = supabase
              .from("progress")
              .select("id, user_id, solution_id, status, progress_percentage, started_at, completed_at, notes, created_at, updated_at")
              .eq("solution_id", id)
              .eq("user_id", user.id)
              .single();
            
            const { data: progressData, error: progressError } = await progressQuery;
            
            if (progressError && progressError.code !== 'PGRST116') {
              console.error("Erro ao buscar progresso:", progressError);
            } else if (progressData) {
              setProgress(progressData);
            } else {
              // Create initial progress record if not exists
              const { data: newProgress, error: createError } = await supabase
                .from("progress")
                .insert({
                  user_id: user.id,
                  solution_id: id,
                  status: 'in_progress',
                  progress_percentage: 0,
                  started_at: new Date().toISOString(),
                  notes: null
                })
                .select()
                .single();
              
              if (createError) {
                console.error("Erro ao criar progresso:", createError);
              } else if (newProgress) {
                setProgress(newProgress);
              }
            }
          } catch (progressError) {
            console.error("Erro ao processar progresso:", progressError);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
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
  }, [id, moduleIndex, user, toast, navigate, isAdmin, profile?.user_roles?.name]);
  
  return {
    solution,
    modules,
    currentModule,
    progress,
    loading,
    moduleIdx
  };
};
