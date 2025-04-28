
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useLessonVideos } from "@/hooks/learning/useLessonVideos";
import { toast } from "sonner";
import { FileUpload } from "@/components/ui/file-upload";
import { LessonVideo } from "@/types/learningTypes";
import { Loader2, Plus, Trash, Video } from "lucide-react";

interface LessonVideoUploaderProps {
  lessonId: string;
}

export function LessonVideoUploader({ lessonId }: LessonVideoUploaderProps) {
  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  const { 
    videos, 
    isLoading, 
    addVideo,
    removeVideo,
    isUpdating
  } = useLessonVideos(lessonId);
  
  const resetForm = () => {
    setVideoUrl("");
    setTitle("");
    setDescription("");
    setThumbnailUrl("");
  };
  
  const handleAddVideo = async () => {
    if (!title || !videoUrl) {
      toast.error("Título e URL do vídeo são obrigatórios");
      return;
    }
    
    try {
      setIsAdding(true);
      
      await addVideo({
        lesson_id: lessonId,
        title,
        description,
        url: videoUrl,
        thumbnail_url: thumbnailUrl,
        order_index: videos ? videos.length : 0,
      });
      
      resetForm();
      toast.success("Vídeo adicionado com sucesso");
    } catch (error) {
      toast.error("Erro ao adicionar vídeo");
    } finally {
      setIsAdding(false);
    }
  };
  
  const handleRemoveVideo = async (videoId: string) => {
    try {
      await removeVideo(videoId);
      toast.success("Vídeo removido com sucesso");
    } catch (error) {
      toast.error("Erro ao remover vídeo");
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <h3 className="text-lg font-medium">Vídeos da Aula</h3>
        
        {videos && videos.length > 0 ? (
          <div className="grid gap-4">
            {videos.map((video: LessonVideo) => (
              <Card key={video.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="relative flex-shrink-0">
                        {video.thumbnail_url ? (
                          <img 
                            src={video.thumbnail_url} 
                            alt={video.title} 
                            className="h-16 w-28 object-cover rounded-md"
                          />
                        ) : (
                          <div className="h-16 w-28 bg-muted flex items-center justify-center rounded-md">
                            <Video className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{video.title}</h4>
                        {video.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {video.description}
                          </p>
                        )}
                        <a 
                          href={video.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                        >
                          Ver vídeo
                        </a>
                      </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleRemoveVideo(video.id)}
                      disabled={isUpdating}
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border rounded-md">
            <p className="text-muted-foreground mb-2">
              Esta aula ainda não tem vídeos.
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-muted/30 p-4 rounded-md border">
        <h4 className="font-medium mb-4">Adicionar Novo Vídeo</h4>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-title">Título do Vídeo</Label>
            <Input
              id="video-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do vídeo"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="video-url">URL do Vídeo</Label>
            <Input
              id="video-url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="text-xs text-muted-foreground">
              Aceita links do YouTube, Vimeo, ou qualquer plataforma de hospedagem de vídeo
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="video-description">Descrição (opcional)</Label>
            <Textarea
              id="video-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Digite uma descrição para o vídeo"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Miniatura (opcional)</Label>
            <FileUpload
              bucketName="learning_assets"
              folder={`lessons/${lessonId}/thumbnails`}
              onUploadComplete={setThumbnailUrl}
              accept="image/*"
              maxSize={2}
              buttonText="Fazer upload de miniatura"
              fieldLabel="Selecione uma imagem"
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleAddVideo} 
              disabled={!title || !videoUrl || isAdding}
            >
              {isAdding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adicionando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Vídeo
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
