
import React from 'react';

interface PandaVideoPlayerProps {
  videoId: string;
  url?: string;
  title?: string;
  width?: string;
  height?: string;
  className?: string;
}

export const PandaVideoPlayer: React.FC<PandaVideoPlayerProps> = ({
  videoId,
  url,
  title = "Vídeo",
  width = "100%",
  height = "100%",
  className,
}) => {
  const [loading, setLoading] = React.useState(true);

  // Determinar a URL baseada no videoId ou usar a URL fornecida diretamente
  const playerUrl = url || `https://player-vz-d6ebf577-797.tv.pandavideo.com.br/embed/?v=${videoId}`;

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
