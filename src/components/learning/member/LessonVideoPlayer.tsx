
import { useState, useEffect, useRef } from "react";
import { LearningLessonVideo } from "@/lib/supabase";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface LessonVideoPlayerProps {
  video: LearningLessonVideo;
  onProgress?: (progress: number) => void;
}

export const LessonVideoPlayer: React.FC<LessonVideoPlayerProps> = ({ 
  video, 
  onProgress 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
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
  }, []);
  
  // Atualizar tempo atual e progresso
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !onProgress) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
      
      // Calcular progresso como porcentagem
      if (duration > 0) {
        const progressPercent = Math.round((videoElement.currentTime / duration) * 100);
        
        // Atualizar progresso em 25%, 50%, 75% e 100%
        if (progressPercent >= 25 && progressPercent < 50) {
          onProgress(25);
        } else if (progressPercent >= 50 && progressPercent < 75) {
          onProgress(50);
        } else if (progressPercent >= 75 && progressPercent < 100) {
          onProgress(75);
        } else if (progressPercent === 100) {
          onProgress(100);
        }
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      onProgress(100);
    };
    
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('ended', handleEnded);
    
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [duration, onProgress]);
  
  // Controle de reprodução
  const togglePlay = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Controle de volume
  const toggleMute = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    videoElement.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  
  const handleVolumeChange = (value: number[]) => {
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
  };
  
  // Controle da timeline
  const handleTimelineChange = (value: number[]) => {
    const newTime = value[0];
    
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    videoElement.currentTime = newTime * duration / 100;
    setCurrentTime(videoElement.currentTime);
  };
  
  // Formatação do tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full overflow-hidden rounded-lg bg-black">
      <div className="relative">
        <video
          ref={videoRef}
          src={video.url}
          className="w-full h-auto"
          poster={video.thumbnail_url || undefined}
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
        <h3 className="font-medium">{video.title}</h3>
        {video.description && (
          <p className="text-sm text-white/70 mt-1">{video.description}</p>
        )}
      </div>
    </div>
  );
};
