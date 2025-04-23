
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { SimpleVideoUpload } from "@/components/admin/solution/editor/components/video/SimpleVideoUpload";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Video, Youtube, Upload } from "lucide-react";
import VideoGallery from "@/components/admin/solution/editor/components/video/VideoGallery";

interface VideoItem {
  id: string;
  name: string;
  url: string;
  type: "video";
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
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const { toast } = useToast();
  
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
    
    fetchVideos();
  }, [solution?.id, toast]);

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
  
  // Filtrar vídeos com base na seleção
  const filteredVideos = videos.filter(video => {
    if (activeFilter === "all") return true;
    return video.metadata?.source === activeFilter;
  });
  
  // Handler para atualizar os vídeos após upload
  const onVideoAdded = () => {
    if (solution?.id) {
      // Recarregar a lista de vídeos
      supabase
        .from("solution_resources")
        .select("*")
        .eq("solution_id", solution.id)
        .eq("type", "video")
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) {
            setVideos(data);
          }
        });
    }
  };

  return (
    <div className="space-y-6">
      <SimpleVideoUpload solutionId={solution?.id} />
      
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="all" value={activeFilter} onValueChange={setActiveFilter} className="w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Vídeos da Solução</h3>
              
              <TabsList>
                <TabsTrigger value="all">
                  <Video className="h-4 w-4 mr-2" />
                  Todos
                </TabsTrigger>
                <TabsTrigger value="youtube">
                  <Youtube className="h-4 w-4 mr-2" />
                  YouTube
                </TabsTrigger>
                <TabsTrigger value="upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Uploads
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredVideos.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-1">Nenhum vídeo encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Adicione vídeos para enriquecer sua solução
                  </p>
                </div>
              ) : (
                <VideoGallery videos={filteredVideos} onRemove={handleRemoveVideo} />
              )}
            </TabsContent>

            <TabsContent value="youtube" className="mt-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredVideos.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Youtube className="h-12 w-12 mx-auto text-red-500 mb-3" />
                  <h3 className="text-lg font-medium mb-1">Nenhum vídeo do YouTube</h3>
                  <p className="text-muted-foreground mb-4">
                    Adicione vídeos do YouTube para sua solução
                  </p>
                </div>
              ) : (
                <VideoGallery videos={filteredVideos} onRemove={handleRemoveVideo} />
              )}
            </TabsContent>

            <TabsContent value="upload" className="mt-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredVideos.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-1">Nenhum vídeo enviado</h3>
                  <p className="text-muted-foreground mb-4">
                    Faça upload de vídeos para sua solução
                  </p>
                </div>
              ) : (
                <VideoGallery videos={filteredVideos} onRemove={handleRemoveVideo} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoTab;
