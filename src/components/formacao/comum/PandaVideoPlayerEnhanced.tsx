
import React, { useEffect, useRef } from 'react';

interface PandaVideoPlayerEnhancedProps {
  videoId: string;
  title?: string;
  className?: string;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
  onReady?: () => void;
  onError?: (message: string) => void;
  startTime?: number;
  autoplay?: boolean;
}

export const PandaVideoPlayerEnhanced: React.FC<PandaVideoPlayerEnhancedProps> = ({
  videoId,
  title = 'Vídeo',
  className = '',
  onProgress,
  onEnded,
  onReady,
  onError,
  startTime = 0,
  autoplay = false,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Script para carregar a API do Panda Video
    const loadPandaAPI = () => {
      if (window.PandaPlayer) {
        initializePlayer();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://player.pandavideo.com.br/api.v2.js';
      script.async = true;
      script.onload = initializePlayer;
      script.onerror = () => {
        if (onError) onError('Falha ao carregar a API do Panda Video');
      };
      document.body.appendChild(script);
    };

    // Inicializar o player quando a API estiver carregada
    const initializePlayer = () => {
      try {
        if (!iframeRef.current || !window.PandaPlayer) return;

        // Criar nova instância do player
        playerInstanceRef.current = new window.PandaPlayer(iframeRef.current, {
          onReady: handleReady,
          onStateChange: handleStateChange,
          onError: handleError,
        });
      } catch (error) {
        console.error('Erro ao inicializar o player:', error);
        if (onError) onError('Erro ao inicializar o player Panda Video');
      }
    };

    loadPandaAPI();

    return () => {
      // Limpar o intervalo ao desmontar o componente
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [videoId]); // Reinicializar quando o videoId mudar

  // Manipuladores de eventos do player
  const handleReady = () => {
    try {
      if (!playerInstanceRef.current) return;
      
      // Configurar o player quando estiver pronto
      if (startTime > 0) {
        playerInstanceRef.current.seekTo(startTime);
      }
      
      if (autoplay) {
        playerInstanceRef.current.playVideo();
      }
      
      // Iniciar o monitoramento do progresso
      if (onProgress) {
        progressIntervalRef.current = window.setInterval(() => {
          if (playerInstanceRef.current) {
            const currentTime = playerInstanceRef.current.getCurrentTime() || 0;
            const duration = playerInstanceRef.current.getDuration() || 1;
            const progressPercent = Math.round((currentTime / duration) * 100);
            onProgress(progressPercent);
          }
        }, 5000); // Verificar a cada 5 segundos para não sobrecarregar
      }
      
      if (onReady) onReady();
    } catch (error) {
      console.error('Erro no evento onReady:', error);
    }
  };

  const handleStateChange = (event: any) => {
    try {
      // Estado -1: não iniciado, 0: terminado, 1: em reprodução, 2: pausado, 3: em buffer, 5: vídeo indicado
      if (event.data === 0 && onEnded) {
        onEnded();
      }
    } catch (error) {
      console.error('Erro no evento de mudança de estado:', error);
    }
  };

  const handleError = (event: any) => {
    const errorCodes: Record<number, string> = {
      2: 'Parâmetros inválidos',
      5: 'Erro HTML5',
      100: 'Vídeo não encontrado',
      101: 'Reprodução não permitida',
      150: 'Reprodução não permitida neste player'
    };

    const errorMessage = errorCodes[event.data] || `Erro desconhecido (${event.data})`;
    console.error('Erro no player Panda Video:', errorMessage);
    
    if (onError) onError(errorMessage);
  };

  return (
    <div className={`relative aspect-video w-full ${className}`}>
      <iframe
        ref={iframeRef}
        src={`https://player.pandavideo.com.br/embed/?v=${videoId}&autoplay=${autoplay ? 1 : 0}`}
        style={{ border: 'none', width: '100%', height: '100%' }}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        title={title}
      />
    </div>
  );
};

// Adiciona a definição para a API do Panda Video no objeto Window
declare global {
  interface Window {
    PandaPlayer: any;
  }
}
