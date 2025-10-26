import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';
import type { PandaPlayer } from '@/types/pandavideo';

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
  const [loadingTime, setLoadingTime] = useState(0);
  const [sdkReady, setSdkReady] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PandaPlayer | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const containerId = useRef(`panda-player-${Math.random().toString(36).substr(2, 9)}`);
  
  // URL para abrir diretamente (fallback)
  const playerUrl = url || `https://player-vz-d6ebf577-797.tv.pandavideo.com.br/embed/?v=${videoId}`;

  // Verificar se SDK está disponível
  useEffect(() => {
    const checkSDK = () => {
      if (typeof window !== 'undefined' && window.PandaPlayer) {
        setSdkReady(true);
        return true;
      }
      return false;
    };

    if (checkSDK()) return;

    // Tentar novamente após um delay
    const interval = setInterval(() => {
      if (checkSDK()) {
        clearInterval(interval);
      }
    }, 100);

    // Timeout de 5s para SDK
    const sdkTimeout = setTimeout(() => {
      clearInterval(interval);
      if (!sdkReady) {
        setError("SDK do PandaVideo não carregou");
        setLoading(false);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(sdkTimeout);
    };
  }, [sdkReady]);

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

  // Timeout geral
  useEffect(() => {
    if (!loading) return;

    timeoutRef.current = setTimeout(() => {
      if (loading) {
        setError("Timeout ao carregar vídeo");
        setLoading(false);
        onLoadTimeout?.();
      }
    }, timeout);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading, timeout, onLoadTimeout]);

  // Inicializar player quando SDK estiver pronto
  useEffect(() => {
    if (!sdkReady || !containerRef.current || playerRef.current) return;

    try {
      const player = new window.PandaPlayer(containerId.current, {
        video_id: videoId,
        responsive: true,
        autoplay: false,
        controls: true,
      });

      playerRef.current = player;

      // Eventos do player
      player.onReady(() => {
        setLoading(false);
        setError(null);
      });

      player.onError((err) => {
        console.error('Erro no PandaVideo player:', err);
        setError("Erro ao carregar vídeo");
        setLoading(false);
      });

      if (onProgress) {
        player.onProgress((progressData) => {
          const progress = progressData.percent || 0;
          const binaryProgress = progress >= 95 ? 100 : 0;
          onProgress(binaryProgress);
        });
      }

      if (onEnded) {
        player.onEnded(() => {
          onEnded();
        });
      }

    } catch (err) {
      console.error('Erro ao inicializar PandaVideo player:', err);
      setError("Erro ao inicializar player");
      setLoading(false);
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (err) {
          console.error('Erro ao destruir player:', err);
        }
        playerRef.current = null;
      }
    };
  }, [sdkReady, videoId, onProgress, onEnded]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setLoadingTime(0);
    setSdkReady(false);
    
    // Destruir player existente
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (err) {
        console.error('Erro ao destruir player no retry:', err);
      }
      playerRef.current = null;
    }
    
    // Forçar re-verificação do SDK
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.PandaPlayer) {
        setSdkReady(true);
      }
    }, 100);
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
            {loadingTime > 5 && (
              <div className="text-muted-foreground text-xs">
                Aguarde, inicializando player...
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
      
      <div 
        ref={containerRef}
        id={containerId.current}
        className="w-full h-full rounded-md bg-surface-base"
        style={{ 
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </div>
  );
};
