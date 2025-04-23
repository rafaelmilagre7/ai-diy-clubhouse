
import { useState } from "react";
import { VideoItem } from "@/types/videoTypes";
import { useYouTubeVideo } from "./videos/useYouTubeVideo";
import { useFileUpload } from "./videos/useFileUpload";
import { useVideosData } from "./videos/useVideosData";

export const useVideoManagement = (solutionId: string) => {
  const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false);
  
  const { handleAddYouTube } = useYouTubeVideo(solutionId);
  const { uploading, uploadProgress, handleFileUpload } = useFileUpload(solutionId);
  const { videos, loading, fetchVideos, handleRemoveVideo } = useVideosData(solutionId);

  const handleYouTubeAdd = async (data: { name: string; url: string; description: string; }) => {
    const video = await handleAddYouTube(data);
    if (video) {
      setYoutubeDialogOpen(false);
      await fetchVideos(); // Recarregar videos após adicionar
    }
  };

  const handleFileVideoUpload = async (file: File) => {
    const video = await handleFileUpload(file);
    if (video) {
      await fetchVideos(); // Recarregar videos após upload
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
