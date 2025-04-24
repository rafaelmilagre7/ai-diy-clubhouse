
import { supabase } from "@/lib/supabase";
import { VideoItem } from "@/types/videoTypes";

interface SaveVideoParams {
  solutionId: string;
  name: string;
  url: string;
  fileExt: string;
  fileSize: number;
  source?: "upload" | "youtube";
}

export const useVideoDatabase = () => {
  const saveVideo = async (params: SaveVideoParams): Promise<VideoItem> => {
    const videoData = {
      solution_id: params.solutionId,
      name: params.name,
      type: "video",
      url: params.url,
      format: params.fileExt,
      metadata: {
        source: params.source || "upload",
        format: params.fileExt,
        size: params.fileSize,
        description: `Vídeo: ${params.name}`,
        uploaded_at: new Date().toISOString()
      }
    };

    const { data, error } = await supabase
      .from("solution_resources")
      .insert(videoData)
      .select("*")
      .single();

    if (error) {
      console.error("[useVideoDatabase] Erro ao salvar vídeo:", error);
      throw error;
    }

    return data as VideoItem;
  };

  return { saveVideo };
};
