
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
        
        // Detectar progresso do vídeo - simplificar para binário
        if (data.event === 'progress' && onProgress && typeof data.percent === 'number') {
          // Converter para progresso binário: >= 95% é considerado concluído
          const binaryProgress = data.percent >= 95 ? 100 : 0;
          onProgress(binaryProgress);
          console.log(`PandaVideoPlayer: progresso ${data.percent}% (binário: ${binaryProgress}%)`);
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
    <div className={`relative w-full aspect-video ${className || ''}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 rounded-md z-10">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            <div className="text-white text-sm">Carregando vídeo...</div>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={playerUrl}
        title={title}
        width={width}
        height={height}
        loading="eager"
        className="w-full h-full rounded-md"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={handleLoad}
        onError={handleError}
        style={{ 
          backgroundColor: '#0f172a',
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </div>
  );
};
