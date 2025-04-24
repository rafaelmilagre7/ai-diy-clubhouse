
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { VideoItem, VideoFetchResponse } from "@/types/videoTypes";

export const useFetchVideos = (solutionId: string): VideoFetchResponse & { refetch: () => Promise<void> } => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(Date.now());

  const fetchVideos = useCallback(async () => {
    if (!solutionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Buscando vídeos para solução:", solutionId, "Timestamp:", new Date().toISOString());
      
      const { data, error } = await supabase
        .from("solution_resources")
        .select("*")
        .eq("solution_id", solutionId)
        .eq("type", "video")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      console.log("Vídeos recebidos:", data?.length || 0);
      if (data && data.length > 0) {
        console.log("Primeiro vídeo:", data[0].name, "ID:", data[0].id);
      }
      
      setVideos(data || []);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar vídeos:", err);
      setError(err as Error);
      toast("Erro ao carregar vídeos", {
        description: "Não foi possível carregar os vídeos desta solução."
      });
    } finally {
      setLoading(false);
    }
  }, [solutionId]); 

  const refetch = useCallback(async () => {
    console.log("Forçando refetch de vídeos...");
    setLastFetch(Date.now()); // Atualiza o timestamp para forçar um refetch
    await fetchVideos(); // Chama diretamente a função fetchVideos
  }, [fetchVideos]);

  useEffect(() => {
    console.log("useEffect em useFetchVideos - buscando vídeos...");
    fetchVideos();
  }, [fetchVideos, lastFetch]);

  return { videos, loading, error, refetch };
};
