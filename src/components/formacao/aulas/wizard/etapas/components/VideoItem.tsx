
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical } from "lucide-react";
import { PandaVideoEmbed } from "@/components/formacao/comum/PandaVideoEmbed";
import { VideoFormValues } from "../types/VideoTypes";

interface VideoItemProps {
  video: VideoFormValues;
  index: number;
  onRemove: () => void;
  onChange: (field: string, value: any) => void;
  onEmbedChange: (embedCode: string, videoId: string, url: string, thumbnailUrl: string) => void;
  dragHandleProps: any;
}

export const VideoItem: React.FC<VideoItemProps> = ({
  video,
  index,
  onRemove,
  onChange,
  onEmbedChange,
  dragHandleProps
}) => {
  return (
    <div className="border rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div {...dragHandleProps} className="cursor-grab mr-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="font-medium">Vídeo {index + 1}</span>
        </div>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={onRemove}
        >
          Remover
        </Button>
      </div>
      
      <div className="space-y-4">
        <Input
          placeholder="Título do vídeo"
          value={video.title || ''}
          onChange={(e) => onChange("title", e.target.value)}
          className="mb-2"
        />
        
        <Textarea
          placeholder="Descrição do vídeo"
          value={video.description || ''}
          onChange={(e) => onChange("description", e.target.value)}
          className="mb-2 resize-none h-20"
        />
        
        <PandaVideoEmbed
          value={video.embedCode || ''}
          onChange={(embedCode, videoId, url, thumbnailUrl) => 
            onEmbedChange(embedCode, videoId, url, thumbnailUrl)
          }
        />
        
        {video.thumbnail_url && (
          <div className="mt-2">
            <p className="text-sm font-medium mb-1">Preview:</p>
            <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
              <img 
                src={video.thumbnail_url}
                alt="Thumbnail do vídeo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
        
        {video.video_id && (
          <div className="text-xs text-muted-foreground">
            ID do vídeo: {video.video_id}
          </div>
        )}
      </div>
    </div>
  );
};
