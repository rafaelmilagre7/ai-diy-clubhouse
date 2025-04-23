
import React, { useState, useEffect } from "react";
import { Module, Solution, supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogging } from "@/hooks/useLogging";
import { YoutubeEmbed } from "@/components/common/YoutubeEmbed";

interface Video {
  id?: string;
  title?: string;
  description?: string;
  url?: string;
  youtube_id?: string;
}

interface ModuleContentVideosProps {
  module: Module;
}

export const ModuleContentVideos: React.FC<ModuleContentVideosProps> = ({ module }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { log, logError } = useLogging("ModuleContentVideos");

  // Fetch solution data to get videos - otimizado para funcionar melhor
  useEffect(() => {
    const fetchVideos = async () => {
      if (!module || !module.solution_id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        log("Buscando vídeos para o módulo", { 
          module_id: module.id, 
          solution_id: module.solution_id 
        });
        
        // Primeiro, verificamos se há vídeos no conteúdo do módulo
        if (module.content && module.content.videos && Array.isArray(module.content.videos)) {
          log("Encontrados vídeos no conteúdo do módulo", { count: module.content.videos.length });
          setVideos(module.content.videos);
          setLoading(false);
          return;
        }
        
        // Senão, buscamos recursos de vídeo relacionados ao módulo
        const { data: moduleResources, error: moduleResourcesError } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("module_id", module.id)
          .eq("type", "video");
          
        if (moduleResourcesError) {
          logError("Erro ao buscar recursos de vídeo do módulo", { error: moduleResourcesError });
        } else if (moduleResources && moduleResources.length > 0) {
          log("Encontrados recursos de vídeo para o módulo", { count: moduleResources.length });
          
          const formattedVideos = moduleResources.map(resource => ({
            id: resource.id,
            title: resource.name,
            description: resource.format || "",
            url: resource.url,
            youtube_id: resource.url.includes("youtube.com/embed/") 
              ? resource.url.split("youtube.com/embed/")[1]?.split("?")[0] 
              : null
          }));
          
          setVideos(formattedVideos);
          setLoading(false);
          return;
        }
        
        // Se não encontramos vídeos relacionados ao módulo, buscamos vídeos da solução
        const { data: solutionResources, error: solutionResourcesError } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("solution_id", module.solution_id)
          .eq("type", "video")
          .is("module_id", null);
          
        if (solutionResourcesError) {
          logError("Erro ao buscar recursos de vídeo da solução", { error: solutionResourcesError });
        } else if (solutionResources && solutionResources.length > 0) {
          log("Encontrados recursos de vídeo para a solução", { count: solutionResources.length });
          
          const formattedVideos = solutionResources.map(resource => ({
            id: resource.id,
            title: resource.name,
            description: resource.format || "",
            url: resource.url,
            youtube_id: resource.url.includes("youtube.com/embed/") 
              ? resource.url.split("youtube.com/embed/")[1]?.split("?")[0] 
              : null
          }));
          
          setVideos(formattedVideos);
        } else {
          log("Nenhum vídeo encontrado para o módulo ou solução", {
            module_id: module.id,
            solution_id: module.solution_id
          });
          setVideos([]);
        }
      } catch (err) {
        logError("Erro ao carregar vídeos", { err });
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideos();
  }, [module, log, logError]);

  // Extract YouTube ID from URL com tratamento de erro
  const getYouTubeId = (url: string): string | null => {
    if (!url) return null;
    
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    } catch (error) {
      logError("Erro ao extrair YouTube ID", { error });
      return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-semibold">Vídeos</h3>
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-52 w-full rounded-md" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-6 mt-6 bg-gray-50 rounded-md">
        <p className="text-muted-foreground">Nenhum vídeo disponível para esta solução.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-8">
      <h3 className="text-lg font-semibold">Vídeos</h3>
      
      <div className="space-y-8">
        {videos.map((video, index) => {
          // Get video ID from provided youtube_id or extract from URL
          const youtubeId = video.youtube_id || (video.url ? getYouTubeId(video.url) : null);
          
          if (!youtubeId && !video.url) {
            log("Vídeo sem URL ou YouTube ID válido", { video, index });
            return null;
          }
          
          return (
            <div key={video.id || index} className="space-y-2">
              {youtubeId ? (
                <YoutubeEmbed youtubeId={youtubeId} title={video.title} />
              ) : video.url ? (
                <div className="aspect-video rounded-md overflow-hidden">
                  <video
                    src={video.url}
                    controls
                    className="w-full h-full"
                    title={video.title || `Vídeo ${index + 1}`}
                  />
                </div>
              ) : null}
              
              {video.title && (
                <h4 className="font-medium text-lg mt-2">{video.title}</h4>
              )}
              
              {video.description && (
                <p className="text-muted-foreground">{video.description}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
