
import React, { useState } from "react";
import { LearningLessonVideo } from "@/lib/supabase/types";
import { VideoPlayer } from "@/components/formacao/aulas/VideoPlayer";
import { VideoPlaylist } from "./VideoPlaylist";
import { useVideoProgress } from "@/hooks/learning/useVideoProgress";

interface LessonVideoPlayerProps {
  videos: LearningLessonVideo[];
  lessonId: string;
  onProgress?: (videoId: string, progress: number) => void;
}

export const LessonVideoPlayer: React.FC<LessonVideoPlayerProps> = ({
  videos,
  lessonId,
  onProgress
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  
  // Garantir que temos videos válidos
  const safeVideos = Array.isArray(videos) ? videos : [];
  
  if (safeVideos.length === 0) {
    return (
      <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Nenhum vídeo disponível para esta aula</p>
      </div>
    );
  }

  const currentVideo = safeVideos[currentVideoIndex];

  // Hook para gerenciar progresso do vídeo
  const { updateProgress } = useVideoProgress({
    lessonId: lessonId,
    videoId: currentVideo?.id || "",
    duration: currentVideo?.duration_seconds || 0,
    onProgressUpdate: (progress) => {
      if (onProgress && currentVideo) {
        // Simplificar para progresso binário
        const binaryProgress = progress >= 95 ? 100 : 0;
        onProgress(currentVideo.id, binaryProgress);
      }
    }
  });

  const handleVideoSelect = (index: number) => {
    setCurrentVideoIndex(index);
  };

  const handleTimeUpdate = (currentTime: number, duration: number) => {
    if (duration > 0) {
      const progress = (currentTime / duration) * 100;
      updateProgress(currentTime, duration);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Player principal - tela cheia */}
      <div className="w-full">
        <VideoPlayer
          video={currentVideo}
          onTimeUpdate={handleTimeUpdate}
        />
      </div>

      {/* Playlist abaixo do vídeo */}
      {safeVideos.length > 1 && (
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-4">Vídeos da aula</h3>
          <VideoPlaylist
            videos={safeVideos}
            currentVideoIndex={currentVideoIndex}
            onSelectVideo={handleVideoSelect}
          />
        </div>
      )}
    </div>
  );
};
