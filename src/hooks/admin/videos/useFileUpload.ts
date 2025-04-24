
import { useState, useRef } from "react";
import { VideoItem } from "@/types/videoTypes";
import { toast } from "sonner";
import { useVideoStorage } from "./useVideoStorage";
import { useVideoDatabase } from "./useVideoDatabase";

export const useFileUpload = (solutionId: string) => {
  const [uploading, setUploading] = useState(false);
  const [lastUploadedVideo, setLastUploadedVideo] = useState<VideoItem | null>(null);
  const uploadInProgressRef = useRef(false);
  
  const { uploadVideo, uploadProgress } = useVideoStorage();
  const { saveVideo } = useVideoDatabase();

  const validateFile = (file: File): boolean => {
    if (!solutionId) {
      toast("Erro", {
        description: "É necessário salvar a solução antes de adicionar vídeos."
      });
      return false;
    }

    if (uploadInProgressRef.current) {
      toast("Upload em andamento", {
        description: "Aguarde o término do upload atual."
      });
      return false;
    }

    if (!file.type.startsWith("video/")) {
      toast("Tipo de arquivo inválido", {
        description: "Por favor, selecione apenas arquivos de vídeo."
      });
      return false;
    }

    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      toast("Arquivo muito grande", {
        description: "O tamanho máximo permitido é 500MB."
      });
      return false;
    }

    return true;
  };

  const handleFileUpload = async (file: File): Promise<VideoItem | null> => {
    if (!validateFile(file)) return null;

    try {
      uploadInProgressRef.current = true;
      setUploading(true);

      toast("Iniciando upload", {
        description: "Preparando para enviar o vídeo..."
      });

      const fileExt = file.name.split(".").pop() || "";
      const uploadResult = await uploadVideo(file, solutionId);

      if (!uploadResult) {
        throw new Error("Falha no upload do vídeo");
      }

      const video = await saveVideo({
        solutionId,
        name: file.name,
        url: uploadResult.url,
        fileExt,
        fileSize: file.size
      });

      setLastUploadedVideo(video);
      
      toast("Upload concluído", {
        description: "O vídeo foi adicionado com sucesso."
      });

      return video;
    } catch (error: any) {
      console.error("[useFileUpload] Erro no upload:", error);
      toast("Erro no upload", {
        description: error.message || "Ocorreu um erro ao tentar fazer o upload do vídeo."
      });
      return null;
    } finally {
      uploadInProgressRef.current = false;
      setUploading(false);
    }
  };

  return {
    uploading,
    uploadProgress,
    lastUploadedVideo,
    handleFileUpload
  };
};
