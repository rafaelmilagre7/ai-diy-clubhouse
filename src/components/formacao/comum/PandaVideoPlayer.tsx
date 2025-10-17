import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { devLog } from '@/hooks/useOptimizedLogging';
import { RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // URL do player - usar URL fornecida ou construir com videoId
  const playerUrl = url || `https://player-vz-d6ebf577-797.tv.pandavideo.com.br/embed/?v=${videoId}&autoplay=0&preload=metadata`;
  
  devLog('🐼 Carregando vídeo Panda:', { 
    videoId, 
    url: playerUrl, 
    title,
    retryCount
  });

  // Timeout simples para detectar problemas de carregamento
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setError("Erro ao carregar vídeo - tente novamente");
        setLoading(false);
      }
    }, 15000);

    return () => clearTimeout(timeout);
  }, [loading, playerUrl]);

  // Handler de mensagens do player
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes('pandavideo.com') && !event.origin.includes('player-vz')) return;
      
      devLog('🐼 Mensagem recebida do player:', event.data);
      
      if (loading) {
        setLoading(false);
        setError(null);
      }

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        if ((data.event === 'progress' || data.type === 'progress') && onProgress) {
          const progress = data.percent || data.progress || 0;
          const binaryProgress = progress >= 95 ? 100 : 0;
          onProgress(binaryProgress);
        }
        
        if ((data.event === 'ended' || data.type === 'ended') && onEnded) {
          onEnded();
        }
      } catch (err) {
        devLog('Erro ao processar mensagem:', err);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [loading, onProgress, onEnded]);

  const handleLoad = () => {
    devLog('✅ Iframe do Panda carregado');
    // Player irá enviar mensagens quando estiver pronto
  };

  const handleError = (event: any) => {
    devLog('❌ Erro no iframe:', event);
    setLoading(false);
    setError("Erro ao carregar vídeo");
  };
  
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount(prev => prev + 1);
  };

  const openVideoDirectly = () => {
    window.open(playerUrl, '_blank', 'noopener,noreferrer');
  };

  if (error) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-0">
          <div 
            className="flex flex-col items-center justify-center bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg p-6"
            style={{ width, height }}
          >
            <AlertTriangle className="w-12 h-12 mb-4" />
            <h3 className="font-semibold mb-2">Erro no Vídeo</h3>
            <p className="text-center px-4 mb-4 text-sm">{error}</p>
            <div className="flex gap-2">
              <Button 
                onClick={handleRetry} 
                variant="outline" 
                size="sm"
                className="border-rose-200 hover:bg-rose-100 dark:border-rose-800 dark:hover:bg-rose-900/20"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
              <Button 
                onClick={openVideoDirectly} 
                variant="outline" 
                size="sm"
                className="border-blue-200 hover:bg-blue-100 dark:border-blue-800 dark:hover:bg-blue-900/20"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir Direto
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`relative w-full aspect-video ${className || ''}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 rounded-md z-10">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            <div className="text-white text-sm">
              Carregando vídeo...
            </div>
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
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={handleLoad}
        onError={handleError}
        referrerPolicy="strict-origin-when-cross-origin"
        className="w-full h-full rounded-md bg-surface-base"
        style={{ 
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </div>
  );
};