
import React from "react";

interface YoutubeEmbedProps {
  youtubeId: string;
  title?: string;
  className?: string;
}

export const YoutubeEmbed: React.FC<YoutubeEmbedProps> = ({ youtubeId, title, className }) => {
  // Garantir que o ID do YouTube é válido e limpo
  const cleanYoutubeId = youtubeId.split('?')[0].split('/').pop() || youtubeId;
  const embedUrl = `https://www.youtube.com/embed/${cleanYoutubeId}`;
  
  return (
    <div className={`aspect-video rounded-md overflow-hidden shadow-sm ${className || ''}`}>
      <iframe 
        src={embedUrl}
        title={title || "YouTube video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
        loading="lazy"
      />
    </div>
  );
};
