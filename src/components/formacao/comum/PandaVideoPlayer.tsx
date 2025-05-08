
import React from 'react';

interface PandaVideoPlayerProps {
  videoId: string;
  url?: string;
  title?: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
}

export const PandaVideoPlayer: React.FC<PandaVideoPlayerProps> = ({
  videoId,
  url,
  title,
  className = '',
  width = '100%',
  height = '100%',
  onProgress,
  onEnded
}) => {
  // Se houver uma URL definida, usá-la; caso contrário, construir com base no ID
  const videoUrl = url || `https://player-vz-d6ebf577-797.tv.pandavideo.com.br/embed/?v=${videoId}`;
  
  return (
    <div className={`aspect-video ${className}`}>
      <iframe 
        id={`panda-${videoId}`}
        src={videoUrl}
        title={title || `Vídeo ${videoId}`}
        allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture"
        allowFullScreen
        style={{ 
          border: 'none',
          width: width,
          height: height
        }}
        width={width}
        height={height}
        // Removido o fetchPriority que estava causando erro
      />
    </div>
  );
};

export default PandaVideoPlayer;
