
import { VideoTutorialItem } from './VideoTutorialItem';
import { VideoTutorial } from '@/types/toolTypes';

export interface VideoTutorialsListProps {
  tutorials: VideoTutorial[];
  onDelete: (index: number) => void;
}

export const VideoTutorialsList = ({ tutorials, onDelete }: VideoTutorialsListProps) => {
  return (
    <div className="space-y-4">
      {tutorials.map((tutorial, index) => (
        <VideoTutorialItem
          key={index}
          tutorial={tutorial}
          onUpdate={(field, value) => {
            // No-op para agora - implementação futura se necessário
          }}
          onRemove={() => onDelete(index)}
        />
      ))}
    </div>
  );
};
