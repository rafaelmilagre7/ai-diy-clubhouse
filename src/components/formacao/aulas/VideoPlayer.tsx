
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LearningLessonVideo } from "@/lib/supabase";
import { YoutubeEmbed } from "@/components/common/YoutubeEmbed";
import { getYoutubeVideoId } from "@/lib/supabase";
import { PandaVideoPlayerEnhanced } from "@/components/formacao/comum/PandaVideoPlayerEnhanced";

interface VideoPlayerProps {
  video: LearningLessonVideo | null;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  startTime?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  video, 
  onTimeUpdate,
  startTime = 0
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Efeito para redefinir o estado quando o vídeo mudar
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Simulação de carregamento para evitar flash de conteúdo
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [video]);
  
  // Configurar intervalo para reportar tempo atual do vídeo
  useEffect(() => {
    if (!videoRef.current || !onTimeUpdate || video?.video_type !== 'file') return;
    
    const interval = setInterval(() => {
      if (videoRef.current) {
        onTimeUpdate(videoRef.current.currentTime, videoRef.current.duration);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [video, onTimeUpdate]);
  
  // Definir tempo inicial do vídeo, se fornecido
  useEffect(() => {
    if (videoRef.current && startTime > 0 && video?.video_type === 'file') {
      videoRef.current.currentTime = startTime;
    }
  }, [video, startTime]);
  
  // Lidar com erros de carregamento
  const handleError = () => {
    setError("Erro ao carregar o vídeo. Verifique a URL ou tente novamente mais tarde.");
    setLoading(false);
  };
  
  // Se não houver vídeo para exibir
  if (!video) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            <p className="text-muted-foreground">Selecione um vídeo para assistir</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Se estiver carregando, mostrar skeleton
  if (loading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="aspect-video">
            <Skeleton className="w-full h-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Se houver erro
  if (error) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="aspect-video bg-rose-50 flex items-center justify-center">
            <p className="text-rose-500 text-center px-4">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Renderizar vídeo baseado no tipo
  const renderVideo = () => {
    // Vídeo do Panda
    if (video.video_type === 'panda' && video.url) {
      // Extrair o ID do vídeo do Panda da URL ou usar o campo video_file_path como fallback
      const pandaVideoId = video.video_file_path || 
                          (video.url.includes('/embed/') ? 
                            video.url.split('/embed/')[1]?.split('?')[0] : 
                            video.url.split('/').pop());
      
      if (pandaVideoId) {
        return (
          <PandaVideoPlayerEnhanced 
            videoId={pandaVideoId} 
            title={video.title}
            onProgress={(progress) => {
              if (onTimeUpdate && video.duration_seconds) {
                // Simular onTimeUpdate para manter compatibilidade
                const duration = video.duration_seconds || 0;
                const currentTime = (progress / 100) * duration;
                onTimeUpdate(currentTime, duration);
              }
            }}
            onEnded={() => {
              console.log("Vídeo finalizado:", video.title);
            }}
            startTime={startTime}
          />
        );
      }
    }
    // Vídeo do YouTube
    else if (video.video_type === 'youtube' && video.url) {
      const youtubeId = getYoutubeVideoId(video.url);
      
      if (youtubeId) {
        return <YoutubeEmbed youtubeId={youtubeId} title={video.title} />;
      } else {
        return (
          <div className="aspect-video bg-rose-50 flex items-center justify-center">
            <p className="text-rose-500">URL do YouTube inválida</p>
          </div>
        );
      }
    } 
    // Vídeo direto (Supabase Storage)
    else if (video.url) {
      return (
        <video
          ref={videoRef}
          src={video.url}
          className="w-full h-full aspect-video"
          controls
          autoPlay
          onError={handleError}
          onTimeUpdate={() => {
            if (videoRef.current && onTimeUpdate) {
              onTimeUpdate(videoRef.current.currentTime, videoRef.current.duration);
            }
          }}
        />
      );
    } else {
      return (
        <div className="aspect-video bg-rose-50 flex items-center justify-center">
          <p className="text-rose-500">URL do vídeo não disponível</p>
        </div>
      );
    }
  };
  
  return (
    <Card>
      <CardContent className="p-0">
        {renderVideo()}
      </CardContent>
    </Card>
  );
};
