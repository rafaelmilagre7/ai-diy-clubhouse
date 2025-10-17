
import React from "react";
import { VideoBlockData } from "@/components/admin/solution/editor/BlockTypes";

interface VideoBlockProps {
  data: VideoBlockData;
  onVideoInteraction?: () => void;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({ data, onVideoInteraction }) => {
  const { url, caption } = data;
  
  if (!url) {
    return null;
  }
  
  const handleVideoInteraction = () => {
    if (onVideoInteraction) {
      onVideoInteraction();
    }
  };
  
  return (
    <figure className="my-6">
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <iframe 
          src={url} 
          className="absolute top-0 left-0 w-full h-full border-0"
          allowFullScreen
          title={caption || "Vídeo da aula"}
          onClick={handleVideoInteraction}
          onPlay={handleVideoInteraction}
        />
      </div>
      {caption && (
        <figcaption className="text-sm text-center text-muted-foreground mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
