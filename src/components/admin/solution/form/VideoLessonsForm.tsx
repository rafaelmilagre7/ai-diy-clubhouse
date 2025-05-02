
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Label 
} from "@/components/ui/label";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Save, 
  Loader2, 
  Film, 
  Youtube, 
  Plus, 
  Trash2,
  Link as LinkIcon
} from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface VideoLesson {
  id?: string;
  title: string;
  description: string;
  url: string;
  type: "youtube" | "video";
  solution_id: string;
  module_id?: string | null;
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
  const [videoLessons, setVideoLessons] = useState<VideoLesson[]>([]);
  const [activeTab, setActiveTab] = useState<"youtube" | "upload">("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeTitle, setYoutubeTitle] = useState("");
  const [youtubeDescription, setYoutubeDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingVideos, setSavingVideos] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (solutionId) {
      fetchVideoLessons();
    } else {
      setLoading(false);
    }
  }, [solutionId]);

  const fetchVideoLessons = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("solution_resources")
        .select("*")
        .eq("solution_id", solutionId)
        .eq("type", "video")
        .is("module_id", null); // apenas vídeos da solução, não de módulos específicos
        
      if (error) throw error;
      
      if (data) {
        // Convert database records to VideoLesson type with proper type checking
        const lessons = data.map(item => {
          // Determine the correct video type
          const videoType: "youtube" | "video" = 
            item.url.includes("youtube") || item.url.includes("youtu.be") 
              ? "youtube" 
              : "video";
              
          return {
            id: item.id,
            title: item.name,
            description: item.format || "",
            url: item.url,
            type: videoType,
            solution_id: item.solution_id
          } as VideoLesson;
        });
        
        setVideoLessons(lessons);
      }
    } catch (error) {
      console.error("Erro ao carregar vídeo-aulas:", error);
      toast({
        title: "Erro ao carregar vídeo-aulas",
        description: "Não foi possível carregar a lista de vídeo-aulas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = async (url: string, fileName: string) => {
    if (!solutionId) return;
    
    try {
      // Verificar se a URL é válida
      if (!url || typeof url !== 'string') {
        console.error("URL de vídeo inválida:", url);
        toast({
          title: "Erro ao adicionar vídeo",
          description: "A URL do vídeo é inválida.",
          variant: "destructive",
        });
        return;
      }
      
      const newVideo = {
        solution_id: solutionId,
        name: fileName || "Vídeo sem título",
        url,
        type: "video",
        format: "Vídeo MP4"
      };
      
      console.log("Adicionando novo vídeo:", newVideo);
      
      const { data, error } = await supabase
        .from("solution_resources")
        .insert(newVideo)
        .select()
        .single();
        
      if (error) {
        console.error("Erro ao adicionar vídeo na base de dados:", error);
        throw error;
      }
      
      if (data) {
        const videoLesson: VideoLesson = {
          id: data.id,
          title: data.name,
          description: data.format || "",
          url: data.url,
          type: "video" as const,
          solution_id: data.solution_id
        };
        
        setVideoLessons(prev => [...prev, videoLesson]);
      }
      
      toast({
        title: "Vídeo adicionado",
        description: "O vídeo foi adicionado com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao adicionar vídeo:", error);
      toast({
        title: "Erro ao adicionar vídeo",
        description: error.message || "Ocorreu um erro ao tentar adicionar o vídeo.",
        variant: "destructive",
      });
    }
  };

  const handleAddYouTubeVideo = async () => {
    if (!solutionId || !youtubeUrl.trim()) return;
    
    try {
      let videoId = "";
      
      // Extrair o ID do vídeo do YouTube da URL
      if (youtubeUrl.includes("youtube.com/watch")) {
        videoId = new URL(youtubeUrl).searchParams.get("v") || "";
      } else if (youtubeUrl.includes("youtu.be/")) {
        videoId = youtubeUrl.split("youtu.be/")[1]?.split("?")[0] || "";
      } else if (youtubeUrl.includes("youtube.com/embed/")) {
        videoId = youtubeUrl.split("youtube.com/embed/")[1]?.split("?")[0] || "";
      }
      
      if (!videoId) {
        toast({
          title: "URL inválida",
          description: "Por favor, insira uma URL válida do YouTube.",
          variant: "destructive",
        });
        return;
      }
      
      // Criar a URL de incorporação
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      
      const newVideo = {
        solution_id: solutionId,
        name: youtubeTitle || `Vídeo do YouTube (${videoId})`,
        url: embedUrl,
        type: "video",
        format: youtubeDescription || "Vídeo do YouTube"
      };
      
      const { data, error } = await supabase
        .from("solution_resources")
        .insert(newVideo)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        const videoLesson: VideoLesson = {
          id: data.id,
          title: data.name,
          description: data.format || "",
          url: data.url,
          type: "youtube" as const,
          solution_id: data.solution_id
        };
        
        setVideoLessons(prev => [...prev, videoLesson]);
        
        // Limpar os campos
        setYoutubeUrl("");
        setYoutubeTitle("");
        setYoutubeDescription("");
      }
      
      toast({
        title: "Vídeo adicionado",
        description: "O vídeo do YouTube foi adicionado com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao adicionar vídeo do YouTube:", error);
      toast({
        title: "Erro ao adicionar vídeo",
        description: error.message || "Ocorreu um erro ao tentar adicionar o vídeo do YouTube.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveVideo = async (id?: string, url?: string) => {
    if (!id) return;
    
    try {
      // Se for um vídeo carregado (não do YouTube), remover do storage
      if (url && !url.includes("youtube") && !url.includes("youtu.be")) {
        const filePath = url.split("/").pop();
        if (filePath) {
          await supabase.storage
            .from("solution_files")
            .remove([`videos/${filePath}`]);
        }
      }
      
      // Remover o registro do banco de dados
      const { error } = await supabase
        .from("solution_resources")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      setVideoLessons(prev => prev.filter(video => video.id !== id));
      
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

  const saveAndContinue = async () => {
    if (!solutionId) return;
    
    try {
      setSavingVideos(true);
      
      // Aqui podemos adicionar validações adicionais se necessário
      
      // Chamar a função de salvamento da solução
      onSave();
      
      toast({
        title: "Vídeos salvos",
        description: "As vídeo-aulas foram salvas com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao salvar vídeos:", error);
      toast({
        title: "Erro ao salvar vídeos",
        description: error.message || "Ocorreu um erro ao tentar salvar as vídeo-aulas.",
        variant: "destructive",
      });
    } finally {
      setSavingVideos(false);
    }
  };

  // Extrair ID do vídeo do YouTube para o preview
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return "";
    
    try {
      let videoId = "";
      
      if (url.includes("youtube.com/embed/")) {
        return url; // Já é uma URL de incorporação
      } else if (url.includes("youtube.com/watch")) {
        videoId = new URL(url).searchParams.get("v") || "";
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
      }
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
      
      return "";
    } catch (error) {
      console.error("Erro ao extrair ID do vídeo:", error);
      return "";
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
      <div>
        <h3 className="text-lg font-medium">Vídeo-aulas</h3>
        <p className="text-sm text-muted-foreground">
          Adicione vídeos que mostram como implementar a solução passo a passo.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "youtube" | "upload")}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="youtube" className="flex items-center gap-2">
            <Youtube className="h-4 w-4" />
            <span>YouTube</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Film className="h-4 w-4" />
            <span>Upload de Vídeo</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="youtube" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="youtube-url">URL do Vídeo no YouTube</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="youtube-url"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="pl-10"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddYouTubeVideo}
                      disabled={!youtubeUrl.trim()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="youtube-title">Título do Vídeo (opcional)</Label>
                  <Input
                    id="youtube-title"
                    value={youtubeTitle}
                    onChange={(e) => setYoutubeTitle(e.target.value)}
                    placeholder="Ex: Como configurar a API OpenAI"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="youtube-description">Descrição (opcional)</Label>
                  <Textarea
                    id="youtube-description"
                    value={youtubeDescription}
                    onChange={(e) => setYoutubeDescription(e.target.value)}
                    placeholder="Breve descrição do conteúdo do vídeo..."
                    rows={3}
                  />
                </div>
                
                {youtubeUrl && getYouTubeEmbedUrl(youtubeUrl) && (
                  <div className="mt-4 border rounded-md overflow-hidden">
                    <p className="text-xs text-muted-foreground p-2 bg-gray-50 border-b">Preview:</p>
                    <div className="relative pb-[56.25%] h-0">
                      <iframe
                        src={getYouTubeEmbedUrl(youtubeUrl)}
                        className="absolute top-0 left-0 w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <FileUpload
                bucketName="solution_files"
                folder="videos"
                onUploadComplete={handleUploadComplete}
                accept=".mp4,.webm,.ogg,.mov"
                buttonText="Upload de Vídeo"
                fieldLabel="Selecione um vídeo (tamanho máximo: 200MB)"
                maxSize={200} // 200MB
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Lista de vídeos */}
      {videoLessons.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-base font-medium mb-4">Vídeos Adicionados</h3>
            <div className="space-y-4">
              {videoLessons.map((video) => (
                <div key={video.id} className="border rounded-md overflow-hidden">
                  <div className="p-3 bg-gray-50 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {video.type === "youtube" ? (
                        <Youtube className="h-4 w-4 text-red-600" />
                      ) : (
                        <Film className="h-4 w-4 text-blue-600" />
                      )}
                      <span className="font-medium">{video.title}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveVideo(video.id, video.url)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="relative pb-[56.25%] h-0">
                    {video.type === "youtube" ? (
                      <iframe
                        src={video.url}
                        className="absolute top-0 left-0 w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={video.url}
                        className="absolute top-0 left-0 w-full h-full"
                        controls
                      />
                    )}
                  </div>
                  
                  {video.description && (
                    <div className="p-3 text-sm">{video.description}</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
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
            Salvar e Continuar
          </>
        )}
      </Button>
    </div>
  );
};

export default VideoLessonsForm;
