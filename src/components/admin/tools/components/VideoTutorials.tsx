
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoTutorialsList, VideoTutorialsListProps } from './video-tutorials/VideoTutorialsList';
import { AddTutorialButton, AddTutorialButtonProps } from './video-tutorials/AddTutorialButton';
import { UseFormReturn } from 'react-hook-form';
import { ToolFormValues } from '../types/toolFormTypes';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { VideoTutorial } from '@/types/toolTypes';

interface VideoTutorialsProps {
  form: UseFormReturn<ToolFormValues>;
}

export const VideoTutorials = ({ form }: VideoTutorialsProps) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const videoTutorials = form.watch('video_tutorials') || [];

  const handleAddTutorial = (tutorial: VideoTutorial) => {
    const currentTutorials = form.getValues('video_tutorials') || [];
    const updatedTutorials = [...currentTutorials, tutorial];
    
    // OTIMIZAÇÃO: Atualização mais direta
    form.setValue('video_tutorials', updatedTutorials, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
    
    setShowAddForm(false);
  };

  const handleDeleteTutorial = (index: number) => {
    const currentTutorials = form.getValues('video_tutorials') || [];
    const updatedTutorials = currentTutorials.filter((_, i) => i !== index);
    
    // OTIMIZAÇÃO: Atualização mais direta
    form.setValue('video_tutorials', updatedTutorials, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Tutoriais em Vídeo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {videoTutorials.length > 0 && (
          <VideoTutorialsList 
            tutorials={videoTutorials}
            onDelete={handleDeleteTutorial}
          />
        )}
        
        {showAddForm ? (
          <AddTutorialButton 
            onAdd={handleAddTutorial}
            onCancel={() => setShowAddForm(false)}
          />
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full py-2 border-2 border-dashed border-border rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar tutorial em vídeo
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
