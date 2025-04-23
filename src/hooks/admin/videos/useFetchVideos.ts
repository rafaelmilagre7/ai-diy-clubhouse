
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { VideoItem, VideoFetchResponse } from "@/types/videoTypes";

export const useFetchVideos = (solutionId: string): VideoFetchResponse => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVideos = async () => {
    if (!solutionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("solution_resources")
        .select("*")
        .eq("solution_id", solutionId)
        .eq("type", "video")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setVideos(data || []);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar vídeos:", err);
      setError(err as Error);
      toast.error("Não foi possível carregar os vídeos desta solução.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [solutionId]);

  return { videos, loading, error };
};
