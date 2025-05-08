import React, { useState, useEffect } from "react";
import { Module, Solution, supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogging } from "@/hooks/useLogging";
import { PandaVideoPlayer } from "@/components/formacao/comum/PandaVideoPlayer";
import { YoutubeEmbed } from "@/components/common/YoutubeEmbed";
import { getVideoTypeFromUrl, getPandaVideoId } from "@/lib/supabase/videoUtils";

interface Video {
  title?: string;
  description?: string;
  url?: string;
  youtube_id?: string;
  id?: string;
  type?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
}

interface ModuleContentVideosProps {
  module: Module;
}

export const ModuleContentVideos: React.FC<ModuleContentVideosProps> = ({ module }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const { log, logError } = useLogging();

  // Fetch solution data to get videos
  useEffect(() => {
    const fetchSolution = async () => {
      try {
        setLoading(true);
        
        // Fetch solution data
        const { data, error } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", module.solution_id)
          .single();
        
        if (error) {
          logError("Error fetching solution for videos:", error);
          return;
        }
        
        // Ensure data is of Solution type
        const solutionData = data as Solution;
        setSolution(solutionData);
        
        // Check for videos in module content first
        if (module.content && module.content.videos && Array.isArray(module.content.videos)) {
          setVideos(module.content.videos);
          log("Found videos in module content", { count: module.content.videos.length });
        } 
        // Then check for videos in solution data
        else if (solutionData.videos && Array.isArray(solutionData.videos)) {
          setVideos(solutionData.videos);
          log("Found videos in solution data", { count: solutionData.videos.length });
        } else {
          // Fetch videos from solution_resources
          const { data: resourcesData, error: resourcesError } = await supabase
            .from("solution_resources")
            .select("*")
            .eq("solution_id", module.solution_id)
            .eq("type", "video");
            
          if (resourcesError) {
            logError("Error fetching video resources:", resourcesError);
          } else if (resourcesData && resourcesData.length > 0) {
            // Convert resource data to video format
            const videoResources = resourcesData.map(resource => {
              // Determinar se é um vídeo do YouTube ou do Panda
              const videoType = getVideoTypeFromUrl(resource.url);
              let youtubeId = null;
              let pandaId = null;
              
              if (videoType === "youtube") {
                const urlParts = resource.url.split('embed/');
                youtubeId = urlParts.length > 1 ? urlParts[1]?.split('?')[0] : null;
              } else if (videoType === "pandavideo") {
                pandaId = getPandaVideoId(resource.url);
              }
              
              // Tentar acessar metadata como objeto ou string JSON
              let metadata: any = {};
              if (resource.metadata) {
                try {
                  if (typeof resource.metadata === 'string') {
                    metadata = JSON.parse(resource.metadata as string);
                  } else if (typeof resource.metadata === 'object') {
                    metadata = resource.metadata;
                  }
                } catch (e) {
                  console.error("Erro ao processar metadata:", e);
                }
              }
              
              return {
                id: resource.id,
                title: resource.name,
                description: resource.format || "",
                url: resource.url,
                type: videoType,
                youtube_id: youtubeId,
                panda_id: pandaId,
                thumbnail_url: metadata?.thumbnail_url || null,
                duration_seconds: metadata?.duration_seconds || 0
              };
            });
            
            setVideos(videoResources);
            log("Found videos in resources", { count: videoResources.length });
          } else {
            log("No videos found in module, solution or resources", {
              module_id: module.id,
              solution_id: module.solution_id
            });
            setVideos([]);
          }
        }
      } catch (err) {
        logError("Error loading videos:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSolution();
  }, [module, logError, log]);

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
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum vídeo disponível para esta solução.</p>
      </div>
    );
  }

  // Renderiza o player de vídeo baseado no tipo
  const renderVideoPlayer = (video: Video, index: number) => {
    // Detectar tipo de vídeo pela URL se não estiver explícito
    const videoType = video.type || getVideoTypeFromUrl(video.url || '');
    
    if (videoType === 'youtube' || (video.youtube_id && !video.url?.includes('pandavideo'))) {
      const youtubeId = video.youtube_id || (video.url ? video.url.split('embed/')[1]?.split('?')[0] : null);
      if (youtubeId) {
        return <YoutubeEmbed youtubeId={youtubeId} title={video.title} />;
      }
    }
    
    if (videoType === 'pandavideo' || video.url?.includes('pandavideo')) {
      const pandaVideoId = getPandaVideoId(video.url || '');
      if (pandaVideoId) {
        return (
          <PandaVideoPlayer 
            videoId={pandaVideoId} 
            title={video.title || `Vídeo ${index + 1}`} 
          />
        );
      }
    }
    
    // Fallback para player de vídeo HTML nativo
    if (video.url) {
      return (
        <div className="aspect-video rounded-md overflow-hidden">
          <video
            src={video.url}
            controls
            className="w-full h-full"
            title={video.title || `Vídeo ${index + 1}`}
          />
        </div>
      );
    }
    
    return (
      <div className="aspect-video rounded-md bg-gray-100 flex items-center justify-center">
        <p className="text-muted-foreground">Vídeo não disponível</p>
      </div>
    );
  };

  return (
    <div className="space-y-8 mt-8">
      <h3 className="text-lg font-semibold">Vídeos</h3>
      
      <div className="space-y-8">
        {videos.map((video, index) => {
          return (
            <div key={video.id || index} className="space-y-2">
              {renderVideoPlayer(video, index)}
              
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
