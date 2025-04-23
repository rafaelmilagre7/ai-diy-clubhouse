
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { VideoItem } from "@/types/videoTypes";

export const useYouTubeVideo = (solutionId: string) => {
  const handleAddYouTube = async (youtubeData: {
    name: string;
    url: string;
    description: string;
  }) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = youtubeData.url.match(regExp);
      const youtubeId = match && match[2].length === 11 ? match[2] : null;

      if (!youtubeId) {
        toast("URL inválida", {
          description: "Por favor, insira uma URL válida do YouTube."
        });
        return;
      }

      const embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
      const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;

      const newVideo = {
        solution_id: solutionId,
        name: youtubeData.name,
        type: "video",
        url: embedUrl,
        metadata: {
          source: "youtube",
          youtube_id: youtubeId,
          thumbnail_url: thumbnailUrl,
          description: youtubeData.description
        }
      };

      const { data, error } = await supabase
        .from("solution_resources")
        .insert(newVideo)
        .select();

      if (error) throw error;

      toast("Vídeo adicionado", {
        description: "O vídeo do YouTube foi adicionado com sucesso."
      });

      return data[0] as VideoItem;
    } catch (error) {
      console.error("Erro ao adicionar vídeo:", error);
      toast("Erro ao adicionar vídeo", {
        description: "Ocorreu um erro ao tentar adicionar o vídeo."
      });
      return null;
    }
  };

  return { handleAddYouTube };
};
