
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { VideoItem } from "@/types/videoTypes";

export const useFileUpload = (solutionId: string) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (file: File) => {
    if (!solutionId) {
      toast("Erro", {
        description: "É necessário salvar a solução antes de adicionar vídeos."
      });
      return null;
    }

    if (!file.type.startsWith("video/")) {
      toast("Tipo de arquivo inválido", {
        description: "Por favor, selecione apenas arquivos de vídeo."
      });
      return null;
    }

    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast("Arquivo muito grande", {
        description: "O tamanho máximo permitido é 100MB."
      });
      return null;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `solution_videos/${solutionId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("materials")
        .getPublicUrl(filePath);

      if (!urlData) throw new Error("Não foi possível obter a URL do vídeo");

      const newVideo = {
        solution_id: solutionId,
        name: file.name,
        type: "video",
        url: urlData.publicUrl,
        metadata: {
          source: "upload",
          format: fileExt,
          size: file.size,
          description: `Vídeo: ${file.name}`
        }
      };

      const { data, error } = await supabase
        .from("solution_resources")
        .insert(newVideo)
        .select();

      if (error) throw error;

      toast("Upload concluído", {
        description: "O vídeo foi adicionado com sucesso."
      });

      return data[0] as VideoItem;
    } catch (error) {
      console.error("Erro no upload:", error);
      toast("Erro no upload", {
        description: "Ocorreu um erro ao tentar fazer o upload do vídeo."
      });
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    uploading,
    uploadProgress,
    handleFileUpload,
    setUploadProgress
  };
};
