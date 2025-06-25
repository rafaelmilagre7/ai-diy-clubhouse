
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";

export interface SolutionVideo {
  id: string;
  name: string;
  title: string;
  url: string;
  description?: string;
  thumbnail_url?: string;
  duration?: string;
  duration_seconds?: number;
  video_type?: string;
}

export const useSolutionVideos = (solutionId: string) => {
  const [videos, setVideos] = useState<SolutionVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { log, logError } = useLogging();

  useEffect(() => {
    const fetchVideos = async () => {
      if (!solutionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        log("Buscando vídeos da solução", { solutionId });

        const { data, error } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("solution_id", solutionId as any)
          .eq("type", "video" as any)
          .order("created_at", { ascending: true });

        if (error) {
          logError("Erro ao buscar vídeos da solução", error);
          throw error;
        }

        const formattedVideos = (data || []).map((video: any) => ({
          id: video.id,
          name: video.name || video.title || 'Vídeo sem título',
          title: video.title || video.name || 'Vídeo sem título',
          url: video.url,
          description: video.description,
          thumbnail_url: video.thumbnail_url,
          duration: video.duration,
          duration_seconds: video.duration_seconds,
          video_type: video.video_type || 'youtube'
        }));

        setVideos(formattedVideos);
        log("Vídeos carregados com sucesso", { count: formattedVideos.length });
      } catch (err: any) {
        logError("Erro ao carregar vídeos", err);
        setError(err.message);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [solutionId, log, logError]);

  return { videos, loading, error };
};
