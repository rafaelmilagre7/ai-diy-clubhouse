
import React from "react";
import { VideoItem } from "./VideoItem";
import { VideoFormValues } from "../types/VideoTypes";

interface VideosListProps {
  videos: VideoFormValues[];
  onVideoChange: (index: number, field: string, value: any) => void;
  onEmbedChange: (index: number, embedCode: string, videoId: string, url: string, thumbnailUrl: string) => void;
  onRemoveVideo: (index: number) => void;
}

export const VideosList: React.FC<VideosListProps> = ({
  videos,
  onVideoChange,
  onEmbedChange,
  onRemoveVideo
}) => {
  if (videos.length === 0) {
    return (
      <div className="p-8 border-2 border-dashed rounded-md text-center">
        <p className="text-muted-foreground">
          Nenhum vídeo adicionado. Clique em "Adicionar Vídeo" para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {videos.map((video: VideoFormValues, index) => (
        <div key={`video-${index}`}>
          <VideoItem
            video={video}
            index={index}
            onRemove={() => onRemoveVideo(index)}
            onChange={(field, value) => onVideoChange(index, field, value)}
            onEmbedChange={(embedCode, videoId, url, thumbnailUrl) => 
              onEmbedChange(index, embedCode, videoId, url, thumbnailUrl)
            }
            dragHandleProps={undefined}
          />
        </div>
      ))}
    </div>
  );
};
