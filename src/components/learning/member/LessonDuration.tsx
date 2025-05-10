
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface LessonDurationProps {
  videos: any[];
  showUpdateButton?: boolean;
  isLoading?: boolean;
  onUpdateDurations?: () => void;
}

export const LessonDuration: React.FC<LessonDurationProps> = ({ 
  videos, 
  showUpdateButton = false,
  isLoading = false,
  onUpdateDurations
}) => {
  // Converter segundos para formato "hh:mm:ss" ou "mm:ss"
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return "00:00";
    
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const minStr = mins.toString().padStart(2, '0');
    const secStr = secs.toString().padStart(2, '0');
    
    return hrs > 0 
      ? `${hrs}:${minStr}:${secStr}`
      : `${minStr}:${secStr}`;
  };
  
  // Calcular duração total dos vídeos
  const calculateTotalDuration = (): number => {
    if (!videos || videos.length === 0) return 0;
    
    return videos.reduce((total, video) => {
      // Usar a duração em segundos se disponível, caso contrário valor padrão
      const duration = video.duration_seconds || 0;
      return total + duration;
    }, 0);
  };
  
  const totalDurationInSeconds = calculateTotalDuration();
  const formattedDuration = formatTime(totalDurationInSeconds);
  
  // Verificar se há vídeos sem duração definida
  const hasVideosMissingDuration = videos?.some(video => !video.duration_seconds);
  
  return (
    <div className="text-sm text-muted-foreground flex items-center">
      <span>
        Duração total: {formattedDuration}
        {hasVideosMissingDuration && " (estimado)"}
      </span>
      
      {showUpdateButton && hasVideosMissingDuration && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-2 h-7 text-xs"
          onClick={onUpdateDurations}
          disabled={isLoading}
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? "Atualizando..." : "Atualizar duração"}
        </Button>
      )}
    </div>
  );
};

export default LessonDuration;
