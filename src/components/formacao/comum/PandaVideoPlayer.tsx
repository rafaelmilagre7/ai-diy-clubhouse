
import { useState } from "react";
import { PandaVideoPlayerEnhanced } from "./PandaVideoPlayerEnhanced";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PandaVideoPlayerProps {
  videoId: string;
  title?: string;
  className?: string;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
  startTime?: number;
  autoplay?: boolean;
}

export const PandaVideoPlayer = ({ 
  videoId, 
  title = "Vídeo",
  className = "",
  onProgress,
  onEnded,
  startTime = 0,
  autoplay = false
}: PandaVideoPlayerProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    toast.error("Erro ao carregar vídeo", {
      description: errorMessage
    });
    console.error("Erro no player Panda Video:", errorMessage);
  };
  
  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10 rounded-lg">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}
      
      <PandaVideoPlayerEnhanced
        videoId={videoId}
        title={title}
        className={className}
        onProgress={onProgress}
        onEnded={onEnded}
        startTime={startTime}
        autoplay={autoplay}
        onReady={() => setLoading(false)}
        onError={handleError}
      />
      
      {error && !loading && (
        <div className="mt-2 p-3 bg-destructive/10 border border-destructive/30 rounded text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
};
