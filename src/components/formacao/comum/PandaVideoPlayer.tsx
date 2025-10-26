import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from 'lucide-react';

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
  className,
  onProgress,
  onEnded,
}) => {
  const [showFallback, setShowFallback] = useState(false);
  
  // URL do player - usar URL fornecida ou construir com videoId
  const playerUrl = url || `https://player-vz-d6ebf577-797.tv.pandavideo.com.br/embed/?v=${videoId}`;

  // Listener de mensagens do player para progresso
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes('pandavideo.com') && !event.origin.includes('player-vz')) return;
      
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
        // Ignorar erros de parse silenciosamente
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onProgress, onEnded]);

  const openVideoDirectly = () => {
    window.open(playerUrl, '_blank', 'noopener,noreferrer');
  };

  // Se houver problema, mostrar botão para abrir direto
  if (showFallback) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-0">
          <div 
            className="flex flex-col items-center justify-center bg-muted rounded-lg p-8 aspect-video"
          >
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Clique no botão abaixo para assistir o vídeo em uma nova aba
              </p>
              <Button 
                onClick={openVideoDirectly} 
                variant="default"
                size="lg"
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Assistir Vídeo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`relative w-full aspect-video ${className || ''}`}>
      <iframe
        src={playerUrl}
        title={title}
        width="100%"
        height="100%"
        loading="eager"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        onError={() => setShowFallback(true)}
        className="w-full h-full rounded-md bg-surface-base border-0"
        style={{ border: 'none' }}
      />
    </div>
  );
};
