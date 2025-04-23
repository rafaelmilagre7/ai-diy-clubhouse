
import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { VideoThumbnail } from "./VideoThumbnail";
import { VideoItem } from "@/hooks/solution/useVideosList";

interface VideoGridProps {
  videos: VideoItem[];
  onVideoClick: (video: VideoItem) => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({ videos, onVideoClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video) => (
        <Dialog key={video.id}>
          <DialogTrigger asChild>
            <Card 
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => onVideoClick(video)}
            >
              <CardContent className="p-3">
                <VideoThumbnail video={video} />
                <h3 className="mt-2 font-medium line-clamp-1">{video.name}</h3>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] p-0">
            <div className="aspect-video w-full">
              {video.metadata?.source === "youtube" ? (
                <iframe 
                  src={video.url} 
                  title={video.name}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video 
                  src={video.url} 
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
};
