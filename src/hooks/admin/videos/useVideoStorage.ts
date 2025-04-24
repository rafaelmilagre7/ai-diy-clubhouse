
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface UploadResult {
  url: string;
  fileName: string;
  filePath: string;
}

export const useVideoStorage = () => {
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadVideo = async (file: File, solutionId: string): Promise<UploadResult | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}-${Date.now()}.${fileExt}`;
      const filePath = `videos/${solutionId}/${fileName}`;

      console.log("[useVideoStorage] Iniciando upload:", {
        fileName: file.name,
        filePath,
        size: file.size
      });

      setUploadProgress(10);

      const { error: uploadError } = await supabase.storage
        .from("solution_files")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      setUploadProgress(75);

      const { data: urlData } = supabase.storage
        .from("solution_files")
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error("Não foi possível obter a URL do vídeo");
      }

      setUploadProgress(100);

      return {
        url: urlData.publicUrl,
        fileName: file.name,
        filePath
      };
    } catch (error) {
      console.error("[useVideoStorage] Erro no upload:", error);
      throw error;
    }
  };

  return {
    uploadVideo,
    uploadProgress
  };
};
