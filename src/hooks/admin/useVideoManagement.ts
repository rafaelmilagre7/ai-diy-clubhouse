
import { useState, useCallback } from "react";
import { VideoItem } from "@/types/videoTypes";
import { useYouTubeVideo } from "./videos/useYouTubeVideo";
import { useFileUpload } from "./videos/useFileUpload";
import { useVideosData } from "./videos/useVideosData";
import { toast } from "sonner";

export const useVideoManagement = (solutionId: string) => {
  const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false);
  
  const { handleAddYouTube } = useYouTubeVideo(solutionId);
  const { uploading, uploadProgress, handleFileUpload } = useFileUpload(solutionId);
  const { videos, loading, fetchVideos, handleRemoveVideo } = useVideosData(solutionId);
  
  // Função para atualizar explicitamente os vídeos
  const refreshVideos = useCallback(async () => {
    console.log("[useVideoManagement] Atualizando lista de vídeos explicitamente");
    await fetchVideos();
  }, [fetchVideos]);

  // Garantir que os vídeos são carregados quando o solutionId mudar
  const handleYouTubeAdd = async (data: { name: string; url: string; description: string; }) => {
    try {
      const video = await handleAddYouTube(data);
      if (video) {
        console.log("[useVideoManagement] Vídeo do YouTube adicionado com sucesso:", video);
        setYoutubeDialogOpen(false);
        
        // Atualiza a lista completa do servidor após adicionar
        await refreshVideos();
        
        toast("Vídeo adicionado", {
          description: "O vídeo do YouTube foi adicionado com sucesso."
        });
      }
    } catch (error) {
      console.error("[useVideoManagement] Erro ao adicionar vídeo do YouTube:", error);
      toast("Erro", {
        description: "Não foi possível adicionar o vídeo do YouTube."
      });
    }
  };

  const handleFileVideoUpload = async (file: File) => {
    try {
      console.log("[useVideoManagement] Iniciando upload de vídeo:", file.name);
      const video = await handleFileUpload(file);
      
      if (video) {
        console.log("[useVideoManagement] Upload bem-sucedido:", video);
        
        // Recarrega a lista completa do servidor para garantir sincronização
        await refreshVideos();
        
        toast("Upload concluído", {
          description: "O vídeo foi adicionado com sucesso."
        });
        
        return true;
      } else {
        throw new Error("Falha no upload - não retornou dados do vídeo");
      }
    } catch (error) {
      console.error("[useVideoManagement] Erro no upload de vídeo:", error);
      toast("Erro no upload", {
        description: "Ocorreu um problema ao fazer upload do vídeo. Tente novamente."
      });
      return false;
    }
  };

  return {
    videos,
    loading,
    uploading,
    uploadProgress,
    youtubeDialogOpen,
    setYoutubeDialogOpen,
    fetchVideos: refreshVideos,
    handleAddYouTube: handleYouTubeAdd,
    handleFileUpload: handleFileVideoUpload,
    handleRemoveVideo
  };
};
