
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Loader2, Trash2, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { extractPandaVideoInfo } from "@/lib/supabase/storage";
import PandaVideoEmbed from "@/components/formacao/comum/PandaVideoEmbed";

interface VideoLessonsFormProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

interface VideoResource {
  id?: string;
  name: string;
  url: string;
  type: "video";
  metadata: {
    title: string;
    description: string;
    url: string;
    type: "video";
    videoId: string;
    embedUrl: string;
    thumbnailUrl: string;
    platform: "panda_video";
  };
  solution_id: string;
}

const VideoLessonsForm: React.FC<VideoLessonsFormProps> = ({
  solutionId,
  onSave,
  saving
}) => {
  const { toast } = useToast();
  const [videos, setVideos] = useState<VideoResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingVideos, setSavingVideos] = useState(false);
  const [embedCode, setEmbedCode] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");

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
        .from('solution_resources')
        .select('*')
        .eq('solution_id', solutionId as any)
        .eq('type', 'video');

      if (error) throw error;

      const videoResources = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        url: item.url,
        type: "video" as const,
        metadata: typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata,
        solution_id: item.solution_id
      }));

      setVideos(videoResources);
    } catch (error: any) {
      console.error("Erro ao buscar vídeos:", error);
      toast({
        title: "Erro ao carregar vídeos",
        description: error.message || "Não foi possível carregar os vídeos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPandaVideo = async () => {
    if (!solutionId || !embedCode.trim() || !videoTitle.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título e o código de incorporação do vídeo.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingVideos(true);

      // Extrair informações do Panda Video
      const videoInfo = extractPandaVideoInfo(embedCode);
      if (!videoInfo || !videoInfo.videoId) {
        throw new Error("Código de incorporação inválido. Certifique-se de que é um iframe do Panda Video.");
      }

      const thumbnailUrl = `https://player.pandavideo.com.br/thumbnail/${videoInfo.videoId}.jpg`;

      const metadata = {
        title: videoTitle,
        description: videoDescription || `Vídeo educacional - ${videoTitle}`,
        url: videoInfo.embedUrl,
        type: "video" as const,
        videoId: videoInfo.videoId,
        embedUrl: videoInfo.embedUrl,
        thumbnailUrl: thumbnailUrl,
        platform: "panda_video" as const
      };

      const { data, error } = await supabase
        .from('solution_resources')
        .insert({
          solution_id: solutionId,
          name: videoTitle,
          url: videoInfo.embedUrl,
          type: 'video',
          metadata: JSON.stringify(metadata)
        } as any)
        .select()
        .single();

      if (error) throw error;

      const newVideo: VideoResource = {
        id: data.id,
        name: videoTitle,
        url: videoInfo.embedUrl,
        type: "video",
        metadata: metadata,
        solution_id: solutionId
      };

      setVideos(prev => [...prev, newVideo]);
      
      // Limpar formulário
      setEmbedCode("");
      setVideoTitle("");
      setVideoDescription("");

      toast({
        title: "Vídeo adicionado",
        description: "O vídeo foi adicionado com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao adicionar vídeo:", error);
      toast({
        title: "Erro ao adicionar vídeo",
        description: error.message || "Ocorreu um erro ao adicionar o vídeo.",
        variant: "destructive",
      });
    } finally {
      setSavingVideos(false);
    }
  };

  const removeVideo = async (videoId: string) => {
    try {
      setSavingVideos(true);

      const { error } = await supabase
        .from('solution_resources')
        .delete()
        .eq('id', videoId as any);

      if (error) throw error;

      setVideos(prev => prev.filter(video => video.id !== videoId));

      toast({
        title: "Vídeo removido",
        description: "O vídeo foi removido com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao remover vídeo:", error);
      toast({
        title: "Erro ao remover vídeo",
        description: error.message || "Ocorreu um erro ao remover o vídeo.",
        variant: "destructive",
      });
    } finally {
      setSavingVideos(false);
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
          <CardTitle>Vídeos Educacionais (Panda Video)</CardTitle>
          <CardDescription>
            Adicione vídeos do Panda Video para complementar o aprendizado da solução.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formulário para adicionar vídeo */}
          <div className="space-y-4 p-4 border border-dashed border-[#0ABAB5]/30 rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-2">
                Título do Vídeo *
              </label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Ex: Introdução ao tema"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0ABAB5]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Descrição (opcional)
              </label>
              <textarea
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                placeholder="Descrição do conteúdo do vídeo"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0ABAB5]"
              />
            </div>

            <PandaVideoEmbed
              value={embedCode}
              onChange={(embedCode, videoId, url, thumbnailUrl) => {
                setEmbedCode(embedCode);
              }}
              label="Código de Incorporação do Panda Video *"
              description="Cole o código iframe completo fornecido pelo Panda Video"
            />

            <Button
              onClick={addPandaVideo}
              disabled={savingVideos || !videoTitle.trim() || !embedCode.trim()}
              className="w-full bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
            >
              {savingVideos ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Adicionar Vídeo
                </>
              )}
            </Button>
          </div>

          {/* Lista de vídeos adicionados */}
          {videos.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vídeos Adicionados</h3>
              <div className="space-y-3">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      {video.metadata.thumbnailUrl && (
                        <img
                          src={video.metadata.thumbnailUrl}
                          alt={video.metadata.title}
                          className="w-16 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <h4 className="font-medium">{video.metadata.title}</h4>
                        {video.metadata.description && (
                          <p className="text-sm text-gray-600">{video.metadata.description}</p>
                        )}
                        <p className="text-xs text-gray-500">Panda Video</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeVideo(video.id!)}
                      disabled={savingVideos}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
