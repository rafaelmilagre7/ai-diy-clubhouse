
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Youtube, Video } from "lucide-react";

interface VideoItem {
  id: string;
  name: string;
  url: string;
  created_at: string;
  metadata?: {
    source?: "youtube" | "upload";
    youtube_id?: string;
    thumbnail_url?: string;
    description?: string;
  };
}

interface VideoGalleryProps {
  videos: VideoItem[];
  onRemove: (id: string, url: string) => Promise<void>;
}

const VideoGallery: React.FC<VideoGalleryProps> = ({ videos, onRemove }) => {
  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(date);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => {
        const isYoutube = video.metadata?.source === "youtube";
        const thumbnailUrl = isYoutube
          ? video.metadata?.thumbnail_url || `https://img.youtube.com/vi/${video.metadata?.youtube_id}/mqdefault.jpg`
          : null;

        return (
          <Card key={video.id} className="overflow-hidden">
            <div className="aspect-video bg-gray-900 relative overflow-hidden">
              {isYoutube ? (
                <img
                  src={thumbnailUrl || ""}
                  alt={video.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <Video className="h-10 w-10 text-white/50" />
                </div>
              )}
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="cursor-pointer bg-black/40 hover:bg-black/60 transition-colors rounded-full p-4"
                  onClick={() => {
                    window.open(video.url, '_blank');
                  }}
                >
                  {isYoutube ? (
                    <Youtube className="h-8 w-8 text-red-500" />
                  ) : (
                    <Video className="h-8 w-8 text-white" />
                  )}
                </div>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium line-clamp-1">{video.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Adicionado em {formatDate(video.created_at)}
                    </p>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
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

                <div className="flex gap-2">
                  <Badge variant="outline" className={isYoutube ? "text-red-500 bg-red-50" : "bg-blue-50 text-blue-500"}>
                    {isYoutube ? "YouTube" : "Arquivo"}
                  </Badge>
                </div>

                {video.metadata?.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {video.metadata.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default VideoGallery;
