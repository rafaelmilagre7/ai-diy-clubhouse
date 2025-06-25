
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";

export interface SolutionVideo {
  id: string;
  title: string;
  url: string;
  description?: string;
  video_type: string;
  thumbnail_url?: string;
  duration_seconds?: number;
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

        // Buscar vídeos associados à solução através dos recursos
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
          title: video.name,
          url: video.url,
          description: video.description,
          video_type: video.format || "youtube",
          thumbnail_url: video.thumbnail_url,
          duration_seconds: video.duration_seconds
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
