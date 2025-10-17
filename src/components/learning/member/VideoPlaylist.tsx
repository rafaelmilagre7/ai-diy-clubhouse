
import { CheckCircle, PlayCircle } from "lucide-react";
import { LearningLessonVideo } from "@/lib/supabase/types";
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
  // Garantir que videos seja sempre um array
  const safeVideos = Array.isArray(videos) ? videos : [];

  // Função para verificar se um vídeo está completo (>=95% assistido)
  const isVideoCompleted = (videoId: string): boolean => {
    return (progresses[videoId] || 0) >= 95;
  };
  
  return (
    <div className="bg-card border rounded-md overflow-hidden">
      <div className="max-h-[400px] overflow-y-auto">
        {safeVideos.map((video, index) => (
          <div
            key={video.id}
            className={cn(
              "flex items-start gap-3 p-3 cursor-pointer hover:bg-accent/20 transition-colors border-b last:border-0",
              index === currentVideoIndex && "bg-accent/30"
            )}
            onClick={() => onSelectVideo(index)}
          >
            <div className="flex-shrink-0 mt-1">
              {isVideoCompleted(video.id) ? (
                <CheckCircle className="h-5 w-5 text-system-healthy" />
              ) : index === currentVideoIndex ? (
                <PlayCircle className="h-5 w-5 text-operational" />
              ) : (
                <PlayCircle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-grow">
              <p className={cn(
                "font-medium text-sm", 
                index === currentVideoIndex && "text-operational",
                isVideoCompleted(video.id) && "text-system-healthy"
              )}>
                {video.title}
              </p>
              {video.duration_seconds && (
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.floor(video.duration_seconds / 60)}min{' '}
                  {Math.floor(video.duration_seconds % 60)}s
                </p>
              )}
              
              {/* Barra de progresso para vídeos em andamento */}
              {progresses[video.id] && progresses[video.id] > 0 && progresses[video.id] < 95 && (
                <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-operational rounded-full" 
                    style={{ width: `${progresses[video.id]}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
