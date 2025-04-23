
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { VideoDeleteResponse } from "@/types/videoTypes";

export const useVideoRemove = () => {
  const handleRemoveVideo = async (id: string, url: string): Promise<VideoDeleteResponse> => {
    try {
      const { error } = await supabase
        .from("solution_resources")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("O vídeo foi removido com sucesso.");

      // Se for um vídeo de upload, tenta remover do storage
      if (url.includes("materials") && !url.includes("youtube.com")) {
        try {
          const filePath = url.split("/materials/")[1];
          if (filePath) {
            await supabase.storage
              .from("materials")
              .remove([filePath]);
          }
        } catch (storageError) {
          console.error("Erro ao remover arquivo do storage:", storageError);
        }
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Erro ao remover vídeo:", error);
      toast.error("Ocorreu um erro ao tentar remover o vídeo.");
      return { success: false, error: error as Error };
    }
  };

  return { handleRemoveVideo };
};
