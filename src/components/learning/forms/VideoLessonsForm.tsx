
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Upload } from 'lucide-react';
import { useUnifiedFileUpload } from '@/hooks/useUnifiedFileUpload';
import { STORAGE_BUCKETS } from '@/lib/supabase/config';
import { LearningCourseFormData } from '@/types/learningTypes';

interface VideoLessonsFormProps {
  form: UseFormReturn<LearningCourseFormData>;
}

export const VideoLessonsForm = ({ form }: VideoLessonsFormProps) => {
  const videoLessons = form.watch('video_lessons') || [];

  const { uploadFile, isUploading, progress } = useUnifiedFileUpload({
    bucketName: STORAGE_BUCKETS.LEARNING_VIDEOS, // Corrigido para usar bucket correto
    folder: 'lessons',
    onUploadComplete: (url, fileName) => {
      console.log('[VIDEO_LESSONS] Upload concluído:', url);
      // Adicionar vídeo à lista
      const newLesson = {
        id: crypto.randomUUID(),
        title: fileName.split('.')[0],
        video_url: url,
        description: '',
        duration: 0,
        order_index: videoLessons.length
      };
      
      form.setValue('video_lessons', [...videoLessons, newLesson], {
        shouldDirty: true
      });
    },
    onUploadError: (error) => {
      console.error('[VIDEO_LESSONS] Erro no upload:', error);
    }
  });

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('[VIDEO_LESSONS] Iniciando upload de vídeo:', file.name);
    await uploadFile(file);
  };

  const addVideoLesson = () => {
    const newLesson = {
      id: crypto.randomUUID(),
      title: '',
      video_url: '',
      description: '',
      duration: 0,
      order_index: videoLessons.length
    };
    
    form.setValue('video_lessons', [...videoLessons, newLesson], {
      shouldDirty: true
    });
  };

  const removeVideoLesson = (index: number) => {
    const updatedLessons = videoLessons.filter((_, i) => i !== index);
    form.setValue('video_lessons', updatedLessons, {
      shouldDirty: true
    });
  };

  const updateVideoLesson = (index: number, field: string, value: any) => {
    const updatedLessons = [...videoLessons];
    updatedLessons[index] = { ...updatedLessons[index], [field]: value };
    form.setValue('video_lessons', updatedLessons, {
      shouldDirty: true
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vídeo Aulas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={addVideoLesson}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Vídeo Aula
          </Button>
          
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin border-2 border-current border-t-transparent rounded-full" />
                  {progress}%
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
            <Input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept="video/*"
              onChange={handleVideoUpload}
              disabled={isUploading}
            />
          </div>
        </div>

        {videoLessons.map((lesson, index) => (
          <Card key={lesson.id || index} className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Vídeo Aula {index + 1}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVideoLesson(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Título</Label>
                  <Input
                    value={lesson.title}
                    onChange={(e) => updateVideoLesson(index, 'title', e.target.value)}
                    placeholder="Título da vídeo aula"
                  />
                </div>
                
                <div>
                  <Label>Duração (minutos)</Label>
                  <Input
                    type="number"
                    value={lesson.duration}
                    onChange={(e) => updateVideoLesson(index, 'duration', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <Label>URL do Vídeo</Label>
                <Input
                  value={lesson.video_url}
                  onChange={(e) => updateVideoLesson(index, 'video_url', e.target.value)}
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <Label>Descrição</Label>
                <Input
                  value={lesson.description}
                  onChange={(e) => updateVideoLesson(index, 'description', e.target.value)}
                  placeholder="Breve descrição da aula"
                />
              </div>
            </div>
          </Card>
        ))}

        {videoLessons.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma vídeo aula adicionada ainda.</p>
            <p className="text-sm">Clique em "Adicionar Vídeo Aula" ou faça upload de um vídeo.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
