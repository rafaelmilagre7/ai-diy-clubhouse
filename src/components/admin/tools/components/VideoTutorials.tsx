
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
    
    form.setValue('video_tutorials', updatedTutorials, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
    
    // Marcar o formulário como modificado
    form.setValue('formModified', true);
    
    setShowAddForm(false);
  };

  const handleDeleteTutorial = (index: number) => {
    const currentTutorials = form.getValues('video_tutorials') || [];
    const updatedTutorials = currentTutorials.filter((_, i) => i !== index);
    
    form.setValue('video_tutorials', updatedTutorials, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
    
    // Marcar o formulário como modificado
    form.setValue('formModified', true);
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
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
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
