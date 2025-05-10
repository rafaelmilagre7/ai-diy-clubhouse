
import React, { useEffect, useState } from "react";
import { LearningLessonVideo } from "@/lib/supabase";
import { formatSeconds } from "@/utils/timeUtils";
import { Clock } from "lucide-react";

interface LessonDurationProps {
  videos: LearningLessonVideo[];
  showUpdateButton?: boolean;
  showIcon?: boolean;
  showPrefix?: boolean;
  className?: string;
}

export const LessonDuration: React.FC<LessonDurationProps> = ({ 
  videos, 
  showUpdateButton = false, // Mantido apenas por compatibilidade
  showIcon = true,
  showPrefix = true,
  className = ""
}) => {
  const [totalDuration, setTotalDuration] = useState<string | null>(null);
  
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

  if (!totalDuration) {
    // Se não houver duração disponível, exibir um valor padrão de "5 min"
    return (
      <div className={`flex items-center text-sm text-muted-foreground ${className}`}>
        {showIcon && <Clock className="h-4 w-4 mr-1" />}
        <span>{showPrefix ? "Duração: " : ""}5 min</span>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center text-sm text-muted-foreground ${className}`}>
      {showIcon && <Clock className="h-4 w-4 mr-1" />}
      <span>{showPrefix ? "Duração total: " : ""}{totalDuration}</span>
    </div>
  );
};

export default LessonDuration;
