
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

export const ModuleContentVideos = ({ module }: ModuleContentVideosProps) => {
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
        } 
        // Then check for videos in solution data
        else if (solutionData.videos && Array.isArray(solutionData.videos)) {
          setVideos(solutionData.videos);
        } else {
          setVideos([]);
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
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) {
    return (
      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-semibold">Vídeos</h3>
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-40 md:h-56 w-full rounded-md" />
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
          // Get video ID from provided youtube_id or extract from URL
          const youtubeId = video.youtube_id || (video.url ? getYouTubeId(video.url) : null);
          
          if (!youtubeId && !video.url) {
            return null;
          }
          
          return (
            <div key={index} className="space-y-2">
              {youtubeId ? (
                <YoutubeEmbed youtubeId={youtubeId} />
              ) : (
                <div className="aspect-w-16 aspect-h-9 rounded-md overflow-hidden">
                  <iframe 
                    src={video.url} 
                    title={video.title || `Vídeo ${index + 1}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-56 md:h-72"
                  />
                </div>
              )}
              
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
