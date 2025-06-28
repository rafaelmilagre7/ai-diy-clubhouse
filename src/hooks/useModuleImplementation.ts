

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Solution {
  id: string;
  title: string;
  description: string;
  category: string;
  estimated_time_hours: number;
  created_at: string;
  updated_at: string;
}

interface Module {
  id: string;
  solution_id: string;
  title: string;
  content: any;
  type: string;
  module_order: number;
  created_at: string;
  updated_at: string;
}

interface Progress {
  id: string;
  user_id: string;
  solution_id: string;
  current_module: number;
  is_completed: boolean;
  completed_modules: number[];
  last_activity: string;
}

export const useModuleImplementation = () => {
  const { id, moduleIndex } = useParams<{ id: string; moduleIndex: string }>();
  const { user, profile } = useSimpleAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isAdmin = profile?.user_roles?.name === 'admin';
  
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
        const solutionQuery = supabase
          .from("solutions")
          .select("*")
          .eq("id", id);
        
        const { data: solutionData, error: solutionError } = await solutionQuery.maybeSingle();
        
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
        
        setSolution(solutionData as Solution);
        
        // Fetch modules for this solution
        const modulesQuery = supabase
          .from("modules")
          .select("*")
          .eq("solution_id", id)
          .order("module_order", { ascending: true });
        
        const { data: modulesData, error: modulesError } = await modulesQuery;
        
        if (modulesError) {
          console.error("Erro ao buscar módulos:", modulesError);
          throw modulesError;
        }
        
        if (modulesData && modulesData.length > 0) {
          const modulesList = modulesData as Module[];
          setModules(modulesList);
          
          // Get current module or create placeholder
          if (moduleIdx < modulesList.length) {
            setCurrentModule(modulesList[moduleIdx]);
          } else {
            setCurrentModule(modulesList[0]);
          }
        } else {
          // Create placeholder module for implementation screen
          const placeholderModule: Module = {
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
        
        // Fetch user progress
        if (user) {
          try {
            const progressQuery = supabase
              .from("progress")
              .select("*")
              .eq("solution_id", id)
              .eq("user_id", user.id);
            
            const { data: progressData, error: progressError } = await progressQuery.maybeSingle();
            
            if (progressError) {
              console.error("Erro ao buscar progresso:", progressError);
            } else if (progressData) {
              setProgress(progressData as Progress);
            } else {
              // Create initial progress record if not exists
              const newProgressQuery = supabase
                .from("progress")
                .insert({
                  user_id: user.id,
                  solution_id: id,
                  current_module: moduleIdx,
                  is_completed: false,
                  completed_modules: [],
                  last_activity: new Date().toISOString(),
                })
                .select()
                .single();
              
              const { data: newProgress, error: createError } = await newProgressQuery;
              
              if (createError) {
                console.error("Erro ao criar progresso:", createError);
              } else if (newProgress) {
                setProgress(newProgress as Progress);
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

