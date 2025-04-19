
import { FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { ToolFormValues } from '../types/toolFormTypes';

interface VideoTutorialsProps {
  form: UseFormReturn<ToolFormValues>;
}

export const VideoTutorials = ({ form }: VideoTutorialsProps) => {
  const videoTutorials = form.watch('video_tutorials');

  const addVideoTutorial = () => {
    const updated = [...videoTutorials, { title: '', url: '' }];
    form.setValue('video_tutorials', updated);
  };

  const updateVideoTutorial = (index: number, field: 'title' | 'url', value: string) => {
    const updated = [...videoTutorials];
    updated[index] = { ...updated[index], [field]: value };
    form.setValue('video_tutorials', updated);
  };

  const removeVideoTutorial = (index: number) => {
    const updated = videoTutorials.filter((_, i) => i !== index);
    form.setValue('video_tutorials', updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel>Tutoriais em Vídeo</FormLabel>
        <Button type="button" variant="outline" onClick={addVideoTutorial}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Tutorial
        </Button>
      </div>
      
      <div className="space-y-4">
        {videoTutorials.map((tutorial, index) => (
          <div key={index} className="flex gap-4 items-start border rounded-md p-4">
            <div className="flex-1 space-y-4">
              <Input
                placeholder="Título do tutorial"
                value={tutorial.title}
                onChange={(e) => updateVideoTutorial(index, 'title', e.target.value)}
              />
              <Input
                placeholder="URL do vídeo do YouTube"
                value={tutorial.url}
                onChange={(e) => updateVideoTutorial(index, 'url', e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeVideoTutorial(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
