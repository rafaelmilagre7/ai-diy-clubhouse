
import { useState, useEffect } from "react";
import { Module, supabase } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";

export interface Video {
  id: string;
  title: string;
  url: string;
  type: string;
  thumbnail?: string;
  description?: string;
  duration?: number;
  module_id?: string;
  solution_id?: string;
}

export const useVideosData = (module: Module) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { log, logError } = useLogging("useVideosData");

  useEffect(() => {
    const fetchVideos = async () => {
      if (!module || !module.solution_id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        log("Buscando vídeos", { module_id: module.id, solution_id: module.solution_id });
        
        // Buscar vídeos específicos do módulo
        const { data: moduleVideos, error: moduleError } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("module_id", module.id)
          .eq("type", "video");
          
        if (moduleError) {
          logError("Erro ao buscar vídeos do módulo", { error: moduleError });
          console.error("Erro ao buscar vídeos do módulo:", moduleError);
        }
        
        // Buscar vídeos gerais da solução
        const { data: solutionVideos, error: solutionError } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("solution_id", module.solution_id)
          .is("module_id", null)
          .eq("type", "video");
          
        if (solutionError) {
          logError("Erro ao buscar vídeos da solução", { error: solutionError });
          console.error("Erro ao buscar vídeos da solução:", solutionError);
        }
        
        // Combinar resultados
        const allVideos = [
          ...(moduleVideos || []),
          ...(solutionVideos || [])
        ];
        
        console.log("Vídeos encontrados:", allVideos);
        
        if (allVideos.length > 0) {
          log("Vídeos encontrados", { count: allVideos.length });
          
          // Formatar vídeos para o formato esperado
          const formattedVideos = allVideos.map(video => {
            const metadata = video.metadata || {};
            return {
              id: video.id,
              title: video.name,
              url: video.url,
              type: video.format || "youtube",
              thumbnail: metadata.thumbnail_url || "",
              description: metadata.description || "",
              duration: metadata.duration || 0,
              module_id: video.module_id,
              solution_id: video.solution_id
            };
          });
          
          setVideos(formattedVideos);
          log("Vídeos formatados", { videos: formattedVideos });
        } else {
          log("Nenhum vídeo encontrado", { module_id: module.id });
          setVideos([]);
        }
      } catch (error) {
        logError("Erro ao buscar vídeos", { error });
        console.error("Erro ao buscar vídeos:", error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideos();
  }, [module, log, logError]);
  
  return { videos, loading };
};
