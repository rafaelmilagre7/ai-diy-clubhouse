
import React, { useEffect, useState } from "react";
import { LearningLessonVideo } from "@/lib/supabase";
import { formatSeconds } from "@/utils/timeUtils";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface LessonDurationProps {
  videos: LearningLessonVideo[];
  showUpdateButton?: boolean;
  showIcon?: boolean;
  showPrefix?: boolean;
  className?: string;
}

export const LessonDuration: React.FC<LessonDurationProps> = ({ 
  videos, 
  showUpdateButton = false,
  showIcon = true,
  showPrefix = true,
  className = ""
}) => {
  const [totalDuration, setTotalDuration] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    // Calcula a duração total dos vídeos
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

  // Função para atualizar manualmente a duração dos vídeos
  const handleUpdateDurations = async () => {
    if (!videos || videos.length === 0 || isUpdating) return;

    try {
      setIsUpdating(true);
      const lessonId = videos[0]?.lesson_id;
      
      if (!lessonId) {
        toast.error("Não foi possível identificar a aula para atualização");
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('update-video-durations', {
        body: { lessonId }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.success > 0) {
        toast.success(`Duração de ${data.success} vídeo(s) atualizada com sucesso!`);
        // Recarregar a página para mostrar as novas durações
        window.location.reload();
      } else {
        toast.info("Nenhuma duração de vídeo precisou ser atualizada.");
      }
    } catch (error: any) {
      console.error("Erro ao atualizar durações:", error);
      toast.error("Falha ao atualizar as durações dos vídeos");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!totalDuration) {
    // Exibir um valor mais realista quando a duração não estiver disponível
    // Se tiver vídeos, mas sem duração, usar 3-10 min dependendo do número de vídeos
    let estimativa = "carregando...";
    
    if (videos && videos.length > 0) {
      // Estimar de 3 a 10 minutos dependendo do número de vídeos
      const minutos = Math.min(10, Math.max(3, videos.length * 2));
      estimativa = `${minutos} min (estimativa)`;
    }
    
    return (
      <div className={`flex items-center text-sm text-muted-foreground ${className}`}>
        {showIcon && <Clock className="h-4 w-4 mr-1" />}
        <span>
          {showPrefix ? "Duração: " : ""}{estimativa}
        </span>
        
        {showUpdateButton && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-2 h-7 px-2"
            onClick={handleUpdateDurations}
            disabled={isUpdating}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
            <span className="ml-1 text-xs">{isUpdating ? 'Atualizando...' : 'Atualizar'}</span>
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className={`flex items-center text-sm text-muted-foreground ${className}`}>
      {showIcon && <Clock className="h-4 w-4 mr-1" />}
      <span>{showPrefix ? "Duração total: " : ""}{totalDuration}</span>
      
      {showUpdateButton && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-2 h-7 px-2"
          onClick={handleUpdateDurations}
          disabled={isUpdating}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
          <span className="ml-1 text-xs">{isUpdating ? 'Atualizando...' : 'Atualizar'}</span>
        </Button>
      )}
    </div>
  );
};

export default LessonDuration;
