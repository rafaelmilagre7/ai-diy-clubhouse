
import { useState } from "react";
import { PandaVideoPlayerEnhanced } from "./PandaVideoPlayerEnhanced";
import { Loader2 } from "lucide-react";

interface PandaVideoPlayerProps {
  videoId: string;
  title?: string;
  className?: string;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
}

export const PandaVideoPlayer = ({ 
  videoId, 
  title = "Vídeo",
  className = "",
  onProgress,
  onEnded
}: PandaVideoPlayerProps) => {
  const [loading, setLoading] = useState(true);
  
  return (
    <PandaVideoPlayerEnhanced
      videoId={videoId}
      title={title}
      className={className}
      onProgress={onProgress}
      onEnded={onEnded}
    />
  );
};
