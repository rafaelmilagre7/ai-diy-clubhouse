
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useVideoUpload } from "./useVideoUpload";
import { toast } from "sonner";

export const useAddVideo = (solutionId: string) => {
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const { handleVideoUpload, uploading, progress } = useVideoUpload(solutionId);

  const addVideo = async (file: File) => {
    try {
      setIsAddingVideo(true);

      // Fazer upload do vídeo
      const uploadResult = await handleVideoUpload(file);
      
      if (!uploadResult) return;

      // Registrar o vídeo no banco de dados
      const { error } = await supabase
        .from("solution_resources")
        .insert({
          solution_id: solutionId,
          name: uploadResult.fileName,
          type: "video",
          url: uploadResult.url,
          metadata: {
            source: "upload",
            format: file.name.split(".").pop(),
            size: file.size,
            uploaded_at: new Date().toISOString()
          }
        });

      if (error) throw error;

      toast("Vídeo adicionado", {
        description: "O vídeo foi adicionado com sucesso à solução"
      });

    } catch (error: any) {
      console.error("Erro ao adicionar vídeo:", error);
      toast("Erro", {
        description: "Não foi possível adicionar o vídeo à solução"
      });
    } finally {
      setIsAddingVideo(false);
    }
  };

  return {
    addVideo,
    isAddingVideo,
    uploadProgress: progress,
    isUploading: uploading
  };
};
