
import React, { useEffect, useRef } from 'react';

interface PandaVideoPlayerProps {
  videoId: string;
  url?: string;
  title?: string;
  width?: string;
  height?: string;
  className?: string;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
}

export const PandaVideoPlayer: React.FC<PandaVideoPlayerProps> = ({
  videoId,
  url,
  title = "Vídeo",
  width = "100%",
  height = "100%",
  className,
  onProgress,
  onEnded
}) => {
  const [loading, setLoading] = React.useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Determinar a URL baseada no videoId ou usar a URL fornecida diretamente
  const playerUrl = url || `https://player-vz-d6ebf577-797.tv.pandavideo.com.br/embed/?v=${videoId}`;

  // Efeito para configurar o listener de mensagens para comunicação com o iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        // Verificar se a mensagem vem do domínio do Panda Video
        if (!event.origin.includes('pandavideo.com.br')) return;
        
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        // Detectar progresso do vídeo
        if (data.event === 'progress' && onProgress && typeof data.percent === 'number') {
          onProgress(data.percent);
          console.log(`PandaVideoPlayer: progresso ${data.percent}%`);
        }
        
        // Detectar final do vídeo
        if (data.event === 'ended' && onEnded) {
          onEnded();
          console.log('PandaVideoPlayer: vídeo finalizado');
        }
      } catch (error) {
        console.error('Erro ao processar mensagem do iframe:', error);
      }
    };

    // Adicionar listener para mensagens
    window.addEventListener('message', handleMessage);
    
    // Remover listener quando o componente for desmontado
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onProgress, onEnded]);

  const handleLoad = () => {
    console.log("PandaVideoPlayer: iframe carregado");
    setLoading(false);
  };

  const handleError = () => {
    console.error("PandaVideoPlayer: erro ao carregar iframe");
    setLoading(false);
  };

  return (
    <div className={`aspect-video ${className || ''}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded-md">
          <div className="animate-pulse">Carregando vídeo...</div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={playerUrl}
        title={title}
        width={width}
        height={height}
        loading="lazy"
        className="w-full h-full rounded-md"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};
