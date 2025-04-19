
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AddTutorialButtonProps {
  onClick: () => void;
}

export const AddTutorialButton = ({ onClick }: AddTutorialButtonProps) => {
  return (
    <Button type="button" variant="outline" onClick={onClick}>
      <Plus className="h-4 w-4 mr-2" />
      Adicionar Tutorial
    </Button>
  );
};
