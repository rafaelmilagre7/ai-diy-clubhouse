import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, Video } from "lucide-react";

interface VideoTabProps {
  solutionId: string;
  onComplete: () => void;
}

interface VideoLesson {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  duration?: number;
}

const VideoTab: React.FC<VideoTabProps> = ({ solutionId, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchedPercentage, setWatchedPercentage] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: videoLessons, isLoading } = useQuery({
    queryKey: ['solution-video-lessons', solutionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solution_video_lessons')
        .select('*')
        .eq('solution_id', solutionId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as VideoLesson[];
    }
  });

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      const percentage = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setWatchedPercentage(Math.max(watchedPercentage, percentage));
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (watchedPercentage >= 80) {
      onComplete();
    }
  }, [watchedPercentage, onComplete]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!videoLessons || videoLessons.length === 0) {
    return (
      <div className="text-center py-12">
        <Video className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum vídeo encontrado</h3>
        <p className="text-muted-foreground mb-4">
          Esta solução não possui vídeos de implementação.
        </p>
        <Button onClick={onComplete} variant="outline">
          Continuar para próxima etapa
        </Button>
      </div>
    );
  }

  const mainVideo = videoLessons[0];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Vídeo de Implementação</h2>
        <p className="text-muted-foreground">
          Assista ao vídeo para entender como implementar esta solução
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            src={mainVideo.video_url}
            className="w-full h-full object-cover"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => {
              setIsPlaying(false);
              setWatchedPercentage(100);
            }}
          />
          
          {/* Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="space-y-2">
              {/* Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-1">
                <div 
                  className="bg-primary h-1 rounded-full transition-all duration-300"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              
              {/* Controls */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePlayPause}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMuteToggle}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                  
                  <span className="text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => videoRef.current?.requestFullscreen()}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2">{mainVideo.title}</h3>
          {mainVideo.description && (
            <p className="text-muted-foreground mb-4">{mainVideo.description}</p>
          )}
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progresso de visualização</span>
              <span className="text-sm text-muted-foreground">{Math.round(watchedPercentage)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all duration-500"
                style={{ width: `${watchedPercentage}%` }}
              />
            </div>
            {watchedPercentage >= 80 && (
              <p className="text-sm text-primary font-medium">
                ✅ Vídeo concluído! Você pode avançar para a próxima etapa.
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VideoTab;