
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { VideoTutorial } from '../../types/toolFormTypes';

interface AddTutorialButtonProps {
  onAdd: (tutorial: VideoTutorial) => void;
  onCancel: () => void;
}

export const AddTutorialButton = ({ onAdd, onCancel }: AddTutorialButtonProps) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const handleAdd = () => {
    if (title.trim() === '' || url.trim() === '') return;

    onAdd({
      title: title.trim(),
      url: url.trim(),
      type: 'youtube'
    });

    // Limpar os campos
    setTitle('');
    setUrl('');
  };

  return (
    <div className="space-y-4 border rounded-md p-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Adicionar tutorial</h3>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-3">
        <Input
          placeholder="Título do tutorial"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          placeholder="URL do vídeo do YouTube"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button 
          type="button" 
          className="w-full" 
          onClick={handleAdd}
          disabled={!title.trim() || !url.trim()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>
    </div>
  );
};
