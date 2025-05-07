
import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Play, Pause, Volume2, VolumeX, Maximize, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

declare global {
  interface Window {
    pandascripttag: any[];
    PandaPlayer: any;
  }
}

interface PandaVideoPlayerEnhancedProps {
  videoId: string;
  title?: string;
  className?: string;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
  startTime?: number;
  autoplay?: boolean;
}

export const PandaVideoPlayerEnhanced = ({
  videoId,
  title = "Vídeo",
  className = "",
  onProgress,
  onEnded,
  startTime = 0,
  autoplay = false
}: PandaVideoPlayerEnhancedProps) => {
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerContainerId = `panda-player-${videoId}`;
  
  // Inicializar o player usando a API oficial da Panda Video
  useEffect(() => {
    if (!videoId) return;

    setLoading(true);
    setPlayerReady(false);
    setPlayerError(null);

    const initializePlayer = () => {
      if (!window.PandaPlayer) {
        console.log("API do Panda Video ainda não carregada, tentando novamente em 500ms");
        setTimeout(initializePlayer, 500);
        return;
      }

      try {
        console.log("Inicializando player do Panda Video para o vídeo:", videoId);
        
        // Registrar a função de inicialização
        window.pandascripttag = window.pandascripttag || [];
        window.pandascripttag.push(() => {
          try {
            // Criar instância do player
            playerRef.current = new window.PandaPlayer(playerContainerId, {
              video_id: videoId,
              onReady: () => {
                console.log("Player pronto:", videoId);
                setPlayerReady(true);
                setLoading(false);
                
                // Configurar tempo inicial se fornecido
                if (startTime > 0) {
                  playerRef.current.setCurrentTime(startTime);
                }
                
                // Iniciar reprodução automática se configurada
                if (autoplay) {
                  playerRef.current.play();
                  setIsPlaying(true);
                }
              },
            });

            // Registrar evento para monitorar o progresso
            playerRef.current.onEvent((event: any) => {
              const type = event.message;
              
              if (type === "video.play") {
                console.log("Vídeo iniciou reprodução");
                setIsPlaying(true);
              } else if (type === "video.pause") {
                console.log("Vídeo pausado");
                setIsPlaying(false);
              } else if (type === "video.ended") {
                console.log("Vídeo finalizado");
                setIsPlaying(false);
                if (onEnded) onEnded();
              } else if (type === "panda_timeupdate") {
                // Atualizar tempo atual e progresso
                if (event.data) {
                  const newTime = event.data.currentTime || 0;
                  const videoDuration = event.data.duration || 0;
                  
                  setCurrentTime(newTime);
                  setDuration(videoDuration);
                  
                  const calculatedProgress = videoDuration > 0 
                    ? Math.floor((newTime / videoDuration) * 100) 
                    : 0;
                  
                  setProgress(calculatedProgress);
                  
                  // Chamar callback de progresso se fornecido
                  if (onProgress) {
                    onProgress(calculatedProgress);
                  }
                }
              }
            });
          } catch (err) {
            console.error("Erro ao inicializar player:", err);
            setPlayerError("Não foi possível inicializar o player. Verifique o ID do vídeo.");
            setLoading(false);
          }
        });
      } catch (error) {
        console.error("Erro ao configurar player:", error);
        setPlayerError("Ocorreu um erro ao configurar o player.");
        setLoading(false);
      }
    };

    // Iniciar o processo de inicialização
    initializePlayer();
    
    // Cleanup ao desmontar o componente
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (err) {
          console.error("Erro ao destruir o player:", err);
        }
        playerRef.current = null;
      }
    };
  }, [videoId, autoplay, onEnded, onProgress, startTime]);
  
  // Funções para controlar o player
  const handlePlayPause = useCallback(() => {
    if (!playerRef.current || !playerReady) return;
    
    try {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
    } catch (err) {
      console.error("Erro ao controlar reprodução:", err);
      toast.error("Erro ao controlar a reprodução");
    }
  }, [isPlaying, playerReady]);
  
  const handleVolumeChange = useCallback((value: number[]) => {
    if (!playerRef.current || !playerReady) return;
    
    try {
      const newVolume = value[0];
      playerRef.current.setVolume(newVolume);
      setVolume(newVolume);
      
      // Atualizar estado de mudo
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    } catch (err) {
      console.error("Erro ao ajustar volume:", err);
    }
  }, [isMuted, playerReady]);
  
  const toggleMute = useCallback(() => {
    if (!playerRef.current || !playerReady) return;
    
    try {
      if (isMuted) {
        playerRef.current.setVolume(volume || 0.5);
        setIsMuted(false);
      } else {
        playerRef.current.setVolume(0);
        setIsMuted(true);
      }
    } catch (err) {
      console.error("Erro ao alternar mudo:", err);
    }
  }, [isMuted, volume, playerReady]);
  
  const handleSeek = useCallback((value: number[]) => {
    if (!playerRef.current || !playerReady) return;
    
    try {
      const seekTime = (value[0] / 100) * duration;
      playerRef.current.setCurrentTime(seekTime);
    } catch (err) {
      console.error("Erro ao ajustar posição:", err);
    }
  }, [duration, playerReady]);
  
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    try {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch(err => {
          console.error("Erro ao entrar em tela cheia:", err);
        });
      } else {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(err => {
          console.error("Erro ao sair da tela cheia:", err);
        });
      }
    } catch (err) {
      console.error("Erro ao alternar tela cheia:", err);
    }
  }, []);
  
  // Formatar tempo para exibição (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleRetry = () => {
    // Reiniciar o player
    setLoading(true);
    setPlayerError(null);
    
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.error("Erro ao destruir player:", e);
      }
    }
    
    // Reiniciar o efeito useEffect principal
    playerRef.current = null;
    setPlayerReady(false);
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-lg bg-black",
        className
      )}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}
      
      {playerError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 p-4">
          <p className="text-white mb-4 text-center">{playerError}</p>
          <Button onClick={handleRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      )}
      
      <div className="aspect-video">
        {/* Container do player do Panda Video */}
        <div 
          id={playerContainerId} 
          className="w-full h-full"
        ></div>
      </div>
      
      {/* Controles personalizados */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity",
        loading ? "opacity-0" : "opacity-100"
      )}>
        <div className="flex flex-col space-y-2 text-white">
          {/* Barra de progresso */}
          <div className="w-full">
            <Slider
              value={[progress]}
              min={0}
              max={100}
              step={1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Botão Play/Pause */}
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={handlePlayPause}
                disabled={!playerReady}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </Button>
              
              {/* Tempo atual / duração */}
              <span className="text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Controle de volume */}
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={toggleMute}
                disabled={!playerReady}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </Button>
              
              <div className="w-24 hidden sm:block">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  disabled={!playerReady}
                  className="cursor-pointer"
                />
              </div>
              
              {/* Botão de tela cheia */}
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={toggleFullscreen}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <Maximize size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Título do vídeo (fora dos controles) */}
      {title && !isFullscreen && (
        <div className="mt-2">
          <h3 className="text-base font-medium">{title}</h3>
        </div>
      )}
    </div>
  );
};
