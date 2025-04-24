
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { VideoItem, VideoFetchResponse } from "@/types/videoTypes";

export const useFetchVideos = (solutionId: string): VideoFetchResponse & { refetch: () => Promise<void> } => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshCounter, setRefreshCounter] = useState<number>(0);

  const fetchVideos = useCallback(async () => {
    if (!solutionId) {
      setLoading(false);
      setVideos([]);
      return;
    }

    try {
      setLoading(true);
      console.log("[useFetchVideos] Buscando vídeos para solução:", solutionId, "Timestamp:", new Date().toISOString());
      
      // Adicionando um timestamp para evitar cache do navegador ou do Supabase
      const { data, error } = await supabase
        .from("solution_resources")
        .select("*")
        .eq("solution_id", solutionId)
        .eq("type", "video")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      console.log("[useFetchVideos] Vídeos recebidos:", data?.length || 0);
      
      if (data && data.length > 0) {
        console.log("[useFetchVideos] Primeiro vídeo da lista:", data[0]);
      } else {
        console.log("[useFetchVideos] Nenhum vídeo encontrado para a solução");
      }
      
      setVideos(data || []);
      setError(null);
    } catch (err) {
      console.error("[useFetchVideos] Erro ao carregar vídeos:", err);
      setError(err as Error);
      toast("Erro ao carregar vídeos", {
        description: "Não foi possível carregar os vídeos desta solução."
      });
    } finally {
      setLoading(false);
    }
  }, [solutionId]); 

  // Função refetch mais robusta que garante um refetch real
  const refetch = useCallback(async () => {
    console.log("[useFetchVideos] Forçando refetch de vídeos...");
    setRefreshCounter(prev => prev + 1); // Incrementa o contador para forçar refetch
    
    try {
      // Pequeno atraso para garantir que qualquer operação de banco de dados tenha tempo de propagar
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchVideos(); // Chama diretamente a função fetchVideos
      console.log("[useFetchVideos] Refetch concluído com sucesso");
    } catch (err) {
      console.error("[useFetchVideos] Erro durante refetch:", err);
      toast("Erro ao atualizar", {
        description: "Ocorreu um problema ao tentar atualizar a lista de vídeos."
      });
    }
  }, [fetchVideos]);

  useEffect(() => {
    console.log("[useFetchVideos] useEffect acionado - buscando vídeos...", { refreshCounter, solutionId });
    if (solutionId) {
      fetchVideos();
    }
  }, [fetchVideos, refreshCounter, solutionId]);

  return { videos, loading, error, refetch };
};
