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
  timeout?: number;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
  onLoadTimeout?: () => void;
}

export const PandaVideoPlayer: React.FC<PandaVideoPlayerProps> = ({
  videoId,
  url,
  title = "Vídeo",
  width = "100%",
  height = "100%",
  className,
  timeout = 30000,
  onProgress,
  onEnded,
  onLoadTimeout
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingTime, setLoadingTime] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // URL do player - usar URL fornecida ou construir com videoId
  const playerUrl = url || `https://player-vz-d6ebf577-797.tv.pandavideo.com.br/embed/?v=${videoId}&autoplay=0&preload=metadata`;
  
  devLog('🐼 Carregando vídeo Panda:', { 
    videoId, 
    url: playerUrl, 
    title,
    retryCount
  });

  // Contador de tempo de carregamento
  useEffect(() => {
    if (!loading) {
      setLoadingTime(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [loading]);

  // Timeout com retry automático
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading && !iframeLoaded) {
        devLog(`⏰ [PANDA-TIMEOUT] ${loadingTime}s decorridos, iframe loaded: ${iframeLoaded}`);
        
        // Se ainda não tentou retry, tentar novamente automaticamente
        if (retryCount < 1) {
          devLog('🔄 [PANDA-RETRY] Tentando novamente automaticamente...');
          setRetryCount(prev => prev + 1);
          setIframeLoaded(false);
          setLoadingTime(0);
          // Recarregar iframe
          if (iframeRef.current) {
            iframeRef.current.src = iframeRef.current.src;
          }
        } else {
          // Após retry, mostrar erro
          devLog('❌ [PANDA-ERROR] Timeout após retry');
          setError("Erro ao carregar vídeo - tente novamente");
          setLoading(false);
          onLoadTimeout?.();
        }
      }
    }, timeout);

    return () => clearTimeout(timeoutId);
  }, [loading, iframeLoaded, timeout, retryCount, loadingTime, onLoadTimeout]);

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
    setIframeLoaded(true);
    // Player irá enviar mensagens quando estiver pronto
    // Considerar sucesso se iframe carregou (mesmo sem mensagem postMessage ainda)
    setTimeout(() => {
      if (loading) {
        devLog('✅ [PANDA-SUCCESS] Iframe carregado, considerando sucesso');
        setLoading(false);
        setError(null);
      }
    }, 2000);
  };

  const handleError = (event: any) => {
    devLog('❌ Erro no iframe:', event);
    setLoading(false);
    setError("Erro ao carregar vídeo");
  };
  
  const handleRetry = () => {
    devLog('🔄 [PANDA-RETRY-MANUAL] Usuário solicitou retry');
    setLoading(true);
    setError(null);
    setLoadingTime(0);
    setIframeLoaded(false);
    setRetryCount(0);
  };

  const openVideoDirectly = () => {
    window.open(playerUrl, '_blank', 'noopener,noreferrer');
  };

  if (error) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-0">
          <div 
            className="flex flex-col items-center justify-center bg-status-error/10 dark:bg-status-error/5 text-status-error rounded-lg p-6"
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
                className="border-status-error/30 hover:bg-status-error/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
              <Button 
                onClick={openVideoDirectly} 
                variant="outline" 
                size="sm"
                className="border-operational/30 hover:bg-operational/10"
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
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-md z-10">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            <div className="text-foreground text-sm">
              Carregando vídeo... {loadingTime}s
            </div>
            {loadingTime > 10 && (
              <div className="text-muted-foreground text-xs">
                {retryCount > 0 ? 'Tentando novamente...' : 'Aguarde, pode demorar em redes lentas'}
              </div>
            )}
            <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000"
                style={{ width: `${Math.min((loadingTime / (timeout / 1000)) * 100, 100)}%` }}
              />
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