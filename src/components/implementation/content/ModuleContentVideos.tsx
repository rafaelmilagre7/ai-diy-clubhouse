
import React, { useState, useEffect } from "react";
import { Module, Solution, supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogging } from "@/hooks/useLogging";
import { YoutubeEmbed } from "@/components/common/YoutubeEmbed";

interface Video {
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
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const { log, logError } = useLogging();

  // Fetch solution data to get videos
  useEffect(() => {
    const fetchSolution = async () => {
      try {
        setLoading(true);
        
        // Verificar se existe solution_id
        if (!module.solution_id) {
          log("No solution_id found in module", { module_id: module.id });
          setVideos([]);
          setLoading(false);
          return;
        }
        
        // Fetch solution data
        const { data, error } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", module.solution_id)
          .maybeSingle();
        
        if (error) {
          logError("Error fetching solution for videos:", error);
          setLoading(false);
          return;
        }
        
        if (!data) {
          log("No solution found", { solution_id: module.solution_id });
          // Buscar vídeos diretamente dos recursos mesmo sem dados da solution
          const { data: resourcesData, error: resourcesError } = await supabase
            .from("solution_resources")
            .select("*")
            .eq("solution_id", module.solution_id)
            .eq("type", "video");
            
          if (!resourcesError && resourcesData && resourcesData.length > 0) {
            const videoResources = resourcesData.map(resource => ({
              title: resource.name,
              description: resource.format || "",
              url: resource.url,
              youtube_id: resource.url.includes("youtube.com/embed/") 
                ? resource.url.split("youtube.com/embed/")[1]?.split("?")[0] 
                : null
            }));
            
            setVideos(videoResources);
            log("Found videos in resources (no solution data)", { count: videoResources.length });
          } else {
            setVideos([]);
            log("No solution or resources found");
          }
          setLoading(false);
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
            const videoResources = resourcesData.map(resource => ({
              title: resource.name,
              description: resource.format || "",
              url: resource.url,
              youtube_id: resource.url.includes("youtube.com/embed/") 
                ? resource.url.split("youtube.com/embed/")[1]?.split("?")[0] 
                : null
            }));
            
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

  // Extract YouTube ID from URL
  const getYouTubeId = (url: string): string | null => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    } catch (error) {
      logError("Error extracting YouTube ID:", error);
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
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum vídeo disponível para esta solução.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-8">
      <h3 className="text-lg font-semibold">Vídeos</h3>
      
      <div className="space-y-8">
        {videos.map((video, index) => {
          // Log video data for debugging
          log("Processing video", { video, index });
          
          // Get video ID from provided youtube_id or extract from URL
          const youtubeId = video.youtube_id || (video.url ? getYouTubeId(video.url) : null);
          
          if (!youtubeId && !video.url) {
            log("Skipping video - no youtube_id or url", { video });
            return null;
          }
          
          return (
            <div key={index} className="space-y-2">
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
