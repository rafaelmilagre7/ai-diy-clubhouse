
import React from "react";
import { LearningLessonVideo } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { getYoutubeVideoId, formatVideoDuration } from "@/lib/supabase/videoUtils";

interface VideoDisplayProps {
  video: LearningLessonVideo;
  onRemove?: () => void;
  onEdit?: () => void;
  className?: string;
  index?: number;
  readOnly?: boolean;
}

const VideoDisplay: React.FC<VideoDisplayProps> = ({
  video,
  onRemove,
  onEdit,
  className,
  index = 0,
  readOnly = false,
}) => {
  // Extrair ID do YouTube, se for um vídeo do YouTube
  const youtubeId = video.video_type === "youtube" || (!video.video_type && video.url?.includes("youtu"))
    ? getYoutubeVideoId(video.url)
    : null;
  
  const thumbnailUrl = video.thumbnail_url || (youtubeId 
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    : null);
    
  return (
    <div 
      className={cn(
        "rounded-md border overflow-hidden bg-card", 
        className
      )}
      onClick={onEdit}
    >
      <div className="relative aspect-video bg-muted">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={video.title || "Miniatura do vídeo"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
            <span>Nenhuma miniatura disponível</span>
          </div>
        )}
        
        {/* Badge com número do vídeo */}
        <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium">
          {index + 1}
        </div>
        
        {/* Duração do vídeo */}
        {video.duration_seconds && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-0.5 rounded text-xs">
            {formatVideoDuration(video.duration_seconds)}
          </div>
        )}
        
        {/* Botão de remover (apenas se não for somente leitura) */}
        {!readOnly && onRemove && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-sm truncate">
          {video.title || "Vídeo sem título"}
        </h3>
        {video.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {video.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>{video.video_type === "file" ? "Arquivo" : "YouTube"}</span>
          {video.file_size_bytes && (
            <span>{Math.round(video.file_size_bytes / (1024 * 1024))} MB</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoDisplay;
