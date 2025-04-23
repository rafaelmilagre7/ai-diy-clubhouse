
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
  const [error, setError] = useState<string | null>(null);
  const { log, logError } = useLogging("ModuleContentVideos");

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

        // Logs para diagnóstico
        console.log(`Buscando vídeos para módulo ${module.id} da solução ${module.solution_id}`);

        // Verificando se o módulo é um placeholder
        const isPlaceholder = module.id.startsWith('placeholder-');
        
        if (isPlaceholder) {
          log("Módulo é um placeholder, não buscando vídeos do banco");
          setVideos([]);
          setLoading(false);
          return;
        }
        
        // Primeiro, verificamos se há vídeos no conteúdo do módulo
        if (module.content && module.content.videos && Array.isArray(module.content.videos)) {
          log("Encontrados vídeos no conteúdo do módulo", { count: module.content.videos.length });
          console.log(`Encontrados ${module.content.videos.length} vídeos no conteúdo do módulo`);
          setVideos(module.content.videos);
          setLoading(false);
          return;
        }
        
        // Senão, buscamos recursos de vídeo relacionados ao módulo
        const { data: moduleVideos, error: moduleVideosError } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("module_id", module.id)
          .eq("type", "video");
          
        if (moduleVideosError) {
          logError("Erro ao buscar vídeos do módulo", { error: moduleVideosError });
          console.error("Erro ao buscar vídeos do módulo:", moduleVideosError);
        } else {
          console.log(`Vídeos específicos do módulo: ${moduleVideos ? moduleVideos.length : 0} encontrados`);
        }
        
        // Buscamos também vídeos gerais da solução
        const { data: solutionVideos, error: solutionVideosError } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("solution_id", module.solution_id)
          .eq("type", "video")
          .is("module_id", null);
          
        if (solutionVideosError) {
          logError("Erro ao buscar vídeos da solução", { error: solutionVideosError });
          console.error("Erro ao buscar vídeos da solução:", solutionVideosError);
        } else {
          console.log(`Vídeos gerais da solução: ${solutionVideos ? solutionVideos.length : 0} encontrados`);
        }
        
        // Combinamos todos os vídeos encontrados
        const allVideos = [
          ...(moduleVideos || []),
          ...(solutionVideos || [])
        ];
        
        if (allVideos.length > 0) {
          log("Vídeos encontrados", { count: allVideos.length });
          console.log(`Total de vídeos encontrados: ${allVideos.length}`);
          
          const formattedVideos = allVideos.map(video => ({
            id: video.id,
            title: video.name,
            description: video.format || "",
            url: video.url,
            youtube_id: extractYoutubeId(video.url)
          }));
          
          setVideos(formattedVideos);
          log("Vídeos formatados", { videos: formattedVideos });
          console.log("Vídeos formatados:", formattedVideos);
        } else {
          log("Nenhum vídeo encontrado", { module_id: module.id });
          console.log(`Nenhum vídeo encontrado para o módulo ${module.id}`);
          setVideos([]);
        }
      } catch (err) {
        logError("Erro ao carregar vídeos", { err });
        console.error("Erro ao carregar vídeos:", err);
        setError("Não foi possível carregar os vídeos");
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideos();
  }, [module, log, logError]);

  // Função para extrair YouTube ID de URL
  const extractYoutubeId = (url?: string): string | null => {
    if (!url) return null;
    
    try {
      // Extrair de URL de incorporação
      if (url.includes('youtube.com/embed/')) {
        const embedPath = url.split('youtube.com/embed/')[1];
        if (embedPath) {
          return embedPath.split('?')[0].split('/')[0];
        }
      }
      
      // Extrair de URL regular do YouTube
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    } catch (error) {
      logError("Erro ao extrair YouTube ID", { error, url });
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

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md mt-8">
        <h3 className="text-lg font-semibold text-red-700">Erro</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8 mt-8">
      <h3 className="text-lg font-semibold">Vídeos</h3>
      
      <div className="space-y-8">
        {videos.map((video, index) => {
          // Get video ID from provided youtube_id or extract from URL
          const youtubeId = video.youtube_id || (video.url ? extractYoutubeId(video.url) : null);
          
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
