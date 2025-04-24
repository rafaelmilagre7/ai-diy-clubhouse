
import { useState, useCallback, useEffect } from "react";
import { VideoItem } from "@/types/videoTypes";
import { useYouTubeVideo } from "./videos/useYouTubeVideo";
import { useFileUpload } from "./videos/useFileUpload";
import { useVideosData } from "./videos/useVideosData";
import { toast } from "sonner";

export const useVideoManagement = (solutionId: string) => {
  const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false);
  
  const { handleAddYouTube } = useYouTubeVideo(solutionId);
  const { uploading, uploadProgress, handleFileUpload, lastUploadedVideo } = useFileUpload(solutionId);
  const { videos, loading, fetchVideos, handleRemoveVideo } = useVideosData(solutionId);
  
  // Ouvir o evento personalizado para abrir o diálogo do YouTube
  useEffect(() => {
    const handleOpenYouTubeDialog = () => {
      setYoutubeDialogOpen(true);
    };

    document.addEventListener('openYouTubeDialog', handleOpenYouTubeDialog);
    
    return () => {
      document.removeEventListener('openYouTubeDialog', handleOpenYouTubeDialog);
    };
  }, []);
  
  // Função para atualizar explicitamente os vídeos
  const refreshVideos = useCallback(async () => {
    console.log("[useVideoManagement] Atualizando lista de vídeos explicitamente");
    try {
      await fetchVideos();
      console.log("[useVideoManagement] Lista atualizada com sucesso");
    } catch (error) {
      console.error("[useVideoManagement] Erro ao atualizar lista:", error);
      toast("Erro ao atualizar", {
        description: "Não foi possível atualizar a lista de vídeos."
      });
    }
  }, [fetchVideos]);

  const handleYouTubeAdd = async (data: { name: string; url: string; description: string; }) => {
    try {
      const video = await handleAddYouTube(data);
      if (video) {
        console.log("[useVideoManagement] Vídeo do YouTube adicionado com sucesso:", video);
        setYoutubeDialogOpen(false);
        
        // Atualiza a lista completa do servidor após adicionar
        console.log("[useVideoManagement] Atualizando lista após adicionar vídeo do YouTube");
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
        
        // Atraso para garantir que o banco de dados processe completamente a inserção
        setTimeout(async () => {
          console.log("[useVideoManagement] Atualizando lista após upload de arquivo");
          await refreshVideos();
          console.log("[useVideoManagement] Lista atualizada após upload");
        }, 2000);
        
        toast("Upload concluído", {
          description: "O vídeo foi adicionado com sucesso. Atualizando lista..."
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
