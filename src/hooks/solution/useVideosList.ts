
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useLogging } from "@/hooks/useLogging";

export interface VideoItem {
  id: string;
  name: string;
  url: string;
  type: "video";
  metadata?: {
    source?: "youtube" | "upload";
    youtube_id?: string;
    thumbnail_url?: string;
  };
}

export const useVideosList = (solution: any) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const { toast } = useToast();
  const { log, logError } = useLogging("useVideosList");

  useEffect(() => {
    const fetchVideos = async () => {
      if (!solution?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("solution_id", solution.id)
          .eq("type", "video")
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        setVideos(data || []);
      } catch (error) {
        logError("Erro ao carregar vídeos", { error });
        toast({
          title: "Erro ao carregar vídeos",
          description: "Não foi possível carregar os vídeos desta solução.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideos();
  }, [solution?.id, toast, log, logError]);

  const handleVideoView = (video: VideoItem) => {
    try {
      log("Vídeo visualizado", { 
        video_id: video.id,
        video_name: video.name,
        solution_id: solution.id 
      });
      setSelectedVideo(video);
    } catch (error) {
      logError("Erro ao registrar visualização de vídeo", { error });
    }
  };

  return {
    videos,
    loading,
    selectedVideo,
    setSelectedVideo,
    handleVideoView
  };
};
