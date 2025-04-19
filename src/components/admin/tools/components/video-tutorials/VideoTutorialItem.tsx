
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { VideoTutorial } from '@/types/toolTypes';

interface VideoTutorialItemProps {
  tutorial: VideoTutorial;
  onUpdate: (field: 'title' | 'url', value: string) => void;
  onRemove: () => void;
}

export const VideoTutorialItem = ({ tutorial, onUpdate, onRemove }: VideoTutorialItemProps) => {
  return (
    <div className="flex gap-4 items-start border rounded-md p-4">
      <div className="flex-1 space-y-4">
        <Input
          placeholder="Título do tutorial"
          value={tutorial.title}
          onChange={(e) => onUpdate('title', e.target.value)}
        />
        <Input
          placeholder="URL do vídeo do YouTube"
          value={tutorial.url}
          onChange={(e) => onUpdate('url', e.target.value)}
        />
      </div>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
