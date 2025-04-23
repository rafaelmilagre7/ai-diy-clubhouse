
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { VideoItem } from "@/types/videoTypes";

export const useVideosData = (solutionId: string) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    if (!solutionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("solution_resources")
        .select("*")
        .eq("solution_id", solutionId)
        .eq("type", "video")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Erro ao carregar vídeos:", error);
      toast({
        title: "Erro ao carregar vídeos",
        description: "Não foi possível carregar os vídeos desta solução.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVideo = async (id: string, url: string) => {
    try {
      const { error } = await supabase
        .from("solution_resources")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setVideos(prev => prev.filter(v => v.id !== id));

      toast({
        title: "Vídeo removido",
        description: "O vídeo foi removido com sucesso."
      });

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
    } catch (error) {
      console.error("Erro ao remover vídeo:", error);
      toast({
        title: "Erro ao remover vídeo",
        description: "Ocorreu um erro ao tentar remover o vídeo.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [solutionId]);

  return {
    videos,
    loading,
    fetchVideos,
    handleRemoveVideo
  };
};
