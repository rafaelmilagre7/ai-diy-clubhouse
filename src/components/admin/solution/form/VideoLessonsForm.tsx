
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Video } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface VideoLessonsFormProps {
  solutionId: string;
  onSave: () => Promise<void>;
  isSaving?: boolean;  // Changed from 'saving' to 'isSaving'
}

interface VideoLesson {
  id?: string;
  solution_id: string;
  title: string;
  url: string;
  description?: string;
  order?: number;
}

const VideoLessonsForm: React.FC<VideoLessonsFormProps> = ({
  solutionId,
  onSave,
  isSaving = false  // Default value and renamed
}) => {
  const [videos, setVideos] = useState<VideoLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);  // Internal saving state
  const { toast } = useToast();

  useEffect(() => {
    if (solutionId) {
      fetchVideos();
    }
  }, [solutionId]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('solution_resources')
        .select('*')
        .eq('solution_id', solutionId)
        .eq('type', 'video')
        .order('name');

      if (error) throw error;

      setVideos(data.map(item => ({
        id: item.id,
        solution_id: item.solution_id,
        title: item.name,
        url: item.url,
        description: item.metadata?.description || '',
        order: item.metadata?.order || 0
      })) || []);
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os vídeos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddVideo = () => {
    setVideos([
      ...videos,
      {
        solution_id: solutionId,
        title: '',
        url: '',
        description: '',
        order: videos.length
      }
    ]);
  };

  const handleRemoveVideo = (index: number) => {
    const newVideos = [...videos];
    newVideos.splice(index, 1);
    setVideos(newVideos);
  };

  const handleVideoChange = (index: number, field: keyof VideoLesson, value: string) => {
    const newVideos = [...videos];
    newVideos[index] = {
      ...newVideos[index],
      [field]: value
    };
    setVideos(newVideos);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Filtrar vídeos vazios
      const validVideos = videos.filter(video => video.title && video.url);

      // Para cada vídeo, atualizar ou inserir no banco
      for (const video of validVideos) {
        const videoData = {
          solution_id: solutionId,
          name: video.title,
          url: video.url,
          type: 'video',
          metadata: {
            description: video.description,
            order: video.order
          }
        };

        if (video.id) {
          // Atualizar vídeo existente
          const { error } = await supabase
            .from('solution_resources')
            .update(videoData)
            .eq('id', video.id);

          if (error) throw error;
        } else {
          // Inserir novo vídeo
          const { error } = await supabase
            .from('solution_resources')
            .insert(videoData);

          if (error) throw error;
        }
      }

      // Chamar a função de callback
      await onSave();

      toast({
        title: 'Sucesso',
        description: 'Vídeos salvos com sucesso'
      });
    } catch (error) {
      console.error('Erro ao salvar vídeos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar os vídeos',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Carregando vídeos...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Vídeos da solução</h3>
        <p className="text-muted-foreground mt-1">
          Adicione vídeos tutoriais ou explicativos para sua solução.
        </p>
      </div>

      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-md">
          <Video className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Nenhum vídeo adicionado</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={handleAddVideo}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar vídeo
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {videos.map((video, index) => (
            <div key={index} className="border rounded-md p-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <div className="sm:col-span-3">
                    <Label htmlFor={`video-title-${index}`}>Título do vídeo</Label>
                    <Input
                      id={`video-title-${index}`}
                      value={video.title}
                      onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                      placeholder="Título do vídeo"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <Label htmlFor={`video-order-${index}`}>Ordem</Label>
                    <Input
                      id={`video-order-${index}`}
                      type="number"
                      value={video.order || index}
                      onChange={(e) => handleVideoChange(index, 'order', e.target.value)}
                      min={0}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor={`video-url-${index}`}>URL do vídeo</Label>
                  <Input
                    id={`video-url-${index}`}
                    value={video.url}
                    onChange={(e) => handleVideoChange(index, 'url', e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                
                <div>
                  <Label htmlFor={`video-description-${index}`}>Descrição</Label>
                  <Textarea
                    id={`video-description-${index}`}
                    value={video.description}
                    onChange={(e) => handleVideoChange(index, 'description', e.target.value)}
                    placeholder="Descrição do vídeo"
                    rows={2}
                  />
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => handleRemoveVideo(index)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remover vídeo
                </Button>
              </div>
            </div>
          ))}
          
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddVideo}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar vídeo
            </Button>
            
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
            >
              Salvar vídeos
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoLessonsForm;
