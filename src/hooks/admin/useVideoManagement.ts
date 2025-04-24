
import { useState, useEffect } from "react";
import { VideoItem } from "@/types/videoTypes";
import { useYouTubeVideo } from "./videos/useYouTubeVideo";
import { useFileUpload } from "./videos/useFileUpload";
import { useVideosData } from "./videos/useVideosData";

export const useVideoManagement = (solutionId: string) => {
  const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  
  const { handleAddYouTube } = useYouTubeVideo(solutionId);
  const { uploading, uploadProgress, handleFileUpload } = useFileUpload(solutionId);
  const { videos: fetchedVideos, loading, fetchVideos, handleRemoveVideo } = useVideosData(solutionId);
  
  // Sincronize os vídeos do useVideosData com o estado local
  useEffect(() => {
    setVideos(fetchedVideos);
  }, [fetchedVideos]);

  // Garantir que os vídeos são carregados quando o solutionId mudar
  useEffect(() => {
    if (solutionId) {
      fetchVideos();
    }
  }, [solutionId, fetchVideos]);

  const handleYouTubeAdd = async (data: { name: string; url: string; description: string; }) => {
    const video = await handleAddYouTube(data);
    if (video) {
      setYoutubeDialogOpen(false);
      await fetchVideos(); // Recarregar videos após adicionar
      // Adicionar o novo vídeo ao estado local imediatamente
      setVideos(prev => [video, ...prev]);
    }
  };

  const handleFileVideoUpload = async (file: File) => {
    console.log("Iniciando upload de vídeo em useVideoManagement");
    const video = await handleFileUpload(file);
    if (video) {
      console.log("Upload bem-sucedido, atualizando lista de vídeos");
      await fetchVideos(); // Recarregar videos após upload
      // Adicionar o novo vídeo ao estado local imediatamente
      setVideos(prev => [video, ...prev]);
    }
  };

  return {
    videos,
    loading,
    uploading,
    uploadProgress,
    youtubeDialogOpen,
    setYoutubeDialogOpen,
    fetchVideos,
    handleAddYouTube: handleYouTubeAdd,
    handleFileUpload: handleFileVideoUpload,
    handleRemoveVideo
  };
};
