
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface PandaVideoPlayerProps {
  videoId: string;
  title?: string;
  className?: string;
}

export const PandaVideoPlayer = ({ 
  videoId, 
  title = "Vídeo",
  className = ""
}: PandaVideoPlayerProps) => {
  const [loading, setLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden rounded-md ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      <div className={`aspect-video ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
        <iframe 
          src={`https://player.pandavideo.com.br/embed/?v=${videoId}`}
          title={title}
          onLoad={() => setLoading(false)}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allowFullScreen
        />
      </div>
    </div>
  );
};
