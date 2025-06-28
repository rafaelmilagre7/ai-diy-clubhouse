
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface VideoLessonsFormProps {
  form: UseFormReturn<any>;
  solutionId?: string;
}

interface VideoLesson {
  id: string;
  title: string;
  url: string;
  duration_seconds?: number;
}

export const VideoLessonsForm = ({ form, solutionId }: VideoLessonsFormProps) => {
  const videos: VideoLesson[] = form.watch('videos') || [];

  const addVideo = () => {
    const newVideo: VideoLesson = {
      id: Date.now().toString(),
      title: 'Nova Aula',
      url: '',
      duration_seconds: 0
    };
    
    form.setValue('videos', [...videos, newVideo]);
  };

  const removeVideo = (index: number) => {
    const updatedVideos = videos.filter((_, i) => i !== index);
    form.setValue('videos', updatedVideos);
  };

  const updateVideo = (index: number, field: keyof VideoLesson, value: any) => {
    const updatedVideos = [...videos];
    updatedVideos[index] = { ...updatedVideos[index], [field]: value };
    form.setValue('videos', updatedVideos);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Vídeo Aulas</h3>
        <Button onClick={addVideo} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Vídeo
        </Button>
      </div>

      {videos.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Nenhuma vídeo aula adicionada ainda.</p>
            <Button onClick={addVideo} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeira Vídeo Aula
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {videos.map((video, index) => (
            <Card key={video.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Vídeo {index + 1}</span>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => removeVideo(index)}
                  >
                    Remover
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Título</label>
                  <input
                    type="text"
                    value={video.title}
                    onChange={(e) => updateVideo(index, 'title', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Título da vídeo aula"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">URL do Vídeo</label>
                  <input
                    type="url"
                    value={video.url}
                    onChange={(e) => updateVideo(index, 'url', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
