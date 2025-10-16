import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2, Plus, Trash2, Play } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import PandaVideoEmbed from "@/components/formacao/comum/PandaVideoEmbed";
import { devLog, devWarn } from "@/hooks/useOptimizedLogging";
interface VideoLesson {
  id?: string;
  title: string;
  description: string;
  url: string;
  type: "panda";
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
  const [pandaTitle, setPandaTitle] = useState("");
  const [pandaDescription, setPandaDescription] = useState("");
  const [pandaEmbedCode, setPandaEmbedCode] = useState("");
  const [pandaVideoId, setPandaVideoId] = useState("");
  const [pandaVideoUrl, setPandaVideoUrl] = useState("");
  const [pandaThumbnailUrl, setPandaThumbnailUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingVideos, setSavingVideos] = useState(false);
  const {
    toast
  } = useToast();
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
      const {
        data,
        error
      } = await supabase.from("solution_resources").select("*").eq("solution_id", solutionId).eq("type", "video").is("module_id", null); // apenas vídeos Panda da solução

      if (error) throw error;
      if (data) {
        // Convert database records to VideoLesson type - only Panda videos
        const lessons = data
          .filter(item => item.metadata?.provider === "panda" || item.url.includes("pandavideo"))
          .map(item => ({
            id: item.id,
            title: item.name,
            description: item.format || "",
            url: item.url,
            type: "panda" as const,
            solution_id: item.solution_id
          } as VideoLesson));
        setVideoLessons(lessons);
      }
    } catch (error) {
      devWarn("Erro ao carregar vídeo-aulas:", error);
      toast({
        title: "Erro ao carregar vídeo-aulas",
        description: "Não foi possível carregar a lista de vídeo-aulas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleAddPandaVideo = async () => {
    if (!solutionId || !pandaVideoId || !pandaVideoUrl) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, insira um código de incorporação válido do Panda Video.",
        variant: "destructive"
      });
      return;
    }
    try {
      const newVideo = {
        solution_id: solutionId,
        name: pandaTitle || `Vídeo do Panda (${pandaVideoId})`,
        url: pandaVideoUrl,
        type: "video",
        format: pandaDescription || "Vídeo do Panda",
        metadata: {
          provider: "panda",
          videoId: pandaVideoId,
          thumbnailUrl: pandaThumbnailUrl
        }
      };
      const {
        data,
        error
      } = await supabase.from("solution_resources").insert(newVideo).select().single();
      if (error) throw error;
      if (data) {
        const videoLesson: VideoLesson = {
          id: data.id,
          title: data.name,
          description: data.format || "",
          url: data.url,
          type: "panda",
          solution_id: data.solution_id
        };
        setVideoLessons(prev => [...prev, videoLesson]);

        // Limpar os campos
        setPandaTitle("");
        setPandaDescription("");
        setPandaEmbedCode("");
        setPandaVideoId("");
        setPandaVideoUrl("");
        setPandaThumbnailUrl("");
      }
      toast({
        title: "Vídeo adicionado",
        description: "O vídeo do Panda foi adicionado com sucesso."
      });
    } catch (error: any) {
      console.error("Erro ao adicionar vídeo do Panda:", error);
      toast({
        title: "Erro ao adicionar vídeo",
        description: error.message || "Ocorreu um erro ao tentar adicionar o vídeo do Panda.",
        variant: "destructive"
      });
    }
  };
  const handlePandaEmbedChange = (embedCode: string, videoId: string, url: string, thumbnailUrl: string) => {
    setPandaEmbedCode(embedCode);
    setPandaVideoId(videoId);
    setPandaVideoUrl(url);
    setPandaThumbnailUrl(thumbnailUrl);
  };
  const handleRemoveVideo = async (id?: string) => {
    if (!id) return;
    try {
      // Remover o registro do banco de dados
      const {
        error
      } = await supabase.from("solution_resources").delete().eq("id", id);
      if (error) throw error;
      setVideoLessons(prev => prev.filter(video => video.id !== id));
      toast({
        title: "Vídeo removido",
        description: "O vídeo foi removido com sucesso."
      });
    } catch (error: any) {
      console.error("Erro ao remover vídeo:", error);
      toast({
        title: "Erro ao remover vídeo",
        description: error.message || "Ocorreu um erro ao tentar remover o vídeo.",
        variant: "destructive"
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
        description: "As vídeo-aulas foram salvas com sucesso."
      });
    } catch (error: any) {
      console.error("Erro ao salvar vídeos:", error);
      toast({
        title: "Erro ao salvar vídeos",
        description: error.message || "Ocorreu um erro ao tentar salvar as vídeo-aulas.",
        variant: "destructive"
      });
    } finally {
      setSavingVideos(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }
  return <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Vídeo-aulas</h3>
        <p className="text-sm text-muted-foreground">
          Adicione vídeos do Panda Video que mostram como implementar a solução passo a passo.
        </p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="panda-title">Título do Vídeo (opcional)</Label>
              <Input id="panda-title" value={pandaTitle} onChange={e => setPandaTitle(e.target.value)} placeholder="Ex: Tutorial de Implementação" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="panda-description">Descrição (opcional)</Label>
              <Textarea id="panda-description" value={pandaDescription} onChange={e => setPandaDescription(e.target.value)} placeholder="Breve descrição do conteúdo do vídeo..." rows={3} />
            </div>
            
            <div className="space-y-2">
              <PandaVideoEmbed value={pandaEmbedCode} onChange={handlePandaEmbedChange} label="Código de Incorporação do Panda Video" description="Cole o código iframe completo fornecido pelo Panda Video" />
            </div>

            <Button onClick={handleAddPandaVideo} disabled={!pandaVideoId || !pandaVideoUrl} className="mt-2 w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Vídeo
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Lista de vídeos */}
      {videoLessons.length > 0 && <Card>
          <CardContent className="pt-6">
            <h3 className="text-base font-medium mb-4">Vídeos Adicionados</h3>
            <div className="space-y-4">
              {videoLessons.map(video => <div key={video.id} className="border rounded-md overflow-hidden">
                  <div className="p-3 border-b flex items-center justify-between bg-gray-900">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{video.title}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleRemoveVideo(video.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="relative pb-[56.25%] h-0">
                    <iframe src={video.url} className="absolute top-0 left-0 w-full h-full" frameBorder="0" allowFullScreen />
                  </div>
                  
                  {video.description && <div className="p-3 text-sm">{video.description}</div>}
                </div>)}
            </div>
          </CardContent>
        </Card>}
      
      <Button onClick={saveAndContinue} disabled={savingVideos || saving} variant="aurora-primary" className="w-full">
        {savingVideos ? <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </> : <>
            <Save className="mr-2 h-4 w-4" />
            Salvar e Continuar
          </>}
      </Button>
    </div>;
};
export default VideoLessonsForm;