
import { useState, useEffect, useCallback } from "react";
import { VideoItem } from "@/types/videoTypes";
import { useFetchVideos } from "./useFetchVideos";
import { useVideoRemove } from "./useVideoRemove";

export const useVideosData = (solutionId: string) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const { videos: fetchedVideos, loading, error, refetch } = useFetchVideos(solutionId);
  const { handleRemoveVideo } = useVideoRemove();

  // Atualiza o estado local quando os vídeos são carregados
  useEffect(() => {
    console.log("[useVideosData] atualizando vídeos do estado", fetchedVideos.length);
    setVideos(fetchedVideos);
  }, [fetchedVideos]);

  const handleRemove = async (id: string, url: string) => {
    console.log("[useVideosData] Removendo vídeo:", id);
    const { success } = await handleRemoveVideo(id, url);
    if (success) {
      console.log("[useVideosData] Vídeo removido com sucesso, atualizando lista");
      setVideos(prev => prev.filter(v => v.id !== id));
    }
  };

  const fetchVideos = useCallback(async () => {
    console.log("[useVideosData] fetchVideos chamado - realizando refetch explícito");
    await refetch();
  }, [refetch]);

  return {
    videos,
    loading,
    error,
    fetchVideos,
    handleRemoveVideo: handleRemove
  };
};
