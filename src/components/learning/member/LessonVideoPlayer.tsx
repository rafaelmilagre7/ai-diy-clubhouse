
import { useState, useEffect, useRef } from "react";
import { LearningLessonVideo } from "@/lib/supabase";
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { PandaVideoPlayer } from "@/components/formacao/comum/PandaVideoPlayer";
import { VideoPlaylist } from "./VideoPlaylist";
import { Card, CardContent } from "@/components/ui/card";

interface LessonVideoPlayerProps {
  videos: LearningLessonVideo[];
  onProgress?: (videoId: string, progress: number) => void;
  initialVideoIndex?: number;
}

export const LessonVideoPlayer: React.FC<LessonVideoPlayerProps> = ({ 
  videos, 
  onProgress,
  initialVideoIndex = 0
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(initialVideoIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [videoProgresses, setVideoProgresses] = useState<Record<string, number>>({});
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Garantir que temos pelo menos um vídeo
  if (!videos || videos.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <p className="text-muted-foreground">Nenhum vídeo disponível para esta aula.</p>
        </CardContent>
      </Card>
    );
  }
  
  // O vídeo atual
  const currentVideo = videos[currentVideoIndex];
  
  // Avançar para o próximo vídeo quando o atual terminar
  const handleVideoEnd = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };
  
  // Atualizar o progresso do vídeo atual
  const handleProgress = (progress: number) => {
    if (onProgress && currentVideo) {
      onProgress(currentVideo.id, progress);
      
      // Atualizar o estado local dos progressos
      setVideoProgresses(prev => ({
        ...prev,
        [currentVideo.id]: progress
      }));
    }
  };
  
  // Configurar evento de metadados para obter duração
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    const handleMetadata = () => {
      setDuration(videoElement.duration);
    };
    
    videoElement.addEventListener('loadedmetadata', handleMetadata);
    
    return () => {
      videoElement.removeEventListener('loadedmetadata', handleMetadata);
    };
  }, [currentVideo]);
  
  // Se for um vídeo do Panda, usar componente específico
  if (currentVideo.video_type === 'panda') {
    // Extrair ID do vídeo do Panda da URL ou usar o campo video_file_path como fallback
    let pandaVideoId = "";
    
    if (currentVideo.video_file_path) {
      pandaVideoId = currentVideo.video_file_path;
    } else if (currentVideo.url) {
      // Tentar extrair o ID do vídeo da URL do Panda Video
      const matches = currentVideo.url.match(/\/embed\/([a-zA-Z0-9]+)/);
      if (matches && matches[1]) {
        pandaVideoId = matches[1];
      } else {
        pandaVideoId = currentVideo.url.split('/').pop() || '';
      }
    }
    
    if (pandaVideoId) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <PandaVideoPlayer
              videoId={pandaVideoId}
              title={currentVideo.title}
              onProgress={handleProgress}
              onEnded={handleVideoEnd}
            />
            
            <div className="mt-3">
              <h3 className="text-lg font-medium">{currentVideo.title}</h3>
              {currentVideo.description && (
                <p className="mt-1 text-muted-foreground">{currentVideo.description}</p>
              )}
            </div>
            
            {/* Controles de navegação em tela pequena (visíveis apenas em dispositivos móveis) */}
            <div className="flex justify-between mt-3 md:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentVideoIndex(prev => Math.max(0, prev - 1))}
                disabled={currentVideoIndex <= 0}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Anterior
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentVideoIndex(prev => Math.min(videos.length - 1, prev + 1))}
                disabled={currentVideoIndex >= videos.length - 1}
              >
                Próximo
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Playlist de vídeos (visível apenas em desktop) */}
          <div className="hidden md:block">
            <VideoPlaylist
              videos={videos}
              currentVideoIndex={currentVideoIndex}
              onSelectVideo={setCurrentVideoIndex}
              progresses={videoProgresses}
            />
          </div>
          
          {/* Playlist de vídeos para mobile */}
          <div className="md:hidden mt-4">
            <details>
              <summary className="cursor-pointer font-medium">
                Ver todos os vídeos ({videos.length})
              </summary>
              <div className="mt-2">
                <VideoPlaylist
                  videos={videos}
                  currentVideoIndex={currentVideoIndex}
                  onSelectVideo={setCurrentVideoIndex}
                  progresses={videoProgresses}
                />
              </div>
            </details>
          </div>
        </div>
      );
    }
  }
  
  // Para outros tipos de vídeo, continuar com o player padrão
  
  // Atualizar tempo atual e progresso
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !onProgress || !currentVideo) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
      
      // Calcular progresso como porcentagem
      if (duration > 0) {
        const progressPercent = Math.round((videoElement.currentTime / duration) * 100);
        
        // Atualizar progresso em 25%, 50%, 75% e 100%
        if (progressPercent >= 25 && progressPercent < 50) {
          handleProgress(25);
        } else if (progressPercent >= 50 && progressPercent < 75) {
          handleProgress(50);
        } else if (progressPercent >= 75 && progressPercent < 100) {
          handleProgress(75);
        } else if (progressPercent === 100) {
          handleProgress(100);
        }
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      handleProgress(100);
      handleVideoEnd();
    };
    
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('ended', handleEnded);
    
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [duration, onProgress, currentVideo, handleProgress, handleVideoEnd]);
  
  // Funções de controle de reprodução
  function togglePlay() {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
    
    setIsPlaying(!isPlaying);
  }
  
  // Controle de volume
  function toggleMute() {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    videoElement.muted = !isMuted;
    setIsMuted(!isMuted);
  }
  
  function handleVolumeChange(value: number[]) {
    const newVolume = value[0];
    
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    videoElement.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
      videoElement.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      videoElement.muted = false;
    }
  }
  
  // Controle da timeline
  function handleTimelineChange(value: number[]) {
    const newTime = value[0];
    
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    videoElement.currentTime = newTime * duration / 100;
    setCurrentTime(videoElement.currentTime);
  }
  
  // Formatação do tempo
  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-3">
        <div className="w-full overflow-hidden rounded-lg bg-black">
          <div className="relative">
            <video
              ref={videoRef}
              src={currentVideo.url}
              className="w-full h-auto"
              poster={currentVideo.thumbnail_url || undefined}
            />
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2 text-white">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-white hover:bg-white/20" 
                    onClick={togglePlay}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </Button>
                  
                  <span className="text-xs">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                  
                  <div className="flex-grow mx-2">
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[(currentTime / duration) * 100 || 0]}
                      onValueChange={handleTimelineChange}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-white hover:bg-white/20" 
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </Button>
                  
                  <div className="w-20">
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      value={[isMuted ? 0 : volume]}
                      onValueChange={handleVolumeChange}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-black text-white">
            <h3 className="font-medium">{currentVideo.title}</h3>
            {currentVideo.description && (
              <p className="text-sm text-white/70 mt-1">{currentVideo.description}</p>
            )}
          </div>
        </div>
        
        {/* Controles de navegação em tela pequena (visíveis apenas em dispositivos móveis) */}
        <div className="flex justify-between mt-3 md:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentVideoIndex(prev => Math.max(0, prev - 1))}
            disabled={currentVideoIndex <= 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Anterior
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentVideoIndex(prev => Math.min(videos.length - 1, prev + 1))}
            disabled={currentVideoIndex >= videos.length - 1}
          >
            Próximo
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Playlist de vídeos (visível apenas em desktop) */}
      <div className="hidden md:block">
        <VideoPlaylist
          videos={videos}
          currentVideoIndex={currentVideoIndex}
          onSelectVideo={setCurrentVideoIndex}
          progresses={videoProgresses}
        />
      </div>
      
      {/* Playlist de vídeos para mobile */}
      <div className="md:hidden mt-4">
        <details>
          <summary className="cursor-pointer font-medium">
            Ver todos os vídeos ({videos.length})
          </summary>
          <div className="mt-2">
            <VideoPlaylist
              videos={videos}
              currentVideoIndex={currentVideoIndex}
              onSelectVideo={setCurrentVideoIndex}
              progresses={videoProgresses}
            />
          </div>
        </details>
      </div>
    </div>
  );
};
