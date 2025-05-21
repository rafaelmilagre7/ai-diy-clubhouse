
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForumCategories } from '@/hooks/community/useForumCategories';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface CreateTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedCategory?: string;
}

export const CreateTopicDialog = ({ open, onOpenChange, preselectedCategory }: CreateTopicDialogProps) => {
  const { categories, isLoading } = useForumCategories();
  const [selectedCategory, setSelectedCategory] = useState(preselectedCategory || '');
  const navigate = useNavigate();

  const handleCreateTopic = () => {
    if (!selectedCategory) return;
    
    const category = categories?.find(c => c.id === selectedCategory);
    if (category) {
      navigate(`/comunidade/novo-topico/${category.slug}`);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar novo tópico</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Selecione a categoria para o seu novo tópico:
          </p>
          
          <Select 
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex justify-end mt-6">
            <Button 
              onClick={handleCreateTopic} 
              disabled={!selectedCategory || isLoading}
            >
              Continuar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
