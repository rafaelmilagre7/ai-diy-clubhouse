
import React, { useRef, useEffect, useState } from "react";
import { LearningLessonVideo } from "@/lib/supabase/types";
import { YoutubeEmbed } from "@/components/common/YoutubeEmbed";
import { getYoutubeVideoId } from "@/lib/utils/videoUtils";

interface LessonVideoPlayerProps {
  video?: LearningLessonVideo;
  videos?: LearningLessonVideo[];
  onTimeUpdate?: (videoId: string, currentTime: number, duration: number) => void;
  onProgress?: (videoId: string, progress: number) => void;
  autoPlay?: boolean;
  startTime?: number;
}

export const LessonVideoPlayer: React.FC<LessonVideoPlayerProps> = ({
  video,
  videos,
  onTimeUpdate,
  onProgress,
  autoPlay = true,
  startTime = 0
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState<LearningLessonVideo | null>(null);

  useEffect(() => {
    // Resetar estado quando o vídeo mudar
    setError(null);
    setIsLoading(true);

    // Determinar qual vídeo mostrar (único ou primeiro da lista)
    const videoToShow = video || (videos && videos.length > 0 ? videos[0] : null);
    setCurrentVideo(videoToShow);

    // Configurar tempo inicial quando o componente montar ou o vídeo mudar
    if (videoRef.current && startTime > 0) {
      videoRef.current.currentTime = startTime;
    }

    // Simular carregamento para evitar flash de conteúdo
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [video, videos, startTime]);

  const handleError = () => {
    setError("Não foi possível carregar o vídeo. Por favor, tente novamente mais tarde.");
    setIsLoading(false);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && onTimeUpdate && currentVideo) {
      onTimeUpdate(
        currentVideo.id,
        videoRef.current.currentTime,
        videoRef.current.duration
      );
    }

    // Calcular progresso para callback de progresso
    if (videoRef.current && onProgress && currentVideo) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      onProgress(currentVideo.id, progress);
    }
  };

  // Renderizar vídeo baseado no tipo
  const renderVideo = () => {
    if (!currentVideo) return null;

    // Vídeo do Panda
    if (currentVideo.video_type === 'panda') {
      // Extrair o ID do vídeo do Panda da URL ou usar o campo video_file_path como fallback
      const pandaVideoId = currentVideo.video_file_path || currentVideo.url.split('/').pop();
      
      if (pandaVideoId) {
        return (
          <div className="aspect-video bg-black flex items-center justify-center">
            <iframe
              src={`https://player.pandavideo.com.br/embed/?v=${pandaVideoId}`}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        );
      }
    }
    
    // Vídeo do YouTube
    if (currentVideo.video_type === 'youtube') {
      const youtubeId = getYoutubeVideoId(currentVideo.url);
      if (youtubeId) {
        return <YoutubeEmbed youtubeId={youtubeId} title={currentVideo.title || ""} />;
      }
    }
    
    // Vídeo direto (MP4, etc)
    return (
      <video
        ref={videoRef}
        src={currentVideo.url}
        className="w-full h-full aspect-video"
        controls
        autoPlay={autoPlay}
        onError={handleError}
        onTimeUpdate={handleTimeUpdate}
      />
    );
  };

  // Se estiver carregando, mostrar um skeleton
  if (isLoading) {
    return (
      <div className="aspect-video bg-gray-100 flex items-center justify-center">
        Carregando vídeo...
      </div>
    );
  }

  // Se houver um erro, mostrar uma mensagem de erro
  if (error) {
    return (
      <div className="aspect-video bg-red-100 flex items-center justify-center">
        {error}
      </div>
    );
  }

  return renderVideo();
};
