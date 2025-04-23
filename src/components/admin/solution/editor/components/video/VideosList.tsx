
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface VideoItem {
  id: string;
  name: string;
  url: string;
  type: "youtube" | "upload";
}

interface VideosListProps {
  videos: VideoItem[];
  onRemove: (id: string, url: string) => Promise<void>;
}

const VideosList: React.FC<VideosListProps> = ({ videos, onRemove }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {videos.map((video) => (
        <div key={video.id} className="border rounded-md overflow-hidden">
          <div className="aspect-video bg-black relative">
            {video.type === "youtube" ? (
              <iframe
                src={video.url}
                title={video.name}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video src={video.url} controls className="w-full h-full" />
            )}
          </div>
          <div className="p-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium line-clamp-1">{video.name}</h3>
                <Badge variant="outline" className="mt-1">
                  {video.type === "youtube" ? "YouTube" : "Arquivo"}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(video.id, video.url)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remover</span>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideosList;
