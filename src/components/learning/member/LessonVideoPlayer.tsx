
import React, { useState } from "react";
import { VideoPlayer } from "@/components/formacao/aulas/VideoPlayer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { LearningLessonVideo } from "@/lib/supabase";

interface LessonVideoPlayerProps {
  videos: LearningLessonVideo[];
  onProgress?: (videoId: string, progress: number) => void;
}

export const LessonVideoPlayer: React.FC<LessonVideoPlayerProps> = ({
  videos,
  onProgress
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [playlistCollapsed, setPlaylistCollapsed] = useState(false);
  
  if (!videos || videos.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Nenhum vídeo disponível para esta aula</p>
        </CardContent>
      </Card>
    );
  }

  const currentVideo = videos[currentVideoIndex];
  const hasMultipleVideos = videos.length > 1;

  const handleVideoSelect = (index: number) => {
    setCurrentVideoIndex(index);
  };

  const handleVideoProgress = (currentTime: number, duration: number) => {
    if (onProgress && currentVideo) {
      const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
      onProgress(currentVideo.id, progress);
    }
  };

  // Layout para vídeo único - usa toda a largura
  if (!hasMultipleVideos) {
    return (
      <div className="w-full">
        <VideoPlayer
          video={currentVideo}
          onTimeUpdate={handleVideoProgress}
        />
        {currentVideo.title && (
          <div className="mt-3 px-1">
            <h3 className="text-lg font-medium text-textPrimary">{currentVideo.title}</h3>
            {currentVideo.description && (
              <p className="text-sm text-textSecondary mt-1">{currentVideo.description}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Layout para múltiplos vídeos - player principal + playlist
  return (
    <div className="w-full">
      {/* Layout responsivo para múltiplos vídeos */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Player principal */}
        <div className="lg:col-span-3">
          <VideoPlayer
            video={currentVideo}
            onTimeUpdate={handleVideoProgress}
          />
          {currentVideo.title && (
            <div className="mt-3 px-1">
              <h3 className="text-lg font-medium text-textPrimary">{currentVideo.title}</h3>
              {currentVideo.description && (
                <p className="text-sm text-textSecondary mt-1">{currentVideo.description}</p>
              )}
            </div>
          )}
        </div>

        {/* Playlist - responsiva */}
        <div className="lg:col-span-1">
          <Card className="bg-cardBg border-cardBorder">
            <div className="p-3 border-b border-cardBorder">
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-2 lg:cursor-default"
                onClick={() => setPlaylistCollapsed(!playlistCollapsed)}
              >
                <span className="font-medium text-sm">
                  Playlist ({videos.length} vídeos)
                </span>
                {/* Botão de colapsar apenas no mobile */}
                <div className="lg:hidden">
                  {playlistCollapsed ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </div>
              </Button>
            </div>
            
            <CardContent className={cn(
              "p-0 transition-all duration-200",
              playlistCollapsed && "lg:block hidden"
            )}>
              <div className="max-h-96 overflow-y-auto">
                {videos.map((video, index) => (
                  <Button
                    key={video.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start p-3 rounded-none border-b border-cardBorder/50 h-auto",
                      currentVideoIndex === index && "bg-viverblue/10 border-l-2 border-l-viverblue"
                    )}
                    onClick={() => handleVideoSelect(index)}
                  >
                    <div className="flex items-start gap-2 text-left">
                      <div className="flex-shrink-0 mt-1">
                        <Play className={cn(
                          "h-3 w-3",
                          currentVideoIndex === index ? "text-viverblue" : "text-textSecondary"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-xs font-medium truncate",
                          currentVideoIndex === index ? "text-viverblue" : "text-textPrimary"
                        )}>
                          {video.title || `Vídeo ${index + 1}`}
                        </p>
                        {video.description && (
                          <p className="text-xs text-textSecondary mt-1 line-clamp-2">
                            {video.description}
                          </p>
                        )}
                        {video.duration_seconds && (
                          <p className="text-xs text-textSecondary mt-1">
                            {Math.floor(video.duration_seconds / 60)}:
                            {String(video.duration_seconds % 60).padStart(2, '0')}
                          </p>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
