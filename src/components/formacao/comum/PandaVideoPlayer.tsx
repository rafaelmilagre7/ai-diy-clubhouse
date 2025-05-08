
import React from "react";

interface PandaVideoPlayerProps {
  videoId: string;
  title?: string;
}

export const PandaVideoPlayer: React.FC<PandaVideoPlayerProps> = ({ videoId, title }) => {
  // Construir URL do iframe para o Panda Video
  const embedUrl = `https://player.pandavideo.com.br/embed/?v=${videoId}`;
  
  return (
    <div className="aspect-video rounded-md overflow-hidden">
      <iframe
        src={embedUrl}
        title={title || "Vídeo"}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        className="w-full h-full border-0"
      />
    </div>
  );
};
