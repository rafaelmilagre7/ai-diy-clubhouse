
import React, { useEffect, useState } from "react";
import { LearningLessonVideo } from "@/lib/supabase";
import { formatSeconds } from "@/utils/timeUtils";
import { Clock, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LessonDurationProps {
  videos: LearningLessonVideo[];
  showUpdateButton?: boolean;
}

export const LessonDuration: React.FC<LessonDurationProps> = ({ videos, showUpdateButton = true }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [totalDuration, setTotalDuration] = useState<string | null>(null);
  const [hasMissingDurations, setHasMissingDurations] = useState(false);
  
  useEffect(() => {
    // Calcula a duração total dos vídeos e identifica se há vídeos sem duração
    const calculateTotalDuration = () => {
      if (!videos || videos.length === 0) return null;
      
      let totalSeconds = 0;
      let hasValidDurations = false;
      let hasInvalidDurations = false;
      
      videos.forEach(video => {
        if (video.duration_seconds && video.duration_seconds > 0) {
          totalSeconds += video.duration_seconds;
          hasValidDurations = true;
        } else {
          hasInvalidDurations = true;
        }
      });
      
      setHasMissingDurations(hasInvalidDurations);
      
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
      
      // Extrair o ID da aula do primeiro vídeo para atualizar apenas os vídeos desta aula
      const lessonId = videos[0]?.lesson_id;
      
      // Chamar edge function para atualizar durações
      const { data: response, error } = await supabase.functions.invoke(
        'update-video-durations',
        { body: JSON.stringify({ lessonId }) }
      );
      
      if (error) {
        console.error("Erro ao atualizar durações:", error);
        toast.error("Ocorreu um erro ao atualizar as durações dos vídeos");
        return;
      }
      
      if (response && response.success > 0) {
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
        {showUpdateButton && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-1 h-6 w-6"
                  onClick={updateVideosDuration}
                  disabled={isUpdating}
                >
                  <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
                  <span className="sr-only">Atualizar duração</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Atualizar informações de duração</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }
  
  return (
    <div className="flex items-center text-sm text-muted-foreground">
      <Clock className="h-4 w-4 mr-1" />
      <span>Duração total: {totalDuration}</span>
      {showUpdateButton && hasMissingDurations && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-1 h-6 w-6"
                onClick={updateVideosDuration}
                disabled={isUpdating}
              >
                <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
                <span className="sr-only">Atualizar duração</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Atualizar informações de duração</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default LessonDuration;
