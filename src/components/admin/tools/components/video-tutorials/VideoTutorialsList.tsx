
import { VideoTutorialItem } from './VideoTutorialItem';
import { VideoTutorial } from '@/types/toolTypes';

interface VideoTutorialsListProps {
  videoTutorials: VideoTutorial[];
  onUpdate: (index: number, field: 'title' | 'url', value: string) => void;
  onRemove: (index: number) => void;
}

export const VideoTutorialsList = ({ videoTutorials, onUpdate, onRemove }: VideoTutorialsListProps) => {
  return (
    <div className="space-y-4">
      {videoTutorials.map((tutorial, index) => (
        <VideoTutorialItem
          key={index}
          tutorial={tutorial}
          onUpdate={(field, value) => onUpdate(index, field, value)}
          onRemove={() => onRemove(index)}
        />
      ))}
    </div>
  );
};
