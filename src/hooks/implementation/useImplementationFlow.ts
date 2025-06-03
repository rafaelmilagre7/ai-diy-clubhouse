
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase, Solution, Progress } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useLogging } from "@/hooks/useLogging";

export const useImplementationFlow = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { log, logError } = useLogging();
  const isAdmin = profile?.role === 'admin';
  
  const [solution, setSolution] = useState<Solution | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("tools");

  // Fetch all implementation data
  useEffect(() => {
    const fetchImplementationData = async () => {
      if (!id || !user) return;
      
      try {
        setLoading(true);
        log("Buscando dados da implementação", { solutionId: id });
        
        // Buscar solução
        let solutionQuery = supabase
          .from("solutions")
          .select("*")
          .eq("id", id);
          
        if (!isAdmin) {
          solutionQuery = solutionQuery.eq("published", true);
        }
        
        const { data: solutionData, error: solutionError } = await solutionQuery.maybeSingle();
        
        if (solutionError) {
          logError("Erro ao buscar solução:", solutionError);
          setError("Erro ao carregar solução");
          return;
        }

        if (!solutionData) {
          setError("Solução não encontrada");
          navigate("/solutions");
          return;
        }

        setSolution(solutionData as Solution);

        // Buscar dados relacionados em paralelo
        const [materialsResult, toolsResult, videosResult, progressResult] = await Promise.allSettled([
          // Materiais
          supabase
            .from("solution_resources")
            .select("*")
            .eq("solution_id", id)
            .neq("type", "video")
            .neq("type", "youtube")
            .order("created_at", { ascending: true }),
          
          // Ferramentas
          supabase
            .from("solution_tools_reference")
            .select(`*, tools (*)`)
            .eq("solution_id", id)
            .order('order_index'),
          
          // Vídeos
          supabase
            .from("solution_resources")
            .select("*")
            .eq("solution_id", id)
            .in("type", ["video", "youtube"])
            .order("created_at", { ascending: true }),
          
          // Progresso do usuário
          supabase
            .from("progress")
            .select("*")
            .eq("solution_id", id)
            .eq("user_id", user.id)
            .maybeSingle()
        ]);

        // Processar resultados
        if (materialsResult.status === 'fulfilled' && !materialsResult.value.error) {
          setMaterials(materialsResult.value.data || []);
        }
        
        if (toolsResult.status === 'fulfilled' && !toolsResult.value.error) {
          setTools(toolsResult.value.data || []);
        }
        
        if (videosResult.status === 'fulfilled' && !videosResult.value.error) {
          setVideos(videosResult.value.data || []);
        }
        
        if (progressResult.status === 'fulfilled' && !progressResult.value.error) {
          setProgress(progressResult.value.data);
        } else {
          // Criar progresso inicial
          const { data: newProgress } = await supabase
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
          
          if (newProgress) {
            setProgress(newProgress as Progress);
          }
        }

        log("Dados carregados com sucesso", {
          solution: !!solutionData,
          materials: materialsResult.status === 'fulfilled' ? materialsResult.value.data?.length : 0,
          tools: toolsResult.status === 'fulfilled' ? toolsResult.value.data?.length : 0,
          videos: videosResult.status === 'fulfilled' ? videosResult.value.data?.length : 0
        });

      } catch (error) {
        logError("Erro ao buscar dados de implementação:", error);
        setError("Erro ao carregar implementação");
        toast({
          title: "Erro ao carregar implementação",
          description: "Ocorreu um erro ao tentar carregar os dados da implementação.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchImplementationData();
  }, [id, user, isAdmin, toast, navigate, log, logError]);

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

  return {
    // Dados
    solution,
    progress,
    materials,
    tools,
    videos,
    
    // Estados
    loading,
    error,
    activeTab,
    setActiveTab,
    
    // Ações
    completeImplementation,
    
    // Metadados
    solutionId: id,
    userId: user?.id,
    isAdmin
  };
};
