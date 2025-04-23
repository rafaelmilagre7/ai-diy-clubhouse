
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
  const { log, logError } = useLogging("useImplementationData");
  const isAdmin = profile?.role === 'admin';
  
  const [solution, setSolution] = useState<Solution | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        log("Buscando dados de implementação", { id });
        
        // Buscar solução
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
        
        // Buscar módulos
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select("*")
          .eq("solution_id", id)
          .order("module_order", { ascending: true });
        
        if (modulesError) throw modulesError;
        
        if (modulesData && modulesData.length > 0) {
          setModules(modulesData as Module[]);
        }
        
        // Buscar progresso do usuário
        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from("progress")
            .select("*")
            .eq("user_id", user.id)
            .eq("solution_id", id)
            .maybeSingle();
          
          if (!progressError && progressData) {
            setProgress(progressData as Progress);
            setCompletedModules(progressData.completed_modules || []);
          }
        }
      } catch (error) {
        logError("Erro ao carregar dados de implementação:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, isAdmin]);

  return {
    solution,
    modules,
    progress,
    completedModules,
    setCompletedModules,
    loading,
  };
};
