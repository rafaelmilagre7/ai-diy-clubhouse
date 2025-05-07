
import React, { useEffect, useRef, useState } from "react";

interface PandaVideoPlayerEnhancedProps {
  videoId: string;
  title?: string;
  className?: string;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
  startTime?: number;
  autoplay?: boolean;
  onReady?: () => void;
  onError?: (message: string) => void;
}

export const PandaVideoPlayerEnhanced = ({
  videoId,
  title = "Vídeo",
  className = "",
  onProgress,
  onEnded,
  startTime = 0,
  autoplay = false,
  onReady,
  onError
}: PandaVideoPlayerEnhancedProps) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackStarted, setPlaybackStarted] = useState(false);
  
  // Referência para intervalos
  const progressIntervalRef = useRef<number | null>(null);
  
  // Configurar o event listener para mensagens do iframe
  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      // Verificar se a mensagem vem do player do Panda Video
      if (event.data && typeof event.data === 'object' && event.data.action) {
        switch (event.data.action) {
          case 'playerready':
            setPlayerReady(true);
            if (onReady) onReady();
            
            // Iniciar reprodução se autoplay estiver habilitado
            if (autoplay && startTime === 0) {
              sendPlayerCommand('play');
            }
            
            // Definir tempo inicial se necessário
            if (startTime > 0) {
              sendPlayerCommand('seek', { seconds: startTime });
              // Pequena pausa antes de dar play para garantir que o seek funcionou
              setTimeout(() => {
                if (autoplay) sendPlayerCommand('play');
              }, 300);
            }
            break;
            
          case 'timeupdate':
            if (event.data.time) {
              setCurrentTime(event.data.time.seconds);
              
              if (duration > 0 && onProgress) {
                const progressPercentage = Math.min(100, Math.round((event.data.time.seconds / duration) * 100));
                onProgress(progressPercentage);
              }
            }
            break;
            
          case 'durationchange':
            if (event.data.duration) {
              setDuration(event.data.duration);
            }
            break;
            
          case 'play':
            setPlaybackStarted(true);
            // Iniciar intervalo para acompanhar progresso
            if (!progressIntervalRef.current) {
              progressIntervalRef.current = window.setInterval(() => {
                sendPlayerCommand('getCurrentTime');
              }, 2000); // Atualizar a cada 2 segundos
            }
            break;
            
          case 'pause':
            // Limpar intervalo quando o vídeo for pausado
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
            break;
            
          case 'ended':
            if (onEnded) onEnded();
            break;
            
          case 'error':
            if (onError) onError(`Erro no player: ${event.data.message || 'Erro desconhecido'}`);
            break;
        }
      }
    };

    window.addEventListener('message', handleIframeMessage);

    return () => {
      window.removeEventListener('message', handleIframeMessage);
      // Limpar intervalo ao desmontar componente
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [videoId, onProgress, onEnded, onReady, onError, autoplay, startTime, duration]);

  // Enviar comando para o iframe
  const sendPlayerCommand = (command: string, params = {}) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        command,
        params,
        // Garantir que o receptor saiba que é para o Panda Video
        target: 'pandavideo'
      }, '*');
    }
  };

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <iframe
        ref={iframeRef}
        src={`https://player.pandavideo.com.br/embed/?v=${videoId}&muted=false&controls=true&playerOptions[playIcon]=&playerOptions[controlsBackgroundColor]=transparent&playerOptions[controlsPosition]=square&playerOptions[controlsActiveButtonColor]=%230abab5&playerOptions[hideControls]=false&playerOptions[visibleControls]=true`}
        allow="encrypted-media; fullscreen; autoplay"
        className="w-full h-full aspect-video"
        title={title}
        frameBorder="0"
      />
    </div>
  );
};
