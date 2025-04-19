
import { FormLabel } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { ToolFormValues } from '../types/toolFormTypes';
import { VideoTutorialsList } from './video-tutorials/VideoTutorialsList';
import { AddTutorialButton } from './video-tutorials/AddTutorialButton';

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
        <AddTutorialButton onClick={addVideoTutorial} />
      </div>
      
      <VideoTutorialsList
        videoTutorials={videoTutorials}
        onUpdate={updateVideoTutorial}
        onRemove={removeVideoTutorial}
      />
    </div>
  );
};
