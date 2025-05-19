import React, { useRef, useEffect, useState } from "react";
import { LearningLessonVideo } from "@/lib/supabase/types";
import { YoutubeEmbed } from "@/components/common/YoutubeEmbed";
import { getYoutubeVideoId } from "@/lib/utils/videoUtils";

interface LessonVideoPlayerProps {
  video: LearningLessonVideo;
  onTimeUpdate?: (videoId: string, currentTime: number, duration: number) => void;
  autoPlay?: boolean;
  startTime?: number;
}

export const LessonVideoPlayer: React.FC<LessonVideoPlayerProps> = ({
  video,
  onTimeUpdate,
  autoPlay = true,
  startTime = 0
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Resetar estado quando o vídeo mudar
    setError(null);
    setIsLoading(true);

    // Configurar tempo inicial quando o componente montar ou o vídeo mudar
    if (videoRef.current && startTime > 0) {
      videoRef.current.currentTime = startTime;
    }

    // Simular carregamento para evitar flash de conteúdo
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [video, startTime]);

  const handleError = () => {
    setError("Não foi possível carregar o vídeo. Por favor, tente novamente mais tarde.");
    setIsLoading(false);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && onTimeUpdate) {
      onTimeUpdate(
        video.id,
        videoRef.current.currentTime,
        videoRef.current.duration
      );
    }
  };

  // Renderizar vídeo baseado no tipo
  const renderVideo = () => {
    // Vídeo do Panda
    if (video.video_type === 'panda') {
      // Extrair o ID do vídeo do Panda da URL ou usar o campo video_file_path como fallback
      const pandaVideoId = video.video_file_path || video.url.split('/').pop();
      
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
    if (video.video_type === 'youtube') {
      const youtubeId = getYoutubeVideoId(video.url);
      if (youtubeId) {
        return <YoutubeEmbed youtubeId={youtubeId} title={video.title || ""} />;
      }
    }
    
    // Vídeo direto (MP4, etc)
    return (
      <video
        ref={videoRef}
        src={video.url}
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
