
import React, { useState } from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileVideo, Youtube, Trash2, PlayCircle, ExternalLink } from "lucide-react";

interface Video {
  id: string;
  name: string;
  url: string;
  type?: string;
  metadata?: {
    source?: "youtube" | "upload";
    youtube_id?: string;
    thumbnail_url?: string;
    description?: string;
  };
}

interface VideosListProps {
  videos: Video[];
  onRemove: (id: string, url: string) => Promise<void>;
}

const VideosList: React.FC<VideosListProps> = ({ videos, onRemove }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<{ id: string; name: string; url: string } | null>(null);

  const handleDelete = (video: Video) => {
    setVideoToDelete({
      id: video.id,
      name: video.name,
      url: video.url
    });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (videoToDelete) {
      await onRemove(videoToDelete.id, videoToDelete.url);
      setDeleteDialogOpen(false);
      setVideoToDelete(null);
    }
  };

  const getVideoThumbnail = (video: Video) => {
    if (video.metadata?.source === "youtube" && video.metadata?.youtube_id) {
      return `https://img.youtube.com/vi/${video.metadata.youtube_id}/mqdefault.jpg`;
    }
    return "https://placehold.co/320x180/e6f7ff/0abab5?text=Vídeo";
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative aspect-video bg-gray-100">
              <img
                src={getVideoThumbnail(video)}
                alt={video.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/90 rounded-full"
                >
                  <PlayCircle className="h-10 w-10 text-[#0ABAB5]" />
                </a>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <span className={`flex items-center gap-1 py-1 px-2 rounded-full text-xs ${
                  video.metadata?.source === "youtube" 
                    ? "bg-red-100 text-red-700" 
                    : "bg-blue-100 text-blue-700"
                }`}>
                  {video.metadata?.source === "youtube" ? (
                    <Youtube className="h-3 w-3" />
                  ) : (
                    <FileVideo className="h-3 w-3" />
                  )}
                  <span>{video.metadata?.source === "youtube" ? "YouTube" : "Arquivo"}</span>
                </span>
              </div>
            </div>
            <CardContent className="pt-4">
              <h3 className="font-medium text-base line-clamp-2 mb-1" title={video.name}>{video.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3" title={video.metadata?.description || ""}>
                {video.metadata?.description || "Sem descrição"}
              </p>
              <div className="flex justify-between items-center">
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#0ABAB5] hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Ver vídeo
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(video)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover vídeo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o vídeo "{videoToDelete?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VideosList;
