
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Video, Youtube, FileVideo, Upload, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import VideosList from "./components/VideosList";
import VideoUploader from "./components/VideoUploader";
import YouTubeVideoForm from "./components/YouTubeVideoForm";
import EmptyVideoState from "./components/EmptyVideoState";

interface VideoItem {
  id: string;
  name: string;
  url: string;
  type: "video";
  solution_id: string;
  created_at: string;
  metadata?: {
    source?: "youtube" | "upload";
    youtube_id?: string;
    thumbnail_url?: string;
    description?: string;
  };
}

interface VideoTabProps {
  solution: any;
  currentValues: any;
  onSubmit: (values: any) => Promise<void>;
  saving: boolean;
}

const VideoTab: React.FC<VideoTabProps> = ({
  solution,
  currentValues,
  onSubmit,
  saving
}) => {
  const [activeTab, setActiveTab] = useState("todos");
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false);
  const { toast } = useToast();

  // Carregar vídeos ao montar o componente
  React.useEffect(() => {
    fetchVideos();
  }, [solution?.id]);

  // Função para buscar vídeos
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
      setVideos(data || []);
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

  // Função para adicionar vídeo do YouTube
  const handleAddYouTube = async (youtubeData: {
    name: string;
    url: string;
    description: string;
  }) => {
    if (!solution?.id) {
      toast({
        title: "Erro",
        description: "É necessário salvar a solução antes de adicionar vídeos.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      // Extrair o ID do YouTube da URL
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = youtubeData.url.match(regExp);
      const youtubeId = match && match[2].length === 11 ? match[2] : null;

      if (!youtubeId) {
        toast({
          title: "URL inválida",
          description: "Por favor, insira uma URL válida do YouTube.",
          variant: "destructive"
        });
        return;
      }

      const embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
      const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;

      const newVideo = {
        solution_id: solution.id,
        name: youtubeData.name,
        type: "video",
        url: embedUrl,
        metadata: {
          source: "youtube",
          youtube_id: youtubeId,
          thumbnail_url: thumbnailUrl,
          description: youtubeData.description
        }
      };

      const { data, error } = await supabase
        .from("solution_resources")
        .insert(newVideo)
        .select();

      if (error) throw error;

      setVideos(prev => [data[0], ...prev]);
      toast({
        title: "Vídeo adicionado",
        description: "O vídeo do YouTube foi adicionado com sucesso."
      });
      setYoutubeDialogOpen(false);
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

  // Função para upload de arquivo de vídeo
  const handleFileUpload = async (file: File) => {
    if (!solution?.id) {
      toast({
        title: "Erro",
        description: "É necessário salvar a solução antes de adicionar vídeos.",
        variant: "destructive"
      });
      return;
    }

    // Verificar tipo de arquivo
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas arquivos de vídeo.",
        variant: "destructive"
      });
      return;
    }

    // Verificar tamanho do arquivo (100MB máximo)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
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

      // Simular progresso de upload (já que a API não suporta onProgress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 500);

      // Fazer upload do arquivo
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `solution_videos/${solution.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(filePath, file);

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      setUploadProgress(100);

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from("materials")
        .getPublicUrl(filePath);

      if (!urlData) throw new Error("Não foi possível obter a URL do vídeo");

      // Registrar no banco de dados
      const newVideo = {
        solution_id: solution.id,
        name: file.name,
        type: "video",
        url: urlData.publicUrl,
        metadata: {
          source: "upload",
          format: fileExt,
          size: file.size,
          description: `Vídeo: ${file.name}`
        }
      };

      const { data, error } = await supabase
        .from("solution_resources")
        .insert(newVideo)
        .select();

      if (error) throw error;

      setVideos(prev => [data[0], ...prev]);
      toast({
        title: "Upload concluído",
        description: "O vídeo foi adicionado com sucesso."
      });

    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao tentar fazer o upload do vídeo.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Função para remover vídeo
  const handleRemoveVideo = async (id: string, url: string) => {
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

      // Tentar remover do storage se for um upload
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

  // Filtrar vídeos com base na aba ativa
  const filteredVideos = videos.filter(video => {
    if (activeTab === "todos") return true;
    if (activeTab === "youtube") return video.metadata?.source === "youtube";
    if (activeTab === "arquivos") return video.metadata?.source === "upload";
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Cabeçalho e opções de upload */}
      <Card className="border border-[#0ABAB5]/30 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-[#0ABAB5]">Vídeos da solução</h2>
                <p className="text-muted-foreground mt-1">
                  Adicione vídeos explicativos ou tutoriais para sua solução de IA
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={() => setYoutubeDialogOpen(true)}
                  variant="outline"
                  className="gap-2"
                  disabled={!solution?.id || uploading}
                >
                  <Youtube className="h-4 w-4 text-red-500" />
                  Adicionar do YouTube
                </Button>
              </div>
            </div>
            
            {/* Uploader de arquivo */}
            <VideoUploader
              onFileSelect={handleFileUpload}
              isUploading={uploading}
              uploadProgress={uploadProgress}
              disabled={!solution?.id}
            />

            {!solution?.id && (
              <div className="flex items-center p-4 gap-2 bg-amber-50 border border-amber-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <p className="text-sm text-amber-800">
                  Salve as informações básicas antes de adicionar vídeos.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de vídeos */}
      <Card className="border shadow-sm">
        <CardContent className="p-6">
          <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Vídeos disponíveis</h3>
              <TabsList>
                <TabsTrigger value="todos" className="gap-1">
                  <Video className="h-4 w-4" />
                  <span>Todos</span>
                </TabsTrigger>
                <TabsTrigger value="youtube" className="gap-1">
                  <Youtube className="h-4 w-4" />
                  <span>YouTube</span>
                </TabsTrigger>
                <TabsTrigger value="arquivos" className="gap-1">
                  <FileVideo className="h-4 w-4" />
                  <span>Arquivos</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0ABAB5]" />
                  <span className="mt-2 text-sm text-muted-foreground">Carregando vídeos...</span>
                </div>
              </div>
            ) : videos.length === 0 ? (
              <EmptyVideoState 
                onYoutubeClick={() => setYoutubeDialogOpen(true)}
                onFileUploadClick={() => document.getElementById('video-file-input')?.click()}
                solutionId={solution?.id}
              />
            ) : filteredVideos.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
                <Video className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-1">Nenhum vídeo encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Não há vídeos na categoria selecionada
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("todos")}
                >
                  Ver todos os vídeos
                </Button>
              </div>
            ) : (
              <TabsContent value={activeTab} className="mt-0">
                <VideosList videos={filteredVideos} onRemove={handleRemoveVideo} />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal para adicionar vídeo do YouTube */}
      <YouTubeVideoForm
        isOpen={youtubeDialogOpen}
        onOpenChange={setYoutubeDialogOpen}
        onAddYouTube={handleAddYouTube}
        isUploading={uploading}
      />
    </div>
  );
};

export default VideoTab;
