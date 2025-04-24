
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Video, Youtube } from "lucide-react";
import { VideoItem } from "@/types/videoTypes";
import Image from "./Image";

interface VideosListProps {
  videos: VideoItem[];
  onRemove: (id: string, url: string) => void;
}

const VideosList: React.FC<VideosListProps> = ({ videos, onRemove }) => {
  // Função para extrair o tipo adequado do vídeo
  const getVideoType = (video: VideoItem) => {
    if (video.metadata?.source === "youtube" || video.url.includes("youtube")) {
      return "youtube";
    }
    return "upload";
  };
  
  // Função para obter a thumbnail do vídeo
  const getVideoThumbnail = (video: VideoItem) => {
    if (video.metadata?.thumbnail_url) {
      return video.metadata.thumbnail_url;
    }
    
    if (video.metadata?.youtube_id) {
      return `https://img.youtube.com/vi/${video.metadata.youtube_id}/mqdefault.jpg`;
    }
    
    // Extrair ID do YouTube da URL
    if (video.url.includes("youtube.com/embed/")) {
      const youtubeId = video.url.split("youtube.com/embed/")[1]?.split('?')[0];
      if (youtubeId) {
        return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
      }
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm mb-4">
        {videos.length} {videos.length === 1 ? 'vídeo encontrado' : 'vídeos encontrados'}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.map((video) => {
          const videoType = getVideoType(video);
          const thumbnailUrl = getVideoThumbnail(video);
          
          return (
            <div 
              key={video.id} 
              className="border rounded-lg overflow-hidden shadow-sm bg-white hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-gray-100 relative">
                {thumbnailUrl ? (
                  <img 
                    src={thumbnailUrl}
                    alt={video.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Video className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                  {videoType === "youtube" ? (
                    <>
                      <Youtube className="h-3 w-3" />
                      YouTube
                    </>
                  ) : (
                    <>
                      <Video className="h-3 w-3" />
                      Upload
                    </>
                  )}
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 truncate">{video.name}</h4>
                    {video.metadata?.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {video.metadata.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remover
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover vídeo</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover este vídeo? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() => onRemove(video.id, video.url)}
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VideosList;
