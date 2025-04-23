import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Video, 
  Upload, 
  Loader2, 
  FilePlus,
  X,
  Link as LinkIcon,
  AlertCircle,
  Youtube
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { v4 as uuidv4 } from "uuid";
import { Badge } from "@/components/ui/badge";

interface VideosTabProps {
  solution: any;
  currentValues: any;
  onSubmit: (values: any) => Promise<void>;
  saving: boolean;
}

interface VideoItem {
  id: string;
  name: string;
  url: string;
  type: "youtube" | "upload";
  solution_id?: string;
  metadata?: any;
  created_at?: string;
}

const VideosTab: React.FC<VideosTabProps> = ({
  solution,
  currentValues,
  onSubmit,
  saving
}) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [addYouTubeOpen, setAddYouTubeOpen] = useState(false);
  const [youtubeData, setYoutubeData] = useState({
    name: "",
    url: "",
    description: ""
  });
  const { toast } = useToast();

  // Função para extrair ID do YouTube de uma URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Função para validar URL do YouTube
  const isValidYouTubeUrl = (url: string) => {
    return !!getYouTubeId(url);
  };

  // Carregar vídeos da solução
  useEffect(() => {
    const fetchVideos = async () => {
      if (!solution?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("solution_id", solution.id)
          .eq("type", "video")
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        
        setVideos(data?.map(video => ({
          ...video,
          type: video.metadata?.source === "youtube" ? "youtube" : "upload"
        })) || []);
      } catch (error) {
        console.error("Erro ao carregar vídeos:", error);
        toast({
          title: "Erro ao carregar vídeos",
          description: "Não foi possível carregar os vídeos desta solução.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideos();
  }, [solution?.id, toast]);

  // Função para adicionar vídeo do YouTube
  const handleAddYouTube = async () => {
    if (!solution?.id) {
      toast({
        title: "Erro",
        description: "É necessário salvar as informações básicas antes de adicionar vídeos.",
        variant: "destructive"
      });
      return;
    }

    if (!youtubeData.name || !youtubeData.url) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e URL são campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (!isValidYouTubeUrl(youtubeData.url)) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida do YouTube.",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      
      const youtubeId = getYouTubeId(youtubeData.url);
      const embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
      const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
      
      const newVideo = {
        solution_id: solution.id,
        name: youtubeData.name,
        type: "video",
        url: embedUrl,
        metadata: {
          title: youtubeData.name,
          description: youtubeData.description,
          url: embedUrl,
          type: "video",
          source: "youtube",
          youtube_id: youtubeId,
          thumbnail_url: thumbnailUrl
        }
      };
      
      const { data, error } = await supabase
        .from("solution_resources")
        .insert(newVideo)
        .select();
        
      if (error) throw error;
      
      setVideos(prev => [{
        ...data[0],
        type: "youtube"
      }, ...prev]);
      setAddYouTubeOpen(false);
      setYoutubeData({ name: "", url: "", description: "" });
      
      toast({
        title: "Vídeo adicionado",
        description: "O vídeo do YouTube foi adicionado com sucesso."
      });
    } catch (error) {
      console.error("Erro ao adicionar vídeo:", error);
      toast({
        title: "Erro ao adicionar vídeo",
        description: "Ocorreu um erro ao tentar adicionar o vídeo.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  // Função para fazer upload de vídeo
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!solution?.id) {
      toast({
        title: "Erro",
        description: "É necessário salvar as informações básicas antes de adicionar vídeos.",
        variant: "destructive"
      });
      return;
    }

    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Verificar tipos de arquivos (apenas vídeos)
    const videoFile = files[0];
    if (!videoFile.type.startsWith("video/")) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas arquivos de vídeo.",
        variant: "destructive"
      });
      return;
    }

    // Verificar tamanho do arquivo (100MB máximo)
    const maxSize = 100 * 1024 * 1024; // 100MB em bytes
    if (videoFile.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 100MB.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setUploading(true);
      setUploadProgress(0);
      
      const fileExt = videoFile.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `solution_videos/${solution.id}/${fileName}`;
      
      // Upload para o storage
      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(filePath, videoFile);
        
      if (uploadError) throw uploadError;
      
      // Obter a URL do arquivo
      const { data: urlData } = supabase.storage
        .from("materials")
        .getPublicUrl(filePath);
        
      if (!urlData) throw new Error("Não foi possível obter a URL do vídeo");
      
      // Registrar no banco de dados
      const newVideo = {
        solution_id: solution.id,
        name: videoFile.name,
        type: "video",
        url: urlData.publicUrl,
        format: fileExt,
        size: videoFile.size,
        metadata: {
          title: videoFile.name,
          description: `Vídeo para a solução`,
          url: urlData.publicUrl,
          type: "video",
          source: "upload",
          format: fileExt,
          size: videoFile.size
        }
      };
      
      const { data, error } = await supabase
        .from("solution_resources")
        .insert(newVideo)
        .select();
        
      if (error) throw error;
      
      setVideos(prev => [{
        ...data[0],
        type: "upload"
      }, ...prev]);
      
      toast({
        title: "Upload concluído",
        description: "O vídeo foi adicionado com sucesso."
      });
      
      // Limpar input file após upload
      e.target.value = "";
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao tentar fazer o upload do vídeo.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  // Função para remover vídeo
  const handleRemove = async (id: string, url: string) => {
    try {
      // Remover do banco de dados
      const { error } = await supabase
        .from("solution_resources")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      // Atualizar estado
      setVideos(prev => prev.filter(v => v.id !== id));
      
      toast({
        title: "Vídeo removido",
        description: "O vídeo foi removido com sucesso."
      });
      
      // Tentativa de remover do storage se for um upload
      if (url.includes("materials") && !url.includes("youtube.com")) {
        try {
          const filePath = url.split("/materials/")[1];
          if (filePath) {
            await supabase.storage
              .from("materials")
              .remove([filePath]);
          }
        } catch (storageError) {
          console.error("Erro ao remover arquivo do storage:", storageError);
          // Não mostrar erro ao usuário já que o registro foi removido do BD
        }
      }
    } catch (error) {
      console.error("Erro ao remover vídeo:", error);
      toast({
        title: "Erro ao remover vídeo",
        description: "Ocorreu um erro ao tentar remover o vídeo.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">
              Vídeos da solução
            </CardTitle>
            <div className="flex gap-2">
              <Dialog open={addYouTubeOpen} onOpenChange={setAddYouTubeOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Youtube className="mr-2 h-4 w-4" />
                    Adicionar do YouTube
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar vídeo do YouTube</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="youtube-name">Título do vídeo</Label>
                      <Input
                        id="youtube-name"
                        placeholder="Título do vídeo"
                        value={youtubeData.name}
                        onChange={(e) => setYoutubeData({ ...youtubeData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="youtube-url">URL do YouTube</Label>
                      <Input
                        id="youtube-url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={youtubeData.url}
                        onChange={(e) => setYoutubeData({ ...youtubeData, url: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Ex: https://www.youtube.com/watch?v=abcdefghijk
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="youtube-description">Descrição (opcional)</Label>
                      <Textarea
                        id="youtube-description"
                        placeholder="Descrição do vídeo"
                        value={youtubeData.description}
                        onChange={(e) => setYoutubeData({ ...youtubeData, description: e.target.value })}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleAddYouTube}
                      disabled={uploading || !youtubeData.name || !youtubeData.url}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adicionando...
                        </>
                      ) : (
                        "Adicionar Vídeo"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <label htmlFor="video-upload" className="cursor-pointer">
                <Input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileUpload}
                  className="hidden"
                  disabled={uploading || !solution?.id}
                />
                <Button size="sm" asChild>
                  <span>
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {uploadProgress.toFixed(0)}%
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload de Vídeo
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!solution?.id && (
            <div className="flex items-center p-4 gap-2 bg-amber-50 border border-amber-200 rounded-md mb-4">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <p className="text-sm text-amber-800">
                Salve as informações básicas antes de adicionar vídeos.
              </p>
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-md">
              <Video className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Nenhum vídeo ainda</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Faça upload de vídeos ou adicione do YouTube
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <label htmlFor="video-upload-empty" className="cursor-pointer">
                  <Input
                    id="video-upload-empty"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileUpload}
                    className="hidden"
                    disabled={uploading || !solution?.id}
                  />
                  <Button size="sm" asChild disabled={!solution?.id}>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Fazer Upload
                    </span>
                  </Button>
                </label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAddYouTubeOpen(true)}
                  disabled={!solution?.id}
                >
                  <Youtube className="mr-2 h-4 w-4" />
                  Adicionar do YouTube
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((video) => (
                <div 
                  key={video.id} 
                  className="border rounded-md overflow-hidden"
                >
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
                      <video 
                        src={video.url} 
                        controls
                        className="w-full h-full"
                      />
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
                        onClick={() => handleRemove(video.id, video.url)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remover</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VideosTab;
