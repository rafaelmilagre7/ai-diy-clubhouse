
import React, { useEffect, useState } from "react";
import { Module, Solution, supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogging } from "@/hooks/useLogging";

interface ModuleContentVideosProps {
  module: Module;
}

interface Video {
  title: string;
  description?: string;
  url?: string;
  youtube_id?: string;
}

export const ModuleContentVideos = ({ module }: ModuleContentVideosProps) => {
  const [solution, setSolution] = useState<Solution | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { log, logError } = useLogging();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        
        // First, get the solution data
        const { data: solutionData, error: solutionError } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", module.solution_id)
          .single();
        
        if (solutionError) {
          logError("Error fetching solution:", solutionError);
          return;
        }
        
        setSolution(solutionData as Solution);
        
        // Next, fetch videos from solution_resources
        const { data: resourceData, error: resourceError } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("solution_id", module.solution_id)
          .in("type", ['video', 'youtube']);
        
        if (resourceError) {
          logError("Error fetching video resources:", resourceError);
          return;
        }
        
        // Process video data from resources
        const processedVideos: Video[] = (resourceData || []).map((video: any) => {
          let youtubeId = video.url;
          
          // Try to extract YouTube ID if it's a full URL
          if (video.url && video.url.includes('youtube.com')) {
            const url = new URL(video.url);
            youtubeId = url.searchParams.get('v') || video.url;
          } else if (video.url && video.url.includes('youtu.be')) {
            youtubeId = video.url.split('/').pop() || video.url;
          }
          
          return {
            title: video.name || 'Vídeo sem título',
            description: video.metadata?.description || '',
            url: video.url,
            youtube_id: youtubeId
          };
        });
        
        // Also check the legacy videos array in the solution object if present
        if (solutionData.videos && Array.isArray(solutionData.videos)) {
          const legacyVideos: Video[] = solutionData.videos.map((video: any) => ({
            title: video.title || 'Vídeo sem título',
            description: video.description || '',
            url: video.url || '',
            youtube_id: video.youtube_id || ''
          }));
          
          // Combine both sources, removing duplicates
          const allVideos = [...processedVideos, ...legacyVideos];
          // Remove duplicates by youtube_id or url
          const uniqueVideos = Array.from(new Map(allVideos.map(video => 
            [video.youtube_id || video.url, video]
          )).values());
          
          setVideos(uniqueVideos);
        } else {
          setVideos(processedVideos);
        }
        
        log("Videos loaded", { count: processedVideos.length });
      } catch (err) {
        logError("Error fetching video data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [module.solution_id, log, logError]);

  if (loading) {
    return (
      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-semibold">Vídeos Explicativos</h3>
        <div className="aspect-video bg-gray-100 rounded-lg">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-full" />
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
    <div className="space-y-6 mt-8">
      <h3 className="text-lg font-semibold">Vídeos Explicativos</h3>
      
      <div className="space-y-8">
        {videos.map((video: Video, index: number) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <div className="aspect-video bg-gray-100">
              {video.youtube_id ? (
                <iframe 
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${video.youtube_id}`}
                  title={video.title || `Vídeo ${index + 1}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : video.url ? (
                <iframe 
                  className="w-full h-full"
                  src={video.url}
                  title={video.title || `Vídeo ${index + 1}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Vídeo não disponível</p>
                </div>
              )}
            </div>
            <div className="p-4">
              <h4 className="font-medium">{video.title || `Vídeo ${index + 1}`}</h4>
              {video.description && (
                <p className="text-sm text-muted-foreground mt-2">{video.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
