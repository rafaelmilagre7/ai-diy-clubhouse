
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface VideoBlockProps {
  data: {
    url: string;
    caption?: string;
  };
  onChange: (data: any) => void;
}

const VideoBlock: React.FC<VideoBlockProps> = ({ data, onChange }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Implementação de lazy loading para vídeos
  useEffect(() => {
    // Usar Intersection Observer para carregar o vídeo apenas quando visível
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 } // Carregar quando pelo menos 10% do elemento estiver visível
    );

    const videoContainer = document.getElementById("video-preview-container");
    if (videoContainer) {
      observer.observe(videoContainer);
    }

    return () => {
      if (videoContainer) {
        observer.unobserve(videoContainer);
      }
      observer.disconnect();
    };
  }, [data.url]);

  return (
    <div className="space-y-2">
      <Input
        value={data.url}
        onChange={(e) => onChange({ ...data, url: e.target.value })}
        placeholder="URL do vídeo (MP4)"
      />
      <Input
        value={data.caption || ''}
        onChange={(e) => onChange({ ...data, caption: e.target.value })}
        placeholder="Legenda (opcional)"
      />
      {data.url && (
        <div id="video-preview-container" className="mt-2 border rounded p-2">
          <p className="text-xs text-muted-foreground mb-1">Preview:</p>
          {isVisible ? (
            <video 
              src={data.url} 
              controls 
              preload="metadata"
              className="max-h-[200px] w-full"
            />
          ) : (
            <div 
              className="max-h-[200px] w-full bg-gray-100 flex items-center justify-center"
              style={{ aspectRatio: "16/9" }}
            >
              <p className="text-sm text-muted-foreground">Carregando vídeo...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoBlock;
