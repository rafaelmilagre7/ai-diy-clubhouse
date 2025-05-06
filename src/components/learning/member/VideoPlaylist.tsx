
import { useState } from "react";
import { LearningLessonVideo } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Play,
  CheckCircle2
} from "lucide-react";
import { formatVideoDuration } from "@/lib/supabase/videoUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface VideoPlaylistProps {
  videos: LearningLessonVideo[];
  currentVideoIndex: number;
  onSelectVideo: (index: number) => void;
  progresses?: Record<string, number>;
}

export const VideoPlaylist: React.FC<VideoPlaylistProps> = ({
  videos,
  currentVideoIndex,
  onSelectVideo,
  progresses = {}
}) => {
  const [showControls, setShowControls] = useState(false);
  
  // Calcular duração total dos vídeos
  const totalDurationSeconds = videos.reduce((total, video) => {
    return total + (video.duration_seconds || 0);
  }, 0);
  
  const formatTotalDuration = () => {
    const hours = Math.floor(totalDurationSeconds / 3600);
    const minutes = Math.floor((totalDurationSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  };
  
  const handlePrevious = () => {
    if (currentVideoIndex > 0) {
      onSelectVideo(currentVideoIndex - 1);
    }
  };
  
  const handleNext = () => {
    if (currentVideoIndex < videos.length - 1) {
      onSelectVideo(currentVideoIndex + 1);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Lista de Vídeos ({videos.length})</h3>
        <span className="text-xs text-muted-foreground">
          Duração total: {formatTotalDuration()}
        </span>
      </div>
      
      <div className="flex gap-2 mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentVideoIndex <= 0}
          className="px-2 h-8"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Anterior</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentVideoIndex >= videos.length - 1}
          className="px-2 h-8"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Próximo</span>
        </Button>
      </div>
      
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-1">
          {videos.map((video, index) => {
            const isActive = index === currentVideoIndex;
            const progress = progresses[video.id] || 0;
            const isCompleted = progress >= 100;
            
            return (
              <div
                key={video.id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-muted/50"
                )}
                onClick={() => onSelectVideo(index)}
              >
                <div className="relative shrink-0 h-12 w-20 rounded overflow-hidden bg-muted">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={`Miniatura de ${video.title}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-muted text-muted-foreground">
                      <Play className="h-4 w-4" />
                    </div>
                  )}
                  
                  {video.duration_seconds && (
                    <span className="absolute bottom-0 right-0 text-[10px] bg-black/70 text-white px-1">
                      {formatVideoDuration(video.duration_seconds)}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    {isCompleted && (
                      <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                    )}
                    <p className={cn(
                      "text-xs font-medium truncate",
                      isCompleted && "text-primary"
                    )}>
                      {index + 1}. {video.title}
                    </p>
                  </div>
                  
                  {video.description && (
                    <p className="text-[10px] text-muted-foreground line-clamp-1">
                      {video.description}
                    </p>
                  )}
                  
                  {progress > 0 && progress < 100 && (
                    <div className="w-full h-1 bg-muted mt-1 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
