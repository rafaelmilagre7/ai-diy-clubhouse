
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { VideoDeleteResponse } from "@/types/videoTypes";

export const useVideoRemove = () => {
  const handleRemoveVideo = async (id: string, url: string): Promise<VideoDeleteResponse> => {
    try {
      console.log("Iniciando remoção de vídeo:", id, url);
      
      const { error } = await supabase
        .from("solution_resources")
        .delete()
        .eq("id", id);

      if (error) throw error;

      console.log("Registro removido do banco de dados. Tentando remover arquivo...");

      // Se for um vídeo de upload, tenta remover do storage
      if (!url.includes("youtube.com") && url.includes("resources")) {
        try {
          // Extrair caminho do arquivo da URL
          const pathRegex = /resources\/([^?]+)/;
          const match = url.match(pathRegex);
          
          if (match && match[1]) {
            const filePath = match[1];
            console.log("Removendo arquivo do storage, caminho:", filePath);
            
            await supabase.storage
              .from("resources")
              .remove([filePath]);
              
            console.log("Arquivo removido com sucesso do storage");
          }
        } catch (storageError) {
          console.error("Erro ao remover arquivo do storage:", storageError);
          // Não interrompemos a execução, pois o registro já foi removido do banco
        }
      }

      toast.success("O vídeo foi removido com sucesso.");
      return { success: true, error: null };
    } catch (error) {
      console.error("Erro ao remover vídeo:", error);
      toast.error("Ocorreu um erro ao tentar remover o vídeo.");
      return { success: false, error: error as Error };
    }
  };

  return { handleRemoveVideo };
};
