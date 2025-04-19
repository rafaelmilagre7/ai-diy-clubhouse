
import { VideoTutorialItem } from './VideoTutorialItem';
import { VideoTutorial } from '../../types/toolFormTypes';

interface VideoTutorialsListProps {
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
            console.log(`Update tutorial ${index}, field ${field} to ${value}`);
          }}
          onRemove={() => onDelete(index)}
        />
      ))}
    </div>
  );
};
