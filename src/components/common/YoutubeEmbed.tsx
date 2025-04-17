
import React from "react";

interface YoutubeEmbedProps {
  youtubeId: string;
  title?: string;
  className?: string;
}

export const YoutubeEmbed: React.FC<YoutubeEmbedProps> = ({ youtubeId, title, className }) => {
  const embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
  
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
