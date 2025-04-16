import React, { useEffect, useState } from "react";
import { Module, Solution, supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

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

  useEffect(() => {
    const fetchSolution = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", module.solution_id)
          .single();
        
        if (error) {
          console.error("Error fetching solution:", error);
          return;
        }
        
        // Cast data to Solution type
        const solutionData = data as Solution;
        setSolution(solutionData);
        
        // Check if videos property exists and is an array
        if (solutionData.videos && Array.isArray(solutionData.videos)) {
          setVideos(solutionData.videos);
        } else {
          console.warn("Videos property is missing or not an array", solutionData);
          setVideos([]);
        }
      } catch (err) {
        console.error("Error fetching solution data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSolution();
  }, [module.solution_id]);

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
    return null;
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
