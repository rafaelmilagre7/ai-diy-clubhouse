import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

// Estender window para incluir pandascripttag
declare global {
  interface Window {
    pandascripttag?: any[];
    PandaPlayer?: any;
  }
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
  
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const containerId = useRef(`panda-${videoId}`); // ID deve começar com "panda-"
  
  // URL para abrir diretamente (fallback)
  const playerUrl = url || `https://player-vz-d6ebf577-797.tv.pandavideo.com.br/embed/?v=${videoId}`;

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
        console.error('[PandaVideoPlayer] Timeout ao carregar vídeo');
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

  // Inicializar player usando o padrão oficial do PandaVideo
  useEffect(() => {
    if (!containerRef.current || playerRef.current) return;

    console.log('[PandaVideoPlayer] Inicializando player para videoId:', videoId);
    console.log('[PandaVideoPlayer] Container ID:', containerId.current);

    // Garantir que window.pandascripttag existe
    window.pandascripttag = window.pandascripttag || [];

    // Adicionar callback de inicialização seguindo o padrão oficial
    window.pandascripttag.push(function () {
      try {
        console.log('[PandaVideoPlayer] Criando player com PandaPlayer...');
        
        const player = new window.PandaPlayer(containerId.current, {
          onReady: () => {
            console.log('[PandaVideoPlayer] Player pronto!');
            setLoading(false);
            setError(null);
            
            // Configurar eventos de progresso
            if (onProgress || onEnded) {
              player.onEvent((event: any) => {
                console.log('[PandaVideoPlayer] Evento:', event);
                
                if (event.message === 'panda_timeupdate' && onProgress) {
                  const currentTime = player.getCurrentTime();
                  const duration = player.getDuration();
                  if (duration > 0) {
                    const progress = (currentTime / duration) * 100;
                    const binaryProgress = progress >= 95 ? 100 : 0;
                    onProgress(binaryProgress);
                  }
                }
                
                if (event.message === 'panda_end' && onEnded) {
                  onEnded();
                }
              });
            }
          },
          onError: (err: any) => {
            console.error('[PandaVideoPlayer] Erro no player:', err);
            setError("Erro ao carregar vídeo");
            setLoading(false);
          }
        });

        console.log('[PandaVideoPlayer] Player criado com sucesso');
        playerRef.current = player;

      } catch (err) {
        console.error('[PandaVideoPlayer] ERRO ao criar player:', err);
        setError(`Erro ao inicializar: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    });

    return () => {
      if (playerRef.current) {
        try {
          console.log('[PandaVideoPlayer] Destruindo player...');
          // PandaPlayer não tem método destroy documentado, então apenas limpar referência
          playerRef.current = null;
        } catch (err) {
          console.error('[PandaVideoPlayer] Erro ao limpar player:', err);
        }
      }
    };
  }, [videoId, onProgress, onEnded]);

  const handleRetry = () => {
    console.log('[PandaVideoPlayer] Tentando novamente...');
    setLoading(true);
    setError(null);
    setLoadingTime(0);
    
    // Limpar player existente
    playerRef.current = null;
    
    // Recarregar a página para reinicializar o SDK
    window.location.reload();
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
                Inicializando player do PandaVideo...
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
