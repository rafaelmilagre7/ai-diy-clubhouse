
import React from "react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { VideoItem } from "./VideoItem";
import { VideoFormValues } from "../types/VideoTypes";

interface VideosListProps {
  videos: VideoFormValues[];
  onDragEnd: (result: any) => void;
  onVideoChange: (index: number, field: string, value: any) => void;
  onEmbedChange: (index: number, embedCode: string, videoId: string, url: string, thumbnailUrl: string) => void;
  onRemoveVideo: (index: number) => void;
}

export const VideosList: React.FC<VideosListProps> = ({
  videos,
  onDragEnd,
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
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="videos">
        {(provided) => (
          <div 
            {...provided.droppableProps} 
            ref={provided.innerRef} 
            className="space-y-4"
          >
            {videos.map((video: VideoFormValues, index) => (
              <Draggable 
                key={`video-${index}`} 
                draggableId={`video-${index}`} 
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <VideoItem
                      video={video}
                      index={index}
                      onRemove={() => onRemoveVideo(index)}
                      onChange={(field, value) => onVideoChange(index, field, value)}
                      onEmbedChange={(embedCode, videoId, url, thumbnailUrl) => 
                        onEmbedChange(index, embedCode, videoId, url, thumbnailUrl)
                      }
                      dragHandleProps={provided.dragHandleProps}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
