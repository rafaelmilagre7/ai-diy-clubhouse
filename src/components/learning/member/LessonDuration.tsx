
import React, { useEffect, useState } from "react";
import { LearningLessonVideo } from "@/lib/supabase";
import { formatSeconds } from "@/utils/timeUtils";
import { Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface LessonDurationProps {
  videos: LearningLessonVideo[];
}

export const LessonDuration: React.FC<LessonDurationProps> = ({ videos }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [totalDuration, setTotalDuration] = useState<string | null>(null);
  
  useEffect(() => {
    // Calcula a duração total dos vídeos
    const calculateTotalDuration = () => {
      if (!videos || videos.length === 0) return null;
      
      let totalSeconds = 0;
      let hasValidDurations = false;
      let hasInvalidDurations = false;
      
      videos.forEach(video => {
        if (video.duration_seconds) {
          totalSeconds += video.duration_seconds;
          hasValidDurations = true;
        } else {
          hasInvalidDurations = true;
        }
      });
      
      // Se não tiver durações válidas, retorna null
      if (!hasValidDurations) return null;
      
      // Se tiver durações inválidas mas pelo menos uma válida, marca como incompleto
      const formattedDuration = formatSeconds(totalSeconds);
      if (hasInvalidDurations) {
        return `${formattedDuration}+`;
      }
      
      return formattedDuration;
    };
    
    setTotalDuration(calculateTotalDuration());
  }, [videos]);
  
  // Função para atualizar as durações dos vídeos do Panda
  const updateVideosDuration = async () => {
    try {
      // Verifica se há vídeos do Panda sem duração
      const pandaVideosWithoutDuration = videos.filter(
        v => v.video_type === 'panda' && (!v.duration_seconds || v.duration_seconds === 0)
      );
      
      if (pandaVideosWithoutDuration.length === 0) {
        toast.info("Todos os vídeos já possuem informações de duração");
        return;
      }
      
      setIsUpdating(true);
      toast.loading("Atualizando informações de duração dos vídeos...");
      
      // Chamar edge function para atualizar durações
      const { data: response } = await supabase.functions.invoke('update-video-durations');
      
      if (response.success > 0) {
        toast.success(`Duração atualizada para ${response.success} vídeos`);
        
        // Recarregar a página para mostrar os novos dados
        window.location.reload();
      } else {
        toast.error("Não foi possível atualizar as durações dos vídeos");
      }
    } catch (error) {
      console.error("Erro ao atualizar durações:", error);
      toast.error("Ocorreu um erro ao atualizar as durações dos vídeos");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!totalDuration) {
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <Clock className="h-4 w-4 mr-1" />
        <span>Duração não disponível</span>
        <button 
          className="ml-2 text-xs text-primary hover:underline"
          onClick={updateVideosDuration}
          disabled={isUpdating}
        >
          {isUpdating ? "Atualizando..." : "Atualizar"}
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex items-center text-sm text-muted-foreground">
      <Clock className="h-4 w-4 mr-1" />
      <span>Duração total: {totalDuration}</span>
    </div>
  );
};

export default LessonDuration;
