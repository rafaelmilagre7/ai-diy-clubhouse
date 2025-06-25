
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { Save, Loader2, Play, Trash2, Plus, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface VideoResource {
  id?: string;
  name: string;
  description?: string;
  url: string;
  thumbnail?: string;
  metadata?: any;
}

interface VideoLessonsFormProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

const VideoLessonsForm: React.FC<VideoLessonsFormProps> = ({
  solutionId,
  onSave,
  saving
}) => {
  const [videos, setVideos] = useState<VideoResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingVideos, setSavingVideos] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (solutionId) {
      fetchVideos();
    } else {
      setLoading(false);
    }
  }, [solutionId]);

  const fetchVideos = async () => {
    if (!solutionId) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("solution_resources")
        .select("*")
        .eq("solution_id", solutionId as any)
        .eq("type", "video" as any)
        .order("created_at");
        
      if (error) throw error;
      
      if (data) {
        const videoResources = (data as any[]).map((item: any) => {
          const videoUrl = item.url;
          const isYoutube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
          const metadata = item.metadata ? JSON.parse(item.metadata) : {};
          
          return {
            id: item.id,
            name: item.name,
            description: item.format,
            url: videoUrl,
            thumbnail: isYoutube ? `https://img.youtube.com/vi/${getYouTubeVideoId(videoUrl)}/maxresdefault.jpg` : undefined,
            metadata: metadata
          };
        });
        
        setVideos(videoResources);
      }
    } catch (error: any) {
      console.error("Erro ao carregar vídeos:", error);
      toast({
        title: "Erro ao carregar vídeos",
        description: error.message || "Ocorreu um erro ao tentar carregar os vídeos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeVideoId = (url: string) => {
    let videoId = "";
    
    if (url.includes("youtube.com/watch")) {
      videoId = new URL(url).searchParams.get("v") || "";
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
    } else if (url.includes("youtube.com/embed/")) {
      videoId = url.split("youtube.com/embed/")[1]?.split("?")[0] || "";
    }
    
    return videoId;
  };

  const addYouTubeVideo = async () => {
    if (!solutionId || !youtubeUrl.trim()) return;
    
    try {
      const videoId = getYouTubeVideoId(youtubeUrl);
      
      if (!videoId) {
        toast({
          title: "URL inválido",
          description: "Por favor, insira um URL válido do YouTube.",
          variant: "destructive",
        });
        return;
      }
      
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      
      const metadata = {
        title: `Vídeo do YouTube (${videoId})`,
        description: "Vídeo educacional do YouTube",
        url: embedUrl,
        type: "video",
        format: "YouTube",
        tags: ["youtube", "video", "educacao"],
        order: videos.length,
        downloads: 0,
        size: 0,
        version: "1.0",
        thumbnail: thumbnailUrl
      };
      
      const newResource = {
        solution_id: solutionId,
        name: `Vídeo do YouTube (${videoId})`,
        url: embedUrl,
        type: "video",
        format: "YouTube",
        metadata: JSON.stringify(metadata),
        size: 0
      };
      
      const { data, error } = await supabase
        .from("solution_resources")
        .insert(newResource as any)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        const newVideo: VideoResource = {
          id: (data as any).id,
          name: (data as any).name,
          description: (data as any).format,
          url: (data as any).url,
          thumbnail: thumbnailUrl,
          metadata: metadata
        };
        
        setVideos([...videos, newVideo]);
        setYoutubeUrl("");
        
        toast({
          title: "Vídeo adicionado",
          description: "O vídeo do YouTube foi adicionado com sucesso.",
        });
      }
    } catch (error: any) {
      console.error("Erro ao adicionar vídeo:", error);
      toast({
        title: "Erro ao adicionar vídeo",
        description: error.message || "Ocorreu um erro ao tentar adicionar o vídeo.",
        variant: "destructive",
      });
    }
  };

  const removeVideo = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from("solution_resources")
        .delete()
        .eq("id", videoId as any);
        
      if (error) throw error;
      
      setVideos(videos.filter(video => video.id !== videoId));
      
      toast({
        title: "Vídeo removido",
        description: "O vídeo foi removido com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao remover vídeo:", error);
      toast({
        title: "Erro ao remover vídeo",
        description: error.message || "Ocorreu um erro ao tentar remover o vídeo.",
        variant: "destructive",
      });
    }
  };

  const handleVideoUpload = async (url: string, fileName: string, fileSize: number) => {
    if (!solutionId) return;
    
    try {
      const metadata = {
        title: fileName,
        description: "Vídeo enviado diretamente",
        url: url,
        type: "video",
        format: "MP4",
        tags: ["video", "upload"],
        order: videos.length,
        downloads: 0,
        size: fileSize,
        version: "1.0"
      };
      
      const newResource = {
        solution_id: solutionId,
        name: fileName,
        url: url,
        type: "video",
        format: "MP4",
        metadata: JSON.stringify(metadata),
        size: fileSize
      };
      
      const { data, error } = await supabase
        .from("solution_resources")
        .insert(newResource as any)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        const newVideo: VideoResource = {
          id: (data as any).id,
          name: (data as any).name,
          description: (data as any).format,
          url: (data as any).url,
          metadata: metadata
        };
        
        setVideos([...videos, newVideo]);
        
        toast({
          title: "Vídeo enviado",
          description: "O vídeo foi enviado com sucesso.",
        });
      }
    } catch (error: any) {
      console.error("Erro ao enviar vídeo:", error);
      toast({
        title: "Erro ao enviar vídeo",
        description: error.message || "Ocorreu um erro ao tentar enviar o vídeo.",
        variant: "destructive",
      });
    }
  };

  const saveAndContinue = async () => {
    try {
      setSavingVideos(true);
      onSave();
      
      toast({
        title: "Vídeos salvos",
        description: "Os vídeos foram salvos com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao salvar vídeos:", error);
      toast({
        title: "Erro ao salvar vídeos",
        description: error.message || "Ocorreu um erro ao tentar salvar os vídeos.",
        variant: "destructive",
      });
    } finally {
      setSavingVideos(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border border-[#0ABAB5]/20">
        <CardHeader>
          <CardTitle>Vídeos Educacionais</CardTitle>
          <CardDescription>
            Adicione vídeos do YouTube ou faça upload de arquivos de vídeo para enriquecer o conteúdo da solução.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* YouTube URL Input */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Adicionar vídeo do YouTube</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={addYouTubeVideo} disabled={!youtubeUrl.trim()}>
                <Youtube className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Upload de arquivo de vídeo</Label>
            <FileUpload 
              bucketName="solution_files" 
              folder="videos" 
              onUploadComplete={handleVideoUpload} 
              accept="video/*" 
              maxSize={100} 
              buttonText="Upload de Vídeo" 
              fieldLabel="Selecione um arquivo de vídeo (até 100MB)" 
            />
          </div>

          {/* Video List */}
          {videos.length > 0 && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Vídeos adicionados</Label>
              <div className="grid gap-4">
                {videos.map((video) => (
                  <div key={video.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    {video.thumbnail ? (
                      <img 
                        src={video.thumbnail} 
                        alt={video.name} 
                        className="w-20 h-12 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <Play className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h4 className="font-medium">{video.name}</h4>
                      <p className="text-sm text-muted-foreground">{video.description}</p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => video.id && removeVideo(video.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Button 
        onClick={saveAndContinue}
        disabled={savingVideos || saving}
        className="w-full bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
      >
        {savingVideos ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Salvar Vídeos
          </>
        )}
      </Button>
    </div>
  );
};

export default VideoLessonsForm;
