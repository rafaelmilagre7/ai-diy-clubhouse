
import { useState, useEffect } from "react";
import { VideoItem } from "@/types/videoTypes";
import { useFetchVideos } from "./useFetchVideos";
import { useVideoRemove } from "./useVideoRemove";

export const useVideosData = (solutionId: string) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const { videos: fetchedVideos, loading, error, refetch } = useFetchVideos(solutionId);
  const { handleRemoveVideo } = useVideoRemove();

  // Atualiza o estado local quando os vídeos são carregados
  useEffect(() => {
    setVideos(fetchedVideos);
  }, [fetchedVideos]);

  const handleRemove = async (id: string, url: string) => {
    const { success } = await handleRemoveVideo(id, url);
    if (success) {
      setVideos(prev => prev.filter(v => v.id !== id));
    }
  };

  const fetchVideos = async () => {
    console.log("Recarregando vídeos...");
    await refetch();
  };

  return {
    videos,
    loading,
    error,
    fetchVideos,
    handleRemoveVideo: handleRemove
  };
};
