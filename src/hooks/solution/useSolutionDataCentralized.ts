
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useLogging } from "@/hooks/useLogging";

export interface SolutionData {
  solution: any | null;
  materials: any[];
  tools: any[];
  videos: any[];
  progress: any | null;
}

export const useSolutionDataCentralized = (solutionId: string | undefined) => {
  const { user, profile } = useAuth();
  const { log, logError } = useLogging();
  const isAdmin = profile?.role === 'admin';

  return useQuery({
    queryKey: ['solution-complete-data', solutionId, user?.id],
    queryFn: async (): Promise<SolutionData> => {
      if (!solutionId) {
        throw new Error('Solution ID is required');
      }

      log("Buscando dados completos da solução", { solutionId });

      try {
        // 1. Buscar solução
        let solutionQuery = supabase
          .from("solutions")
          .select("*")
          .eq("id", solutionId);
          
        if (!isAdmin) {
          solutionQuery = solutionQuery.eq("published", true);
        }
        
        const { data: solution, error: solutionError } = await solutionQuery.maybeSingle();
        
        if (solutionError) {
          logError("Erro ao buscar solução:", solutionError);
          throw solutionError;
        }

        if (!solution) {
          throw new Error('Solução não encontrada');
        }

        // 2. Buscar dados relacionados em paralelo
        const [materialsResult, toolsResult, videosResult, progressResult] = await Promise.allSettled([
          // Materiais (excluindo vídeos)
          supabase
            .from("solution_resources")
            .select("*")
            .eq("solution_id", solutionId)
            .neq("type", "video")
            .neq("type", "youtube")
            .order("created_at", { ascending: true }),
          
          // Ferramentas (com fallback para sistema antigo)
          supabase
            .from("solution_tools_reference")
            .select(`*, tools (*)`)
            .eq("solution_id", solutionId)
            .order('order_index')
            .then(result => {
              if (result.error || !result.data || result.data.length === 0) {
                // Fallback para sistema antigo
                return supabase
                  .from("solution_tools")
                  .select("*")
                  .eq("solution_id", solutionId);
              }
              return result;
            }),
          
          // Vídeos
          supabase
            .from("solution_resources")
            .select("*")
            .eq("solution_id", solutionId)
            .in("type", ["video", "youtube"])
            .order("created_at", { ascending: true }),
          
          // Progresso do usuário (se autenticado)
          user ? supabase
            .from("progress")
            .select("*")
            .eq("solution_id", solutionId)
            .eq("user_id", user.id)
            .maybeSingle() : Promise.resolve({ data: null, error: null })
        ]);

        // Processar resultados com tratamento de erros graceful
        const materials = materialsResult.status === 'fulfilled' && !materialsResult.value.error 
          ? materialsResult.value.data || [] 
          : [];
          
        const tools = toolsResult.status === 'fulfilled' && !toolsResult.value.error 
          ? toolsResult.value.data || [] 
          : [];
          
        const videos = videosResult.status === 'fulfilled' && !videosResult.value.error 
          ? videosResult.value.data || [] 
          : [];
          
        const progress = progressResult.status === 'fulfilled' && !progressResult.value.error 
          ? progressResult.value.data 
          : null;

        // Log de erros não críticos
        [materialsResult, toolsResult, videosResult, progressResult].forEach((result, index) => {
          if (result.status === 'rejected') {
            const sections = ['materials', 'tools', 'videos', 'progress'];
            logError(`Erro ao buscar ${sections[index]}:`, result.reason);
          }
        });

        log("Dados completos carregados com sucesso", {
          solution: !!solution,
          materials: materials.length,
          tools: tools.length,
          videos: videos.length,
          hasProgress: !!progress
        });

        return {
          solution,
          materials,
          tools,
          videos,
          progress
        };

      } catch (error) {
        logError("Erro ao buscar dados da solução:", error);
        throw error;
      }
    },
    enabled: !!solutionId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    retryDelay: 1000
  });
};
