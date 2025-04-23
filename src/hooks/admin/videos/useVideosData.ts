
import { useState } from "react";
import { VideoItem } from "@/types/videoTypes";
import { useFetchVideos } from "./useFetchVideos";
import { useVideoRemove } from "./useVideoRemove";

export const useVideosData = (solutionId: string) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const { videos: fetchedVideos, loading } = useFetchVideos(solutionId);
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

  return {
    videos,
    loading,
    fetchVideos: () => setVideos(fetchedVideos),
    handleRemoveVideo: handleRemove
  };
};
