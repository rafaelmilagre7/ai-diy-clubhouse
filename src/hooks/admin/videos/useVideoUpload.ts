
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface VideoUploadResult {
  url: string;
  fileName: string;
}

export const useVideoUpload = (solutionId: string) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleVideoUpload = async (file: File): Promise<VideoUploadResult | null> => {
    if (!solutionId) {
      toast("Erro", {
        description: "ID da solução não fornecido"
      });
      return null;
    }

    if (!file.type.startsWith("video/")) {
      toast("Tipo de arquivo inválido", {
        description: "Por favor, selecione apenas arquivos de vídeo"
      });
      return null;
    }

    // Limite de 500MB
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      toast("Arquivo muito grande", {
        description: "O tamanho máximo permitido é 500MB"
      });
      return null;
    }

    try {
      setUploading(true);
      setProgress(0);

      // Criar o caminho do arquivo no formato: videos/solution_id/timestamp-filename
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `videos/${solutionId}/${fileName}`;

      // Mostrar toast de início do upload
      toast("Upload iniciado", {
        description: "Enviando vídeo..."
      });

      // Upload do arquivo
      const { data, error } = await supabase.storage
        .from("solution_files")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true
        });

      if (error) throw error;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from("solution_files")
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error("Erro ao obter URL do vídeo");
      }

      setProgress(100);

      toast("Upload concluído", {
        description: "O vídeo foi enviado com sucesso"
      });

      return {
        url: urlData.publicUrl,
        fileName: file.name
      };

    } catch (error: any) {
      console.error("Erro no upload:", error);
      toast("Erro no upload", {
        description: error.message || "Ocorreu um erro ao fazer upload do vídeo"
      });
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return {
    uploading,
    progress,
    handleVideoUpload
  };
};
