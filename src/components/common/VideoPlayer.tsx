
import React, { useState } from "react";
import ReactPlayer from "react-player";
import { useVideoPlayer } from "@/hooks/implementation/useVideoPlayer";
import { useLogging } from "@/hooks/useLogging";

interface VideoPlayerProps {
  url: string;
  title?: string;
  type?: string;
  width?: string;
  height?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onProgress?: (state: { played: number; playedSeconds: number }) => void;
  onEnded?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  title,
  type = "youtube",
  width = "100%",
  height = "100%",
  onPlay,
  onPause,
  onProgress,
  onEnded
}) => {
  const videoId = url.split("/").pop() || "";
  const { log, logError } = useLogging("VideoPlayer");
  const [error, setError] = useState<string | null>(null);
  
  const {
    playing,
    handlePlay,
    handlePause,
    handleProgress,
    handleDuration,
    handleEnded,
    handleReady
  } = useVideoPlayer({ videoId });
  
  const handleError = (e: any) => {
    logError("Erro ao carregar vídeo", { error: e, url });
    console.error("Erro ao carregar vídeo:", e);
    setError("Não foi possível carregar o vídeo. Verifique a URL ou tente novamente mais tarde.");
  };

  // Determina a URL correta com base no tipo de vídeo
  const getProcessedUrl = () => {
    if (!url) return "";
    
    try {
      // Converte URLs de compartilhamento do YouTube para formato de incorporação se necessário
      if (type === "youtube" && url.includes("youtu.be")) {
        const videoId = url.split("/").pop()?.split("?")[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }

      // Converte URLs do YouTube para formato de incorporação se necessário
      if (type === "youtube" && url.includes("youtube.com/watch")) {
        const videoId = new URL(url).searchParams.get("v");
        return `https://www.youtube.com/embed/${videoId}`;
      }
      
      // Processa URLs do Vimeo
      if (type === "vimeo" && !url.includes("player.vimeo.com")) {
        const vimeoId = url.split("/").pop();
        return `https://player.vimeo.com/video/${vimeoId}`;
      }

      return url;
    } catch (e) {
      logError("Erro ao processar URL do vídeo", { error: e, url });
      return url;
    }
  };

  // Log ao renderizar o componente
  React.useEffect(() => {
    log("VideoPlayer renderizado", { url, type });
    
    // Limpa erro quando a URL muda
    setError(null);
  }, [url, type, log]);

  const processedUrl = getProcessedUrl();
  
  if (error) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg w-full h-full min-h-[240px] p-6">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <p className="text-sm text-gray-500 mt-2">URL: {url}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <ReactPlayer
        url={processedUrl}
        width={width}
        height={height}
        controls={true}
        playing={playing}
        onPlay={() => {
          handlePlay();
          onPlay?.();
        }}
        onPause={() => {
          handlePause();
          onPause?.();
        }}
        onProgress={(state) => {
          handleProgress(state);
          onProgress?.(state);
        }}
        onDuration={handleDuration}
        onEnded={() => {
          handleEnded();
          onEnded?.();
        }}
        onReady={handleReady}
        onError={handleError}
        config={{
          youtube: {
            playerVars: {
              rel: 0,
              modestbranding: 1,
              enablejsapi: 1
            }
          },
          vimeo: {
            playerOptions: {
              title: false,
              byline: false,
              portrait: false
            }
          }
        }}
        style={{
          width: "100%",
          height: "100%"
        }}
      />
    </div>
  );
};

export default VideoPlayer;
