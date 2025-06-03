
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase, Solution, Progress } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useLogging } from "@/hooks/useLogging";
import { useSolutionDataCentralized } from "@/hooks/solution/useSolutionDataCentralized";

export const useImplementationFlow = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { log, logError } = useLogging();
  const isAdmin = profile?.role === 'admin';
  
  const [solution, setSolution] = useState<Solution | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tools");

  // Buscar dados centralizados da solução
  const { data: solutionData, isLoading: dataLoading, error: dataError } = useSolutionDataCentralized(id);

  // Fetch solution and progress
  useEffect(() => {
    const fetchImplementationData = async () => {
      if (!id || !user) return;
      
      try {
        setLoading(true);
        
        // Verificar se a solução existe nos dados centralizados
        if (solutionData?.solution) {
          setSolution(solutionData.solution);
          log("Solução carregada para implementação", { 
            solutionId: solutionData.solution.id,
            title: solutionData.solution.title
          });
        }
        
        // Buscar progresso do usuário
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
            setCompletedModules([]);
          }
          
          log("Progresso carregado", { 
            progressId: progressData.id,
            completedModules: progressData.completed_modules?.length || 0
          });
        } else {
          // Criar progresso inicial se não existir
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
            log("Progresso inicial criado", { progressId: newProgress.id });
          }
        }
      } catch (error) {
        logError("Erro ao buscar dados de implementação:", error);
        toast({
          title: "Erro ao carregar implementação",
          description: "Ocorreu um erro ao tentar carregar os dados da implementação.",
          variant: "destructive",
        });
        navigate("/solutions");
      } finally {
        setLoading(false);
      }
    };
    
    if (!dataLoading && solutionData) {
      fetchImplementationData();
    }
  }, [id, user, solutionData, dataLoading, toast, navigate, log, logError]);

  // Função para marcar implementação como completa
  const completeImplementation = async () => {
    if (!progress || !user || !id) return false;
    
    try {
      const { error } = await supabase
        .from("progress")
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          last_activity: new Date().toISOString(),
        })
        .eq("id", progress.id);
      
      if (error) throw error;
      
      setProgress(prev => prev ? { ...prev, is_completed: true } : null);
      
      toast({
        title: "Parabéns!",
        description: "Implementação concluída com sucesso!",
        variant: "default",
      });
      
      log("Implementação concluída", { 
        progressId: progress.id,
        solutionId: id
      });
      
      return true;
    } catch (error) {
      logError("Erro ao completar implementação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível completar a implementação.",
        variant: "destructive",
      });
      return false;
    }
  };

  const isLoadingAny = loading || dataLoading;

  return {
    // Dados
    solution,
    progress,
    completedModules,
    materials: solutionData?.materials || [],
    tools: solutionData?.tools || [],
    videos: solutionData?.videos || [],
    
    // Estados
    loading: isLoadingAny,
    error: dataError,
    activeTab,
    setActiveTab,
    
    // Ações
    completeImplementation,
    setCompletedModules,
    
    // Metadados
    solutionId: id,
    userId: user?.id,
    isAdmin
  };
};
